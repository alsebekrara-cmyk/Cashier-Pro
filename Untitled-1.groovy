// ============================================
    // 🏪 نظام إدارة الموردين - شركة الإبداع الرقمي
    // ============================================
    (function() {
        // متغيرات عداد صفوف المنتجات
        window.supplierProductRowCounter = 0;
        window.editSupplierProductRowCounter = 0;

        // تحميل الموردين من localStorage
        window.loadSuppliers = function() {
            try {
                const savedSuppliers = localStorage.getItem('suppliers');
                if (savedSuppliers) {
                    suppliers = JSON.parse(savedSuppliers);
                    console.log('✅ تم تحميل الموردين:', suppliers.length);
                }
            } catch (error) {
                console.error('❌ خطأ في تحميل الموردين:', error);
                suppliers = [];
            }
        };

        // حفظ الموردين في localStorage  
        window.saveSuppliers = function() {
            try {
                localStorage.setItem('suppliers', JSON.stringify(suppliers));
                console.log('✅ تم حفظ الموردين:', suppliers.length);
                return true;
            } catch (error) {
                console.error('❌ خطأ في حفظ الموردين:', error);
                return false;
            }
        };

        // تحديث إحصائيات الموردين
        window.updateSuppliersStats = function() {
            const totalSuppliers = suppliers.length;
            let totalProducts = 0, totalValue = 0, latestSupplierName = 'لا يوجد';

            suppliers.forEach(supplier => {
                if (supplier.products && Array.isArray(supplier.products)) {
                    totalProducts += supplier.products.length;
                    supplier.products.forEach(product => {
                        const quantity = parseInt(product.quantity) || 0;
                        const costRetail = parseFloat(product.costRetail) || 0;
                        totalValue += quantity * costRetail;
                    });
                }
            });

            if (suppliers.length > 0) {
                const sortedSuppliers = [...suppliers].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                latestSupplierName = sortedSuppliers[0].name;
            }

            const els = {
                totalSuppliers: document.getElementById('totalSuppliersCount'),
                totalProducts: document.getElementById('totalSupplierProducts'),
                totalValue: document.getElementById('totalSuppliersValue'),
                latest: document.getElementById('latestSupplier')
            };

            if (els.totalSuppliers) els.totalSuppliers.textContent = totalSuppliers;
            if (els.totalProducts) els.totalProducts.textContent = totalProducts;
            if (els.totalValue) els.totalValue.textContent = totalValue.toLocaleString() + ' دينار';
            if (els.latest) els.latest.textContent = latestSupplierName;
        };

        // عرض جدول الموردين
        window.displaySuppliers = function() {
            const tbody = document.getElementById('suppliersTableBody');
            if (!tbody) return;

            if (!suppliers || suppliers.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 3rem;"><i class="fas fa-truck" style="font-size: 3rem; color: var(--theme-text-tertiary); opacity: 0.3;"></i><p style="margin-top: 1rem; color: var(--theme-text-secondary);">لا توجد موردين حالياً</p><button class="btn btn-primary" onclick="openAddSupplierModal()" style="margin-top: 1rem;"><i class="fas fa-plus"></i> إضافة أول مورد</button></td></tr>`;
                updateSuppliersStats();
                return;
            }

            tbody.innerHTML = suppliers.map((supplier, index) => {
                const productsCount = supplier.products ? supplier.products.length : 0;
                let totalValue = 0;
                if (supplier.products && Array.isArray(supplier.products)) {
                    supplier.products.forEach(product => {
                        const quantity = parseInt(product.quantity) || 0;
                        const costRetail = parseFloat(product.costRetail) || 0;
                        totalValue += quantity * costRetail;
                    });
                }
                const date = supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString('ar-IQ') : 'غير محدد';

                return `<tr><td>${index + 1}</td><td><strong>${supplier.name}</strong></td><td>${supplier.company || '-'}</td><td><i class="fas fa-phone"></i> ${supplier.phone}</td><td>${supplier.address || '-'}</td><td><span class="badge" style="background: linear-gradient(135deg, #667eea, #764ba2);">${productsCount}</span></td><td><strong>${totalValue.toLocaleString()} د</strong></td><td>${date}</td><td><div style="display: flex; gap: 0.5rem; justify-content: center;"><button class="btn btn-sm btn-info" onclick="viewSupplierDetails('${supplier.id}')" title="عرض التفاصيل"><i class="fas fa-eye"></i></button><button class="btn btn-sm btn-primary" onclick="editSupplier('${supplier.id}')" title="تعديل"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-success" onclick="printSupplierDetails('${supplier.id}')" title="طباعة"><i class="fas fa-print"></i></button><button class="btn btn-sm btn-danger" onclick="deleteSupplier('${supplier.id}')" title="حذف"><i class="fas fa-trash"></i></button></div></td></tr>`;
            }).join('');

            updateSuppliersStats();
        };

        // فلترة الموردين
        window.filterSuppliers = function() {
            const searchTerm = (document.getElementById('supplierSearchInput')?.value || '').toLowerCase();
            const dateFilter = document.getElementById('supplierDateFilter')?.value || 'all';
            let filteredSuppliers = [...suppliers];

            if (searchTerm) {
                filteredSuppliers = filteredSuppliers.filter(supplier => 
                    supplier.name.toLowerCase().includes(searchTerm) ||
                    (supplier.company && supplier.company.toLowerCase().includes(searchTerm)) ||
                    supplier.phone.includes(searchTerm) ||
                    (supplier.address && supplier.address.toLowerCase().includes(searchTerm))
                );
            }

            if (dateFilter !== 'all') {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                filteredSuppliers = filteredSuppliers.filter(supplier => {
                    if (!supplier.createdAt) return false;
                    const supplierDate = new Date(supplier.createdAt);
                    switch(dateFilter) {
                        case 'today': return supplierDate >= today;
                        case 'week': const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7); return supplierDate >= weekAgo;
                        case 'month': const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1); return supplierDate >= monthAgo;
                        case 'year': const yearAgo = new Date(today); yearAgo.setFullYear(yearAgo.getFullYear() - 1); return supplierDate >= yearAgo;
                        default: return true;
                    }
                });
            }

            const tbody = document.getElementById('suppliersTableBody');
            if (!tbody) return;

            if (filteredSuppliers.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem;"><i class="fas fa-search" style="font-size: 2rem; color: var(--theme-text-tertiary); opacity: 0.3;"></i><p style="margin-top: 1rem; color: var(--theme-text-secondary);">لم يتم العثور على نتائج</p></td></tr>`;
                return;
            }

            tbody.innerHTML = filteredSuppliers.map((supplier, index) => {
                const productsCount = supplier.products ? supplier.products.length : 0;
                let totalValue = 0;
                if (supplier.products && Array.isArray(supplier.products)) {
                    supplier.products.forEach(product => {
                        const quantity = parseInt(product.quantity) || 0;
                        const costRetail = parseFloat(product.costRetail) || 0;
                        totalValue += quantity * costRetail;
                    });
                }
                const date = supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString('ar-IQ') : 'غير محدد';
                return `<tr><td>${index + 1}</td><td><strong>${supplier.name}</strong></td><td>${supplier.company || '-'}</td><td><i class="fas fa-phone"></i> ${supplier.phone}</td><td>${supplier.address || '-'}</td><td><span class="badge" style="background: linear-gradient(135deg, #667eea, #764ba2);">${productsCount}</span></td><td><strong>${totalValue.toLocaleString()} د</strong></td><td>${date}</td><td><div style="display: flex; gap: 0.5rem; justify-content: center;"><button class="btn btn-sm btn-info" onclick="viewSupplierDetails('${supplier.id}')" title="عرض التفاصيل"><i class="fas fa-eye"></i></button><button class="btn btn-sm btn-primary" onclick="editSupplier('${supplier.id}')" title="تعديل"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-success" onclick="printSupplierDetails('${supplier.id}')" title="طباعة"><i class="fas fa-print"></i></button><button class="btn btn-sm btn-danger" onclick="deleteSupplier('${supplier.id}')" title="حذف"><i class="fas fa-trash"></i></button></div></td></tr>`;
            }).join('');
        };
        

        // إعادة تعيين الفلاتر
        window.resetSupplierFilters = function() {
            const searchInput = document.getElementById('supplierSearchInput');
            const dateFilter = document.getElementById('supplierDateFilter');
            if (searchInput) searchInput.value = '';
            if (dateFilter) dateFilter.value = 'all';
            displaySuppliers();
        };

        // إضافة صف منتج في modal الإضافة
        window.addSupplierProductRow = function() {
            window.supplierProductRowCounter++;
            const tbody = document.getElementById('supplierProductsTableBody');
            if (!tbody) return;
            const row = document.createElement('tr');
            row.innerHTML = `<td>${window.supplierProductRowCounter}</td><td><input type="text" class="form-input" name="productName[]" required style="width: 100%; min-width: 150px;"></td><td><input type="number" class="form-input" name="productQuantity[]" required min="1" value="1" style="width: 100%;"></td><td><input type="number" class="form-input" name="productCostRetail[]" required min="0" step="0.01" style="width: 100%;"></td><td><input type="number" class="form-input" name="productCostWholesale[]" min="0" step="0.01" style="width: 100%;"></td><td><input type="number" class="form-input" name="productPriceRetail[]" required min="0" step="0.01" style="width: 100%;"></td><td><input type="number" class="form-input" name="productPriceWholesale[]" min="0" step="0.01" style="width: 100%;"></td><td><button type="button" class="btn btn-sm btn-danger" onclick="this.closest('tr').remove()"><i class="fas fa-trash"></i></button></td>`;
            tbody.appendChild(row);
        };

        // إضافة صف منتج في modal التعديل
        window.addEditSupplierProductRow = function() {
            window.editSupplierProductRowCounter++;
            const tbody = document.getElementById('editSupplierProductsTableBody');
            if (!tbody) return;
            const row = document.createElement('tr');
            row.innerHTML = `<td>${window.editSupplierProductRowCounter}</td><td><input type="text" class="form-input" name="editProductName[]" required style="width: 100%; min-width: 150px;"></td><td><input type="number" class="form-input" name="editProductQuantity[]" required min="1" value="1" style="width: 100%;"></td><td><input type="number" class="form-input" name="editProductCostRetail[]" required min="0" step="0.01" style="width: 100%;"></td><td><input type="number" class="form-input" name="editProductCostWholesale[]" min="0" step="0.01" style="width: 100%;"></td><td><input type="number" class="form-input" name="editProductPriceRetail[]" required min="0" step="0.01" style="width: 100%;"></td><td><input type="number" class="form-input" name="editProductPriceWholesale[]" min="0" step="0.01" style="width: 100%;"></td><td><button type="button" class="btn btn-sm btn-danger" onclick="this.closest('tr').remove()"><i class="fas fa-trash"></i></button></td>`;
            tbody.appendChild(row);
        };

        // فتح نافذة إضافة مورد
        window.openAddSupplierModal = function() {
            const modal = document.getElementById('addSupplierModal');
            if (!modal) return;
            document.getElementById('addSupplierForm').reset();
            const tbody = document.getElementById('supplierProductsTableBody');
            if (tbody) tbody.innerHTML = '';
            window.supplierProductRowCounter = 0;
            addSupplierProductRow();
            modal.style.display = 'flex';
        };

        // معالجة إضافة مورد جديد
        window.handleAddSupplier = function(event) {
            event.preventDefault();

            const name = document.getElementById('supplierName').value.trim();
            const company = document.getElementById('supplierCompany').value.trim();
            const phone = document.getElementById('supplierPhone').value.trim();
            const address = document.getElementById('supplierAddress').value.trim();

            const productNames = document.getElementsByName('productName[]');
            const productQuantities = document.getElementsByName('productQuantity[]');
            const productCostRetails = document.getElementsByName('productCostRetail[]');
            const productCostWholesales = document.getElementsByName('productCostWholesale[]');
            const productPriceRetails = document.getElementsByName('productPriceRetail[]');
            const productPriceWholesales = document.getElementsByName('productPriceWholesale[]');

            const products = [];
            for (let i = 0; i < productNames.length; i++) {
                if (productNames[i].value.trim()) {
                    products.push({
                        name: productNames[i].value.trim(),
                        quantity: parseInt(productQuantities[i].value) || 0,
                        costRetail: parseFloat(productCostRetails[i].value) || 0,
                        costWholesale: parseFloat(productCostWholesales[i].value) || 0,
                        priceRetail: parseFloat(productPriceRetails[i].value) || 0,
                        priceWholesale: parseFloat(productPriceWholesales[i].value) || 0
                    });
                }
            }
            

            if (products.length === 0) {
                showToast('❌ يجب إضافة منتج واحد على الأقل', 'error');
                return;
            }

            const newSupplier = {
                id: 'SUP-' + Date.now(),
                name, company, phone, address, products,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            

            suppliers.push(newSupplier);

            if (saveSuppliers()) {
                showToast('✅ تم إضافة المورد بنجاح', 'success');
                closeModal('addSupplierModal');
                displaySuppliers();
            } else {
                showToast('❌ حدث خطأ أثناء حفظ المورد', 'error');
            }
        };
        

        // عرض تفاصيل المورد
        window.viewSupplierDetails = function(supplierId) {
            const supplier = suppliers.find(s => s.id === supplierId);
            if (!supplier) {
                showToast('❌ لم يتم العثور على المورد', 'error');
                return;
            }

            let totalValue = 0;
            if (supplier.products && Array.isArray(supplier.products)) {
                supplier.products.forEach(product => {
                    const quantity = parseInt(product.quantity) || 0;
                    const costRetail = parseFloat(product.costRetail) || 0;
                    totalValue += quantity * costRetail;
                });
            }

            const date = supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString('ar-IQ', {year: 'numeric', month: 'long', day: 'numeric'}) : 'غير محدد';

            const productsHTML = supplier.products && supplier.products.length > 0 ? `
                <table class="data-table" style="font-size: 0.9rem; margin-top: 1rem;">
                    <thead><tr><th>#</th><th>اسم المنتج</th><th>الكمية</th><th>سعر التكلفة (مفرد)</th><th>سعر التكلفة (جملة)</th><th>سعر البيع (مفرد)</th><th>سعر البيع (جملة)</th><th>القيمة الإجمالية</th></tr></thead>
                    <tbody>${supplier.products.map((product, index) => {
                        const total = (parseInt(product.quantity) || 0) * (parseFloat(product.costRetail) || 0);
                        return `<tr><td>${index + 1}</td><td><strong>${product.name}</strong></td><td>${product.quantity}</td><td>${(parseFloat(product.costRetail) || 0).toLocaleString()} د</td><td>${(parseFloat(product.costWholesale) || 0).toLocaleString()} د</td><td>${(parseFloat(product.priceRetail) || 0).toLocaleString()} د</td><td>${(parseFloat(product.priceWholesale) || 0).toLocaleString()} د</td><td><strong>${total.toLocaleString()} د</strong></td></tr>`;
                    }).join('')}</tbody>
                </table>
            ` : '<p style="text-align: center; color: var(--theme-text-secondary);">لا توجد منتجات</p>';

            const content = `
                <div style="padding: 1rem;">
                    <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)); padding: 1.5rem; border-radius: var(--border-radius); border: 2px solid rgba(99, 102, 241, 0.3); margin-bottom: 1.5rem;">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                            <div><div style="color: var(--theme-text-secondary); margin-bottom: 0.5rem;"><i class="fas fa-truck"></i> اسم المورد</div><div style="font-size: 1.2rem; font-weight: bold;">${supplier.name}</div></div>
                            <div><div style="color: var(--theme-text-secondary); margin-bottom: 0.5rem;"><i class="fas fa-building"></i> اسم الشركة</div><div style="font-size: 1.2rem; font-weight: bold;">${supplier.company || '-'}</div></div>
                            <div><div style="color: var(--theme-text-secondary); margin-bottom: 0.5rem;"><i class="fas fa-phone"></i> رقم الهاتف</div><div style="font-size: 1.2rem; font-weight: bold;">${supplier.phone}</div></div>
                            <div><div style="color: var(--theme-text-secondary); margin-bottom: 0.5rem;"><i class="fas fa-map-marker-alt"></i> العنوان</div><div style="font-size: 1.2rem; font-weight: bold;">${supplier.address || '-'}</div></div>
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1)); padding: 1.5rem; border-radius: var(--border-radius); border: 2px solid rgba(16, 185, 129, 0.3); margin-bottom: 1.5rem;">
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
                            <div><div style="color: var(--theme-text-secondary); margin-bottom: 0.5rem;">عدد المنتجات</div><div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${supplier.products ? supplier.products.length : 0}</div></div>
                            <div><div style="color: var(--theme-text-secondary); margin-bottom: 0.5rem;">القيمة الإجمالية</div><div style="font-size: 1.5rem; font-weight: bold; color: var(--success-color);">${totalValue.toLocaleString()} د</div></div>
                            <div><div style="color: var(--theme-text-secondary); margin-bottom: 0.5rem;">تاريخ الإضافة</div><div style="font-size: 1rem; font-weight: bold;">${date}</div></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <h4 style="color: var(--primary-color); margin-bottom: 1rem;"><i class="fas fa-boxes"></i> قائمة المنتجات</h4>
                        ${productsHTML}
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                        <button class="btn btn-primary" onclick="editSupplier('${supplier.id}'); closeModal('supplierDetailsModal');"><i class="fas fa-edit"></i> تعديل</button>
                        <button class="btn btn-success" onclick="printSupplierDetails('${supplier.id}')"><i class="fas fa-print"></i> طباعة</button>
                        <button class="btn btn-secondary" onclick="closeModal('supplierDetailsModal')"><i class="fas fa-times"></i> إغلاق</button>
                    </div>
                </div>
            `;
        
            

            const contentDiv = document.getElementById('supplierDetailsContent');
            if (contentDiv) contentDiv.innerHTML = content;

            const modal = document.getElementById('supplierDetailsModal');
            if (modal) modal.style.display = 'flex';
        };

        // تعديل مورد
        window.editSupplier = function(supplierId) {
            const supplier = suppliers.find(s => s.id === supplierId);
            if (!supplier) {
                showToast('❌ لم يتم العثور على المورد', 'error');
                return;
            }

            document.getElementById('editSupplierId').value = supplier.id;
            document.getElementById('editSupplierName').value = supplier.name;
            document.getElementById('editSupplierCompany').value = supplier.company || '';
            document.getElementById('editSupplierPhone').value = supplier.phone;
            document.getElementById('editSupplierAddress').value = supplier.address || '';

            const tbody = document.getElementById('editSupplierProductsTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                window.editSupplierProductRowCounter = 0;

                if (supplier.products && supplier.products.length > 0) {
                    supplier.products.forEach((product, index) => {
                        window.editSupplierProductRowCounter++;
                        const row = document.createElement('tr');
                        row.innerHTML = `<td>${window.editSupplierProductRowCounter}</td><td><input type="text" class="form-input" name="editProductName[]" required value="${product.name}" style="width: 100%; min-width: 150px;"></td><td><input type="number" class="form-input" name="editProductQuantity[]" required min="1" value="${product.quantity}" style="width: 100%;"></td><td><input type="number" class="form-input" name="editProductCostRetail[]" required min="0" step="0.01" value="${product.costRetail}" style="width: 100%;"></td><td><input type="number" class="form-input" name="editProductCostWholesale[]" min="0" step="0.01" value="${product.costWholesale || ''}" style="width: 100%;"></td><td><input type="number" class="form-input" name="editProductPriceRetail[]" required min="0" step="0.01" value="${product.priceRetail}" style="width: 100%;"></td><td><input type="number" class="form-input" name="editProductPriceWholesale[]" min="0" step="0.01" value="${product.priceWholesale || ''}" style="width: 100%;"></td><td><button type="button" class="btn btn-sm btn-danger" onclick="this.closest('tr').remove()"><i class="fas fa-trash"></i></button></td>`;
                        tbody.appendChild(row);
                    });
                } else {
                    addEditSupplierProductRow();
                }
            }

            const modal = document.getElementById('editSupplierModal');
            if (modal) modal.style.display = 'flex';
        };

        // معالجة تعديل المورد
        window.handleEditSupplier = function(event) {
            event.preventDefault();

            const supplierId = document.getElementById('editSupplierId').value;
            const supplierIndex = suppliers.findIndex(s => s.id === supplierId);
            
            if (supplierIndex === -1) {
                showToast('❌ لم يتم العثور على المورد', 'error');
                return;
            }

            const name = document.getElementById('editSupplierName').value.trim();
            const company = document.getElementById('editSupplierCompany').value.trim();
            const phone = document.getElementById('editSupplierPhone').value.trim();
            const address = document.getElementById('editSupplierAddress').value.trim();

            const productNames = document.getElementsByName('editProductName[]');
            const productQuantities = document.getElementsByName('editProductQuantity[]');
            const productCostRetails = document.getElementsByName('editProductCostRetail[]');
            const productCostWholesales = document.getElementsByName('editProductCostWholesale[]');
            const productPriceRetails = document.getElementsByName('editProductPriceRetail[]');
            const productPriceWholesales = document.getElementsByName('editProductPriceWholesale[]');

            const products = [];
            for (let i = 0; i < productNames.length; i++) {
                if (productNames[i].value.trim()) {
                    products.push({
                        name: productNames[i].value.trim(),
                        quantity: parseInt(productQuantities[i].value) || 0,
                        costRetail: parseFloat(productCostRetails[i].value) || 0,
                        costWholesale: parseFloat(productCostWholesales[i].value) || 0,
                        priceRetail: parseFloat(productPriceRetails[i].value) || 0,
                        priceWholesale: parseFloat(productPriceWholesales[i].value) || 0
                    });
                }
            }

            if (products.length === 0) {
                showToast('❌ يجب إضافة منتج واحد على الأقل', 'error');
                return;
            }

            suppliers[supplierIndex] = {
                ...suppliers[supplierIndex],
                name, company, phone, address, products,
                updatedAt: new Date().toISOString()
            };

            if (saveSuppliers()) {
                showToast('✅ تم تحديث المورد بنجاح', 'success');
                closeModal('editSupplierModal');
                displaySuppliers();
            } else {
                showToast('❌ حدث خطأ أثناء تحديث المورد', 'error');
            }
        };

        // حذف مورد
        window.deleteSupplier = function(supplierId) {
            const supplier = suppliers.find(s => s.id === supplierId);
            if (!supplier) {
                showToast('❌ لم يتم العثور على المورد', 'error');
                return;
            }

            if (confirm(`هل أنت متأكد من حذف المورد "${supplier.name}"؟\n\nسيتم حذف جميع بيانات المنتجات المرتبطة به.`)) {
                suppliers = suppliers.filter(s => s.id !== supplierId);
                
                if (saveSuppliers()) {
                    showToast('✅ تم حذف المورد بنجاح', 'success');
                    displaySuppliers();
                } else {
                    showToast('❌ حدث خطأ أثناء حذف المورد', 'error');
                }
            }
        };
        

        // طباعة تفاصيل مورد واحد
        window.printSupplierDetails = function(supplierId) {
            const supplier = suppliers.find(s => s.id === supplierId);
            if (!supplier) {
                showToast('❌ لم يتم العثور على المورد', 'error');
                return;
            }

            let totalValue = 0, totalQuantity = 0;
            if (supplier.products && Array.isArray(supplier.products)) {
                supplier.products.forEach(product => {
                    const quantity = parseInt(product.quantity) || 0;
                    const costRetail = parseFloat(product.costRetail) || 0;
                    totalQuantity += quantity;
                    totalValue += quantity * costRetail;
                });
            }
            


            const date = supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString('ar-IQ', {year: 'numeric', month: 'long', day: 'numeric'}) : 'غير محدد';
            const storeSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
            const storeName = storeSettings.storeName || storeSettings.store_name || 'نظام نقاط البيع المتقدم';
            const storePhone = storeSettings.storePhone || storeSettings.store_phone || '';

            const productsHTML = supplier.products && supplier.products.length > 0 ? `
                <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.9rem;">
                    <thead><tr style="background: #f3f4f6;"><th style="border: 1px solid #ddd; padding: 8px;">#</th><th style="border: 1px solid #ddd; padding: 8px;">اسم المنتج</th><th style="border: 1px solid #ddd; padding: 8px;">الكمية</th><th style="border: 1px solid #ddd; padding: 8px;">سعر التكلفة (مفرد)</th><th style="border: 1px solid #ddd; padding: 8px;">سعر التكلفة (جملة)</th><th style="border: 1px solid #ddd; padding: 8px;">سعر البيع (مفرد)</th><th style="border: 1px solid #ddd; padding: 8px;">سعر البيع (جملة)</th><th style="border: 1px solid #ddd; padding: 8px;">القيمة الإجمالية</th></tr></thead>
                    <tbody>${supplier.products.map((product, index) => {
                        const total = (parseInt(product.quantity) || 0) * (parseFloat(product.costRetail) || 0);
                        return `<tr><td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td><td style="border: 1px solid #ddd; padding: 8px;"><strong>${product.name}</strong></td><td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${product.quantity}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${(parseFloat(product.costRetail) || 0).toLocaleString()} د</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${(parseFloat(product.costWholesale) || 0).toLocaleString()} د</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${(parseFloat(product.priceRetail) || 0).toLocaleString()} د</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${(parseFloat(product.priceWholesale) || 0).toLocaleString()} د</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center;"><strong>${total.toLocaleString()} د</strong></td></tr>`;
                    }).join('')}
                    <tr style="background: #f9fafb; font-weight: bold;"><td colspan="2" style="border: 1px solid #ddd; padding: 8px;">المجموع</td><td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${totalQuantity}</td><td colspan="4" style="border: 1px solid #ddd; padding: 8px;"></td><td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #10b981;">${totalValue.toLocaleString()} د</td></tr>
                    </tbody>
                </table>
            ` : '<p style="text-align: center; margin-top: 1rem;">لا توجد منتجات</p>';

            const printHTML = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>تفاصيل المورد - ${supplier.name}</title><style>@page {size: A4; margin: 1cm;}* {margin: 0; padding: 0; box-sizing: border-box;}body {font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; direction: rtl; padding: 20px; color: #1f2937; line-height: 1.6;}.header {text-align: center; margin-bottom: 30px; border-bottom: 3px solid #6366f1; padding-bottom: 20px;}.header h1 {color: #6366f1; margin-bottom: 10px;}.header p {color: #6b7280; font-size: 14px;}.info-section {background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;}.info-grid {display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;}.info-item {padding: 10px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;}.info-label {color: #6b7280; font-size: 14px; margin-bottom: 5px;}.info-value {font-weight: bold; font-size: 16px; color: #1f2937;}.stats-section {display: flex; gap: 15px; margin-bottom: 20px;}.stat-box {flex: 1; padding: 15px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-radius: 8px; text-align: center;}.stat-label {font-size: 14px; opacity: 0.9; margin-bottom: 5px;}.stat-value {font-size: 24px; font-weight: bold;}.products-section {margin-top: 20px;}.section-title {color: #6366f1; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;}table {width: 100%; border-collapse: collapse; margin-top: 15px;}th, td {border: 1px solid #ddd; padding: 10px; text-align: center;}th {background: #f3f4f6; font-weight: bold; color: #374151;}.footer {margin-top: 40px; text-align: center; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 12px;}@media print {body {padding: 0;}.no-print {display: none;}}</style></head><body><div class="header"><h1>📄 تفاصيل المورد</h1><p>${storeName}</p>${storePhone ? '<p>📞 ' + storePhone + '</p>' : ''}<p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-IQ')}</p></div><div class="info-section"><div class="info-grid"><div class="info-item"><div class="info-label">🚚 اسم المورد</div><div class="info-value">${supplier.name}</div></div><div class="info-item"><div class="info-label">🏢 اسم الشركة</div><div class="info-value">${supplier.company || '-'}</div></div><div class="info-item"><div class="info-label">📱 رقم الهاتف</div><div class="info-value">${supplier.phone}</div></div><div class="info-item"><div class="info-label">📍 العنوان</div><div class="info-value">${supplier.address || '-'}</div></div></div></div><div class="stats-section"><div class="stat-box"><div class="stat-label">عدد المنتجات</div><div class="stat-value">${supplier.products ? supplier.products.length : 0}</div></div><div class="stat-box" style="background: linear-gradient(135deg, #10b981, #059669);"><div class="stat-label">إجمالي الكمية</div><div class="stat-value">${totalQuantity}</div></div><div class="stat-box" style="background: linear-gradient(135deg, #f59e0b, #d97706);"><div class="stat-label">القيمة الإجمالية</div><div class="stat-value">${totalValue.toLocaleString()} د</div></div></div><div class="products-section"><h2 class="section-title">📦 قائمة المنتجات</h2>${productsHTML}</div><div class="footer"><p>تم الإنشاء بواسطة: ${storeName}</p><p>نظام نقاط البيع المتقدم - شركة الإبداع الرقمي</p></div><script>window.onload = function() {window.print();};</script></body></html>`;

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(printHTML);
                printWindow.document.close();
            } else {
                showToast('❌ تعذر فتح نافذة الطباعة', 'error');
            }
            
        };

        

        // طباعة جميع الموردين
        window.printAllSuppliers = function() {
            if (!suppliers || suppliers.length === 0) {
                showToast('❌ لا توجد موردين للطباعة', 'error');
                return;
            }

            let totalSuppliers = suppliers.length, totalProducts = 0, totalValue = 0;
            suppliers.forEach(supplier => {
                if (supplier.products && Array.isArray(supplier.products)) {
                    totalProducts += supplier.products.length;
                    supplier.products.forEach(product => {
                        const quantity = parseInt(product.quantity) || 0;
                        const costRetail = parseFloat(product.costRetail) || 0;
                        totalValue += quantity * costRetail;
                    });
                }
            });

            const storeSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
            const storeName = storeSettings.storeName || storeSettings.store_name || 'نظام نقاط البيع المتقدم';
            const storePhone = storeSettings.storePhone || storeSettings.store_phone || '';

            const suppliersHTML = suppliers.map((supplier, index) => {
                let supplierTotalValue = 0, supplierTotalProducts = 0;
                if (supplier.products && Array.isArray(supplier.products)) {
                    supplierTotalProducts = supplier.products.length;
                    supplier.products.forEach(product => {
                        const quantity = parseInt(product.quantity) || 0;
                        const costRetail = parseFloat(product.costRetail) || 0;
                        supplierTotalValue += quantity * costRetail;
                    });
                }
                
                return `<tr><td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${index + 1}</td><td style="border: 1px solid #ddd; padding: 10px;"><strong>${supplier.name}</strong></td><td style="border: 1px solid #ddd; padding: 10px;">${supplier.company || '-'}</td><td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${supplier.phone}</td><td style="border: 1px solid #ddd; padding: 10px;">${supplier.address || '-'}</td><td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${supplierTotalProducts}</td><td style="border: 1px solid #ddd; padding: 10px; text-align: center;"><strong>${supplierTotalValue.toLocaleString()} د</strong></td></tr>`;
            }).join('');

            const printHTML = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>قائمة الموردين</title><style>@page {size: A4 landscape; margin: 1cm;}* {margin: 0; padding: 0; box-sizing: border-box;}body {font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; direction: rtl; padding: 20px; color: #1f2937; line-height: 1.6;}.header {text-align: center; margin-bottom: 30px; border-bottom: 3px solid #6366f1; padding-bottom: 20px;}.header h1 {color: #6366f1; margin-bottom: 10px;}.header p {color: #6b7280; font-size: 14px;}.stats-section {display: flex; gap: 15px; margin-bottom: 30px;}.stat-box {flex: 1; padding: 15px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-radius: 8px; text-align: center;}.stat-label {font-size: 14px; opacity: 0.9; margin-bottom: 5px;}.stat-value {font-size: 24px; font-weight: bold;}table {width: 100%; border-collapse: collapse; margin-top: 15px;}th, td {border: 1px solid #ddd; padding: 10px; text-align: center;}th {background: #f3f4f6; font-weight: bold; color: #374151;}.footer {margin-top: 40px; text-align: center; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 12px;}@media print {body {padding: 0;}}</style></head><body><div class="header"><h1>📋 قائمة الموردين</h1><p>${storeName}</p>${storePhone ? '<p>📞 ' + storePhone + '</p>' : ''}<p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-IQ')}</p></div><div class="stats-section"><div class="stat-box"><div class="stat-label">إجمالي الموردين</div><div class="stat-value">${totalSuppliers}</div></div><div class="stat-box" style="background: linear-gradient(135deg, #10b981, #059669);"><div class="stat-label">إجمالي المنتجات</div><div class="stat-value">${totalProducts}</div></div><div class="stat-box" style="background: linear-gradient(135deg, #f59e0b, #d97706);"><div class="stat-label">القيمة الإجمالية</div><div class="stat-value">${totalValue.toLocaleString()} د</div></div></div><table><thead><tr><th>#</th><th>اسم المورد</th><th>اسم الشركة</th><th>رقم الهاتف</th><th>العنوان</th><th>عدد المنتجات</th><th>القيمة الإجمالية</th></tr></thead><tbody>${suppliersHTML}</tbody></table><div class="footer"><p>تم الإنشاء بواسطة: ${storeName}</p><p>نظام نقاط البيع المتقدم - شركة الإبداع الرقمي</p></div><script>window.onload = function() {window.print();};</script></body></html>`;

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(printHTML);
                printWindow.document.close();
            } else {
                showToast('❌ تعذر فتح نافذة الطباعة', 'error');
            }
        };
        

        // تحميل الموردين عند بدء التطبيق
        loadSuppliers();
        
        // عرض الموردين إذا كانت الصفحة مفتوحة
        const suppliersPage = document.getElementById('suppliers');
        if (suppliersPage && suppliersPage.classList.contains('active')) {
            displaySuppliers();
        }
        

        console.log('✅ نظام إدارة الموردين تم تحميله بنجاح');
    })();
    