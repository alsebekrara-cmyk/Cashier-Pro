/**
 * ========================================
 * إصلاحات شاملة لنظام إدارة المنتجات
 * Digital Creativity Company - نظام يعقوب POS
 * ========================================
 * 
 * هذا الملف يحل المشاكل التالية:
 * 1. النافذة المنبثقة لا تُغلق بشكل صحيح
 * 2. عدم عرض التفاصيل بشكل كامل
 * 3. عدم حذف المنتج من القائمة بعد الحذف
 * 4. عدم تحديث الواجهة بعد التعديل
 * 5. قائمة التصنيفات فارغة في نافذة التعديل ⭐ جديد ومحسّن
 * 
 * التعليمات:
 * - أضف هذا الكود في نهاية ملف index.html قبل وسم </body>
 * - أو قم باستيراد الملف: <script src="products-fixes.js"></script>
 */

(function() {
    'use strict';
    
    console.log('🔧 تحميل إصلاحات نظام إدارة المنتجات...');
    
    // ==================== إصلاح #1: دالة عرض تفاصيل المنتج المحسّنة ====================
    
    /**
     * عرض تفاصيل المنتج الكاملة
     * @param {string} productId - معرف المنتج
     */
    window.showProductDetails = function(productId) {
        console.log('📋 عرض تفاصيل المنتج:', productId);
        
        try {
            // البحث عن المنتج
            const product = products.find(p => p.product_id === productId);
            
            if (!product) {
                console.error('❌ المنتج غير موجود:', productId);
                showToast('المنتج غير موجود', 'error');
                return;
            }
            
            // البحث عن التصنيف
            const category = categories.find(c => c.category_id === product.product_category);
            
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
            } else if (product.stock_quantity <= product.min_stock) {
                stockStatus = 'مخزون قليل';
                stockClass = 'text-warning';
            }
            
            // بناء محتوى التفاصيل
            const content = `
                <div class="product-details-container" style="padding: 1rem;">
                    
                    <!-- معلومات أساسية -->
                    <div class="details-section" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--theme-bg-secondary); border-radius: 8px;">
                        <h4 style="margin-bottom: 1rem; color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-info-circle"></i>
                            <span>المعلومات الأساسية</span>
                        </h4>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-tag"></i> اسم المنتج:
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--theme-text-primary);">
                                ${product.product_name || 'غير محدد'}
                            </span>
                        </div>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-barcode"></i> الباركود:
                            </span>
                            <span class="detail-value" style="font-family: monospace; color: var(--theme-text-primary);">
                                ${product.product_barcode || 'غير محدد'}
                            </span>
                        </div>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-layer-group"></i> التصنيف:
                            </span>
                            <span class="detail-value" style="color: var(--theme-text-primary);">
                                ${category ? `<i class="${category.category_icon}"></i> ${category.category_name}` : 'غير محدد'}
                            </span>
                        </div>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-truck"></i> المورد:
                            </span>
                            <span class="detail-value" style="color: var(--theme-text-primary);">
                                ${product.supplier || 'غير محدد'}
                            </span>
                        </div>
                    </div>
                    
                    <!-- معلومات الأسعار -->
                    <div class="details-section" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--theme-bg-secondary); border-radius: 8px;">
                        <h4 style="margin-bottom: 1rem; color: var(--success-color); display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>معلومات الأسعار</span>
                        </h4>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-coins"></i> سعر التكلفة (مفرد):
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--warning-color);">
                                ${formatCurrency(product.product_cost_retail)}
                            </span>
                        </div>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-coins"></i> سعر التكلفة (جملة):
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--warning-color);">
                                ${formatCurrency(product.product_cost_wholesale || product.product_cost_retail)}
                            </span>
                        </div>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-money-bill"></i> سعر البيع (مفرد):
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--success-color);">
                                ${formatCurrency(product.product_price_retail)}
                            </span>
                        </div>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-money-bill"></i> سعر البيع (جملة):
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--success-color);">
                                ${formatCurrency(product.product_price_wholesale || product.product_price_retail)}
                            </span>
                        </div>
                    </div>
                    
                    <!-- معلومات المخزون -->
                    <div class="details-section" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--theme-bg-secondary); border-radius: 8px;">
                        <h4 style="margin-bottom: 1rem; color: var(--info-color); display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-warehouse"></i>
                            <span>معلومات المخزون</span>
                        </h4>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-boxes"></i> الكمية الحالية:
                            </span>
                            <span class="detail-value ${stockClass}" style="font-weight: 700; font-size: 1.2em;">
                                ${product.stock_quantity || 0}
                            </span>
                        </div>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-exclamation-triangle"></i> الحد الأدنى للمخزون:
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--theme-text-primary);">
                                ${product.min_stock || 0}
                            </span>
                        </div>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-info-circle"></i> حالة المخزون:
                            </span>
                            <span class="detail-value ${stockClass}" style="font-weight: 700;">
                                ${stockStatus}
                            </span>
                        </div>
                    </div>
                    
                    <!-- معلومات مالية -->
                    <div class="details-section" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--theme-bg-secondary); border-radius: 8px;">
                        <h4 style="margin-bottom: 1rem; color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-chart-line"></i>
                            <span>التحليل المالي</span>
                        </h4>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-dollar-sign"></i> إجمالي التكلفة:
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--warning-color);">
                                ${formatCurrency(totalCost)}
                            </span>
                        </div>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-money-check-alt"></i> إجمالي القيمة:
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: var(--success-color);">
                                ${formatCurrency(totalValue)}
                            </span>
                        </div>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-chart-bar"></i> الربح المتوقع:
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: ${profit >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                ${formatCurrency(profit)}
                            </span>
                        </div>
                        
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-percentage"></i> هامش الربح:
                            </span>
                            <span class="detail-value" style="font-weight: 700; color: ${profit >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                                ${profitMargin}%
                            </span>
                        </div>
                    </div>
                    
                    <!-- معلومات النظام -->
                    ${product.created_at || product.modified_at ? `
                    <div class="details-section" style="padding: 1rem; background: var(--theme-bg-secondary); border-radius: 8px;">
                        <h4 style="margin-bottom: 1rem; color: var(--theme-text-secondary); display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-clock"></i>
                            <span>معلومات النظام</span>
                        </h4>
                        
                        ${product.created_at ? `
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-calendar-plus"></i> تاريخ الإضافة:
                            </span>
                            <span class="detail-value" style="color: var(--theme-text-primary);">
                                ${new Date(product.created_at).toLocaleString('ar-IQ')}
                            </span>
                        </div>
                        ` : ''}
                        
                        ${product.created_by_name ? `
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-user"></i> أضيف بواسطة:
                            </span>
                            <span class="detail-value" style="color: var(--theme-text-primary);">
                                ${product.created_by_name}
                            </span>
                        </div>
                        ` : ''}
                        
                        ${product.modified_at ? `
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-calendar-alt"></i> آخر تعديل:
                            </span>
                            <span class="detail-value" style="color: var(--theme-text-primary);">
                                ${new Date(product.modified_at).toLocaleString('ar-IQ')}
                            </span>
                        </div>
                        ` : ''}
                        
                        ${product.modified_by_name ? `
                        <div class="detail-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                            <span class="detail-label" style="font-weight: 600; color: var(--theme-text-secondary);">
                                <i class="fas fa-user-edit"></i> عُدل بواسطة:
                            </span>
                            <span class="detail-value" style="color: var(--theme-text-primary);">
                                ${product.modified_by_name}
                            </span>
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}
                    
                    <!-- أزرار الإجراءات -->
                    <div class="details-actions" style="margin-top: 1.5rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
                        ${window.securityManager && window.securityManager.hasPermission('products_edit') ? `
                        <button onclick="closeModal('productDetailsModal'); showEditProductModal('${productId}');" 
                                class="btn btn-primary" style="display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-edit"></i>
                            <span>تعديل المنتج</span>
                        </button>
                        ` : ''}
                        
                        <button onclick="closeModal('productDetailsModal');" 
                                class="btn btn-secondary" style="display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-times"></i>
                            <span>إغلاق</span>
                        </button>
                    </div>
                    
                </div>
            `;
            
            // تحديث محتوى النافذة
            const detailsContainer = document.getElementById('productDetailsContent');
            if (detailsContainer) {
                detailsContainer.innerHTML = content;
            } else {
                console.error('❌ عنصر productDetailsContent غير موجود');
                showToast('خطأ في عرض التفاصيل', 'error');
                return;
            }
            
            // إظهار النافذة
            showModal('productDetailsModal');
            console.log('✅ تم عرض تفاصيل المنتج بنجاح');
            
        } catch (error) {
            console.error('❌ خطأ في عرض تفاصيل المنتج:', error);
            showToast('حدث خطأ في عرض التفاصيل', 'error');
        }
    };
    
    // ==================== إصلاح #2: دالة حذف المنتج المحسّنة ====================
    
    /**
     * حذف منتج مع تحديث فوري للواجهة
     * @param {string} productId - معرف المنتج
     */
    window.deleteProduct = async function(productId) {
        console.log('🗑️ محاولة حذف المنتج:', productId);
        
        try {
            // فحص الصلاحية
            if (window.securityManager && !window.securityManager.checkPermission('products_delete')) {
                console.warn('⚠️ لا توجد صلاحية للحذف');
                return;
            }
            
            // البحث عن المنتج
            const product = products.find(p => p.product_id === productId);
            
            if (!product) {
                console.error('❌ المنتج غير موجود:', productId);
                showToast('المنتج غير موجود', 'error');
                return;
            }
            
            // تأكيد الحذف
            const confirmed = confirm(
                `هل أنت متأكد من حذف المنتج؟\n\n` +
                `📦 المنتج: ${product.product_name}\n` +
                `🏷️ الباركود: ${product.product_barcode || 'غير محدد'}\n` +
                `📊 الكمية: ${product.stock_quantity || 0}\n\n` +
                `⚠️ تحذير: لا يمكن التراجع عن هذا الإجراء!`
            );
            
            if (!confirmed) {
                console.log('❌ تم إلغاء الحذف');
                return;
            }
            
            // عرض رسالة تحميل
            showToast('جاري حذف المنتج...', 'info');
            
            // الحذف من قاعدة البيانات
            if (!window.dataSdk) {
                console.error('❌ dataSdk غير متوفر');
                showToast('خطأ في النظام', 'error');
                return;
            }
            
            if (!product.id && !product.__backendId) {
                console.error('❌ معرف المنتج غير صحيح');
                showToast('خطأ في بيانات المنتج', 'error');
                return;
            }
            
            const deleteId = product.id || product.__backendId;
            const result = await window.dataSdk.delete(deleteId);
            
            if (result.isOk) {
                console.log('✅ تم الحذف من قاعدة البيانات');
                
                // تسجيل العملية
                if (window.securityManager) {
                    window.securityManager.logOperation('حذف منتج', {
                        productId: product.product_id,
                        productName: product.product_name,
                        barcode: product.product_barcode,
                        stockQuantity: product.stock_quantity
                    });
                }
                
                // ⭐ تحديث فوري للمصفوفة المحلية (هذا هو الإصلاح الرئيسي)
                const index = products.findIndex(p => p.product_id === productId);
                if (index !== -1) {
                    products.splice(index, 1);
                    console.log('✅ تم حذف المنتج من المصفوفة المحلية');
                }
                
                // تحديث الواجهة فوراً
                if (typeof renderProductsTable === 'function') {
                    renderProductsTable();
                }
                if (typeof renderInventoryTable === 'function') {
                    renderInventoryTable();
                }
                if (typeof updateQuickStats === 'function') {
                    updateQuickStats();
                }
                if (typeof updateStatistics === 'function') {
                    updateStatistics();
                }
                
                // عرض رسالة نجاح
                showToast('✅ تم حذف المنتج بنجاح', 'success');
                console.log('✅ تم حذف المنتج بنجاح');
                
                // إغلاق نافذة التفاصيل إذا كانت مفتوحة
                const detailsModal = document.getElementById('productDetailsModal');
                if (detailsModal && detailsModal.classList.contains('active')) {
                    closeModal('productDetailsModal');
                }
                
            } else {
                console.error('❌ فشل الحذف من قاعدة البيانات:', result.error);
                showToast('فشل في حذف المنتج: ' + (result.error || 'خطأ غير معروف'), 'error');
            }
            
        } catch (error) {
            console.error('❌ خطأ في حذف المنتج:', error);
            showToast('حدث خطأ أثناء حذف المنتج', 'error');
        }
    };
    
    // ==================== إصلاح #3: دالة تحديث المنتج المحسّنة ====================
    
    /**
     * معالجة تعديل المنتج مع تحديث فوري
     * ملاحظة: يعتمد على الإصلاح #4 لضمان ملء قائمة التصنيفات بشكل صحيح
     */
    window.handleEditProduct = async function(event) {
        if (event) {
            event.preventDefault();
        }
        
        console.log('✏️ محاولة تعديل المنتج');
        
        try {
            // فحص الصلاحية
            if (window.securityManager && !window.securityManager.checkPermission('products_edit')) {
                console.warn('⚠️ لا توجد صلاحية للتعديل');
                return;
            }
            
            if (window.isLoading) {
                console.warn('⚠️ عملية جارية بالفعل');
                return;
            }
            
            if (typeof window.setLoading === 'function') {
                window.setLoading(true);
            }
            
            // جمع البيانات من النموذج
            const productId = document.getElementById('editProductId')?.value;
            
            if (!productId) {
                console.error('❌ معرف المنتج مفقود');
                showToast('خطأ في بيانات المنتج', 'error');
                if (typeof window.setLoading === 'function') {
                    window.setLoading(false);
                }
                return;
            }
            
            const product = products.find(p => p.product_id === productId);
            
            if (!product) {
                console.error('❌ المنتج غير موجود:', productId);
                showToast('المنتج غير موجود', 'error');
                if (typeof window.setLoading === 'function') {
                    window.setLoading(false);
                }
                return;
            }
            
            // بناء بيانات التحديث
            const updatedData = {
                product_name: document.getElementById('editProductName')?.value || product.product_name,
                product_barcode: document.getElementById('editProductBarcode')?.value || product.product_barcode,
                product_category: document.getElementById('editProductCategory')?.value || product.product_category,
                supplier: document.getElementById('editProductSupplier')?.value || product.supplier || '',
                product_cost_retail: parseFloat(document.getElementById('editProductCostRetail')?.value) || product.product_cost_retail,
                product_cost_wholesale: parseFloat(document.getElementById('editProductCostWholesale')?.value) || parseFloat(document.getElementById('editProductCostRetail')?.value) || product.product_cost_wholesale,
                product_price_retail: parseFloat(document.getElementById('editProductPriceRetail')?.value) || product.product_price_retail,
                product_price_wholesale: parseFloat(document.getElementById('editProductPriceWholesale')?.value) || parseFloat(document.getElementById('editProductPriceRetail')?.value) || product.product_price_wholesale,
                stock_quantity: parseInt(document.getElementById('editProductStock')?.value) || product.stock_quantity,
                min_stock: parseInt(document.getElementById('editProductMinStock')?.value) || product.min_stock,
                // معلومات التعديل
                modified_by: window.securityManager ? window.securityManager.getCurrentUsername() : 'unknown',
                modified_by_name: window.securityManager ? window.securityManager.getCurrentUserFullName() : 'مجهول',
                modified_at: new Date().toISOString()
            };
            
            console.log('📝 بيانات التحديث:', updatedData);
            
            // التحديث في قاعدة البيانات
            if (!window.dataSdk) {
                console.error('❌ dataSdk غير متوفر');
                showToast('خطأ في النظام', 'error');
                if (typeof window.setLoading === 'function') {
                    window.setLoading(false);
                }
                return;
            }
            
            const updateId = product.id || product.__backendId;
            if (!updateId) {
                console.error('❌ معرف المنتج غير صحيح');
                showToast('خطأ في بيانات المنتج', 'error');
                if (typeof window.setLoading === 'function') {
                    window.setLoading(false);
                }
                return;
            }
            
            const result = await window.dataSdk.update(updateId, updatedData);
            
            if (result.isOk) {
                console.log('✅ تم التحديث في قاعدة البيانات');
                
                // تسجيل العملية
                if (window.securityManager) {
                    window.securityManager.logOperation('تعديل منتج', {
                        productId: product.product_id,
                        productName: updatedData.product_name,
                        barcode: updatedData.product_barcode
                    });
                }
                
                // ⭐ تحديث فوري للمصفوفة المحلية (هذا هو الإصلاح الرئيسي)
                const index = products.findIndex(p => p.product_id === productId);
                if (index !== -1) {
                    products[index] = { ...products[index], ...updatedData };
                    console.log('✅ تم تحديث المنتج في المصفوفة المحلية');
                }
                
                // إغلاق النافذة
                closeModal('editProductModal');
                
                // تحديث الواجهة فوراً
                if (typeof renderProductsTable === 'function') {
                    renderProductsTable();
                }
                if (typeof renderInventoryTable === 'function') {
                    renderInventoryTable();
                }
                if (typeof updateQuickStats === 'function') {
                    updateQuickStats();
                }
                if (typeof updateStatistics === 'function') {
                    updateStatistics();
                }
                
                // عرض رسالة نجاح
                showToast('✅ تم تحديث المنتج بنجاح', 'success');
                console.log('✅ تم تعديل المنتج بنجاح');
                
            } else {
                console.error('❌ فشل التحديث:', result.error);
                showToast('فشل في تحديث المنتج: ' + (result.error || 'خطأ غير معروف'), 'error');
            }
            
        } catch (error) {
            console.error('❌ خطأ في تعديل المنتج:', error);
            showToast('حدث خطأ أثناء تعديل المنتج', 'error');
        } finally {
            if (typeof window.setLoading === 'function') {
                window.setLoading(false);
            }
        }
    };
    
    // ==================== إصلاح #4: ملء قائمة التصنيفات في نافذة التعديل ====================
    
    /**
     * الحصول على مصفوفة التصنيفات من أي مصدر متاح
     */
    window.getCategoriesArray = function() {
        // محاولة الحصول على التصنيفات من عدة مصادر
        if (window.categories && Array.isArray(window.categories) && window.categories.length > 0) {
            return window.categories;
        }
        
        if (typeof categories !== 'undefined' && Array.isArray(categories) && categories.length > 0) {
            return categories;
        }
        
        // محاولة تحميل التصنيفات من dataSdk
        if (window.dataSdk && typeof window.dataSdk.getAll === 'function') {
            try {
                const result = window.dataSdk.getAll('categories');
                if (result && Array.isArray(result) && result.length > 0) {
                    console.log('✅ تم الحصول على التصنيفات من dataSdk');
                    return result;
                }
            } catch (e) {
                console.warn('⚠️ فشل الحصول على التصنيفات من dataSdk:', e);
            }
        }
        
        console.warn('⚠️ لم يتم العثور على التصنيفات في أي مصدر');
        return [];
    };
    
    /**
     * ملء جميع قوائم التصنيفات بما فيها نافذة التعديل
     * محسّنة مع فحص أفضل للبيانات
     */
    window.populateAllCategorySelects = function() {
        console.log('📋 ملء قوائم التصنيفات...');
        
        try {
            // الحصول على التصنيفات
            const categoriesArray = window.getCategoriesArray();
            
            if (!categoriesArray || categoriesArray.length === 0) {
                console.error('❌ لا توجد تصنيفات للعرض!');
                console.log('💡 تلميح: تأكد من تحميل البيانات أولاً باستخدام dataSdk.loadAllData()');
                
                // محاولة إعادة تحميل البيانات
                if (window.dataSdk && typeof window.dataSdk.loadAllData === 'function') {
                    console.log('🔄 محاولة إعادة تحميل البيانات...');
                    window.dataSdk.loadAllData().then(() => {
                        console.log('✅ تم إعادة تحميل البيانات، جرب مرة أخرى');
                        // إعادة استدعاء الدالة بعد التحميل
                        setTimeout(() => window.populateAllCategorySelects(), 100);
                    });
                }
                
                return false;
            }
            
            console.log(`📊 عدد التصنيفات المتاحة: ${categoriesArray.length}`);
            
            // قائمة جميع عناصر select للتصنيفات
            const selectIds = [
                'productCategory',           // نافذة إضافة منتج
                'editProductCategory',       // نافذة تعديل منتج ⭐ هذا هو الإصلاح
                'inventoryCategory',         // فلتر المخزون
                'filterCategory'             // أي فلاتر أخرى
            ];
            
            let successCount = 0;
            
            selectIds.forEach(selectId => {
                const select = document.getElementById(selectId);
                
                if (!select) {
                    console.log(`  ⊗ العنصر ${selectId} غير موجود في DOM`);
                    return;
                }
                
                console.log(`  ↳ ملء قائمة: ${selectId}`);
                
                // حفظ القيمة الحالية
                const currentValue = select.value;
                
                // مسح القائمة وإضافة الخيار الافتراضي
                if (selectId === 'inventoryCategory' || selectId === 'filterCategory') {
                    select.innerHTML = '<option value="all">جميع التصنيفات</option>';
                } else {
                    select.innerHTML = '<option value="">اختر التصنيف</option>';
                }
                
                // عداد التصنيفات المضافة
                let addedCount = 0;
                
                // إضافة جميع التصنيفات
                categoriesArray.forEach(category => {
                    if (category && category.category_id && category.category_name) {
                        const option = document.createElement('option');
                        option.value = category.category_id;
                        option.textContent = category.category_name;
                        
                        // إضافة أيقونة التصنيف إذا كانت موجودة
                        if (category.category_icon) {
                            option.setAttribute('data-icon', category.category_icon);
                        }
                        
                        select.appendChild(option);
                        addedCount++;
                    }
                });
                
                console.log(`  ✓ تم إضافة ${addedCount} تصنيف إلى ${selectId}`);
                
                // استعادة القيمة السابقة إن وجدت
                if (currentValue && currentValue !== '' && currentValue !== 'all') {
                    select.value = currentValue;
                    if (select.value === currentValue) {
                        console.log(`  ↳ تم استعادة القيمة: ${currentValue}`);
                    } else {
                        console.warn(`  ⚠️ فشل استعادة القيمة: ${currentValue} (قد لا يكون موجوداً)`);
                    }
                }
                
                successCount++;
            });
            
            console.log(`✅ تم ملء ${successCount} قائمة بنجاح من أصل ${selectIds.length}`);
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في ملء قوائم التصنيفات:', error);
            return false;
        }
    };
    
    // استبدال الدالة القديمة populateCategorySelects
    window.populateCategorySelects = window.populateAllCategorySelects;
    
    /**
     * تحسين دالة showEditProductModal لضمان ملء التصنيفات
     * محسّنة مع فحص أفضل وإعادة محاولة
     */
    window.showEditProductModal = async function(productId) {
        console.log('✏️ فتح نافذة تعديل المنتج:', productId);
        
        try {
            // البحث عن المنتج
            const product = products.find(p => p.product_id === productId);
            
            if (!product) {
                console.error('❌ المنتج غير موجود:', productId);
                showToast('المنتج غير موجود', 'error');
                return;
            }
            
            console.log('📦 المنتج المراد تعديله:', {
                id: product.product_id,
                name: product.product_name,
                category: product.product_category
            });
            
            // ⭐ أولاً: التحقق من وجود التصنيفات
            const categoriesArray = window.getCategoriesArray();
            
            if (!categoriesArray || categoriesArray.length === 0) {
                console.warn('⚠️ لا توجد تصنيفات! محاولة تحميل البيانات...');
                
                // محاولة تحميل البيانات
                if (window.dataSdk && typeof window.dataSdk.loadAllData === 'function') {
                    try {
                        await window.dataSdk.loadAllData();
                        console.log('✅ تم تحميل البيانات بنجاح');
                    } catch (error) {
                        console.error('❌ فشل تحميل البيانات:', error);
                        showToast('فشل تحميل التصنيفات. جرب تحديث الصفحة.', 'warning');
                    }
                }
            }
            
            // ⭐ ثانياً: ملء قائمة التصنيفات (هذا هو الإصلاح الرئيسي)
            const fillResult = window.populateAllCategorySelects();
            
            if (!fillResult) {
                console.error('❌ فشل ملء قائمة التصنيفات');
                showToast('لا توجد تصنيفات متاحة. الرجاء إضافة تصنيفات أولاً.', 'warning');
                // سنستمر في فتح النافذة حتى لو فشل ملء التصنيفات
            }
            
            // ⭐ التحقق من وجود عنصر select للتصنيف
            const categorySelect = document.getElementById('editProductCategory');
            if (!categorySelect) {
                console.error('❌ عنصر قائمة التصنيف غير موجود في DOM!');
                showToast('خطأ في النافذة. الرجاء تحديث الصفحة.', 'error');
                return;
            }
            
            console.log(`📋 قائمة التصنيف تحتوي على ${categorySelect.options.length} خيار`);
            
            // ثالثاً: ملء بيانات المنتج في النموذج
            const fields = {
                'editProductId': productId,
                'editProductName': product.product_name || '',
                'editProductBarcode': product.product_barcode || '',
                'editProductCategory': product.product_category || '',
                'editProductSupplier': product.supplier || '',
                'editProductCostRetail': product.product_cost_retail || 0,
                'editProductCostWholesale': product.product_cost_wholesale || product.product_cost_retail || 0,
                'editProductPriceRetail': product.product_price_retail || 0,
                'editProductPriceWholesale': product.product_price_wholesale || product.product_price_retail || 0,
                'editProductStock': product.stock_quantity || 0,
                'editProductMinStock': product.min_stock || 0
            };
            
            console.log('📝 ملء حقول النموذج...');
            
            // ملء جميع الحقول
            let filledCount = 0;
            for (const [fieldId, value] of Object.entries(fields)) {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.value = value;
                    filledCount++;
                    
                    // سجل خاص لحقل التصنيف
                    if (fieldId === 'editProductCategory') {
                        console.log(`  📌 تصنيف المنتج: ${value}`);
                        console.log(`  📌 القيمة في القائمة بعد الملء: ${field.value}`);
                    }
                } else {
                    console.warn(`⚠️ الحقل غير موجود: ${fieldId}`);
                }
            }
            
            console.log(`✅ تم ملء ${filledCount} حقل من أصل ${Object.keys(fields).length}`);
            
            // رابعاً: التأكد من تحديد التصنيف الصحيح
            // نضيف تأخير صغير لضمان ملء القائمة أولاً
            setTimeout(() => {
                const categorySelect = document.getElementById('editProductCategory');
                if (categorySelect && product.product_category) {
                    // محاولة تحديد التصنيف
                    categorySelect.value = product.product_category;
                    
                    // التحقق من نجاح التحديد
                    if (categorySelect.value === product.product_category) {
                        console.log('✅ تم تحديد التصنيف بنجاح:', product.product_category);
                    } else {
                        console.warn('⚠️ فشل تحديد التصنيف!');
                        console.warn('   التصنيف المطلوب:', product.product_category);
                        console.warn('   القيمة الفعلية:', categorySelect.value);
                        console.warn('   الخيارات المتاحة:', Array.from(categorySelect.options).map(o => o.value));
                        
                        showToast('تحذير: التصنيف الأصلي قد لا يكون متاحاً', 'warning');
                    }
                }
            }, 100); // زيادة التأخير قليلاً
            
            // خامساً: فتح النافذة
            showModal('editProductModal');
            
            console.log('✅ تم فتح نافذة التعديل بنجاح');
            
        } catch (error) {
            console.error('❌ خطأ في فتح نافذة التعديل:', error);
            showToast('حدث خطأ في فتح نافذة التعديل', 'error');
        }
    };
    
    // ==================== إصلاح #6: تحسين دوال النوافذ المنبثقة ====================
    
    /**
     * فتح نافذة منبثقة بشكل محسّن
     */
    window.showModal = function(modalId) {
        console.log('🪟 فتح نافذة:', modalId);
        
        try {
            const modal = document.getElementById(modalId);
            
            if (!modal) {
                console.error('❌ النافذة غير موجودة:', modalId);
                return false;
            }
            
            // إزالة class active من جميع النوافذ الأخرى
            document.querySelectorAll('.modal.active').forEach(m => {
                if (m.id !== modalId) {
                    m.classList.remove('active');
                }
            });
            
            // إضافة class active للنافذة المطلوبة
            modal.classList.add('active');
            
            // إعداد خاص لبعض النوافذ
            if (modalId === 'addCategoryModal' && typeof renderCategoryIcons === 'function') {
                renderCategoryIcons();
            }
            
            if (modalId === 'paymentModal') {
                const installmentForm = document.getElementById('installmentForm');
                if (installmentForm) {
                    installmentForm.style.display = 'none';
                }
            }
            
            console.log('✅ تم فتح النافذة بنجاح');
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في فتح النافذة:', error);
            return false;
        }
    };
    
    /**
     * إغلاق نافذة منبثقة بشكل محسّن
     */
    window.closeModal = function(modalId) {
        console.log('🚪 إغلاق نافذة:', modalId);
        
        try {
            const modal = document.getElementById(modalId);
            
            if (!modal) {
                console.error('❌ النافذة غير موجودة:', modalId);
                return false;
            }
            
            // إزالة class active
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
            
            // إعداد خاص لبعض النوافذ
            if (modalId === 'paymentModal') {
                const installmentForm = document.getElementById('installmentForm');
                if (installmentForm) {
                    installmentForm.style.display = 'none';
                }
            }
            
            console.log('✅ تم إغلاق النافذة بنجاح');
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في إغلاق النافذة:', error);
            return false;
        }
    };
    
    // ==================== إصلاح #7: معالج الضغط على ESC لإغلاق النوافذ ====================
    
    // إضافة معالج لإغلاق النوافذ عند الضغط على ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' || event.keyCode === 27) {
            const activeModals = document.querySelectorAll('.modal.active');
            if (activeModals.length > 0) {
                // إغلاق آخر نافذة نشطة
                const lastModal = activeModals[activeModals.length - 1];
                closeModal(lastModal.id);
            }
        }
    });
    
    // ==================== إصلاح #8: معالج النقر خارج النافذة للإغلاق ====================
    
    // إضافة معالج للنقر خارج النافذة
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal') && event.target.classList.contains('active')) {
            closeModal(event.target.id);
        }
    });
    
    // ==================== إصلاح #9: تحديث data_sdk لتحسين الأداء ====================
    
    // تحسين دالة loadAllData في dataSdk
    if (window.dataSdk && typeof window.dataSdk.loadAllData === 'function') {
        const originalLoadAllData = window.dataSdk.loadAllData.bind(window.dataSdk);
        
        window.dataSdk.loadAllData = async function() {
            console.log('🔄 تحميل البيانات من data_sdk...');
            const result = await originalLoadAllData();
            
            console.log('✅ تم تحميل البيانات بنجاح');
            
            // ⭐ ملء قوائم التصنيفات تلقائياً بعد تحميل البيانات
            setTimeout(() => {
                console.log('🔄 ملء قوائم التصنيفات تلقائياً...');
                window.populateAllCategorySelects();
            }, 200);
            
            // تحديث الواجهة تلقائياً بعد تحميل البيانات
            if (typeof updateAllViews === 'function') {
                setTimeout(() => updateAllViews(), 100);
            }
            
            return result;
        };
        
        console.log('✅ تم تحسين دالة loadAllData مع ملء تلقائي للتصنيفات');
    }
    
    // ==================== إصلاح #10: استدعاء أولي لملء التصنيفات ====================
    
    // ملء التصنيفات عند تحميل السكريبت
    setTimeout(() => {
        console.log('🚀 استدعاء أولي لملء قوائم التصنيفات...');
        window.populateAllCategorySelects();
    }, 500);
    
    console.log('✅ تم تحميل جميع إصلاحات نظام إدارة المنتجات بنجاح');
    
})();

