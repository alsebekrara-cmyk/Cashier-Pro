/**
 * ========================================
 * إصلاح شامل لنظام إدارة المنتجات - النسخة النهائية 3.2
 * Digital Creativity Company - نظام يعقوب POS
 * ========================================
 * 
 * ✅ عرض تفاصيل المنتج (النسخة المحددة من المستخدم)
 * ✅ ملء قوائم التصنيفات بشكل صحيح
 * ✅ حذف وتعديل المنتجات باستخدام dataSdk الصحيح
 * ✅ نظام Cache و Debouncing
 * ✅ معالجة شاملة للأخطاء
 * 
 * الإصدار: 3.2 - النسخة النهائية
 * التاريخ: 22 ديسمبر 2025
 */

(function() {
    'use strict';
    
    console.log('🔧 تحميل إصلاحات نظام إدارة المنتجات النسخة 3.2...');
    
    // ==================== متغيرات عامة لإدارة الحالة ====================
    
    let isUpdating = false;
    let updateTimeout = null;
    let categoriesCache = null;
    let productsCache = null;
    let lastCategoriesUpdate = 0;
    let lastProductsUpdate = 0;
    const CATEGORIES_CACHE_DURATION = 5000; // 5 ثواني
    const PRODUCTS_CACHE_DURATION = 3000; // 3 ثواني
    const UPDATE_DEBOUNCE_DELAY = 300; // 300 ميلي ثانية
    
    // ==================== دوال مساعدة ====================
    
    /**
     * Debounce function - تأخير تنفيذ الدالة
     */
    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    /**
     * دالة تنسيق العملة
     */
    if (!window.formatCurrency) {
        window.formatCurrency = function(amount) {
            try {
                return new Intl.NumberFormat('ar-IQ', {
                    style: 'currency',
                    currency: 'IQD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(amount || 0);
            } catch (error) {
                return (amount || 0).toLocaleString('ar-IQ') + ' د.ع';
            }
        };
    }
    
    /**
     * الحصول على المنتجات من مصادر متعددة
     */
    async function getProducts() {
        try {
            const now = Date.now();
            
            // استخدام الكاش إذا كان حديثاً
            if (productsCache && (now - lastProductsUpdate) < PRODUCTS_CACHE_DURATION) {
                console.log('📦 استخدام المنتجات من الكاش');
                return productsCache;
            }
            
            let loadedProducts = null;
            
            // محاولة 1: من المتغير العام
            if (window.products && Array.isArray(window.products) && window.products.length > 0) {
                loadedProducts = window.products;
                console.log('✅ تم تحميل المنتجات من المتغير العام');
            }
            // محاولة 2: من dataSdk
            else if (window.dataSdk && typeof window.dataSdk.query === 'function') {
                const allData = window.dataSdk.query({type: 'product'});
                if (allData && Array.isArray(allData) && allData.length > 0) {
                    loadedProducts = allData;
                    console.log('✅ تم تحميل المنتجات من dataSdk');
                }
            }
            
            // تحديث الكاش
            if (loadedProducts && loadedProducts.length > 0) {
                productsCache = loadedProducts;
                lastProductsUpdate = now;
                
                // تحديث المتغير العام
                if (window.products !== loadedProducts) {
                    window.products = loadedProducts;
                }
                
                return loadedProducts;
            }
            
            console.warn('⚠️ لم يتم العثور على منتجات');
            return [];
            
        } catch (error) {
            console.error('❌ خطأ في تحميل المنتجات:', error);
            return productsCache || window.products || [];
        }
    }
    
    /**
     * الحصول على التصنيفات من مصادر متعددة
     */
    async function getCategories() {
        try {
            const now = Date.now();
            
            // استخدام الكاش إذا كان حديثاً
            if (categoriesCache && (now - lastCategoriesUpdate) < CATEGORIES_CACHE_DURATION) {
                console.log('📦 استخدام التصنيفات من الكاش');
                return categoriesCache;
            }
            
            let loadedCategories = null;
            
            // محاولة 1: من المتغير العام
            if (window.categories && Array.isArray(window.categories) && window.categories.length > 0) {
                loadedCategories = window.categories;
                console.log('✅ تم تحميل التصنيفات من المتغير العام');
            }
            // محاولة 2: من dataSdk
            else if (window.dataSdk && typeof window.dataSdk.query === 'function') {
                const allData = window.dataSdk.query({type: 'category'});
                if (allData && Array.isArray(allData) && allData.length > 0) {
                    loadedCategories = allData;
                    console.log('✅ تم تحميل التصنيفات من dataSdk');
                }
            }
            
            // تحديث الكاش
            if (loadedCategories && loadedCategories.length > 0) {
                categoriesCache = loadedCategories;
                lastCategoriesUpdate = now;
                
                // تحديث المتغير العام
                if (window.categories !== loadedCategories) {
                    window.categories = loadedCategories;
                }
                
                return loadedCategories;
            }
            
            console.warn('⚠️ لم يتم العثور على تصنيفات');
            return [];
            
        } catch (error) {
            console.error('❌ خطأ في تحميل التصنيفات:', error);
            return categoriesCache || window.categories || [];
        }
    }
    
    /**
     * البحث عن منتج بواسطة المعرف
     */
    async function findProductById(productId) {
        try {
            const allProducts = await getProducts();
            
            // البحث بحسب product_id
            let product = allProducts.find(p => p.product_id === productId);
            
            // إذا لم نجد، نبحث بحسب id
            if (!product) {
                product = allProducts.find(p => p.id === productId || p.id === parseInt(productId));
            }
            
            return product || null;
            
        } catch (error) {
            console.error('❌ خطأ في البحث عن المنتج:', error);
            return null;
        }
    }
    
    /**
     * البحث عن تصنيف بواسطة المعرف
     */
    async function findCategoryById(categoryId) {
        try {
            const allCategories = await getCategories();
            
            // البحث بحسب category_id
            let category = allCategories.find(c => c.category_id === categoryId);
            
            // إذا لم نجد، نبحث بحسب id
            if (!category) {
                category = allCategories.find(c => c.id === categoryId || c.id === parseInt(categoryId));
            }
            
            return category || null;
            
        } catch (error) {
            console.error('❌ خطأ في البحث عن التصنيف:', error);
            return null;
        }
    }
    
    // ==================== دالة عرض تفاصيل المنتج - النسخة المحددة ====================
    
    /**
     * عرض تفاصيل المنتج الكاملة
     * @param {string} productId - معرف المنتج
     */
    window.showProductDetails = async function(productId) {
        console.log('📋 عرض تفاصيل المنتج:', productId);
        try {
            // جلب المنتجات بشكل آمن
            let allProducts = window.products && Array.isArray(window.products) ? window.products : null;
            if (!allProducts) {
                allProducts = await getProducts();
                if (!allProducts || !Array.isArray(allProducts) || allProducts.length === 0) {
                    console.error('❌ مصفوفة المنتجات غير متوفرة');
                    if (typeof showToast === 'function') {
                        showToast('خطأ: البيانات غير متوفرة', 'error');
                    } else {
                        alert('خطأ: البيانات غير متوفرة');
                    }
                    return;
                }
            }
            // البحث عن المنتج
            const product = allProducts.find(p => p.product_id === productId);
            if (!product) {
                console.error('❌ المنتج غير موجود:', productId);
                if (typeof showToast === 'function') {
                    showToast('المنتج غير موجود', 'error');
                } else {
                    alert('المنتج غير موجود');
                }
                return;
            }
            console.log('✅ تم العثور على المنتج:', product);
            // البحث عن التصنيف
            let category = null;
            let allCategories = window.categories && Array.isArray(window.categories) ? window.categories : null;
            if (!allCategories) {
                allCategories = await getCategories();
            }
            if (allCategories && Array.isArray(allCategories)) {
                category = allCategories.find(c => c.category_id === product.product_category);
            }
            // حساب معلومات إضافية
            const totalCost = (product.stock_quantity || 0) * (product.product_cost_retail || 0);
            const totalValue = (product.stock_quantity || 0) * (product.product_price_retail || 0);
            const profit = totalValue - totalCost;
            const profitMargin = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(2) : 0;
            // تحديد حالة المخزون
            let stockStatus = 'متوفر';
            let stockClass = 'text-success';
            if (product.stock_quantity === 0) {
                stockStatus = 'نفد المخزون';
                stockClass = 'text-danger';
            } else if (product.stock_quantity <= (product.min_stock || 0)) {
                stockStatus = 'مخزون قليل';
                stockClass = 'text-warning';
            }
            // بناء محتوى التفاصيل
            const content = `
                <div class="product-details-container" style="padding: 1rem;">
                    <!-- معلومات أساسية -->
                    <div class="details-section" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--theme-bg-secondary, #2a2a3e); border-radius: 8px;">
                        <h4 style="margin-bottom: 1rem; color: var(--primary-color, #6366f1); display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-info-circle"></i>
                            <span>المعلومات الأساسية</span>
                        </h4>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-tag"></i> اسم المنتج:
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--theme-text-primary, #f3f4f6);">
                                ${product.product_name || 'غير محدد'}
                            </span>
                        </div>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-barcode"></i> الباركود:
                            </span>
                            <span class="detail-value" style="font-family: monospace; color: var(--theme-text-primary, #f3f4f6);">
                                ${product.product_barcode || 'غير محدد'}
                            </span>
                        </div>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-layer-group"></i> التصنيف:
                            </span>
                            <span class="detail-value" style="color: var(--theme-text-primary, #f3f4f6);">
                                ${category ? `<i class="${category.category_icon || 'fas fa-folder'}"></i> ${category.category_name}` : 'غير محدد'}
                            </span>
                        </div>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-truck"></i> المورد:
                            </span>
                            <span class="detail-value" style="color: var(--theme-text-primary, #f3f4f6);">
                                ${product.supplier || 'غير محدد'}
                            </span>
                        </div>
                    </div>
                    <!-- معلومات الأسعار -->
                    <div class="details-section" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--theme-bg-secondary, #2a2a3e); border-radius: 8px;">
                        <h4 style="margin-bottom: 1rem; color: var(--success-color, #10b981); display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>معلومات الأسعار</span>
                        </h4>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-coins"></i> سعر التكلفة (مفرد):
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--warning-color, #f59e0b);">
                                ${formatCurrency(product.product_cost_retail)}
                            </span>
                        </div>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-coins"></i> سعر التكلفة (جملة):
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--warning-color, #f59e0b);">
                                ${formatCurrency(product.product_cost_wholesale || product.product_cost_retail)}
                            </span>
                        </div>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-money-bill"></i> سعر البيع (مفرد):
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--success-color, #10b981);">
                                ${formatCurrency(product.product_price_retail)}
                            </span>
                        </div>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-money-bill"></i> سعر البيع (جملة):
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--success-color, #10b981);">
                                ${formatCurrency(product.product_price_wholesale || product.product_price_retail)}
                            </span>
                        </div>
                    </div>
                    <!-- معلومات المخزون -->
                    <div class="details-section" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--theme-bg-secondary, #2a2a3e); border-radius: 8px;">
                        <h4 style="margin-bottom: 1rem; color: var(--info-color, #3b82f6); display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-warehouse"></i>
                            <span>معلومات المخزون</span>
                        </h4>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-boxes"></i> الكمية الحالية:
                            </span>
                            <span class="detail-value ${stockClass}" style="font-weight: 700; font-size: 1.2em;">
                                ${product.stock_quantity || 0}
                            </span>
                        </div>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-exclamation-triangle"></i> الحد الأدنى للمخزون:
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--theme-text-primary, #f3f4f6);">
                                ${product.min_stock || 0}
                            </span>
                        </div>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-info-circle"></i> حالة المخزون:
                            </span>
                            <span class="detail-value ${stockClass}" style="font-weight: 700;">
                                ${stockStatus}
                            </span>
                        </div>
                    </div>
                    <!-- معلومات مالية -->
                    <div class="details-section" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--theme-bg-secondary, #2a2a3e); border-radius: 8px;">
                        <h4 style="margin-bottom: 1rem; color: var(--primary-color, #6366f1); display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-chart-line"></i>
                            <span>التحليل المالي</span>
                        </h4>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-dollar-sign"></i> إجمالي التكلفة:
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--warning-color, #f59e0b);">
                                ${formatCurrency(totalCost)}
                            </span>
                        </div>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-money-check-alt"></i> إجمالي القيمة:
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--success-color, #10b981);">
                                ${formatCurrency(totalValue)}
                            </span>
                        </div>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-chart-bar"></i> الربح المتوقع:
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: ${profit >= 0 ? 'var(--success-color, #10b981)' : 'var(--danger-color, #ef4444)'};">
                                ${formatCurrency(profit)}
                            </span>
                        </div>
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);">
                                <i class="fas fa-percentage"></i> هامش الربح:
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: ${profit >= 0 ? 'var(--success-color, #10b981)' : 'var(--danger-color, #ef4444)'};">
                                ${profitMargin}%
                            </span>
                        </div>
                    </div>
                    <!-- معلومات النظام -->
                    ${(product.created_at || product.modified_at) ? `
                    <div class="details-section" style="padding: 1rem; background: var(--theme-bg-secondary, #2a2a3e); border-radius: 8px;">
                        <h4 style="margin-bottom: 1rem; color: var(--theme-text-secondary, #9ca3af); display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-clock"></i>
                            <span>معلومات النظام</span>
                        </h4>
                        ${product.created_at ? `<div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);"><span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);"><i class="fas fa-calendar-plus"></i> تاريخ الإضافة:</span><span class="detail-value" style="color: var(--theme-text-primary, #f3f4f6);">${new Date(product.created_at).toLocaleString('ar-IQ')}</span></div>` : ''}
                        ${product.created_by_name ? `<div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);"><span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);"><i class="fas fa-user"></i> أضيف بواسطة:</span><span class="detail-value" style="color: var(--theme-text-primary, #f3f4f6);">${product.created_by_name}</span></div>` : ''}
                        ${product.modified_at ? `<div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);"><span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);"><i class="fas fa-calendar-alt"></i> آخر تعديل:</span><span class="detail-value" style="color: var(--theme-text-primary, #f3f4f6);">${new Date(product.modified_at).toLocaleString('ar-IQ')}</span></div>` : ''}
                        ${product.modified_by_name ? `<div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary, #9ca3af);"><i class="fas fa-user-edit"></i> عُدل بواسطة:</span><span class="detail-value" style="color: var(--theme-text-primary, #f3f4f6);">${product.modified_by_name}</span></div>` : ''}
                    </div>
                    ` : ''}
                    <!-- أزرار الإجراءات -->
                    <div class="details-actions" style="margin-top: 1.5rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
                        ${window.securityManager && window.securityManager.hasPermission('products_edit') ? `<button onclick="closeModal('productDetailsModal'); editProduct('${productId}');" class="btn btn-primary" style="display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-edit"></i><span>تعديل المنتج</span></button>` : ''}
                        <button onclick="closeModal('productDetailsModal');" class="btn btn-secondary" style="display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-times"></i><span>إغلاق</span></button>
                    </div>
                </div>
            `;
            // تحديث محتوى النافذة
            const detailsContainer = document.getElementById('productDetailsContent');
            if (detailsContainer) {
                detailsContainer.innerHTML = content;
                console.log('✅ تم تحديث محتوى النافذة');
            } else {
                console.error('❌ عنصر productDetailsContent غير موجود');
                if (typeof showToast === 'function') {
                    showToast('خطأ في عرض التفاصيل', 'error');
                } else {
                    alert('خطأ في عرض التفاصيل');
                }
                return;
            }
            // إظهار النافذة
            if (typeof showModal === 'function') {
                showModal('productDetailsModal');
            } else if (typeof openModal === 'function') {
                openModal('productDetailsModal');
            } else {
                // طريقة بديلة لفتح النافذة
                const modal = document.getElementById('productDetailsModal');
                if (modal) {
                    modal.classList.add('active');
                    console.log('✅ تم فتح النافذة بطريقة بديلة');
                }
            }
            console.log('✅✅✅ تم عرض تفاصيل المنتج بنجاح');
        } catch (error) {
            console.error('❌ خطأ في عرض تفاصيل المنتج:', error);
            if (typeof showToast === 'function') {
                showToast('حدث خطأ في عرض التفاصيل: ' + error.message, 'error');
            } else {
                alert('حدث خطأ في عرض التفاصيل: ' + error.message);
            }
        }
    };
    
    // ==================== باقي الدوال (بدون تغيير) ====================
    
    /**
     * تحديث عرض المنتجات (مع منع التحديثات المتكررة)
     */
    const refreshProductsDisplay = debounce(async function() {
        if (isUpdating) {
            console.log('⏸️ تحديث قيد التنفيذ بالفعل، تم التجاهل');
            return;
        }
        
        console.log('🔄 تحديث عرض المنتجات...');
        isUpdating = true;
        
        try {
            // مسح الكاش لإعادة تحميل البيانات
            productsCache = null;
            lastProductsUpdate = 0;
            
            // تحديث العرض حسب الصفحة النشطة
            const currentPage = document.querySelector('.page.active');
            
            if (currentPage && currentPage.id === 'productsPage') {
                // تحديث قائمة المنتجات
                if (typeof displayProductsByCategory === 'function') {
                    const categoryFilter = document.getElementById('productCategoryFilter');
                    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
                    await displayProductsByCategory(selectedCategory);
                }
            } else if (currentPage && currentPage.id === 'pos') {
                // تحديث منتجات نقطة البيع
                if (typeof loadPOSProducts === 'function') {
                    await loadPOSProducts();
                }
            }
            
            console.log('✅ تم تحديث عرض المنتجات');
        } catch (error) {
            console.error('❌ خطأ في تحديث عرض المنتجات:', error);
        } finally {
            isUpdating = false;
        }
    }, UPDATE_DEBOUNCE_DELAY);
    
    window.refreshProductsDisplay = refreshProductsDisplay;
    
    /**
     * عرض المنتجات حسب التصنيف
     */
    window.displayProductsByCategory = async function(categoryId = 'all') {
        console.log('📦 عرض منتجات التصنيف:', categoryId);
        
        try {
            const container = document.getElementById('productsList');
            if (!container) {
                console.error('❌ لم يتم العثور على حاوية المنتجات');
                return;
            }
            
            // تحميل البيانات
            const allProducts = await getProducts();
            const allCategories = await getCategories();
            
            // تصفية المنتجات
            let filteredProducts = allProducts;
            if (categoryId !== 'all') {
                filteredProducts = allProducts.filter(p => p.product_category === categoryId);
            }
            
            // عرض المنتجات
            if (filteredProducts.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" style="text-align: center; padding: 3rem; color: var(--theme-text-secondary, #9ca3af);">
                        <i class="fas fa-box-open" style="font-size: 4rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                        <p style="font-size: 1.2rem; margin: 0;">لا توجد منتجات في هذا التصنيف</p>
                    </div>
                `;
                return;
            }
            
            // بناء HTML للمنتجات
            const productsHTML = filteredProducts.map(product => {
                const category = allCategories.find(c => c.category_id === product.product_category || c.id === product.product_category);
                const stockClass = product.stock_quantity === 0 ? 'out-of-stock' : 
                                  product.stock_quantity <= (product.min_stock || 0) ? 'low-stock' : '';
                
                // استخدام product_id أو id
                const productIdentifier = product.product_id || product.id;
                
                return `
                    <div class="product-card ${stockClass}" data-product-id="${productIdentifier}">
                        <div class="product-header">
                            <h3 class="product-name">${product.product_name || 'منتج بدون اسم'}</h3>
                            ${category ? `<span class="product-category"><i class="${category.category_icon || 'fas fa-folder'}"></i> ${category.category_name}</span>` : ''}
                        </div>
                        
                        <div class="product-info">
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-barcode"></i> الباركود:</span>
                                <span class="info-value">${product.product_barcode || 'غير محدد'}</span>
                            </div>
                            
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-dollar-sign"></i> السعر:</span>
                                <span class="info-value price">${formatCurrency(product.product_price_retail)}</span>
                            </div>
                            
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-boxes"></i> المخزون:</span>
                                <span class="info-value stock ${stockClass}">${product.stock_quantity || 0}</span>
                            </div>
                        </div>
                        
                        <div class="product-actions">
                            <button class="btn btn-sm btn-primary" onclick="showProductDetails('${productIdentifier}')" title="عرض التفاصيل">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="editProduct('${productIdentifier}')" title="تعديل">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteProduct('${productIdentifier}')" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            
            container.innerHTML = productsHTML;
            console.log(`✅ تم عرض ${filteredProducts.length} منتج`);
            
        } catch (error) {
            console.error('❌ خطأ في عرض المنتجات:', error);
        }
    };
    
    /**
     * حذف منتج مع تحديث فوري للواجهة
     */
    window.deleteProduct = async function(productId) {
        console.log('🗑️ حذف المنتج:', productId);
        
        try {
            // البحث عن المنتج
            const product = await findProductById(productId);
            
            if (!product) {
                const msg = 'المنتج غير موجود';
                console.error('❌', msg);
                if (typeof showToast === 'function') {
                    showToast(msg, 'error');
                } else {
                    alert(msg);
                }
                return;
            }
            
            // التأكيد من المستخدم
            const confirmDelete = confirm(`هل أنت متأكد من حذف المنتج: ${product.product_name}؟`);
            if (!confirmDelete) {
                console.log('❌ تم إلغاء الحذف');
                return;
            }
            
            // الحذف من dataSdk باستخدام id (ليس product_id)
            const recordId = product.id || product.product_id;
            
            if (window.dataSdk && typeof window.dataSdk.delete === 'function') {
                const result = await window.dataSdk.delete(recordId);
                
                if (result && result.isOk) {
                    console.log('✅ تم الحذف من dataSdk');
                    
                    // حذف من المصفوفة المحلية
                    if (window.products && Array.isArray(window.products)) {
                        const index = window.products.findIndex(p => 
                            p.product_id === productId || p.id === productId || 
                            p.id === parseInt(productId) || p.product_id === parseInt(productId)
                        );
                        if (index > -1) {
                            window.products.splice(index, 1);
                            console.log('✅ تم الحذف من المصفوفة المحلية');
                        }
                    }
                    
                    // مسح الكاش
                    productsCache = null;
                    lastProductsUpdate = 0;
                    
                    // تحديث الواجهة فوراً
                    await refreshProductsDisplay();
                    
                    // إغلاق نافذة التفاصيل إذا كانت مفتوحة
                    if (typeof closeModal === 'function') {
                        closeModal('productDetailsModal');
                    }
                    
                    if (typeof showToast === 'function') {
                        showToast('تم حذف المنتج بنجاح', 'success');
                    } else {
                        alert('تم حذف المنتج بنجاح');
                    }
                    console.log('✅ تم حذف المنتج بنجاح');
                } else {
                    throw new Error(result?.error || 'فشل الحذف من dataSdk');
                }
            } else {
                throw new Error('dataSdk غير متوفر أو دالة delete غير موجودة');
            }
            
        } catch (error) {
            console.error('❌ خطأ في حذف المنتج:', error);
            if (typeof showToast === 'function') {
                showToast('فشل حذف المنتج: ' + error.message, 'error');
            } else {
                alert('فشل حذف المنتج: ' + error.message);
            }
        }
    };
    
    /**
     * تعديل منتج (مع ملء التصنيفات)
     */
    window.editProduct = async function(productId) {
        console.log('✏️ تعديل المنتج:', productId);
        
        try {
            const product = await findProductById(productId);
            
            if (!product) {
                console.error('❌ المنتج غير موجود:', productId);
                if (typeof showToast === 'function') {
                    showToast('المنتج غير موجود', 'error');
                } else {
                    alert('المنتج غير موجود');
                }
                return;
            }
            
            console.log('✅ تم العثور على المنتج للتعديل:', product);
            
            // ملء نموذج التعديل
            const editProductId = document.getElementById('editProductId');
            if (editProductId) editProductId.value = product.product_id || product.id || '';
            
            const editProductName = document.getElementById('editProductName');
            if (editProductName) editProductName.value = product.product_name || '';
            
            const editProductBarcode = document.getElementById('editProductBarcode');
            if (editProductBarcode) editProductBarcode.value = product.product_barcode || '';
            
            const editProductPriceRetail = document.getElementById('editProductPriceRetail');
            if (editProductPriceRetail) editProductPriceRetail.value = product.product_price_retail || '';
            
            const editProductPriceWholesale = document.getElementById('editProductPriceWholesale');
            if (editProductPriceWholesale) editProductPriceWholesale.value = product.product_price_wholesale || product.product_price_retail || '';
            
            const editProductCostRetail = document.getElementById('editProductCostRetail');
            if (editProductCostRetail) editProductCostRetail.value = product.product_cost_retail || '';
            
            const editProductCostWholesale = document.getElementById('editProductCostWholesale');
            if (editProductCostWholesale) editProductCostWholesale.value = product.product_cost_wholesale || product.product_cost_retail || '';
            
            const editStockQuantity = document.getElementById('editStockQuantity');
            if (editStockQuantity) editStockQuantity.value = product.stock_quantity || 0;
            
            const editMinStock = document.getElementById('editMinStock');
            if (editMinStock) editMinStock.value = product.min_stock || 0;
            
            const editSupplier = document.getElementById('editSupplier');
            if (editSupplier) editSupplier.value = product.supplier || '';
            
            // ملء قائمة التصنيفات
            await populateCategorySelect('editProductCategory', product.product_category);
            
            // فتح النافذة
            if (typeof openModal === 'function') {
                openModal('editProductModal');
            } else if (typeof showModal === 'function') {
                showModal('editProductModal');
            }
            console.log('✅ تم فتح نافذة التعديل');
            
        } catch (error) {
            console.error('❌ خطأ في تعديل المنتج:', error);
            if (typeof showToast === 'function') {
                showToast('حدث خطأ في فتح نافذة التعديل: ' + error.message, 'error');
            } else {
                alert('حدث خطأ في فتح نافذة التعديل: ' + error.message);
            }
        }
    };
    
    /**
     * ملء قائمة تصنيف واحدة
     */
    async function populateCategorySelect(selectId, selectedValue = null) {
        try {
            const select = document.getElementById(selectId);
            if (!select) {
                console.warn(`⚠️ القائمة ${selectId} غير موجودة`);
                return;
            }
            
            // الحصول على التصنيفات
            const loadedCategories = await getCategories();
            
            console.log(`📦 تم تحميل ${loadedCategories.length} تصنيف لـ ${selectId}`);
            
            if (!loadedCategories || loadedCategories.length === 0) {
                console.warn('⚠️ لا توجد تصنيفات متاحة');
                select.innerHTML = '<option value="">لا توجد تصنيفات</option>';
                return;
            }
            
            // بناء الخيارات
            let optionsHTML = '<option value="">اختر التصنيف</option>';
            loadedCategories.forEach(cat => {
                // استخدام category_id أو id
                const catId = cat.category_id || cat.id;
                const selected = (catId === selectedValue) || (cat.id === selectedValue) ? 'selected' : '';
                optionsHTML += `<option value="${catId}" ${selected}>
                    ${cat.category_name || 'تصنيف بدون اسم'}
                </option>`;
            });
            
            select.innerHTML = optionsHTML;
            console.log(`✅ تم ملء ${selectId} بـ ${loadedCategories.length} تصنيف`);
            
        } catch (error) {
            console.error(`❌ خطأ في ملء ${selectId}:`, error);
        }
    }
    
    /**
     * ملء جميع قوائم التصنيفات
     */
    window.populateAllCategorySelects = async function() {
        console.log('🔄 ملء جميع قوائم التصنيفات...');
        
        try {
            // قوائم التصنيفات المطلوب ملؤها
            const selects = [
                { id: 'productCategory', selected: null },
                { id: 'editProductCategory', selected: null },
                { id: 'productCategoryFilter', selected: 'all' }
            ];
            
            // ملء كل قائمة
            for (const selectInfo of selects) {
                await populateCategorySelect(selectInfo.id, selectInfo.selected);
            }
            
            console.log('✅ تم ملء جميع قوائم التصنيفات');
            
        } catch (error) {
            console.error('❌ خطأ في ملء قوائم التصنيفات:', error);
        }
    };
    
    /**
     * حفظ تعديلات المنتج
     */
    window.saveProductEdits = async function() {
        console.log('💾 حفظ تعديلات المنتج...');
        
        try {
            const productId = document.getElementById('editProductId').value;
            
            if (!productId) {
                throw new Error('معرف المنتج غير موجود');
            }
            
            // البحث عن المنتج للحصول على id الخاص بـ dataSdk
            const product = await findProductById(productId);
            if (!product) {
                throw new Error('المنتج غير موجود');
            }
            
            const recordId = product.id || product.product_id;
            
            const updatedData = {
                product_name: document.getElementById('editProductName').value,
                product_barcode: document.getElementById('editProductBarcode').value,
                product_category: document.getElementById('editProductCategory').value,
                product_price_retail: parseFloat(document.getElementById('editProductPriceRetail').value) || 0,
                product_price_wholesale: parseFloat(document.getElementById('editProductPriceWholesale').value) || 0,
                product_cost_retail: parseFloat(document.getElementById('editProductCostRetail').value) || 0,
                product_cost_wholesale: parseFloat(document.getElementById('editProductCostWholesale').value) || 0,
                stock_quantity: parseInt(document.getElementById('editStockQuantity').value) || 0,
                min_stock: parseInt(document.getElementById('editMinStock').value) || 0,
                supplier: document.getElementById('editSupplier').value
            };
            
            // التحقق من البيانات
            if (!updatedData.product_name) {
                if (typeof showToast === 'function') {
                    showToast('الرجاء إدخال اسم المنتج', 'error');
                } else {
                    alert('الرجاء إدخال اسم المنتج');
                }
                return;
            }
            
            // الحفظ في dataSdk باستخدام id
            if (window.dataSdk && typeof window.dataSdk.update === 'function') {
                const result = await window.dataSdk.update(recordId, updatedData);
                
                if (result && result.isOk) {
                    console.log('✅ تم التحديث في dataSdk');
                    
                    // تحديث المصفوفة المحلية
                    if (window.products && Array.isArray(window.products)) {
                        const index = window.products.findIndex(p => 
                            p.product_id === productId || p.id === productId || 
                            p.id === parseInt(productId) || p.product_id === parseInt(productId)
                        );
                        if (index > -1) {
                            window.products[index] = { ...window.products[index], ...updatedData };
                            console.log('✅ تم التحديث في المصفوفة المحلية');
                        }
                    }
                    
                    // مسح الكاش
                    productsCache = null;
                    lastProductsUpdate = 0;
                    
                    // تحديث الواجهة فوراً
                    await refreshProductsDisplay();
                    
                    // إغلاق النافذة
                    if (typeof closeModal === 'function') {
                        closeModal('editProductModal');
                    }
                    
                    if (typeof showToast === 'function') {
                        showToast('تم تحديث المنتج بنجاح', 'success');
                    } else {
                        alert('تم تحديث المنتج بنجاح');
                    }
                    console.log('✅ تم تحديث المنتج بنجاح');
                } else {
                    throw new Error(result?.error || 'فشل التحديث في dataSdk');
                }
            } else {
                throw new Error('dataSdk غير متوفر أو دالة update غير موجودة');
            }
            
        } catch (error) {
            console.error('❌ خطأ في حفظ التعديلات:', error);
            if (typeof showToast === 'function') {
                showToast('فشل تحديث المنتج: ' + error.message, 'error');
            } else {
                alert('فشل تحديث المنتج: ' + error.message);
            }
        }
    };
    
    /**
     * فتح نافذة منبثقة
     */
    window.openModal = function(modalId) {
        console.log('🚪 فتح نافذة:', modalId);
        
        try {
            const modal = document.getElementById(modalId);
            
            if (!modal) {
                console.error('❌ النافذة غير موجودة:', modalId);
                return false;
            }
            
            modal.classList.add('active');
            console.log('✅ تم فتح النافذة بنجاح');
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في فتح النافذة:', error);
            return false;
        }
    };
    
    /**
     * إغلاق نافذة منبثقة
     */
    window.closeModal = function(modalId) {
        console.log('🚪 إغلاق نافذة:', modalId);
        
        try {
            const modal = document.getElementById(modalId);
            
            if (!modal) {
                console.error('❌ النافذة غير موجودة:', modalId);
                return false;
            }
            
            modal.classList.remove('active');
            
            // إعادة تعيين النموذج إذا وجد
            const form = modal.querySelector('form');
            if (form) {
                try {
                    form.reset();
                } catch (e) {
                    console.warn('⚠️ فشل إعادة تعيين النموذج:', e);
                }
            }
            
            console.log('✅ تم إغلاق النافذة بنجاح');
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في إغلاق النافذة:', error);
            return false;
        }
    };
    
    // معالجات لوحة المفاتيح
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' || event.keyCode === 27) {
            const activeModals = document.querySelectorAll('.modal.active');
            if (activeModals.length > 0) {
                const lastModal = activeModals[activeModals.length - 1];
                if (typeof closeModal === 'function') {
                    closeModal(lastModal.id);
                }
            }
        }
    });
    
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal') && event.target.classList.contains('active')) {
            if (typeof closeModal === 'function') {
                closeModal(event.target.id);
            }
        }
    });
    
    // التهيئة الأولية
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProductsFixes);
    } else {
        initializeProductsFixes();
    }
    
    async function initializeProductsFixes() {
        console.log('🚀 تهيئة إصلاحات المنتجات...');
        
        // انتظار تحميل dataSdk
        let attempts = 0;
        const maxAttempts = 20;
        
        while (!window.dataSdk && attempts < maxAttempts) {
            console.log(`⏳ انتظار تحميل dataSdk... (${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (!window.dataSdk) {
            console.error('❌ فشل تحميل dataSdk بعد', maxAttempts, 'محاولة');
        } else {
            console.log('✅ تم تحميل dataSdk بنجاح');
        }
        
        // انتظار إضافي
        setTimeout(async () => {
            try {
                // ملء قوائم التصنيفات
                await window.populateAllCategorySelects();
                
                // إضافة معالج لتغيير فلتر التصنيف
                const categoryFilter = document.getElementById('productCategoryFilter');
                if (categoryFilter) {
                    categoryFilter.addEventListener('change', async function() {
                        await displayProductsByCategory(this.value);
                    });
                    console.log('✅ تم ربط معالج فلتر التصنيف');
                }
                
                // إضافة معالج focus لقائمة التصنيف في نافذة التعديل
                const editCategorySelect = document.getElementById('editProductCategory');
                if (editCategorySelect) {
                    let hasPopulated = false;
                    editCategorySelect.addEventListener('focus', async function() {
                        if (!hasPopulated) {
                            await populateCategorySelect('editProductCategory');
                            hasPopulated = true;
                        }
                    });
                    console.log('✅ تم ربط معالج focus لقائمة التصنيف');
                }
                
                console.log('✅ تم تهيئة إصلاحات المنتجات بنجاح');
                
            } catch (error) {
                console.error('❌ خطأ في تهيئة إصلاحات المنتجات:', error);
            }
        }, 1500);
    }
    
    console.log('✅✅✅ تم تحميل جميع إصلاحات نظام إدارة المنتجات النسخة 3.2 بنجاح');
    
})();