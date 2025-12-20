/**
 * 💰 نظام إدارة المصاريف والمشتريات الشامل
 * شركة الإبداع الرقمي - كرار السعبري
 * Digital Creativity Company
 */

// ==================== دوال التبديل بين التبويبات ====================

/**
 * التبديل بين تبويبات صفحة المصاريف
 */
function switchExpenseTab(tabName) {
    // إزالة active من جميع الأزرار والمحتوى
    document.querySelectorAll('.expense-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.expense-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // إضافة active للتبويب المحدد
    event.target.closest('.expense-tab-btn').classList.add('active');
    
    // عرض المحتوى المناسب
    if (tabName === 'general') {
        document.getElementById('generalExpensesTab').classList.add('active');
        loadExpenses();
    } else if (tabName === 'purchases') {
        document.getElementById('purchasesTab').classList.add('active');
        loadPurchases();
    } else if (tabName === 'reports') {
        document.getElementById('reportsTab').classList.add('active');
        updateExpensesReports();
    }
    
    currentExpenseTab = tabName;
}

// ==================== دوال النوافذ المنبثقة ====================

/**
 * فتح نافذة إضافة مصروف
 */
function showAddExpenseModal() {
    const modal = document.getElementById('addExpenseModal');
    modal.style.display = 'flex';
    
    // تعيين التاريخ الحالي
    document.getElementById('expenseDate').valueAsDate = new Date();
    
    // تفريغ الحقول
    document.getElementById('expenseType').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseDescription').value = '';
}

/**
 * إغلاق نافذة إضافة مصروف
 */
function closeAddExpenseModal() {
    document.getElementById('addExpenseModal').style.display = 'none';
}

/**
 * فتح نافذة إضافة فاتورة مشتريات
 */
function showAddPurchaseModal() {
    const modal = document.getElementById('addPurchaseModal');
    modal.style.display = 'flex';
    
    // تعيين التاريخ الحالي
    document.getElementById('purchaseDate').valueAsDate = new Date();
    
    // تفريغ الحقول
    document.getElementById('supplierName').value = '';
    document.getElementById('supplierPhone').value = '';
    document.getElementById('invoiceNumber').value = '';
    
    // إعادة تعيين المنتجات
    purchaseItems = [];
    document.getElementById('purchaseItemsContainer').innerHTML = '';
    addPurchaseItem(); // إضافة صف واحد افتراضي
    updatePurchaseTotal();
}

/**
 * إغلاق نافذة إضافة فاتورة مشتريات
 */
function closeAddPurchaseModal() {
    document.getElementById('addPurchaseModal').style.display = 'none';
}

/**
 * إغلاق نافذة عرض تفاصيل الفاتورة
 */
function closeViewPurchaseModal() {
    document.getElementById('viewPurchaseModal').style.display = 'none';
}

// ==================== دوال إدارة المصاريف ====================

/**
 * حفظ مصروف جديد
 */
async function saveExpense() {
    const type = document.getElementById('expenseType').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const description = document.getElementById('expenseDescription').value;
    const date = document.getElementById('expenseDate').value;
    
    // التحقق من البيانات
    if (!type || !amount || !date) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    if (amount <= 0) {
        showNotification('المبلغ يجب أن يكون أكبر من صفر', 'error');
        return;
    }
    
    // إنشاء كائن المصروف
    const expense = {
        id: Date.now(),
        type: type,
        amount: amount,
        description: description,
        date: date,
        createdAt: new Date().toISOString(),
        createdBy: window.currentUser?.username || 'Admin'
    };
    
    try {
        // حفظ في قاعدة البيانات
        if (window.electronAPI && window.electronAPI.insertData) {
            await window.electronAPI.insertData('expenses', expense);
        } else {
            // استخدام localStorage كبديل
            const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            expenses.push(expense);
            localStorage.setItem('expenses', JSON.stringify(expenses));
        }
        
        // إضافة إلى المصفوفة المحلية
        expensesData.push(expense);
        
        // إعادة تحميل البيانات
        loadExpenses();
        updateExpensesStats();
        
        // إغلاق النافذة
        closeAddExpenseModal();
        
        showNotification('تم إضافة المصروف بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في حفظ المصروف:', error);
        showNotification('حدث خطأ أثناء حفظ المصروف', 'error');
    }
}

/**
 * حذف مصروف
 */
async function deleteExpense(expenseId) {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
        return;
    }
    
    try {
        if (window.electronAPI && window.electronAPI.deleteData) {
            await window.electronAPI.deleteData('expenses', expenseId);
        } else {
            // استخدام localStorage كبديل
            const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            const filtered = expenses.filter(e => e.id !== expenseId);
            localStorage.setItem('expenses', JSON.stringify(filtered));
        }
        
        expensesData = expensesData.filter(e => e.id !== expenseId);
        loadExpenses();
        updateExpensesStats();
        showNotification('تم حذف المصروف بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في حذف المصروف:', error);
        showNotification('حدث خطأ أثناء حذف المصروف', 'error');
    }
}

/**
 * تحميل المصاريف
 */