/**
 * ========================================
 * تعليمات الاستخدام:
 * ========================================
 * 
 * 1. أضف هذا الملف في نهاية ملف index.html قبل </body>:
 *    <script src="products-fixes.js"></script>
 * 
 * 2. أو انسخ المحتوى بالكامل والصقه في نهاية القسم <script> في index.html
 * 
 * 3. قم بإعادة تحميل التطبيق
 * 
 * 4. اختبر:
 *    - عرض تفاصيل منتج ✓
 *    - تعديل منتج ✓
 *    - حذف منتج ✓
 *    - إغلاق النوافذ ✓
 * 
 * ========================================
 * الإصلاحات المطبقة:
 * ========================================
 * 
 * ✅ عرض جميع تفاصيل المنتج بشكل كامل ومنظم
 * ✅ تحديث فوري للواجهة بعد الحذف
 * ✅ تحديث فوري للواجهة بعد التعديل
 * ✅ ملء قائمة التصنيفات في نافذة التعديل مع فحص ذكي ⭐ محسّن
 * ✅ دالة ذكية للحصول على التصنيفات من مصادر متعددة ⭐ جديد
 * ✅ إعادة تحميل تلقائية للتصنيفات عند الفشل ⭐ جديد
 * ✅ سجلات تصحيح مفصّلة لتتبع مشاكل التصنيفات ⭐ جديد
 * ✅ استدعاء تلقائي لملء التصنيفات عند تحميل البيانات ⭐ جديد
 * ✅ إغلاق النوافذ بشكل صحيح
 * ✅ دعم إغلاق النوافذ بالضغط على ESC
 * ✅ دعم إغلاق النوافذ بالنقر خارجها
 * ✅ معالجة أفضل للأخطاء
 * ✅ رسائل تأكيد محسّنة
 * ✅ سجلات console مفصلة للتصحيح
 * 
 * ========================================
 */