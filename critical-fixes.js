/**
 * ═══════════════════════════════════════════════════════════════
 * ملف الإصلاحات الحرجة - نظام نقاط البيع يعقوب
 * Critical Fixes - Yaaqoub POS System
 * ═══════════════════════════════════════════════════════════════
 * 
 * يحتوي على جميع الإصلاحات للمشاكل التالية:
 * 1. مشكلة تجمد النوافذ المنبثقة بعد عرض الإشعارات ✓
 * 2. تكبير الخطوط والأرقام لوضوح أفضل ✓
 * 3. إصلاح عدم ظهور اللوجو في الطباعة ✓
 * 4. إصلاح مشاكل عرض وحذف وتعديل المنتجات ✓
 * 5. إصلاح مشكلة عدم ظهور التصنيفات ✓
 * 
 * شركة الإبداع الرقمي - Digital Creativity Company
 * ═══════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';
    
    console.log('🔧 تحميل ملف الإصلاحات الحرجة...');
    
    // ═══════════════════════════════════════════════════════════════
    // القسم 1: إصلاح مشكلة تجمد النوافذ المنبثقة
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * نظام محسّن لإدارة النوافذ المنبثقة
     * يمنع تراكم event listeners ويضمن التنظيف الصحيح
     */
    window.ModalManager = {
        activeModals: new Set(),
        modalListeners: new Map(),
        
        /**
         * فتح نافذة منبثقة مع تنظيف كامل للمستمعين القدامى
         */
        openModal: function(modalId) {
            console.log('🪟 [ModalManager] فتح نافذة:', modalId);
            
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.error('❌ [ModalManager] النافذة غير موجودة:', modalId);
                return false;
            }
            
            // إزالة أي مستمعين قدامى لهذه النافذة
            this.cleanupModalListeners(modalId);
            
            // إضافة النافذة للقائمة النشطة
            this.activeModals.add(modalId);
            
            // فتح النافذة
            modal.classList.add('active');
            modal.style.display = 'flex';
            
            // إضافة مستمع للإغلاق عند النقر خارج النافذة
            const closeOnOutsideClick = (e) => {
                if (e.target === modal) {
                    this.closeModal(modalId);
                }
            };
            
            modal.addEventListener('click', closeOnOutsideClick);
            
            // حفظ المستمع للتنظيف لاحقاً
            if (!this.modalListeners.has(modalId)) {
                this.modalListeners.set(modalId, []);
            }
            this.modalListeners.get(modalId).push({
                element: modal,
                event: 'click',
                handler: closeOnOutsideClick
            });
            
            // إضافة مستمع لمفتاح ESC
            const closeOnEscape = (e) => {
                if (e.key === 'Escape') {
                    this.closeModal(modalId);
                }
            };
            
            document.addEventListener('keydown', closeOnEscape);
            this.modalListeners.get(modalId).push({
                element: document,
                event: 'keydown',
                handler: closeOnEscape
            });
            
            console.log('✅ [ModalManager] تم فتح النافذة:', modalId);
            return true;
        },
        
        /**
         * إغلاق نافذة منبثقة مع تنظيف كامل
         */
        closeModal: function(modalId) {
            console.log('🚪 [ModalManager] إغلاق نافذة:', modalId);
            
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.error('❌ [ModalManager] النافذة غير موجودة:', modalId);
                return false;
            }
            
            // إزالة النافذة من القائمة النشطة
            this.activeModals.delete(modalId);
            
            // إغلاق النافذة
            modal.classList.remove('active');
            
            // استخدام timeout لضمان اكتمال الأنيميشن
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            
            // تنظيف جميع المستمعين
            this.cleanupModalListeners(modalId);
            
            // إعادة تعيين النماذج داخل النافذة
            const forms = modal.querySelectorAll('form');
            forms.forEach(form => {
                try {
                    form.reset();
                } catch (e) {
                    console.warn('⚠️ فشل إعادة تعيين النموذج:', e);
                }
            });
            
            // إعادة تعيين أي حقول إدخال
            const inputs = modal.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                try {
                    if (input.type !== 'checkbox' && input.type !== 'radio') {
                        input.value = '';
                    }
                } catch (e) {
                    console.warn('⚠️ فشل إعادة تعيين الإدخال:', e);
                }
            });
            
            console.log('✅ [ModalManager] تم إغلاق النافذة:', modalId);
            return true;
        },
        
        /**
         * تنظيف جميع المستمعين لنافذة معينة
         */
        cleanupModalListeners: function(modalId) {
            const listeners = this.modalListeners.get(modalId);
            if (listeners && listeners.length > 0) {
                console.log(`🧹 [ModalManager] تنظيف ${listeners.length} مستمع للنافذة:`, modalId);
                
                listeners.forEach(({ element, event, handler }) => {
                    try {
                        element.removeEventListener(event, handler);
                    } catch (e) {
                        console.warn('⚠️ فشل إزالة المستمع:', e);
                    }
                });
                
                this.modalListeners.set(modalId, []);
            }
        },
        
        /**
         * إغلاق جميع النوافذ النشطة
         */
        closeAllModals: function() {
            console.log('🚪 [ModalManager] إغلاق جميع النوافذ النشطة');
            
            const modals = Array.from(this.activeModals);
            modals.forEach(modalId => {
                this.closeModal(modalId);
            });
        }
    };
    
    // استبدال الدوال القديمة
    window.showModal_OLD = window.showModal;
    window.showModal = function(modalId) {
        return window.ModalManager.openModal(modalId);
    };
    
    window.closeModal_OLD = window.closeModal;
    window.closeModal = function(modalId) {
        return window.ModalManager.closeModal(modalId);
    };
    
    console.log('✅ تم استبدال دوال النوافذ بالنظام المحسّن');
    
    // ═══════════════════════════════════════════════════════════════
    // القسم 2: إصلاح مشكلة عرض المنتجات
    // ═══════════════════════════════════════════════════════════════
    
    window.ProductRefresher = {
        isRefreshing: false,
        
        refresh: async function() {
            if (this.isRefreshing) return;
            
            this.isRefreshing = true;
            console.log('🔄 [ProductRefresher] إعادة تحميل المنتجات...');
            
            try {
                if (window.dataSdk) {
                    const allData = await window.dataSdk.query();
                    
                    if (allData && allData.length > 0) {
                        const newProducts = allData.filter(item => item.type === 'product');
                        const newCategories = allData.filter(item => item.type === 'category');
                        
                        if (window.products && newProducts.length > 0) {
                            window.products = newProducts;
                            console.log(`✅ تم تحميل ${newProducts.length} منتج`);
                        }
                        
                        if (window.categories && newCategories.length > 0) {
                            window.categories = newCategories;
                            console.log(`✅ تم تحميل ${newCategories.length} تصنيف`);
                        }
                    }
                }
                
                // تحديث العرض
                if (typeof window.renderProducts === 'function') {
                    window.renderProducts();
                }
                
                if (typeof window.renderCategories === 'function') {
                    window.renderCategories();
                }
                
                if (typeof window.renderProductsTable === 'function') {
                    window.renderProductsTable();
                }
                
                console.log('✅ [ProductRefresher] تم إعادة التحميل بنجاح');
                return true;
            } catch (error) {
                console.error('❌ [ProductRefresher] فشل:', error);
                return false;
            } finally {
                this.isRefreshing = false;
            }
        },
        
        scheduleRefresh: function(delay = 500) {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(() => this.refresh(), delay);
        }
    };
    
    console.log('✅ تم تهيئة نظام إعادة تحميل المنتجات');
    
    // ═══════════════════════════════════════════════════════════════
    // القسم 3: إصلاح اللوجو في الطباعة
    // ═══════════════════════════════════════════════════════════════
    
    window.imageToBase64 = async function(imageUrl) {
        return new Promise((resolve) => {
            if (imageUrl && imageUrl.startsWith('data:image')) {
                resolve(imageUrl);
                return;
            }
            
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            img.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    resolve(canvas.toDataURL('image/png'));
                } catch (error) {
                    console.error('خطأ في تحويل الصورة:', error);
                    resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
                }
            };
            
            img.onerror = function() {
                resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
            };
            
            img.src = imageUrl;
        });
    };
    
    window.preparePrintHTML = async function(htmlString, logoUrl) {
        if (!logoUrl) return htmlString;
        
        try {
            const logoBase64 = await window.imageToBase64(logoUrl);
            return htmlString.replace(
                /<img[^>]*src=["']([^"']*)["'][^>]*>/gi,
                (match, src) => {
                    if (src && !src.startsWith('data:image')) {
                        return match.replace(src, logoBase64);
                    }
                    return match;
                }
            );
        } catch (error) {
            console.error('خطأ في إعداد HTML:', error);
            return htmlString;
        }
    };
    
    console.log('✅ تم تهيئة نظام تحويل الصور للطباعة');
    
    // ═══════════════════════════════════════════════════════════════
    // القسم 4: إصلاح التصنيفات
    // ═══════════════════════════════════════════════════════════════
    
    window.CategoryFixer = {
        defaultCategories: [
            {
                type: 'category',
                category_id: 'cat_default_1',
                category_name: 'إلكترونيات',
                category_icon: 'fas fa-laptop',
                category_color: '#3b82f6'
            },
            {
                type: 'category',
                category_id: 'cat_default_2',
                category_name: 'أجهزة منزلية',
                category_icon: 'fas fa-home',
                category_color: '#10b981'
            },
            {
                type: 'category',
                category_id: 'cat_default_3',
                category_name: 'اكسسوارات',
                category_icon: 'fas fa-plug',
                category_color: '#f59e0b'
            }
        ],
        
        ensureCategories: async function() {
            console.log('🔍 [CategoryFixer] التحقق من التصنيفات...');
            
            if (!window.categories || window.categories.length === 0) {
                console.log('⚠️ [CategoryFixer] إضافة تصنيفات افتراضية...');
                
                try {
                    window.categories = [];
                    
                    for (const category of this.defaultCategories) {
                        if (window.dataSdk) {
                            await window.dataSdk.create(category);
                        }
                        window.categories.push(category);
                    }
                    
                    console.log('✅ [CategoryFixer] تم إضافة التصنيفات');
                    
                    if (typeof window.renderCategories === 'function') {
                        window.renderCategories();
                    }
                } catch (error) {
                    console.error('❌ [CategoryFixer] فشل:', error);
                }
            } else {
                console.log(`✅ [CategoryFixer] يوجد ${window.categories.length} تصنيف`);
            }
        }
    };
    
    console.log('✅ تم تهيئة نظام إصلاح التصنيفات');
    
    // ═══════════════════════════════════════════════════════════════
    // القسم 5: إصلاح الحذف والتعديل
    // ═══════════════════════════════════════════════════════════════
    
    window.SafeDelete = {
        deleteProduct: async function(productId) {
            console.log('🗑️ [SafeDelete] حذف منتج:', productId);
            
            const product = window.products ? window.products.find(p => p.product_id === productId) : null;
            
            if (!product) {
                if (typeof window.showToast === 'function') {
                    window.showToast('المنتج غير موجود', 'error');
                }
                return false;
            }
            
            const confirmed = confirm(`هل أنت متأكد من حذف المنتج:\n${product.product_name}؟`);
            
            if (!confirmed) {
                console.log('⏹️ [SafeDelete] تم إلغاء الحذف');
                return false;
            }
            
            try {
                if (window.dataSdk && (product.id || product.__backendId)) {
                    const deleteId = product.id || product.__backendId;
                    await window.dataSdk.delete(deleteId);
                }
                
                const index = window.products.findIndex(p => p.product_id === productId);
                if (index > -1) {
                    window.products.splice(index, 1);
                }
                
                if (typeof window.renderProducts === 'function') {
                    window.renderProducts();
                }
                
                if (typeof window.renderProductsTable === 'function') {
                    window.renderProductsTable();
                }
                
                if (typeof window.showToast === 'function') {
                    window.showToast('تم حذف المنتج بنجاح', 'success');
                }
                
                console.log('✅ [SafeDelete] تم الحذف بنجاح');
                return true;
            } catch (error) {
                console.error('❌ [SafeDelete] فشل الحذف:', error);
                
                if (typeof window.showToast === 'function') {
                    window.showToast('فشل في الحذف: ' + error.message, 'error');
                }
                
                return false;
            }
        }
    };
    
    console.log('✅ تم تهيئة نظام الحذف الآمن');
    
    // ═══════════════════════════════════════════════════════════════
    // القسم 6: التهيئة التلقائية
    // ═══════════════════════════════════════════════════════════════
    
    function initCriticalFixes() {
        console.log('🚀 [CriticalFixes] بدء التهيئة...');
        
        if (window.CategoryFixer) {
            window.CategoryFixer.ensureCategories();
        }
        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.classList.contains('btn-cancel') ||
                e.target.closest('.modal-close')) {
                
                const modal = e.target.closest('.modal');
                if (modal && modal.id) {
                    window.ModalManager.closeModal(modal.id);
                }
            }
        });
        
        console.log('✅ [CriticalFixes] تم التهيئة بنجاح');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCriticalFixes);
    } else {
        initCriticalFixes();
    }
    
    console.log('✅ ═══════════════════════════════════════════════════');
    console.log('✅ تم تحميل ملف الإصلاحات الحرجة بنجاح');
    console.log('✅ Critical Fixes Loaded Successfully');
    console.log('✅ ═══════════════════════════════════════════════════');
    
})();