async function loadExpenses() {
    try {
        let expenses = [];
        if (window.electronAPI && window.electronAPI.getAllData) {
            expenses = await window.electronAPI.getAllData('expenses');
        } else {
            // استخدام localStorage كبديل
            expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        }
        expensesData = expenses || [];
        
        const tbody = document.getElementById('generalExpensesTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (expensesData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 3rem; color: var(--theme-text-tertiary);">لا توجد مصاريف مسجلة</td></tr>';
            return;
        }
        
        // ترتيب حسب التاريخ (الأحدث أولاً)
        expensesData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        expensesData.forEach((expense, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <span class="expense-type-badge expense-type-${expense.type}">
                        ${getExpenseTypeLabel(expense.type)}
                    </span>
                </td>
                <td class="expense-amount-cell expense-amount-negative">${expense.amount.toLocaleString()} دينار</td>
                <td>${new Date(expense.date).toLocaleDateString('ar-IQ')}</td>
                <td>${expense.description || '-'}</td>
                <td>${expense.createdBy || '-'}</td>
                <td>
                    <button class="action-btn view-btn" onclick="viewExpenseDetails(${expense.id})" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editExpense(${expense.id})" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteExpense(${expense.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('خطأ في تحميل المصاريف:', error);
        showNotification('حدث خطأ أثناء تحميل المصاريف', 'error');
    }
}

/**
 * الحصول على تسمية نوع المصروف
 */
function getExpenseTypeLabel(type) {
    const labels = {
        'rent': '🏠 إيجار',
        'utilities': '⚡ كهرباء/ماء',
        'salary': '💰 رواتب',
        'maintenance': '🔧 صيانة',
        'transportation': '🚗 نقل ومواصلات',
        'supplies': '📦 لوازم مكتبية',
        'marketing': '📢 تسويق وإعلان',
        'insurance': '🛡️ تأمينات',
        'taxes': '📊 ضرائب ورسوم',
        'other': '📝 أخرى'
    };
    return labels[type] || type;
}

// ==================== دوال إدارة فواتير المشتريات ====================

/**
 * إضافة صف منتج جديد في فاتورة المشتريات
 */
function addPurchaseItem() {
    const container = document.getElementById('purchaseItemsContainer');
    const itemIndex = purchaseItems.length;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'purchase-item';
    itemDiv.style.cssText = 'display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; padding: 1rem; background: var(--theme-bg-card); border-radius: 8px;';
    itemDiv.innerHTML = `
        <div style="flex: 2;">
            <label style="font-size: 0.85rem; color: var(--theme-text-secondary); margin-bottom: 0.3rem; display: block;">اسم المنتج</label>
            <input type="text" class="form-control" id="itemName${itemIndex}" placeholder="اسم المنتج" required>
        </div>
        <div style="flex: 1;">
            <label style="font-size: 0.85rem; color: var(--theme-text-secondary); margin-bottom: 0.3rem; display: block;">الكمية</label>
            <input type="number" class="form-control" id="itemQuantity${itemIndex}" placeholder="الكمية" min="1" value="1" onchange="updatePurchaseTotal()" required>
        </div>
        <div style="flex: 1;">
            <label style="font-size: 0.85rem; color: var(--theme-text-secondary); margin-bottom: 0.3rem; display: block;">السعر</label>
            <input type="number" class="form-control" id="itemPrice${itemIndex}" placeholder="السعر" min="0" onchange="updatePurchaseTotal()" required>
        </div>
        <div style="display: flex; align-items: end; padding-bottom: 0.5rem;">
            <button type="button" class="action-btn delete-btn" onclick="removePurchaseItem(${itemIndex})" title="حذف">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    container.appendChild(itemDiv);
    purchaseItems.push({ index: itemIndex });
}

/**
 * إزالة صف منتج من فاتورة المشتريات
 */
function removePurchaseItem(itemIndex) {
    const container = document.getElementById('purchaseItemsContainer');
    const items = container.querySelectorAll('.purchase-item');
    
    if (items.length <= 1) {
        showNotification('يجب أن تحتوي الفاتورة على منتج واحد على الأقل', 'warning');
        return;
    }
    
    items[itemIndex].remove();
    purchaseItems = purchaseItems.filter(item => item.index !== itemIndex);
    updatePurchaseTotal();
}

/**
 * تحديث المجموع الإجمالي لفاتورة المشتريات
 */
function updatePurchaseTotal() {
    let total = 0;
    const container = document.getElementById('purchaseItemsContainer');
    const items = container.querySelectorAll('.purchase-item');
    
    items.forEach((item, index) => {
        const quantity = parseFloat(document.getElementById(`itemQuantity${index}`)?.value) || 0;
        const price = parseFloat(document.getElementById(`itemPrice${index}`)?.value) || 0;
        total += quantity * price;
    });
    
    document.getElementById('purchaseTotalAmount').textContent = total.toLocaleString() + ' دينار';
}

/**
 * حفظ فاتورة مشتريات
 */
async function savePurchase() {
    const supplierName = document.getElementById('supplierName').value;
    const supplierPhone = document.getElementById('supplierPhone').value;
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const date = document.getElementById('purchaseDate').value;
    
    // التحقق من البيانات
    if (!supplierName || !date) {
        showNotification('يرجى ملء المعلومات الأساسية', 'error');
        return;
    }
    
    // جمع بيانات المنتجات
    const items = [];
    const container = document.getElementById('purchaseItemsContainer');
    const itemElements = container.querySelectorAll('.purchase-item');
    
    let hasError = false;
    itemElements.forEach((item, index) => {
        const name = document.getElementById(`itemName${index}`)?.value;
        const quantity = parseFloat(document.getElementById(`itemQuantity${index}`)?.value);
        const price = parseFloat(document.getElementById(`itemPrice${index}`)?.value);
        
        if (!name || !quantity || !price) {
            hasError = true;
            return;
        }
        
        items.push({
            name: name,
            quantity: quantity,
            price: price,
            total: quantity * price
        });
    });
    
    if (hasError || items.length === 0) {
        showNotification('يرجى ملء جميع بيانات المنتجات', 'error');
        return;
    }
    
    // حساب المجموع الإجمالي
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    
    // إنشاء كائن الفاتورة
    const purchase = {
        id: Date.now(),
        invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
        supplierName: supplierName,
        supplierPhone: supplierPhone,
        date: date,
        items: items,
        totalAmount: totalAmount,
        itemsCount: items.length,
        createdAt: new Date().toISOString(),
        createdBy: window.currentUser?.username || 'Admin'
    };
    
    try {
        // حفظ في قاعدة البيانات
        if (window.electronAPI && window.electronAPI.insertData) {
            await window.electronAPI.insertData('purchases', purchase);
        } else {
            // استخدام localStorage كبديل
            const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
            purchases.push(purchase);
            localStorage.setItem('purchases', JSON.stringify(purchases));
        }
        
        // إضافة إلى المصفوفة المحلية
        purchasesData.push(purchase);
        
        // ⭐ إضافة المنتجات إلى صفحة المنتجات تلقائياً ⭐
        await addPurchaseItemsToProducts(items, supplierName, date);
        
        // إعادة تحميل البيانات
        loadPurchases();
        updateExpensesStats();
        
        // إغلاق النافذة
        closeAddPurchaseModal();
        
        showNotification('تم إضافة فاتورة المشتريات بنجاح ✅ وتم إضافة المنتجات إلى المخزون', 'success');
    } catch (error) {
        console.error('خطأ في حفظ فاتورة المشتريات:', error);
        showNotification('حدث خطأ أثناء حفظ الفاتورة', 'error');
    }
}

/**
 * إضافة منتجات فاتورة المشتريات إلى صفحة المنتجات
 */
async function addPurchaseItemsToProducts(items, supplierName, purchaseDate) {
    console.log('🛍️ إضافة منتجات إلى المخزون:', items);
    
    for (const item of items) {
        try {
            // التحقق إذا كان المنتج موجود بالفعل
            let existingProducts = [];
            if (window.electronAPI && window.electronAPI.getAllData) {
                existingProducts = await window.electronAPI.getAllData('products') || [];
            } else {
                existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
            }
            
            // البحث عن المنتج بالاسم
            const existingProduct = existingProducts.find(p => 
                p.name && p.name.trim().toLowerCase() === item.name.trim().toLowerCase()
            );
            
            if (existingProduct) {
                // تحديث الكمية والسعر للمنتج الموجود
                existingProduct.stock = (parseFloat(existingProduct.stock) || 0) + item.quantity;
                existingProduct.costPrice = item.price;
                existingProduct.lastPurchaseDate = purchaseDate;
                existingProduct.lastSupplier = supplierName;
                existingProduct.updatedAt = new Date().toISOString();
                
                // حفظ التحديث
                if (window.electronAPI && window.electronAPI.updateData) {
                    await window.electronAPI.updateData('products', existingProduct.id, existingProduct);
                } else {
                    const index = existingProducts.findIndex(p => p.id === existingProduct.id);
                    if (index !== -1) {
                        existingProducts[index] = existingProduct;
                        localStorage.setItem('products', JSON.stringify(existingProducts));
                    }
                }
                
                console.log('✅ تم تحديث المنتج الموجود:', existingProduct.name);
                
            } else {
                // إنشاء منتج جديد
                const newProduct = {
                    id: Date.now() + Math.random(),
                    barcode: `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: item.name,
                    category: 'عام', // تصنيف افتراضي
                    costPrice: item.price,
                    salePrice: Math.ceil(item.price * 1.2), // هامش ربح 20%
                    stock: item.quantity,
                    minStock: 5,
                    unit: 'قطعة',
                    supplier: supplierName,
                    lastSupplier: supplierName,
                    lastPurchaseDate: purchaseDate,
                    description: `تم إضافته تلقائياً من فاتورة المشتريات - ${supplierName}`,
                    image: null,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    createdBy: window.currentUser?.username || 'Admin',
                    autoAdded: true // علامة للإشارة أنه تم إضافته تلقائياً
                };
                
                // حفظ المنتج الجديد
                if (window.electronAPI && window.electronAPI.insertData) {
                    await window.electronAPI.insertData('products', newProduct);
                } else {
                    existingProducts.push(newProduct);
                    localStorage.setItem('products', JSON.stringify(existingProducts));
                }
                
                console.log('✅ تم إضافة منتج جديد:', newProduct.name);
            }
            
        } catch (error) {
            console.error('❌ خطأ في إضافة المنتج:', item.name, error);
        }
    }
    
    // تحديث صفحة المنتجات إذا كانت مفتوحة
    if (typeof loadProducts === 'function') {
        loadProducts();
    }
    
    console.log('🎉 تمت إضافة جميع المنتجات بنجاح');
}

