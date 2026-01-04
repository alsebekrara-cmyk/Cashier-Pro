// ملاحظة هامة:
// يجب تضمين هذا الملف (element_sdk.js) في مجلد البناء النهائي (build/output) عند توزيع التطبيق.
// إذا كنت تستخدم سكريبت بناء (npm run build أو غيره)، تأكد من نسخ ملف _sdk/element_sdk.js إلى مجلد build أو output النهائي.
// مثال (في package.json):
//   "build": "... && copy _sdk\\element_sdk.js build\\_sdk\\element_sdk.js && ..."

/**
 * Element SDK - نظام إدارة إعدادات التطبيق
 * يوفر تخزين دائم للإعدادات باستخدام localStorage
 */

(function() {
    'use strict';

    const CONFIG_KEY = 'pos_system_config';
    
    class ElementSDK {
        constructor() {
            this.config = null;
            this.defaultConfig = null;
            this.onConfigChangeCallback = null;
        }

        /**
         * تهيئة SDK
         * @param {Object} options - {defaultConfig, onConfigChange}
         * @returns {Promise<Object>} - {isOk: boolean, config: Object}
         */
        async init(options = {}) {
            try {
                this.defaultConfig = options.defaultConfig || {};
                this.onConfigChangeCallback = options.onConfigChange;

                // تحميل الإعدادات المحفوظة أو استخدام الافتراضية
                const savedConfig = localStorage.getItem(CONFIG_KEY);
                
                if (savedConfig) {
                    try {
                        this.config = JSON.parse(savedConfig);
                        console.log('✅ تم تحميل الإعدادات المحفوظة');
                    } catch (error) {
                        console.warn('⚠️ فشل تحليل الإعدادات المحفوظة، استخدام الافتراضية');
                        this.config = { ...this.defaultConfig };
                    }
                } else {
                    this.config = { ...this.defaultConfig };
                    await this.saveConfig();
                    console.log('✅ تم إنشاء إعدادات افتراضية');
                }

                // إشعار بالإعدادات الحالية
                if (this.onConfigChangeCallback) {
                    await this.onConfigChangeCallback(this.config);
                }

                return { isOk: true, config: this.config };
            } catch (error) {
                console.error('خطأ في تهيئة Element SDK:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * الحصول على الإعدادات الحالية
         * @returns {Object} - الإعدادات
         */
        getConfig() {
            return { ...this.config };
        }

        /**
         * تحديث الإعدادات
         * @param {Object} updates - التحديثات الجزئية
         * @returns {Promise<Object>} - {isOk: boolean, config: Object}
         */
        async updateConfig(updates) {
            try {
                if (!updates || typeof updates !== 'object') {
                    throw new Error('التحديثات يجب أن تكون كائن');
                }

                // دمج التحديثات مع الإعدادات الحالية
                this.config = { ...this.config, ...updates };
                
                // حفظ التغييرات
                await this.saveConfig();

                // إشعار بالتغييرات
                if (this.onConfigChangeCallback) {
                    await this.onConfigChangeCallback(this.config);
                }

                console.log('✅ تم تحديث الإعدادات');
                
                return { isOk: true, config: this.config };
            } catch (error) {
                console.error('خطأ في تحديث الإعدادات:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * حفظ الإعدادات في localStorage
         * @returns {Promise<boolean>} - نجاح العملية
         */
        async saveConfig() {
            try {
                localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
                return true;
            } catch (error) {
                console.error('خطأ في حفظ الإعدادات:', error);
                return false;
            }
        }

        /**
         * إعادة تعيين الإعدادات للقيم الافتراضية
         * @returns {Promise<Object>} - {isOk: boolean, config: Object}
         */
        async resetConfig() {
            try {
                this.config = { ...this.defaultConfig };
                await this.saveConfig();

                // إشعار بالتغييرات
                if (this.onConfigChangeCallback) {
                    await this.onConfigChangeCallback(this.config);
                }

                console.log('✅ تم إعادة تعيين الإعدادات');
                
                return { isOk: true, config: this.config };
            } catch (error) {
                console.error('خطأ في إعادة تعيين الإعدادات:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * تصدير الإعدادات كـ JSON
         * @returns {string} - الإعدادات بصيغة JSON
         */
        exportConfig() {
            return JSON.stringify(this.config, null, 2);
        }

        /**
         * استيراد إعدادات من JSON
         * @param {string} jsonConfig - الإعدادات بصيغة JSON
         * @returns {Promise<Object>} - {isOk: boolean, config: Object}
         */
        async importConfig(jsonConfig) {
            try {
                const config = JSON.parse(jsonConfig);
                
                if (!config || typeof config !== 'object') {
                    throw new Error('الإعدادات يجب أن تكون كائن');
                }

                this.config = config;
                await this.saveConfig();

                // إشعار بالتغييرات
                if (this.onConfigChangeCallback) {
                    await this.onConfigChangeCallback(this.config);
                }

                console.log('✅ تم استيراد الإعدادات');
                
                return { isOk: true, config: this.config };
            } catch (error) {
                console.error('خطأ في استيراد الإعدادات:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * حذف جميع الإعدادات المحفوظة
         * @returns {Promise<Object>} - {isOk: boolean}
         */
        async clearConfig() {
            try {
                localStorage.removeItem(CONFIG_KEY);
                this.config = { ...this.defaultConfig };
                
                console.log('✅ تم حذف الإعدادات المحفوظة');
                
                return { isOk: true };
            } catch (error) {
                console.error('خطأ في حذف الإعدادات:', error);
                return { isOk: false, error: error.message };
            }
        }
    }

    // إنشاء نسخة واحدة من SDK
    window.elementSdk = new ElementSDK();
    
    console.log('✅ Element SDK تم تحميله بنجاح');
})();
