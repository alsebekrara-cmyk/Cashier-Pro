// ملاحظة هامة:
// يجب تضمين هذا الملف (data_sdk.js) في مجلد البناء النهائي (build/output) عند توزيع التطبيق.
// إذا كنت تستخدم سكريبت بناء (npm run build أو غيره)، تأكد من نسخ ملف _sdk/data_sdk.js إلى مجلد build أو output النهائي.
// مثال (في package.json):
//   "build": "... && copy _sdk\\data_sdk.js build\\_sdk\\data_sdk.js && ..."

/**
 * Data SDK - نظام قاعدة البيانات المحلي باستخدام IndexedDB
 * يوفر تخزين دائم لجميع بيانات التطبيق
 */

(function() {
    'use strict';

    const DB_NAME = 'POSSystemDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'app_data';
    
    class DataSDK {
                /**
                 * جلب قائمة سجلات بناءً على معايير (متوافقة مع await)
                 * @param {Object} criteria - معايير البحث {type, ...}
                 * @returns {Promise<Array>} - السجلات المطابقة
                 */
                async list(criteria) {
                    // دعم الواجهة async/await
                    return this.query(criteria);
                }
        constructor() {
            this.db = null;
            this.dataHandler = null;
            this.data = [];
        }

        /**
         * تهيئة قاعدة البيانات
         * @param {Object} handler - معالج البيانات {onDataChanged}
         * @returns {Promise<Object>} - {isOk: boolean, error?: string}
         */
        async init(handler) {
            try {
                this.dataHandler = handler;
                
                return new Promise((resolve, reject) => {
                    const request = indexedDB.open(DB_NAME, DB_VERSION);

                    request.onerror = () => {
                        console.error('فشل فتح قاعدة البيانات:', request.error);
                        resolve({ isOk: false, error: request.error });
                    };

                    request.onsuccess = async () => {
                        this.db = request.result;
                        console.log('✅ تم فتح قاعدة البيانات بنجاح');
                        
                        // تحميل البيانات الموجودة
                        await this.loadAllData();
                        
                        resolve({ isOk: true });
                    };

                    request.onupgradeneeded = (event) => {
                        const db = event.target.result;
                        
                        // إنشاء متجر البيانات إذا لم يكن موجوداً
                        if (!db.objectStoreNames.contains(STORE_NAME)) {
                            const objectStore = db.createObjectStore(STORE_NAME, { 
                                keyPath: 'id',
                                autoIncrement: true 
                            });
                            
                            // إنشاء فهارس للبحث السريع
                            objectStore.createIndex('type', 'type', { unique: false });
                            objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                            objectStore.createIndex('category_id', 'category_id', { unique: false });
                            objectStore.createIndex('product_id', 'product_id', { unique: false });
                            objectStore.createIndex('sale_id', 'sale_id', { unique: false });
                            
                            console.log('✅ تم إنشاء متجر البيانات');
                        }
                    };
                });
            } catch (error) {
                console.error('خطأ في تهيئة قاعدة البيانات:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * تحميل جميع البيانات من قاعدة البيانات
         */
        async loadAllData() {
            try {
                if (!this.db) {
                    throw new Error('قاعدة البيانات غير مهيأة');
                }

                const transaction = this.db.transaction([STORE_NAME], 'readonly');
                const objectStore = transaction.objectStore(STORE_NAME);
                const request = objectStore.getAll();

                return new Promise((resolve, reject) => {
                    request.onsuccess = () => {
                        this.data = request.result || [];
                        console.log(`✅ تم تحميل ${this.data.length} سجل من قاعدة البيانات`);
                        
                        // إشعار المعالج بالبيانات
                        if (this.dataHandler && this.dataHandler.onDataChanged) {
                            this.dataHandler.onDataChanged(this.data);
                        }
                        
                        resolve(this.data);
                    };

                    request.onerror = () => {
                        console.error('فشل تحميل البيانات:', request.error);
                        reject(request.error);
                    };
                });
            } catch (error) {
                console.error('خطأ في تحميل البيانات:', error);
                return [];
            }
        }

        /**
         * إنشاء سجل جديد
         * @param {Object} data - البيانات المراد حفظها
         * @returns {Promise<Object>} - {isOk: boolean, id?: number, error?: string}
         */
        async create(data) {
            try {
                if (!this.db) {
                    throw new Error('قاعدة البيانات غير مهيأة');
                }

                // التحقق من وجود البيانات المطلوبة
                if (!data.type) {
                    throw new Error('نوع البيانات مطلوب (type)');
                }

                const transaction = this.db.transaction([STORE_NAME], 'readwrite');
                const objectStore = transaction.objectStore(STORE_NAME);
                
                // إضافة طابع زمني إذا لم يكن موجوداً
                if (!data.timestamp) {
                    data.timestamp = new Date().toISOString();
                }

                const request = objectStore.add(data);

                return new Promise((resolve, reject) => {
                    request.onsuccess = async () => {
                        const id = request.result;
                        console.log(`✅ تم إنشاء سجل جديد بمعرف: ${id}`);
                        
                        // تحديث البيانات المحلية
                        await this.loadAllData();
                        
                        // مزامنة مع Firestore
                        if (window.syncToFirestore && data.type) {
                            const dataWithId = { ...data, id };
                            if (data.type === 'product') {
                                window.syncProductToFirestore(dataWithId).catch(e => console.warn('⚠️ فشل مزامنة المنتج:', e));
                            } else if (data.type === 'category') {
                                window.syncCategoryToFirestore(dataWithId).catch(e => console.warn('⚠️ فشل مزامنة التصنيف:', e));
                            }
                        }
                        
                        resolve({ isOk: true, id: id });
                    };

                    request.onerror = () => {
                        console.error('فشل إنشاء السجل:', request.error);
                        resolve({ isOk: false, error: request.error.message });
                    };
                });
            } catch (error) {
                console.error('خطأ في إنشاء السجل:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * تحديث سجل موجود
         * @param {number} id - معرف السجل
         * @param {Object} data - البيانات الجديدة
         * @returns {Promise<Object>} - {isOk: boolean, error?: string}
         */
        async update(id, data) {
            try {
                if (!this.db) {
                    throw new Error('قاعدة البيانات غير مهيأة');
                }

                const transaction = this.db.transaction([STORE_NAME], 'readwrite');
                const objectStore = transaction.objectStore(STORE_NAME);
                
                // الحصول على السجل الحالي
                const getRequest = objectStore.get(id);

                return new Promise((resolve, reject) => {
                    getRequest.onsuccess = () => {
                        const existingData = getRequest.result;
                        
                        if (!existingData) {
                            resolve({ isOk: false, error: 'السجل غير موجود' });
                            return;
                        }

                        // دمج البيانات الجديدة مع القديمة
                        const updatedData = { ...existingData, ...data, id: id };
                        updatedData.updated_at = new Date().toISOString();

                        const putRequest = objectStore.put(updatedData);

                        putRequest.onsuccess = async () => {
                            console.log(`✅ تم تحديث السجل: ${id}`);
                            
                            // تحديث البيانات المحلية
                            await this.loadAllData();
                            
                            // مزامنة مع Firestore
                            if (window.syncToFirestore && updatedData.type) {
                                if (updatedData.type === 'product') {
                                    window.syncProductToFirestore(updatedData).catch(e => console.warn('⚠️ فشل مزامنة المنتج:', e));
                                } else if (updatedData.type === 'category') {
                                    window.syncCategoryToFirestore(updatedData).catch(e => console.warn('⚠️ فشل مزامنة التصنيف:', e));
                                }
                            }
                            
                            resolve({ isOk: true });
                        };

                        putRequest.onerror = () => {
                            console.error('فشل تحديث السجل:', putRequest.error);
                            resolve({ isOk: false, error: putRequest.error.message });
                        };
                    };

                    getRequest.onerror = () => {
                        console.error('فشل الحصول على السجل:', getRequest.error);
                        resolve({ isOk: false, error: getRequest.error.message });
                    };
                });
            } catch (error) {
                console.error('خطأ في تحديث السجل:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * حذف سجل
         * @param {number} id - معرف السجل
         * @returns {Promise<Object>} - {isOk: boolean, error?: string}
         */
        async delete(id) {
            try {
                if (!this.db) {
                    throw new Error('قاعدة البيانات غير مهيأة');
                }

                const transaction = this.db.transaction([STORE_NAME], 'readwrite');
                const objectStore = transaction.objectStore(STORE_NAME);
                
                // الحصول على السجل قبل حذفه لمعرفة النوع
                const getRequest = objectStore.get(id);

                return new Promise((resolve, reject) => {
                    getRequest.onsuccess = async () => {
                        const record = getRequest.result;
                        const deleteRequest = objectStore.delete(id);
                        
                        deleteRequest.onsuccess = async () => {
                            console.log(`✅ تم حذف السجل: ${id}`);
                            
                            // تحديث البيانات المحلية
                            await this.loadAllData();
                            
                            // حذف من Firestore
                            if (window.deleteFromFirestore && record && record.type) {
                                if (record.type === 'product') {
                                    window.deleteFromFirestore('products', id.toString()).catch(e => console.warn('⚠️ فشل حذف المنتج من Firestore:', e));
                                } else if (record.type === 'category') {
                                    window.deleteFromFirestore('categories', id.toString()).catch(e => console.warn('⚠️ فشل حذف التصنيف من Firestore:', e));
                                }
                            }
                            
                            resolve({ isOk: true });
                        };
                        
                        deleteRequest.onerror = () => {
                            console.error('فشل حذف السجل:', deleteRequest.error);
                            resolve({ isOk: false, error: deleteRequest.error.message });
                        };
                    };
                    
                    getRequest.onerror = () => {
                        console.error('فشل الحصول على السجل:', getRequest.error);
                        resolve({ isOk: false, error: getRequest.error.message });
                    };
                });
            } catch (error) {
                console.error('خطأ في حذف السجل:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * البحث عن سجلات بناءً على معايير
         * @param {Object} criteria - معايير البحث {type, category_id, ...}
         * @returns {Array} - السجلات المطابقة
         */
        query(criteria) {
            if (!criteria) {
                return this.data;
            }

            return this.data.filter(item => {
                for (let key in criteria) {
                    if (item[key] !== criteria[key]) {
                        return false;
                    }
                }
                return true;
            });
        }

        /**
         * الحصول على سجل واحد بواسطة المعرف
         * @param {number} id - معرف السجل
         * @returns {Object|null} - السجل أو null
         */
        getById(id) {
            return this.data.find(item => item.id === id) || null;
        }

        /**
         * الحصول على جميع البيانات
         * @returns {Array} - جميع السجلات
         */
        getAll() {
            return this.data;
        }

        /**
         * حذف جميع البيانات (استخدم بحذر!)
         * @returns {Promise<Object>} - {isOk: boolean, error?: string}
         */
        async clearAll() {
            try {
                if (!this.db) {
                    throw new Error('قاعدة البيانات غير مهيأة');
                }

                const transaction = this.db.transaction([STORE_NAME], 'readwrite');
                const objectStore = transaction.objectStore(STORE_NAME);
                const request = objectStore.clear();

                return new Promise((resolve, reject) => {
                    request.onsuccess = async () => {
                        console.log('✅ تم حذف جميع البيانات');
                        
                        // تحديث البيانات المحلية
                        this.data = [];
                        if (this.dataHandler && this.dataHandler.onDataChanged) {
                            this.dataHandler.onDataChanged(this.data);
                        }
                        
                        resolve({ isOk: true });
                    };

                    request.onerror = () => {
                        console.error('فشل حذف البيانات:', request.error);
                        resolve({ isOk: false, error: request.error.message });
                    };
                });
            } catch (error) {
                console.error('خطأ في حذف البيانات:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * تصدير جميع البيانات كـ JSON
         * @returns {string} - البيانات بصيغة JSON
         */
        exportData() {
            return JSON.stringify(this.data, null, 2);
        }

        /**
         * استيراد بيانات من JSON
         * @param {string} jsonData - البيانات بصيغة JSON
         * @returns {Promise<Object>} - {isOk: boolean, count: number, error?: string}
         */
        async importData(jsonData) {
            try {
                const data = JSON.parse(jsonData);
                
                if (!Array.isArray(data)) {
                    throw new Error('البيانات يجب أن تكون مصفوفة');
                }

                let successCount = 0;
                
                for (let item of data) {
                    // إزالة المعرف القديم للسماح بإنشاء معرف جديد
                    const { id, ...itemData } = item;
                    const result = await this.create(itemData);
                    
                    if (result.isOk) {
                        successCount++;
                    }
                }

                console.log(`✅ تم استيراد ${successCount} من ${data.length} سجل`);
                
                return { isOk: true, count: successCount };
            } catch (error) {
                console.error('خطأ في استيراد البيانات:', error);
                return { isOk: false, error: error.message };
            }
        }
    }

    // إنشاء نسخة واحدة من SDK
    window.dataSdk = new DataSDK();
    
    console.log('✅ Data SDK تم تحميله بنجاح');
})();