/**
 * حذف فاتورة مشتريات
 */
async function deletePurchase(purchaseId) {
    if (!confirm('هل أنت متأكد من حذف فاتورة المشتريات؟')) {
        return;
    }
    
    try {
        if (window.electronAPI && window.electronAPI.deleteData) {
            await window.electronAPI.deleteData('purchases', purchaseId);
        } else {
            // استخدام localStorage كبديل
            const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
            const filtered = purchases.filter(p => p.id !== purchaseId);
            localStorage.setItem('purchases', JSON.stringify(filtered));
        }
        
        purchasesData = purchasesData.filter(p => p.id !== purchaseId);
        loadPurchases();
        updateExpensesStats();
        showNotification('تم حذف فاتورة المشتريات بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في حذف فاتورة المشتريات:', error);
        showNotification('حدث خطأ أثناء حذف الفاتورة', 'error');
    }
}

/**
 * عرض تفاصيل فاتورة مشتريات
 */
function viewPurchaseDetails(purchaseId) {
    const purchase = purchasesData.find(p => p.id === purchaseId);
    if (!purchase) return;
    
    const modal = document.getElementById('viewPurchaseModal');
    const content = document.getElementById('purchaseDetailsContent');
    
    let itemsHtml = '';
    purchase.items.forEach((item, index) => {
        itemsHtml += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toLocaleString()} دينار</td>
                <td class="expense-amount-cell expense-amount-negative">${item.total.toLocaleString()} دينار</td>
            </tr>
        `;
    });
    
    content.innerHTML = `
        <div style="background: var(--theme-bg-secondary); padding: 1.5rem; border-radius: var(--border-radius); margin-bottom: 1.5rem;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;">
                <div>
                    <div style="color: var(--theme-text-tertiary); font-size: 0.9rem; margin-bottom: 0.3rem;">رقم الفاتورة</div>
                    <div style="font-size: 1.1rem; font-weight: 600;">${purchase.invoiceNumber}</div>
                </div>
                <div>
                    <div style="color: var(--theme-text-tertiary); font-size: 0.9rem; margin-bottom: 0.3rem;">التاريخ</div>
                    <div style="font-size: 1.1rem; font-weight: 600;">${new Date(purchase.date).toLocaleDateString('ar-IQ')}</div>
                </div>
                <div>
                    <div style="color: var(--theme-text-tertiary); font-size: 0.9rem; margin-bottom: 0.3rem;">اسم المورد</div>
                    <div style="font-size: 1.1rem; font-weight: 600;">${purchase.supplierName}</div>
                </div>
                <div>
                    <div style="color: var(--theme-text-tertiary); font-size: 0.9rem; margin-bottom: 0.3rem;">رقم الهاتف</div>
                    <div style="font-size: 1.1rem; font-weight: 600;">${purchase.supplierPhone || '-'}</div>
                </div>
            </div>
        </div>
        
        <h4 style="margin-bottom: 1rem; color: var(--primary-color);"><i class="fas fa-boxes"></i> المنتجات</h4>
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>اسم المنتج</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
        </div>
        
        <div style="background: var(--theme-bg-secondary); padding: 1.5rem; border-radius: var(--border-radius); margin-top: 1.5rem; text-align: center;">
            <div style="font-size: 1.1rem; color: var(--theme-text-secondary); margin-bottom: 0.5rem;">المجموع الإجمالي</div>
            <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">${purchase.totalAmount.toLocaleString()} دينار</div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

/**
 * تحميل فواتير المشتريات
 */
async function loadPurchases() {
    try {
        let purchases = [];
        if (window.electronAPI && window.electronAPI.getAllData) {
            purchases = await window.electronAPI.getAllData('purchases');
        } else {
            // استخدام localStorage كبديل
            purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
        }
        purchasesData = purchases || [];
        
        const tbody = document.getElementById('purchasesTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (purchasesData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 3rem; color: var(--theme-text-tertiary);">لا توجد فواتير مشتريات مسجلة</td></tr>';
            return;
        }
        
        // ترتيب حسب التاريخ (الأحدث أولاً)
        purchasesData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        purchasesData.forEach(purchase => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${purchase.invoiceNumber}</td>
                <td>${purchase.supplierName}</td>
                <td>${purchase.supplierPhone || '-'}</td>
                <td class="expense-amount-cell expense-amount-negative">${purchase.totalAmount.toLocaleString()} دينار</td>
                <td>${purchase.itemsCount}</td>
                <td>${new Date(purchase.date).toLocaleDateString('ar-IQ')}</td>
                <td>
                    <button class="action-btn view-btn" onclick="viewPurchaseDetails(${purchase.id})" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deletePurchase(${purchase.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('خطأ في تحميل فواتير المشتريات:', error);
        showNotification('حدث خطأ أثناء تحميل الفواتير', 'error');
    }
}

// ==================== دوال الإحصائيات ====================

/**
 * تحديث إحصائيات المصاريف
 */
async function updateExpensesStats() {
    try {
        // جلب البيانات
        let expenses = [];
        let purchases = [];
        
        if (window.electronAPI && window.electronAPI.getAllData) {
            expenses = await window.electronAPI.getAllData('expenses') || [];
            purchases = await window.electronAPI.getAllData('purchases') || [];
        } else {
            // استخدام localStorage كبديل
            expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
        }
        
        // حساب المجاميع
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalPurchases = purchases.reduce((sum, pur) => sum + pur.totalAmount, 0);
        
        // حساب مصاريف هذا الشهر
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyExpenses = expenses
            .filter(exp => {
                const expDate = new Date(exp.date);
                return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
            })
            .reduce((sum, exp) => sum + exp.amount, 0);
        
        // تحديث العناصر
        const totalExpensesEl = document.getElementById('totalExpensesAmount');
        const totalPurchasesEl = document.getElementById('totalPurchasesAmount');
        const monthlyExpensesEl = document.getElementById('monthlyExpensesAmount');
        const totalCountEl = document.getElementById('totalExpensesCount');
        
        if (totalExpensesEl) totalExpensesEl.textContent = totalExpenses.toLocaleString() + ' دينار';
        if (totalPurchasesEl) totalPurchasesEl.textContent = totalPurchases.toLocaleString() + ' دينار';
        if (monthlyExpensesEl) monthlyExpensesEl.textContent = monthlyExpenses.toLocaleString() + ' دينار';
        if (totalCountEl) totalCountEl.textContent = (expenses.length + purchases.length).toLocaleString();
    } catch (error) {
        console.error('خطأ في تحديث إحصائيات المصاريف:', error);
    }
}

/**
 * تحديث تقارير المصاريف
 */
async function updateExpensesReports() {
    const period = document.getElementById('reportsPeriodFilter').value;
    let dateFrom, dateTo;
    
    // تحديد الفترة الزمنية
    const now = new Date();
    dateTo = now;
    
    switch (period) {
        case 'today':
            dateFrom = new Date(now.setHours(0, 0, 0, 0));
            break;
        case 'week':
            dateFrom = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'month':
            dateFrom = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case 'year':
            dateFrom = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        case 'custom':
            const customFrom = document.getElementById('reportsDateFrom').value;
            const customTo = document.getElementById('reportsDateTo').value;
            if (!customFrom || !customTo) {
                showNotification('يرجى تحديد الفترة الزمنية', 'warning');
                return;
            }
            dateFrom = new Date(customFrom);
            dateTo = new Date(customTo);
            break;
    }
    
    // عرض/إخفاء حقول التاريخ المخصص
    const customDateRangeEl = document.getElementById('customDateRangeGroup');
    if (customDateRangeEl) {
        customDateRangeEl.style.display = period === 'custom' ? 'flex' : 'none';
    }
    
    try {
        // جلب البيانات المفلترة
        let expenses = [];
        let purchases = [];
        
        if (window.electronAPI && window.electronAPI.getAllData) {
            expenses = await window.electronAPI.getAllData('expenses') || [];
            purchases = await window.electronAPI.getAllData('purchases') || [];
        } else {
            // استخدام localStorage كبديل
            expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
        }
        
        const filteredExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate >= dateFrom && expDate <= dateTo;
        });
        
        const filteredPurchases = purchases.filter(pur => {
            const purDate = new Date(pur.date);
            return purDate >= dateFrom && purDate <= dateTo;
        });
        
        // حساب المجاميع
        const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalPurchases = filteredPurchases.reduce((sum, pur) => sum + pur.totalAmount, 0);
        
        // حساب مصاريف محددة
        const rentExpenses = filteredExpenses
            .filter(exp => exp.type === 'rent')
            .reduce((sum, exp) => sum + exp.amount, 0);
        
        const utilitiesExpenses = filteredExpenses
            .filter(exp => exp.type === 'utilities')
            .reduce((sum, exp) => sum + exp.amount, 0);
        
        // تحديث الإحصائيات
        const reportTotalExpensesEl = document.getElementById('reportTotalExpenses');
        const reportTotalPurchasesEl = document.getElementById('reportTotalPurchases');
        const reportRentExpensesEl = document.getElementById('reportRentExpenses');
        const reportUtilitiesExpensesEl = document.getElementById('reportUtilitiesExpenses');
        
        if (reportTotalExpensesEl) reportTotalExpensesEl.textContent = totalExpenses.toLocaleString() + ' دينار';
        if (reportTotalPurchasesEl) reportTotalPurchasesEl.textContent = totalPurchases.toLocaleString() + ' دينار';
        if (reportRentExpensesEl) reportRentExpensesEl.textContent = rentExpenses.toLocaleString() + ' دينار';
        if (reportUtilitiesExpensesEl) reportUtilitiesExpensesEl.textContent = utilitiesExpenses.toLocaleString() + ' دينار';
        
        // تحديث جدول المصاريف حسب النوع
        updateExpensesByTypeTable(filteredExpenses);
        
        // تحديث جدول المنتجات المشتراة
        updatePurchasedProductsTable(filteredPurchases);
    } catch (error) {
        console.error('خطأ في تحديث تقارير المصاريف:', error);
        showNotification('حدث خطأ أثناء تحديث التقارير', 'error');
    }
}

/**
 * تحديث جدول المصاريف حسب النوع
 */
function updateExpensesByTypeTable(expenses) {
    const tbody = document.getElementById('expensesByTypeTableBody');
    tbody.innerHTML = '';
    
    // تجميع المصاريف حسب النوع
    const expensesByType = {};
    expenses.forEach(exp => {
        if (!expensesByType[exp.type]) {
            expensesByType[exp.type] = {
                count: 0,
                total: 0
            };
        }
        expensesByType[exp.type].count++;
        expensesByType[exp.type].total += exp.amount;
    });
    
    // حساب المجموع الكلي
    const grandTotal = Object.values(expensesByType).reduce((sum, type) => sum + type.total, 0);
    
    // عرض البيانات
    Object.keys(expensesByType).forEach(type => {
        const data = expensesByType[type];
        const percentage = grandTotal > 0 ? ((data.total / grandTotal) * 100).toFixed(1) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="expense-type-badge expense-type-${type}">
                    ${getExpenseTypeLabel(type)}
                </span>
            </td>
            <td>${data.count}</td>
            <td class="expense-amount-cell expense-amount-negative">${data.total.toLocaleString()} دينار</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="flex: 1; height: 8px; background: var(--theme-bg-secondary); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: var(--primary-gradient);"></div>
                    </div>
                    <span style="font-weight: 600;">${percentage}%</span>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    if (Object.keys(expensesByType).length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--theme-text-tertiary);">لا توجد مصاريف في الفترة المحددة</td></tr>';
    }
}

/**
 * تحديث جدول المنتجات المشتراة
 */
function updatePurchasedProductsTable(purchases) {
    const tbody = document.getElementById('purchasedProductsTableBody');
    tbody.innerHTML = '';
    
    // جمع جميع المنتجات من جميع الفواتير
    const allProducts = [];
    purchases.forEach(purchase => {
        purchase.items.forEach(item => {
            allProducts.push({
                name: item.name,
                supplier: purchase.supplierName,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
                date: purchase.date
            });
        });
    });
    
    // ترتيب حسب التاريخ (الأحدث أولاً)
    allProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (allProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--theme-text-tertiary);">لا توجد منتجات مشتراة في الفترة المحددة</td></tr>';
        return;
    }
    
    allProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.supplier}</td>
            <td>${product.quantity}</td>
            <td>${product.price.toLocaleString()} دينار</td>
            <td class="expense-amount-cell expense-amount-negative">${product.total.toLocaleString()} دينار</td>
            <td>${new Date(product.date).toLocaleDateString('ar-IQ')}</td>
        `;
        tbody.appendChild(row);
    });
}

// ==================== دوال البحث والتصفية ====================

/**
 * تصفية المصاريف
 */
function filterExpenses() {
    const searchTerm = document.getElementById('expensesSearchInput').value.toLowerCase();
    const tbody = document.getElementById('generalExpensesTableBody');
    const rows = tbody.getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// ==================== دالة التهيئة ====================

/**
 * تهيئة صفحة المصاريف عند التحميل
 */
async function initExpensesPage() {
    try {
        await loadExpenses();
        await loadPurchases();
        await updateExpensesStats();
        
        // تعيين التاريخ الحالي في فلتر التقارير
        const today = new Date().toISOString().split('T')[0];
        if (document.getElementById('reportsDateFrom')) {
            document.getElementById('reportsDateFrom').value = today;
        }
        if (document.getElementById('reportsDateTo')) {
            document.getElementById('reportsDateTo').value = today;
        }
        
        console.log('✅ تم تهيئة صفحة المصاريف بنجاح');
    } catch (error) {
        console.error('❌ خطأ في تهيئة صفحة المصاريف:', error);
    }
}

// تشغيل التهيئة عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExpensesPage);
} else {
    initExpensesPage();
}

// ==================== دوال إدارة الدين اليدوي ====================

/**
 * فتح نافذة إضافة دين يدوياً
 */
function showAddManualDebtModal() {
    const modal = document.getElementById('addManualDebtModal');
    if (!modal) {
        console.error('نافذة إضافة الدين غير موجودة');
        return;
    }
    modal.style.display = 'flex';
    
    // تعيين التاريخ الحالي
    document.getElementById('manualDebtDate').valueAsDate = new Date();
    
    // تفريغ الحقول
    document.getElementById('manualDebtCustomerName').value = '';
    document.getElementById('manualDebtCustomerPhone').value = '';
    document.getElementById('manualDebtCustomerAddress').value = '';
    document.getElementById('manualDebtTotalAmount').value = '';
    document.getElementById('manualDebtDownPayment').value = '0';
    document.getElementById('manualDebtMonths').value = '';
    document.getElementById('manualDebtAdditionalAmount').value = '0';
    document.getElementById('manualDebtNotes').value = '';
    
    // إعادة تعيين الملخص
    document.getElementById('manualDebtRemainingAmount').textContent = '0 دينار';
    document.getElementById('manualDebtMonthlyAmount').textContent = '0 دينار';
    document.getElementById('manualDebtFinalTotal').textContent = '0 دينار';
}

/**
 * إغلاق نافذة إضافة دين يدوياً
 */
function closeAddManualDebtModal() {
    const modal = document.getElementById('addManualDebtModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * حساب الأقساط للدين اليدوي
 */
function calculateManualDebtInstallments() {
    const totalAmount = parseFloat(document.getElementById('manualDebtTotalAmount').value) || 0;
    const downPayment = parseFloat(document.getElementById('manualDebtDownPayment').value) || 0;
    const months = parseInt(document.getElementById('manualDebtMonths').value) || 0;
    const additionalAmount = parseFloat(document.getElementById('manualDebtAdditionalAmount').value) || 0;
    
    // حساب المبلغ المتبقي
    const remainingAmount = totalAmount - downPayment + additionalAmount;
    
    // حساب القسط الشهري
    const monthlyAmount = months > 0 ? Math.ceil(remainingAmount / months) : 0;
    
    // حساب المجموع النهائي
    const finalTotal = totalAmount + additionalAmount;
    
    // تحديث العرض
    document.getElementById('manualDebtRemainingAmount').textContent = remainingAmount.toLocaleString() + ' دينار';
    document.getElementById('manualDebtMonthlyAmount').textContent = monthlyAmount.toLocaleString() + ' دينار';
    document.getElementById('manualDebtFinalTotal').textContent = finalTotal.toLocaleString() + ' دينار';
}

/**
 * حفظ دين يدوياً
 */
async function saveManualDebt() {
    // جمع البيانات من النموذج
    const customerName = document.getElementById('manualDebtCustomerName').value;
    const customerPhone = document.getElementById('manualDebtCustomerPhone').value;
    const customerAddress = document.getElementById('manualDebtCustomerAddress').value;
    const date = document.getElementById('manualDebtDate').value;
    const totalAmount = parseFloat(document.getElementById('manualDebtTotalAmount').value);
    const downPayment = parseFloat(document.getElementById('manualDebtDownPayment').value) || 0;
    const months = parseInt(document.getElementById('manualDebtMonths').value);
    const additionalAmount = parseFloat(document.getElementById('manualDebtAdditionalAmount').value) || 0;
    const notes = document.getElementById('manualDebtNotes').value;
    
    // التحقق من البيانات
    if (!customerName || !customerPhone || !date || !totalAmount || !months) {
        if (typeof showNotification === 'function') {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        } else {
            alert('يرجى ملء جميع الحقول المطلوبة');
        }
        return;
    }
    
    if (totalAmount <= 0 || months <= 0) {
        if (typeof showNotification === 'function') {
            showNotification('المبلغ وعدد الأشهر يجب أن يكون أكبر من صفر', 'error');
        } else {
            alert('المبلغ وعدد الأشهر يجب أن يكون أكبر من صفر');
        }
        return;
    }
    
    if (downPayment >= totalAmount) {
        if (typeof showNotification === 'function') {
            showNotification('الدفعة المقدمة لا يمكن أن تكون أكبر من أو تساوي المبلغ الإجمالي', 'error');
        } else {
            alert('الدفعة المقدمة لا يمكن أن تكون أكبر من أو تساوي المبلغ الإجمالي');
        }
        return;
    }
    
    // حساب القيم
    const remainingAmount = totalAmount - downPayment + additionalAmount;
    const monthlyAmount = Math.ceil(remainingAmount / months);
    const finalTotal = totalAmount + additionalAmount;
    
    // إنشاء جدول الأقساط
    const installments = [];
    const startDate = new Date(date);
    
    for (let i = 1; i <= months; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        installments.push({
            month: i,
            amount: monthlyAmount,
            due_date: dueDate.toISOString().split('T')[0],
            status: 'unpaid',
            paid_amount: 0,
            paid_date: null
        });
    }
    
    // إنشاء كائن الدين
    const debtId = Date.now();
    const debt = {
        id: debtId,
        __backendId: debtId,
        invoice_id: 'MANUAL-' + debtId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        date: date,
        due_date: installments[0].due_date,
        total_amount: finalTotal,
        down_payment: downPayment,
        remaining_amount: remainingAmount,
        paid_amount: downPayment,
        monthly_amount: monthlyAmount,
        installment_months: months,
        additional_amount: additionalAmount,
        notes: notes,
        installments: installments,
        items: [],  // فارغ لأنه دين يدوي
        status: 'active',
        type: 'debt',
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        created_by: window.currentUser?.username || 'Admin',
        createdBy: window.currentUser?.username || 'Admin',
        is_manual: true  // علامة للتمييز عن ديون البيع
    };
    
    console.log('💳 حفظ دين يدوي:', debt);
    
    try {
        // حفظ في قاعدة البيانات
        if (window.electronAPI && window.electronAPI.insertData) {
            await window.electronAPI.insertData('debts', debt);
            console.log('✅ تم الحفظ في قاعدة البيانات');
        } else {
            // استخدام localStorage كبديل
            const debts = JSON.parse(localStorage.getItem('debts') || '[]');
            debts.push(debt);
            localStorage.setItem('debts', JSON.stringify(debts));
            console.log('✅ تم الحفظ في localStorage');
        }
        
        // إضافة إلى مصفوفة debtsData في الذاكرة إذا كانت موجودة
        if (typeof debtsData !== 'undefined' && Array.isArray(debtsData)) {
            debtsData.push(debt);
            console.log('✅ تم الإضافة إلى debtsData في الذاكرة');
        }
        
        // تحديث جدول الديون فوراً
        if (typeof renderDebtsTable === 'function') {
            renderDebtsTable();
            console.log('✅ تم تحديث جدول الديون');
        }
        
        // تحديث الإحصائيات
        if (typeof updateDebtsStats === 'function') {
            updateDebtsStats();
            console.log('✅ تم تحديث الإحصائيات');
        }
        
        // إعادة تحميل البيانات من قاعدة البيانات للتأكد
        if (window.electronAPI && window.electronAPI.getAllData) {
            try {
                const allDebts = await window.electronAPI.getAllData('debts');
                if (allDebts && Array.isArray(allDebts)) {
                    if (typeof debtsData !== 'undefined') {
                        debtsData = allDebts;
                    }
                    if (typeof renderDebtsTable === 'function') {
                        renderDebtsTable();
                    }
                    console.log('✅ تم إعادة تحميل جميع الديون من قاعدة البيانات');
                }
            } catch (e) {
                console.log('ℹ️ تم تحديث الجدول من الذاكرة');
            }
        }
        
        // إغلاق النافذة
        closeAddManualDebtModal();
        
        if (typeof showNotification === 'function') {
            showNotification('تم إضافة الدين بنجاح ✅', 'success');
        } else {
            alert('تم إضافة الدين بنجاح ✅');
        }
        
        console.log('🎉 تمت عملية الحفظ بنجاح');
        
    } catch (error) {
        console.error('❌ خطأ في حفظ الدين:', error);
        if (typeof showNotification === 'function') {
            showNotification('حدث خطأ أثناء حفظ الدين: ' + error.message, 'error');
        } else {
            alert('حدث خطأ أثناء حفظ الدين: ' + error.message);
        }
    }
}

// ==================== دوال عرض وتعديل المصاريف ====================

/**
 * عرض تفاصيل مصروف
 */
function viewExpenseDetails(expenseId) {
    const expense = expensesData.find(e => e.id === expenseId);
    if (!expense) {
        showNotification('لم يتم العثور على المصروف', 'error');
        return;
    }
    
    // إنشاء محتوى التفاصيل
    const details = `
        <div style="padding: 1rem;">
            <div style="display: grid; gap: 1rem;">
                <div style="border-bottom: 2px solid var(--border-color); padding-bottom: 1rem;">
                    <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">
                        <i class="fas fa-info-circle"></i> معلومات المصروف
                    </h4>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div>
                        <div style="color: var(--theme-text-tertiary); font-size: 0.9rem;">نوع المصروف</div>
                        <div style="margin-top: 0.5rem;">
                            <span class="expense-type-badge expense-type-${expense.type}">
                                ${getExpenseTypeLabel(expense.type)}
                            </span>
                        </div>
                    </div>
                    
                    <div>
                        <div style="color: var(--theme-text-tertiary); font-size: 0.9rem;">المبلغ</div>
                        <div style="margin-top: 0.5rem; font-size: 1.5rem; font-weight: bold; color: var(--danger-color);">
                            ${expense.amount.toLocaleString()} دينار
                        </div>
                    </div>
                    
                    <div>
                        <div style="color: var(--theme-text-tertiary); font-size: 0.9rem;">التاريخ</div>
                        <div style="margin-top: 0.5rem; font-weight: 500;">
                            ${new Date(expense.date).toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                    
                    <div>
                        <div style="color: var(--theme-text-tertiary); font-size: 0.9rem;">المستخدم</div>
                        <div style="margin-top: 0.5rem; font-weight: 500;">
                            <i class="fas fa-user"></i> ${expense.createdBy || 'غير محدد'}
                        </div>
                    </div>
                </div>
                
                ${expense.description ? `
                <div style="margin-top: 1rem; padding: 1rem; background: var(--theme-bg-secondary); border-radius: 8px;">
                    <div style="color: var(--theme-text-tertiary); font-size: 0.9rem; margin-bottom: 0.5rem;">الوصف</div>
                    <div style="white-space: pre-wrap;">${expense.description}</div>
                </div>
                ` : ''}
                
                <div style="margin-top: 1rem; padding: 0.5rem; background: rgba(99, 102, 241, 0.1); border-radius: 8px; font-size: 0.85rem; color: var(--theme-text-tertiary);">
                    <i class="fas fa-clock"></i> تم الإنشاء: ${new Date(expense.createdAt).toLocaleString('ar-IQ')}
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="closeExpenseDetailsModal()">إغلاق</button>
                <button class="btn btn-primary" onclick="closeExpenseDetailsModal(); editExpense(${expense.id});">
                    <i class="fas fa-edit"></i> تعديل
                </button>
            </div>
        </div>
    `;
    
    // إنشاء نافذة منبثقة أو استخدام موجودة
    let modal = document.getElementById('viewExpenseDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'viewExpenseDetailsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="fas fa-receipt"></i> تفاصيل المصروف</h3>
                    <button class="close-btn" onclick="closeExpenseDetailsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" id="expenseDetailsContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('expenseDetailsContent').innerHTML = details;
    modal.style.display = 'flex';
}

/**
 * إغلاق نافذة تفاصيل المصروف
 */
function closeExpenseDetailsModal() {
    const modal = document.getElementById('viewExpenseDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * تعديل مصروف
 */
function editExpense(expenseId) {
    const expense = expensesData.find(e => e.id === expenseId);
    if (!expense) {
        showNotification('لم يتم العثور على المصروف', 'error');
        return;
    }
    
    // ملء النموذج بالبيانات الحالية
    document.getElementById('expenseType').value = expense.type;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseDescription').value = expense.description || '';
    document.getElementById('expenseDate').value = expense.date;
    
    // تغيير زر الحفظ إلى تحديث
    const modal = document.getElementById('addExpenseModal');
    const modalTitle = modal.querySelector('.modal-title');
    const saveBtn = modal.querySelector('.btn-primary');
    
    modalTitle.innerHTML = '<i class="fas fa-edit"></i> تعديل مصروف';
    saveBtn.innerHTML = '<i class="fas fa-save"></i> تحديث المصروف';
    saveBtn.onclick = function() { updateExpense(expenseId); };
    
    // فتح النافذة
    modal.style.display = 'flex';
}

/**
 * تحديث مصروف
 */
async function updateExpense(expenseId) {
    const type = document.getElementById('expenseType').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const description = document.getElementById('expenseDescription').value;
    const date = document.getElementById('expenseDate').value;
    
    // التحقق من البيانات
    if (!type || !amount || !date) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    if (amount <= 0) {
        showNotification('المبلغ يجب أن يكون أكبر من صفر', 'error');
        return;
    }
    
    // العثور على المصروف
    const expenseIndex = expensesData.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) {
        showNotification('لم يتم العثور على المصروف', 'error');
        return;
    }
    
    // تحديث البيانات
    const updatedExpense = {
        ...expensesData[expenseIndex],
        type: type,
        amount: amount,
        description: description,
        date: date,
        updatedAt: new Date().toISOString(),
        updatedBy: window.currentUser?.username || 'Admin'
    };
    
    try {
        // تحديث في قاعدة البيانات
        if (window.electronAPI && window.electronAPI.updateData) {
            await window.electronAPI.updateData('expenses', expenseId, updatedExpense);
        } else {
            // استخدام localStorage كبديل
            const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            const index = expenses.findIndex(e => e.id === expenseId);
            if (index !== -1) {
                expenses[index] = updatedExpense;
                localStorage.setItem('expenses', JSON.stringify(expenses));
            }
        }
        
        // تحديث في المصفوفة المحلية
        expensesData[expenseIndex] = updatedExpense;
        
        // إعادة تحميل البيانات
        loadExpenses();
        updateExpensesStats();
        
        // إعادة تعيين النموذج
        resetExpenseForm();
        
        // إغلاق النافذة
        closeAddExpenseModal();
        
        showNotification('تم تحديث المصروف بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في تحديث المصروف:', error);
        showNotification('حدث خطأ أثناء تحديث المصروف', 'error');
    }
}

/**
 * إعادة تعيين نموذج المصروف
 */
function resetExpenseForm() {
    const modal = document.getElementById('addExpenseModal');
    const modalTitle = modal.querySelector('.modal-title');
    const saveBtn = modal.querySelector('.btn-primary');
    
    modalTitle.innerHTML = '<i class="fas fa-plus"></i> إضافة مصروف جديد';
    saveBtn.innerHTML = '<i class="fas fa-save"></i> حفظ المصروف';
    saveBtn.onclick = saveExpense;
    
    // تفريغ الحقول
    document.getElementById('expenseType').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseDescription').value = '';
    document.getElementById('expenseDate').valueAsDate = new Date();
}

console.log('💰 تم تحميل نظام إدارة المصاريف - شركة الإبداع الرقمي');
