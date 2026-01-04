/**
 * =============================================
 * نظام إدارة المخزون المتقدم - Version 2.0
 * Digital Creativity Company - Iraq
 * =============================================
 * 
 * نظام متكامل لإدارة المخزون بناءً على التصنيفات
 * Features:
 * - عرض التصنيفات كبطاقات
 * - عرض المنتجات داخل كل تصنيف
 * - إحصائيات متقدمة لكل تصنيف
 * - فلاتر متعددة (العدد، القيمة، الربح، المباع)
 * - إمكانية التعديل والحذف للتصنيفات والمنتجات
 */

(function() {
    'use strict';

    // =============================================
    // المتغيرات العامة
    // =============================================
    
    let currentView = 'categories'; // 'categories' or 'products'
    let currentCategoryId = null;
    let inventoryFilters = {
        search: '',
        stockStatus: 'all',
        sortBy: 'name_asc'
    };

    // =============================================
    // دوال التهيئة
    // =============================================

    /**
     * تهيئة نظام إدارة المخزون
     */
    window.initInventoryManagementSystem = function() {
        console.log('🔄 تهيئة نظام إدارة المخزون المتقدم...');
        
        // إنشاء واجهة المستخدم
        createInventoryUI();
        
        // تحميل البيانات الأولية
        loadInventoryData();
        
        console.log('✅ تم تهيئة نظام إدارة المخزون بنجاح');
    };

    /**
     * إنشاء واجهة المستخدم الجديدة
     */
    function createInventoryUI() {
        const inventoryPage = document.getElementById('inventory');
        if (!inventoryPage) {
            console.error('❌ لم يتم العثور على صفحة المخزون');
            return;
        }

        // الحصول على header الموجود
        const existingHeader = inventoryPage.querySelector('.section-header');
        const existingFilters = inventoryPage.querySelector('.filters-section');
        
        // إنشاء HTML الجديد
        const newHTML = `
            <!-- شريط التنقل بين التصنيفات والمنتجات -->
            <div id="inventoryBreadcrumb" class="inventory-breadcrumb" style="margin-bottom: 1.5rem; display: none;">
                <button class="breadcrumb-btn" onclick="window.inventoryManagement.showCategories()">
                    <i class="fas fa-arrow-right"></i> العودة إلى التصنيفات
                </button>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-current" id="currentCategoryName">التصنيف</span>
            </div>

            <!-- عرض التصنيفات -->
            <div id="categoriesView" class="categories-view">
                <div class="categories-grid" id="categoriesGrid">
                    <!-- التصنيفات ستظهر هنا -->
                </div>
            </div>

            <!-- عرض المنتجات داخل التصنيف -->
            <div id="productsView" class="products-view" style="display: none;">
                <!-- إحصائيات التصنيف -->
                <div class="category-stats-section" id="categoryStatsSection">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-boxes"></i></div>
                            <div class="stat-value" id="categoryTotalProducts">0</div>
                            <div class="stat-label">عدد المنتجات</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-layer-group"></i></div>
                            <div class="stat-value" id="categoryTotalQuantity">0</div>
                            <div class="stat-label">إجمالي الكميات</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-coins"></i></div>
                            <div class="stat-value" id="categoryTotalCost">0</div>
                            <div class="stat-label">إجمالي التكلفة</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
                            <div class="stat-value" id="categoryTotalValue">0</div>
                            <div class="stat-label">القيمة المتوقعة</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                            <div class="stat-value" id="categoryTotalProfit">0</div>
                            <div class="stat-label">الربح المتوقع</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-shopping-cart"></i></div>
                            <div class="stat-value" id="categoryTotalSold">0</div>
                            <div class="stat-label">المباع</div>
                        </div>
                    </div>
                </div>

                <!-- فلاتر المنتجات -->
                <div class="products-filters-section" style="margin: 1.5rem 0;">
                    <div class="filters-grid">
                        <div class="form-group">
                            <label class="form-label">بحث في المنتجات</label>
                            <div class="pos-search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" id="productsSearchInput" class="pos-search-input" 
                                       placeholder="ابحث عن منتج..." 
                                       oninput="window.inventoryManagement.filterProducts()">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">حالة المخزون</label>
                            <select class="form-select" id="productsStockStatus" 
                                    onchange="window.inventoryManagement.filterProducts()">
                                <option value="all">جميع الحالات</option>
                                <option value="in-stock">متوفر</option>
                                <option value="low-stock">مخزون قليل</option>
                                <option value="out-of-stock">نفد المخزون</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">ترتيب حسب</label>
                            <select class="form-select" id="productsSortBy" 
                                    onchange="window.inventoryManagement.filterProducts()">
                                <option value="name_asc">الاسم (أ-ي)</option>
                                <option value="name_desc">الاسم (ي-أ)</option>
                                <option value="quantity_high">الكمية (الأكثر)</option>
                                <option value="quantity_low">الكمية (الأقل)</option>
                                <option value="value_high">القيمة (الأعلى)</option>
                                <option value="value_low">القيمة (الأقل)</option>
                                <option value="profit_high">الربح (الأعلى)</option>
                                <option value="profit_low">الربح (الأقل)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- جدول المنتجات -->
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th><i class="fas fa-tag"></i> المنتج</th>
                                <th><i class="fas fa-barcode"></i> الباركود</th>
                                <th><i class="fas fa-warehouse"></i> الكمية</th>
                                <th><i class="fas fa-coins"></i> التكلفة الإجمالية</th>
                                <th><i class="fas fa-money-bill"></i> القيمة المتوقعة</th>
                                <th><i class="fas fa-chart-line"></i> الربح المتوقع</th>
                                <th><i class="fas fa-shopping-cart"></i> المباع</th>
                                <th><i class="fas fa-info-circle"></i> الحالة</th>
                                <th><i class="fas fa-cogs"></i> الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="categoryProductsTableBody">
                            <!-- المنتجات ستظهر هنا -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // إضافة HTML الجديد بعد الفلاتر
        if (existingFilters) {
            existingFilters.insertAdjacentHTML('afterend', newHTML);
            // إخفاء الفلاتر القديمة والإحصائيات القديمة
            existingFilters.style.display = 'none';
            const oldStats = inventoryPage.querySelector('.stats-grid');
            if (oldStats) oldStats.style.display = 'none';
            const oldTable = inventoryPage.querySelector('.table-container');
            if (oldTable) oldTable.style.display = 'none';
        }
    }

    /**
     * تحميل بيانات المخزون
     */
    function loadInventoryData() {
        // تحديث عرض التصنيفات
        updateCategoriesView();
    }

    // =============================================
    // عرض التصنيفات
    // =============================================

    /**
     * تحديث عرض التصنيفات
     */
    function updateCategoriesView() {
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (!categoriesGrid) return;

        // الحصول على التصنيفات من النظام
        const allCategories = window.categories || [];
        
        if (allCategories.length === 0) {
            categoriesGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <i class="fas fa-folder-open" style="font-size: 4rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <h3 style="color: #64748b; margin-bottom: 0.5rem;">لا توجد تصنيفات</h3>
                    <p style="color: #94a3b8;">قم بإنشاء تصنيف جديد من صفحة إدارة المنتجات</p>
                </div>
            `;
            return;
        }

        // حساب إحصائيات كل تصنيف
        const categoriesWithStats = allCategories.map(category => {
            const categoryProducts = (window.products || []).filter(p => 
                p.product_category === category.category_id
            );
            
            const stats = calculateCategoryStats(categoryProducts);
            
            return {
                ...category,
                ...stats
            };
        });

        // إنشاء بطاقات التصنيفات
        categoriesGrid.innerHTML = categoriesWithStats.map(category => `
            <div class="category-card" data-category-id="${category.category_id}">
                <div class="category-card-header">
                    <div class="category-icon-wrapper">
                        <i class="${category.category_icon || 'fas fa-folder'}"></i>
                    </div>
                    <div class="category-info">
                        <h3 class="category-name">${category.category_name}</h3>
                        <p class="category-description">${category.category_description || 'لا يوجد وصف'}</p>
                    </div>
                    <div class="category-actions">
                        <button class="category-action-btn" 
                                onclick="window.inventoryManagement.showCategoryDetails('${category.category_id}')"
                                title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="category-action-btn" 
                                onclick="window.inventoryManagement.editCategory('${category.category_id}')"
                                title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="category-action-btn delete-btn" 
                                onclick="window.inventoryManagement.deleteCategory('${category.category_id}')"
                                title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="category-card-stats">
                    <div class="category-stat">
                        <div class="category-stat-label">
                            <i class="fas fa-boxes"></i> المنتجات
                        </div>
                        <div class="category-stat-value">${category.totalProducts}</div>
                    </div>
                    <div class="category-stat">
                        <div class="category-stat-label">
                            <i class="fas fa-layer-group"></i> الكمية
                        </div>
                        <div class="category-stat-value">${category.totalQuantity}</div>
                    </div>
                    <div class="category-stat">
                        <div class="category-stat-label">
                            <i class="fas fa-coins"></i> التكلفة
                        </div>
                        <div class="category-stat-value">${formatCurrency(category.totalCost)}</div>
                    </div>
                    <div class="category-stat">
                        <div class="category-stat-label">
                            <i class="fas fa-money-bill-wave"></i> القيمة
                        </div>
                        <div class="category-stat-value">${formatCurrency(category.totalValue)}</div>
                    </div>
                    <div class="category-stat">
                        <div class="category-stat-label">
                            <i class="fas fa-chart-line"></i> الربح
                        </div>
                        <div class="category-stat-value category-profit">${formatCurrency(category.totalProfit)}</div>
                    </div>
                    <div class="category-stat">
                        <div class="category-stat-label">
                            <i class="fas fa-shopping-cart"></i> المباع
                        </div>
                        <div class="category-stat-value">${category.totalSold}</div>
                    </div>
                </div>
                
                <div class="category-card-footer">
                    <button class="category-view-btn" 
                            onclick="window.inventoryManagement.showCategoryProducts('${category.category_id}')">
                        <i class="fas fa-arrow-left"></i> عرض المنتجات
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * حساب إحصائيات التصنيف
     */
    function calculateCategoryStats(products) {
        const stats = {
            totalProducts: products.length,
            totalQuantity: 0,
            totalCost: 0,
            totalValue: 0,
            totalProfit: 0,
            totalSold: 0
        };

        products.forEach(product => {
            const quantity = parseFloat(product.stock_quantity) || 0;
            const costPrice = parseFloat(product.product_cost_retail) || 0;
            const sellPrice = parseFloat(product.product_price_retail) || 0;
            
            stats.totalQuantity += quantity;
            stats.totalCost += quantity * costPrice;
            stats.totalValue += quantity * sellPrice;
            stats.totalProfit += quantity * (sellPrice - costPrice);
            stats.totalSold += parseFloat(product.sold_quantity) || 0;
        });

        return stats;
    }

    // =============================================
    // عرض المنتجات داخل التصنيف
    // =============================================

    /**
     * عرض منتجات التصنيف
     */
    function showCategoryProducts(categoryId) {
        currentView = 'products';
        currentCategoryId = categoryId;

        // العثور على التصنيف
        const category = (window.categories || []).find(c => c.category_id === categoryId);
        if (!category) {
            showToast('التصنيف غير موجود', 'error');
            return;
        }

        // تحديث breadcrumb
        const breadcrumb = document.getElementById('inventoryBreadcrumb');
        const categoryName = document.getElementById('currentCategoryName');
        if (breadcrumb && categoryName) {
            categoryName.textContent = category.category_name;
            breadcrumb.style.display = 'flex';
        }

        // إخفاء عرض التصنيفات وإظهار عرض المنتجات
        document.getElementById('categoriesView').style.display = 'none';
        document.getElementById('productsView').style.display = 'block';

        // تحديث إحصائيات التصنيف
        updateCategoryStats(categoryId);

        // عرض المنتجات
        filterProducts();
    }

    /**
     * تحديث إحصائيات التصنيف
     */
    function updateCategoryStats(categoryId) {
        const categoryProducts = (window.products || []).filter(p => 
            p.product_category === categoryId
        );

        const stats = calculateCategoryStats(categoryProducts);

        // تحديث قيم الإحصائيات
        document.getElementById('categoryTotalProducts').textContent = stats.totalProducts;
        document.getElementById('categoryTotalQuantity').textContent = stats.totalQuantity;
        document.getElementById('categoryTotalCost').textContent = formatCurrency(stats.totalCost);
        document.getElementById('categoryTotalValue').textContent = formatCurrency(stats.totalValue);
        document.getElementById('categoryTotalProfit').textContent = formatCurrency(stats.totalProfit);
        document.getElementById('categoryTotalSold').textContent = stats.totalSold;
    }

    /**
     * فلترة وعرض المنتجات
     */
    function filterProducts() {
        if (!currentCategoryId) return;

        const searchTerm = document.getElementById('productsSearchInput')?.value.toLowerCase() || '';
        const stockStatus = document.getElementById('productsStockStatus')?.value || 'all';
        const sortBy = document.getElementById('productsSortBy')?.value || 'name_asc';

        // الحصول على منتجات التصنيف
        let categoryProducts = (window.products || []).filter(p => 
            p.product_category === currentCategoryId
        );

        // تطبيق البحث
        if (searchTerm) {
            categoryProducts = categoryProducts.filter(product => 
                (product.product_name && product.product_name.toLowerCase().includes(searchTerm)) ||
                (product.product_barcode && product.product_barcode.toLowerCase().includes(searchTerm))
            );
        }

        // تطبيق فلتر الحالة
        if (stockStatus !== 'all') {
            categoryProducts = categoryProducts.filter(p => {
                const quantity = parseFloat(p.stock_quantity) || 0;
                const minStock = parseFloat(p.min_stock) || 0;
                
                if (stockStatus === 'in-stock') return quantity > minStock;
                if (stockStatus === 'low-stock') return quantity > 0 && quantity <= minStock;
                if (stockStatus === 'out-of-stock') return quantity === 0;
                return true;
            });
        }

        // تطبيق الترتيب
        categoryProducts = sortProducts(categoryProducts, sortBy);

        // عرض المنتجات
        renderCategoryProducts(categoryProducts);
    }

    /**
     * ترتيب المنتجات
     */
    function sortProducts(products, sortBy) {
        return products.sort((a, b) => {
            switch(sortBy) {
                case 'name_asc':
                    return (a.product_name || '').localeCompare(b.product_name || '');
                case 'name_desc':
                    return (b.product_name || '').localeCompare(a.product_name || '');
                case 'quantity_high':
                    return (b.stock_quantity || 0) - (a.stock_quantity || 0);
                case 'quantity_low':
                    return (a.stock_quantity || 0) - (b.stock_quantity || 0);
                case 'value_high':
                    const valueB = (b.stock_quantity || 0) * (b.product_price_retail || 0);
                    const valueA = (a.stock_quantity || 0) * (a.product_price_retail || 0);
                    return valueB - valueA;
                case 'value_low':
                    const valueA2 = (a.stock_quantity || 0) * (a.product_price_retail || 0);
                    const valueB2 = (b.stock_quantity || 0) * (b.product_price_retail || 0);
                    return valueA2 - valueB2;
                case 'profit_high':
                    const profitB = (b.stock_quantity || 0) * ((b.product_price_retail || 0) - (b.product_cost_retail || 0));
                    const profitA = (a.stock_quantity || 0) * ((a.product_price_retail || 0) - (a.product_cost_retail || 0));
                    return profitB - profitA;
                case 'profit_low':
                    const profitA2 = (a.stock_quantity || 0) * ((a.product_price_retail || 0) - (a.product_cost_retail || 0));
                    const profitB2 = (b.stock_quantity || 0) * ((b.product_price_retail || 0) - (b.product_cost_retail || 0));
                    return profitA2 - profitB2;
                default:
                    return 0;
            }
        });
    }

    /**
     * عرض جدول المنتجات
     */
    function renderCategoryProducts(products) {
        const tbody = document.getElementById('categoryProductsTableBody');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 3rem;">
                        <i class="fas fa-inbox" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                        <p style="color: #64748b;">لا توجد منتجات في هذا التصنيف</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = products.map(product => {
            const quantity = parseFloat(product.stock_quantity) || 0;
            const minStock = parseFloat(product.min_stock) || 0;
            const costPrice = parseFloat(product.product_cost_retail) || 0;
            const sellPrice = parseFloat(product.product_price_retail) || 0;
            const soldQuantity = parseFloat(product.sold_quantity) || 0;
            
            const totalCost = quantity * costPrice;
            const totalValue = quantity * sellPrice;
            const totalProfit = totalValue - totalCost;
            
            // تحديد حالة المخزون
            let status = 'متوفر';
            let statusClass = 'status-badge status-success';
            
            if (quantity === 0) {
                status = 'نفد المخزون';
                statusClass = 'status-badge status-danger';
            } else if (quantity <= minStock) {
                status = 'مخزون قليل';
                statusClass = 'status-badge status-warning';
            }

            return `
                <tr data-product-id="${product.product_id}">
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-box" style="color: #6366f1;"></i>
                            <span style="font-weight: 500;">${product.product_name}</span>
                        </div>
                    </td>
                    <td>
                        <code style="background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85em;">
                            ${product.product_barcode || '-'}
                        </code>
                    </td>
                    <td>
                        <span style="font-weight: 600; color: ${quantity === 0 ? '#ef4444' : '#10b981'};">
                            ${quantity}
                        </span>
                    </td>
                    <td>${formatCurrency(totalCost)}</td>
                    <td>${formatCurrency(totalValue)}</td>
                    <td class="${totalProfit >= 0 ? 'text-success' : 'text-danger'}" style="font-weight: 600;">
                        ${formatCurrency(totalProfit)}
                    </td>
                    <td>
                        <span style="color: #6366f1; font-weight: 500;">
                            ${soldQuantity}
                        </span>
                    </td>
                    <td>
                        <span class="${statusClass}">${status}</span>
                    </td>
                    <td>
                        <div class="action-buttons-group">
                            <button class="action-btn view-btn" 
                                    onclick="window.inventoryManagement.showProductDetails('${product.product_id}')"
                                    title="عرض التفاصيل">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" 
                                    onclick="window.inventoryManagement.editProduct('${product.product_id}')"
                                    title="تعديل">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" 
                                    onclick="window.inventoryManagement.deleteProduct('${product.product_id}')"
                                    title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // =============================================
    // إجراءات التصنيفات
    // =============================================

    /**
     * عرض تفاصيل التصنيف
     */
    function showCategoryDetails(categoryId) {
        const category = (window.categories || []).find(c => c.category_id === categoryId);
        if (!category) {
            showToast('التصنيف غير موجود', 'error');
            return;
        }

        const categoryProducts = (window.products || []).filter(p => 
            p.product_category === categoryId
        );
        const stats = calculateCategoryStats(categoryProducts);

        const modalHTML = `
            <div class="modal fade show" id="categoryDetailsModal" style="display: block; background: rgba(0,0,0,0.5);">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="${category.category_icon || 'fas fa-folder'}"></i>
                                تفاصيل التصنيف
                            </h5>
                            <button type="button" class="close" onclick="document.getElementById('categoryDetailsModal').remove()">
                                <span>&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="category-details-content">
                                <div class="detail-section">
                                    <h6 class="detail-section-title">
                                        <i class="fas fa-info-circle"></i> معلومات أساسية
                                    </h6>
                                    <div class="detail-grid">
                                        <div class="detail-item">
                                            <span class="detail-label">اسم التصنيف:</span>
                                            <span class="detail-value">${category.category_name}</span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">رمز التصنيف:</span>
                                            <span class="detail-value"><i class="${category.category_icon || 'fas fa-folder'}"></i></span>
                                        </div>
                                        <div class="detail-item" style="grid-column: 1/-1;">
                                            <span class="detail-label">الوصف:</span>
                                            <span class="detail-value">${category.category_description || 'لا يوجد وصف'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="detail-section">
                                    <h6 class="detail-section-title">
                                        <i class="fas fa-chart-bar"></i> الإحصائيات
                                    </h6>
                                    <div class="stats-grid-modal">
                                        <div class="stat-item-modal">
                                            <i class="fas fa-boxes stat-icon-modal"></i>
                                            <div class="stat-info-modal">
                                                <div class="stat-value-modal">${stats.totalProducts}</div>
                                                <div class="stat-label-modal">عدد المنتجات</div>
                                            </div>
                                        </div>
                                        <div class="stat-item-modal">
                                            <i class="fas fa-layer-group stat-icon-modal"></i>
                                            <div class="stat-info-modal">
                                                <div class="stat-value-modal">${stats.totalQuantity}</div>
                                                <div class="stat-label-modal">إجمالي الكميات</div>
                                            </div>
                                        </div>
                                        <div class="stat-item-modal">
                                            <i class="fas fa-coins stat-icon-modal"></i>
                                            <div class="stat-info-modal">
                                                <div class="stat-value-modal">${formatCurrency(stats.totalCost)}</div>
                                                <div class="stat-label-modal">إجمالي التكلفة</div>
                                            </div>
                                        </div>
                                        <div class="stat-item-modal">
                                            <i class="fas fa-money-bill-wave stat-icon-modal"></i>
                                            <div class="stat-info-modal">
                                                <div class="stat-value-modal">${formatCurrency(stats.totalValue)}</div>
                                                <div class="stat-label-modal">القيمة المتوقعة</div>
                                            </div>
                                        </div>
                                        <div class="stat-item-modal">
                                            <i class="fas fa-chart-line stat-icon-modal"></i>
                                            <div class="stat-info-modal">
                                                <div class="stat-value-modal">${formatCurrency(stats.totalProfit)}</div>
                                                <div class="stat-label-modal">الربح المتوقع</div>
                                            </div>
                                        </div>
                                        <div class="stat-item-modal">
                                            <i class="fas fa-shopping-cart stat-icon-modal"></i>
                                            <div class="stat-info-modal">
                                                <div class="stat-value-modal">${stats.totalSold}</div>
                                                <div class="stat-label-modal">المباع</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" 
                                    onclick="window.inventoryManagement.showCategoryProducts('${categoryId}'); document.getElementById('categoryDetailsModal').remove();">
                                <i class="fas fa-arrow-left"></i> عرض المنتجات
                            </button>
                            <button type="button" class="btn btn-secondary" 
                                    onclick="document.getElementById('categoryDetailsModal').remove()">
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * تعديل التصنيف
     */
    function editCategory(categoryId) {
        // استدعاء دالة التعديل الموجودة في النظام
        if (typeof window.showEditCategoryModal === 'function') {
            window.showEditCategoryModal(categoryId);
        } else {
            showToast('وظيفة التعديل غير متوفرة حالياً', 'warning');
        }
    }

    /**
     * حذف التصنيف
     */
    function deleteCategory(categoryId) {
        const category = (window.categories || []).find(c => c.category_id === categoryId);
        if (!category) {
            showToast('التصنيف غير موجود', 'error');
            return;
        }

        // التحقق من وجود منتجات في التصنيف
        const categoryProducts = (window.products || []).filter(p => 
            p.product_category === categoryId
        );

        if (categoryProducts.length > 0) {
            showToast(`لا يمكن حذف التصنيف لأنه يحتوي على ${categoryProducts.length} منتج`, 'error');
            return;
        }

        if (confirm(`هل أنت متأكد من حذف التصنيف "${category.category_name}"؟`)) {
            // استدعاء دالة الحذف الموجودة في النظام
            if (typeof window.deleteCategory === 'function') {
                window.deleteCategory(categoryId);
                updateCategoriesView();
                showToast('تم حذف التصنيف بنجاح', 'success');
            } else {
                showToast('وظيفة الحذف غير متوفرة حالياً', 'warning');
            }
        }
    }

    // =============================================
    // إجراءات المنتجات
    // =============================================

    /**
     * عرض تفاصيل المنتج
     */
    function showProductDetails(productId) {
        // استدعاء دالة عرض التفاصيل الموجودة في النظام
        if (typeof window.showProductDetails === 'function') {
            window.showProductDetails(productId);
        } else {
            showToast('وظيفة عرض التفاصيل غير متوفرة حالياً', 'warning');
        }
    }

    /**
     * تعديل المنتج
     */
    function editProduct(productId) {
        // استدعاء دالة التعديل الموجودة في النظام
        if (typeof window.showEditProductModal === 'function') {
            window.showEditProductModal(productId);
        } else {
            showToast('وظيفة التعديل غير متوفرة حالياً', 'warning');
        }
    }

    /**
     * حذف المنتج
     */
    function deleteProduct(productId) {
        const product = (window.products || []).find(p => p.product_id === productId);
        if (!product) {
            showToast('المنتج غير موجود', 'error');
            return;
        }

        if (confirm(`هل أنت متأكد من حذف المنتج "${product.product_name}"؟`)) {
            // استدعاء دالة الحذف الموجودة في النظام
            if (typeof window.deleteProduct === 'function') {
                window.deleteProduct(productId);
                filterProducts();
                updateCategoryStats(currentCategoryId);
                showToast('تم حذف المنتج بنجاح', 'success');
            } else {
                showToast('وظيفة الحذف غير متوفرة حالياً', 'warning');
            }
        }
    }

    // =============================================
    // الدوال المساعدة
    // =============================================

    /**
     * تنسيق العملة
     */
    function formatCurrency(amount) {
        if (typeof window.formatCurrency === 'function') {
            return window.formatCurrency(amount);
        }
        return new Intl.NumberFormat('ar-IQ', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' د.ع';
    }

    /**
     * عرض رسالة Toast
     */
    function showToast(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            alert(message);
        }
    }

    /**
     * العودة إلى عرض التصنيفات
     */
    function showCategories() {
        currentView = 'categories';
        currentCategoryId = null;

        // إخفاء breadcrumb
        const breadcrumb = document.getElementById('inventoryBreadcrumb');
        if (breadcrumb) breadcrumb.style.display = 'none';

        // إخفاء عرض المنتجات وإظهار عرض التصنيفات
        document.getElementById('productsView').style.display = 'none';
        document.getElementById('categoriesView').style.display = 'block';

        // تحديث عرض التصنيفات
        updateCategoriesView();
    }

    // =============================================
    // تصدير الواجهة العامة
    // =============================================

    window.inventoryManagement = {
        init: initInventoryManagementSystem,
        showCategories: showCategories,
        showCategoryProducts: showCategoryProducts,
        showCategoryDetails: showCategoryDetails,
        editCategory: editCategory,
        deleteCategory: deleteCategory,
        showProductDetails: showProductDetails,
        editProduct: editProduct,
        deleteProduct: deleteProduct,
        filterProducts: filterProducts,
        updateCategoriesView: updateCategoriesView,
        updateCategoryStats: updateCategoryStats
    };

    console.log('✅ نظام إدارة المخزون المتقدم جاهز');

})();
