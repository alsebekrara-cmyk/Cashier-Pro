/**
 * ═══════════════════════════════════════════════════════════════════
 * 💰 نظام إدارة المصاريف والمشتريات الشامل - النسخة المحسّنة
 * شركة الإبداع الرقمي - كرار السعبري
 * Digital Creativity Company
 * ═══════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';
    
    console.log('🚀 بدء تحميل نظام إدارة المصاريف...');
    
    // ==================== المتغيرات العامة ====================
    
    var expensesData = [];
    var purchasesData = [];
    var purchaseItems = [];
    var currentExpenseTab = 'general';
    
    // ==================== دالة الحساب التلقائي ====================
    
    function updateExpensePaidRemaining() {
        const amountEl = document.getElementById('expenseAmount');
        const paidEl = document.getElementById('expensePaid');
        const remainingEl = document.getElementById('expenseRemaining');
        
        if (!amountEl || !paidEl || !remainingEl) return;
        
        const amount = parseFloat(amountEl.value) || 0;
        const paid = parseFloat(paidEl.value) || 0;
        const remaining = Math.max(amount - paid, 0);
        
        remainingEl.value = remaining;
    }
    
    // ==================== دوال التبديل بين التبويبات ====================
    
    function switchExpenseTab(tabName) {
        console.log('🔄 التبديل إلى تبويب:', tabName);
        
        // إزالة active من جميع الأزرار
        document.querySelectorAll('.expense-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // إزالة active من جميع المحتويات
        document.querySelectorAll('.expense-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // إضافة active للزر المضغوط
        if (window.event && window.event.target) {
            const btn = window.event.target.closest('.expense-tab-btn');
            if (btn) btn.classList.add('active');
        }
        
        // عرض المحتوى المناسب
        if (tabName === 'general') {
            const tab = document.getElementById('generalExpensesTab');
            if (tab) {
                tab.classList.add('active');
                loadExpenses();
            }
        } else if (tabName === 'purchases') {
            const tab = document.getElementById('purchasesTab');
            if (tab) {
                tab.classList.add('active');
                loadPurchases();
            }
        } else if (tabName === 'reports') {
            const tab = document.getElementById('reportsTab');
            if (tab) {
                tab.classList.add('active');
                updateExpensesReports();
            }
        }
        
        currentExpenseTab = tabName;
    }
    
    // ==================== دوال النوافذ المنبثقة ====================
    
    function showAddExpenseModal() {
        console.log('📝 فتح نافذة إضافة مصروف');
        const modal = document.getElementById('addExpenseModal');
        if (!modal) {
            console.error('❌ نافذة addExpenseModal غير موجودة!');
            return;
        }
        
        modal.style.display = 'flex';
        
        // تعيين التاريخ الحالي
        const dateInput = document.getElementById('expenseDate');
        if (dateInput) {
            dateInput.valueAsDate = new Date();
        }
        
        // تفريغ الحقول
        const typeInput = document.getElementById('expenseType');
        const amountInput = document.getElementById('expenseAmount');
        const paidInput = document.getElementById('expensePaid');
        const remainingInput = document.getElementById('expenseRemaining');
        const descInput = document.getElementById('expenseDescription');
        
        if (typeInput) typeInput.value = '';
        if (amountInput) amountInput.value = '';
        if (paidInput) paidInput.value = '';
        if (remainingInput) remainingInput.value = '';
        if (descInput) descInput.value = '';
        
        console.log('✅ تم فتح نافذة إضافة المصروف');
    }
    
    function closeAddExpenseModal() {
        console.log('🔒 إغلاق نافذة إضافة مصروف');
        const modal = document.getElementById('addExpenseModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    function showAddPurchaseModal() {
        console.log('🛒 فتح نافذة إضافة فاتورة مشتريات');
        const modal = document.getElementById('addPurchaseModal');
        if (!modal) {
            console.error('❌ نافذة addPurchaseModal غير موجودة!');
            return;
        }
        
        modal.style.display = 'flex';
        
        // تعيين التاريخ الحالي
        const dateInput = document.getElementById('purchaseDate');
        if (dateInput) {
            dateInput.valueAsDate = new Date();
        }
        
        // تفريغ الحقول
        const supplierInput = document.getElementById('supplierName');
        const phoneInput = document.getElementById('supplierPhone');
        const invoiceInput = document.getElementById('invoiceNumber');
        
        if (supplierInput) supplierInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (invoiceInput) invoiceInput.value = '';
        
        // إعادة تعيين المنتجات
        purchaseItems = [];
        const container = document.getElementById('purchaseItemsContainer');
        if (container) {
            container.innerHTML = '';
        }
        addPurchaseItem(); // إضافة صف واحد افتراضي
        updatePurchaseTotal();
        
        console.log('✅ تم فتح نافذة إضافة فاتورة المشتريات');
    }
    
    function closeAddPurchaseModal() {
        console.log('🔒 إغلاق نافذة إضافة فاتورة مشتريات');
        const modal = document.getElementById('addPurchaseModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    function closeViewPurchaseModal() {
        const modal = document.getElementById('viewPurchaseModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // ==================== دوال حفظ المصاريف ====================
    
    async function saveExpense() {
        console.log('💾 حفظ مصروف جديد...');
        
        const type = document.getElementById('expenseType')?.value;
        const amount = parseFloat(document.getElementById('expenseAmount')?.value);
        const paid = parseFloat(document.getElementById('expensePaid')?.value) || 0;
        const remaining = Math.max(amount - paid, 0);
        const description = document.getElementById('expenseDescription')?.value;
        const date = document.getElementById('expenseDate')?.value;
        
        // التحقق من البيانات
        if (!type || !amount || !date) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        if (amount <= 0) {
            showNotification('المبلغ يجب أن يكون أكبر من صفر', 'error');
            return;
        }
        
        if (paid < 0 || paid > amount) {
            showNotification('المبلغ المدفوع يجب أن يكون بين 0 والمبلغ الكلي', 'error');
            return;
        }
        
        // إنشاء كائن المصروف
        const expense = {
            id: Date.now(),
            type: type,
            amount: amount,
            paid: paid,
            remaining: remaining,
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
            await loadExpenses();
            await updateExpensesStats();
            
            // إغلاق النافذة
            closeAddExpenseModal();
            
            showNotification('تم إضافة المصروف بنجاح', 'success');
            console.log('✅ تم حفظ المصروف بنجاح');
        } catch (error) {
            console.error('❌ خطأ في حفظ المصروف:', error);
            showNotification('حدث خطأ أثناء حفظ المصروف', 'error');
        }
    }
    
    async function deleteExpense(expenseId) {
        if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
            return;
        }
        
        try {
            if (window.electronAPI && window.electronAPI.deleteData) {
                await window.electronAPI.deleteData('expenses', expenseId);
            } else {
                const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
                const filtered = expenses.filter(e => e.id !== expenseId);
                localStorage.setItem('expenses', JSON.stringify(filtered));
            }
            
            expensesData = expensesData.filter(e => e && e.id !== expenseId);
            await loadExpenses();
            await updateExpensesStats();
            
            showNotification('تم حذف المصروف بنجاح', 'success');
        } catch (error) {
            console.error('❌ خطأ في حذف المصروف:', error);
            showNotification('حدث خطأ أثناء حذف المصروف', 'error');
        }
    }
    
    // ==================== دوال تحميل المصاريف ====================
    
    async function loadExpenses() {
        console.log('📥 تحميل المصاريف...');
        try {
            let expenses = [];
            if (window.electronAPI && window.electronAPI.getAllData) {
                expenses = await window.electronAPI.getAllData('expenses');
            } else {
                expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            }
            
            expensesData = expenses || [];
            
            const tbody = document.getElementById('generalExpensesTableBody');
            if (!tbody) {
                console.warn('⚠️ جدول المصاريف غير موجود');
                return;
            }
            
            tbody.innerHTML = '';
            
            if (expensesData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 3rem; color: var(--theme-text-tertiary);"><i class="fas fa-inbox"></i><br>لا توجد مصاريف مسجلة</td></tr>';
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
                    <td class="expense-amount-cell expense-amount-negative">${(expense.amount || 0).toLocaleString()} دينار</td>
                    <td class="expense-paid-cell" style="color: var(--success-color); font-weight: 500;">${(expense.paid || 0).toLocaleString()} دينار</td>
                    <td class="expense-remaining-cell" style="color: var(--warning-color); font-weight: 500;">${(expense.remaining !== undefined ? expense.remaining : (expense.amount || 0)).toLocaleString()} دينار</td>
                    <td>${new Date(expense.date).toLocaleDateString('ar-IQ')}</td>
                    <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${expense.description || '-'}</td>
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
            
            console.log(`✅ تم تحميل ${expensesData.length} مصروف`);
        } catch (error) {
            console.error('❌ خطأ في تحميل المصاريف:', error);
            showNotification('حدث خطأ أثناء تحميل المصاريف', 'error');
        }
    }
    
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
    
    function filterExpenses() {
        const searchTerm = document.getElementById('expensesSearchInput')?.value.toLowerCase() || '';
        const tbody = document.getElementById('generalExpensesTableBody');
        if (!tbody) return;
        
        const rows = tbody.getElementsByTagName('tr');
        
        Array.from(rows).forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }
    
    function viewExpenseDetails(expenseId) {
        const expense = expensesData.find(e => e.id === expenseId);
        if (!expense) {
            showNotification('لم يتم العثور على المصروف', 'error');
            return;
        }
        
        const details = `
            <div style="padding: 1rem;">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <div style="color: var(--theme-text-tertiary); font-size: 0.9rem;">نوع المصروف</div>
                        <div style="margin-top: 0.5rem; font-weight: 500;">
                            ${getExpenseTypeLabel(expense.type)}
                        </div>
                    </div>
                    <div>
                        <div style="color: var(--theme-text-tertiary); font-size: 0.9rem;">المبلغ الكلي</div>
                        <div style="margin-top: 0.5rem; font-size: 1.1rem; font-weight: bold; color: var(--danger-color);">
                            ${(expense.amount || 0).toLocaleString()} دينار
                        </div>
                    </div>
                    <div>
                        <div style="color: var(--theme-text-tertiary); font-size: 0.9rem;">المبلغ المدفوع</div>
                        <div style="margin-top: 0.5rem; font-size: 1.1rem; font-weight: bold; color: var(--success-color);">
                            ${(expense.paid || 0).toLocaleString()} دينار
                        </div>
                    </div>
                    <div>
                        <div style="color: var(--theme-text-tertiary); font-size: 0.9rem;">المبلغ المتبقي</div>
                        <div style="margin-top: 0.5rem; font-size: 1.1rem; font-weight: bold; color: var(--warning-color);">
                            ${(expense.remaining !== undefined ? expense.remaining : (expense.amount || 0)).toLocaleString()} دينار
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
            
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end; padding: 0 1rem 1rem 1rem;">
                <button class="btn btn-secondary" onclick="closeExpenseDetailsModal()">إغلاق</button>
                <button class="btn btn-primary" onclick="closeExpenseDetailsModal(); editExpense(${expense.id});">
                    <i class="fas fa-edit"></i> تعديل
                </button>
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
    
    function closeExpenseDetailsModal() {
        const modal = document.getElementById('viewExpenseDetailsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    function editExpense(expenseId) {
        const expense = expensesData.find(e => e.id === expenseId);
        if (!expense) {
            showNotification('لم يتم العثور على المصروف', 'error');
            return;
        }
        
        // ملء النموذج
        document.getElementById('expenseType').value = expense.type;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expensePaid').value = expense.paid || '';
        document.getElementById('expenseRemaining').value = (expense.remaining !== undefined ? expense.remaining : (expense.amount || 0));
        document.getElementById('expenseDescription').value = expense.description || '';
        document.getElementById('expenseDate').value = expense.date;
        
        // فتح النافذة
        showAddExpenseModal();
        
        // تغيير زر الحفظ
        const modal = document.getElementById('addExpenseModal');
        const modalTitle = modal.querySelector('.modal-title');
        const saveBtn = modal.querySelector('.btn-primary');
        
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> تعديل مصروف';
        saveBtn.innerHTML = '<i class="fas fa-save"></i> تحديث المصروف';
        saveBtn.onclick = function() { updateExpense(expenseId); };
    }
    
    async function updateExpense(expenseId) {
        const type = document.getElementById('expenseType').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const paid = parseFloat(document.getElementById('expensePaid').value) || 0;
        const remaining = Math.max(amount - paid, 0);
        const description = document.getElementById('expenseDescription').value;
        const date = document.getElementById('expenseDate').value;
        
        if (!type || !amount || !date) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        const expenseIndex = expensesData.findIndex(e => e.id === expenseId);
        if (expenseIndex === -1) {
            showNotification('لم يتم العثور على المصروف', 'error');
            return;
        }
        
        const updatedExpense = {
            ...expensesData[expenseIndex],
            type: type,
            amount: amount,
            paid: paid,
            remaining: remaining,
            description: description,
            date: date,
            updatedAt: new Date().toISOString()
        };
        
        try {
            if (window.electronAPI && window.electronAPI.updateData) {
                await window.electronAPI.updateData('expenses', expenseId, updatedExpense);
            } else {
                const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
                const index = expenses.findIndex(e => e.id === expenseId);
                if (index !== -1) {
                    expenses[index] = updatedExpense;
                    localStorage.setItem('expenses', JSON.stringify(expenses));
                }
            }
            
            expensesData[expenseIndex] = updatedExpense;
            
            await loadExpenses();
            await updateExpensesStats();
            
            resetExpenseForm();
            closeAddExpenseModal();
            
            showNotification('تم تحديث المصروف بنجاح', 'success');
        } catch (error) {
            console.error('❌ خطأ في تحديث المصروف:', error);
            showNotification('حدث خطأ أثناء تحديث المصروف', 'error');
        }
    }
    
    function resetExpenseForm() {
        const modal = document.getElementById('addExpenseModal');
        if (!modal) return;
        
        const modalTitle = modal.querySelector('.modal-title');
        const saveBtn = modal.querySelector('.btn-primary');
        
        if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-plus"></i> إضافة مصروف جديد';
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> حفظ المصروف';
            saveBtn.onclick = saveExpense;
        }
        
        // تفريغ الحقول
        document.getElementById('expenseType').value = '';
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expensePaid').value = '';
        document.getElementById('expenseRemaining').value = '';
        document.getElementById('expenseDescription').value = '';
        document.getElementById('expenseDate').valueAsDate = new Date();
    }
    
    // ==================== دوال المشتريات ====================
    
    function addPurchaseItem() {
        const container = document.getElementById('purchaseItemsContainer');
        if (!container) return;
        
        const itemIndex = purchaseItems.length;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'purchase-item-row';
        itemDiv.style.cssText = 'display: grid; grid-template-columns: 3fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem; align-items: end;';
        itemDiv.innerHTML = `
            <div class="form-group" style="margin: 0;">
                <input type="text" class="form-control" placeholder="اسم المنتج" id="itemName${itemIndex}" required>
            </div>
            <div class="form-group" style="margin: 0;">
                <input type="number" class="form-control" placeholder="الكمية" id="itemQuantity${itemIndex}" min="1" required oninput="updatePurchaseTotal()">
            </div>
            <div class="form-group" style="margin: 0;">
                <input type="number" class="form-control" placeholder="السعر" id="itemPrice${itemIndex}" min="0" required oninput="updatePurchaseTotal()">
            </div>
            <div class="form-group" style="margin: 0;">
                <input type="number" class="form-control" placeholder="المجموع" id="itemTotal${itemIndex}" readonly style="background: var(--theme-bg-secondary);">
            </div>
            <button type="button" class="btn btn-danger" onclick="removePurchaseItem(${itemIndex})" style="height: 42px;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        container.appendChild(itemDiv);
        purchaseItems.push({ index: itemIndex });
    }
    
    function removePurchaseItem(itemIndex) {
        const container = document.getElementById('purchaseItemsContainer');
        if (!container) return;
        
        const items = container.children;
        if (items.length <= 1) {
            showNotification('يجب أن تحتوي الفاتورة على منتج واحد على الأقل', 'warning');
            return;
        }
        
        const itemToRemove = items[itemIndex];
        if (itemToRemove) {
            itemToRemove.remove();
        }
        
        updatePurchaseTotal();
    }
    
    function updatePurchaseTotal() {
        const container = document.getElementById('purchaseItemsContainer');
        if (!container) return;
        
        let total = 0;
        const items = container.querySelectorAll('.purchase-item-row');
        
        items.forEach((item, index) => {
            const quantityInput = item.querySelector(`input[id^="itemQuantity"]`);
            const priceInput = item.querySelector(`input[id^="itemPrice"]`);
            const totalInput = item.querySelector(`input[id^="itemTotal"]`);
            
            if (quantityInput && priceInput && totalInput) {
                const quantity = parseFloat(quantityInput.value) || 0;
                const price = parseFloat(priceInput.value) || 0;
                const itemTotal = quantity * price;
                
                totalInput.value = itemTotal;
                total += itemTotal;
            }
        });
        
        const totalEl = document.getElementById('purchaseTotalAmount');
        if (totalEl) {
            totalEl.textContent = total.toLocaleString() + ' دينار';
        }
    }
    
    async function savePurchase() {
        console.log('💾 حفظ فاتورة مشتريات...');
        
        const supplierName = document.getElementById('supplierName')?.value;
        const supplierPhone = document.getElementById('supplierPhone')?.value || '';
        const invoiceNumber = document.getElementById('invoiceNumber')?.value || '';
        const date = document.getElementById('purchaseDate')?.value;
        
        if (!supplierName || !date) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        // جمع المنتجات
        const container = document.getElementById('purchaseItemsContainer');
        const items = [];
        let totalAmount = 0;
        
        if (container) {
            const itemRows = container.querySelectorAll('.purchase-item-row');
            itemRows.forEach((row, index) => {
                const name = row.querySelector(`input[id^="itemName"]`)?.value;
                const quantity = parseFloat(row.querySelector(`input[id^="itemQuantity"]`)?.value) || 0;
                const price = parseFloat(row.querySelector(`input[id^="itemPrice"]`)?.value) || 0;
                const total = quantity * price;
                
                if (name && quantity > 0 && price > 0) {
                    items.push({ name, quantity, price, total });
                    totalAmount += total;
                }
            });
        }
        
        if (items.length === 0) {
            showNotification('يرجى إضافة منتج واحد على الأقل', 'error');
            return;
        }
        
        const purchase = {
            id: Date.now(),
            supplierName,
            supplierPhone,
            invoiceNumber,
            date,
            items,
            totalAmount,
            createdAt: new Date().toISOString(),
            createdBy: window.currentUser?.username || 'Admin'
        };
        
        try {
            if (window.electronAPI && window.electronAPI.insertData) {
                await window.electronAPI.insertData('purchases', purchase);
            } else {
                const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
                purchases.push(purchase);
                localStorage.setItem('purchases', JSON.stringify(purchases));
            }
            
            purchasesData.push(purchase);
            
            await loadPurchases();
            await updateExpensesStats();
            
            closeAddPurchaseModal();
            
            showNotification('تم إضافة فاتورة المشتريات بنجاح', 'success');
            console.log('✅ تم حفظ فاتورة المشتريات');
        } catch (error) {
            console.error('❌ خطأ في حفظ فاتورة المشتريات:', error);
            showNotification('حدث خطأ أثناء حفظ الفاتورة', 'error');
        }
    }
    
    async function loadPurchases() {
        console.log('📥 تحميل فواتير المشتريات...');
        try {
            let purchases = [];
            if (window.electronAPI && window.electronAPI.getAllData) {
                purchases = await window.electronAPI.getAllData('purchases');
            } else {
                purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
            }
            
            purchasesData = purchases || [];
            
            const tbody = document.getElementById('purchasesTableBody');
            if (!tbody) {
                console.warn('⚠️ جدول المشتريات غير موجود');
                return;
            }
            
            tbody.innerHTML = '';
            
            if (purchasesData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 3rem; color: var(--theme-text-tertiary);"><i class="fas fa-inbox"></i><br>لا توجد فواتير مشتريات</td></tr>';
                return;
            }
            
            purchasesData.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            purchasesData.forEach((purchase, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${purchase.supplierName}</td>
                    <td>${purchase.invoiceNumber || '-'}</td>
                    <td>${purchase.items?.length || 0} منتج</td>
                    <td class="expense-amount-cell expense-amount-negative">${(purchase.totalAmount || 0).toLocaleString()} دينار</td>
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
            
            console.log(`✅ تم تحميل ${purchasesData.length} فاتورة مشتريات`);
        } catch (error) {
            console.error('❌ خطأ في تحميل المشتريات:', error);
            showNotification('حدث خطأ أثناء تحميل المشتريات', 'error');
        }
    }
    
    async function deletePurchase(purchaseId) {
        if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
            return;
        }
        
        try {
            if (window.electronAPI && window.electronAPI.deleteData) {
                await window.electronAPI.deleteData('purchases', purchaseId);
            } else {
                const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
                const filtered = purchases.filter(p => p.id !== purchaseId);
                localStorage.setItem('purchases', JSON.stringify(filtered));
            }
            
            purchasesData = purchasesData.filter(p => p && p.id !== purchaseId);
            await loadPurchases();
            await updateExpensesStats();
            
            showNotification('تم حذف الفاتورة بنجاح', 'success');
        } catch (error) {
            console.error('❌ خطأ في حذف الفاتورة:', error);
            showNotification('حدث خطأ أثناء حذف الفاتورة', 'error');
        }
    }
    
    function viewPurchaseDetails(purchaseId) {
        const purchase = purchasesData.find(p => p.id === purchaseId);
        if (!purchase) {
            showNotification('لم يتم العثور على الفاتورة', 'error');
            return;
        }
        
        let itemsHTML = '';
        if (purchase.items && purchase.items.length > 0) {
            itemsHTML = purchase.items.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toLocaleString()}</td>
                    <td>${item.total.toLocaleString()}</td>
                </tr>
            `).join('');
        }
        
        const details = `
            <div style="padding: 1rem;">
                <div style="background: var(--theme-bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <h4 style="margin-bottom: 0.5rem; color: var(--primary-color);">معلومات المورد</h4>
                    <div><strong>الاسم:</strong> ${purchase.supplierName}</div>
                    <div><strong>الهاتف:</strong> ${purchase.supplierPhone || '-'}</div>
                    <div><strong>رقم الفاتورة:</strong> ${purchase.invoiceNumber || '-'}</div>
                    <div><strong>التاريخ:</strong> ${new Date(purchase.date).toLocaleDateString('ar-IQ')}</div>
                </div>
                
                <h4 style="margin-bottom: 0.5rem; color: var(--primary-color);">المنتجات</h4>
                <table class="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>المنتج</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                            <th>المجموع</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                
                <div style="text-align: left; margin-top: 1rem; padding: 1rem; background: var(--primary-color); color: white; border-radius: 8px;">
                    <strong style="font-size: 1.2rem;">المجموع الكلي: ${purchase.totalAmount.toLocaleString()} دينار</strong>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end; padding: 0 1rem 1rem 1rem;">
                <button class="btn btn-secondary" onclick="closeViewPurchaseModal()">إغلاق</button>
            </div>
        `;
        
        const modal = document.getElementById('viewPurchaseModal');
        if (modal) {
            const content = document.getElementById('purchaseDetailsContent');
            if (content) {
                content.innerHTML = details;
            }
            modal.style.display = 'flex';
        }
    }
    
    function filterPurchases() {
        const searchTerm = document.getElementById('purchasesSearchInput')?.value.toLowerCase() || '';
        const tbody = document.getElementById('purchasesTableBody');
        if (!tbody) return;
        
        const rows = tbody.getElementsByTagName('tr');
        
        Array.from(rows).forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }
    
    // ==================== دوال الإحصائيات ====================
    
    async function updateExpensesStats() {
        console.log('📊 تحديث الإحصائيات...');
        try {
            let expenses = [];
            let purchases = [];
            
            if (window.electronAPI && window.electronAPI.getAllData) {
                expenses = await window.electronAPI.getAllData('expenses') || [];
                purchases = await window.electronAPI.getAllData('purchases') || [];
            } else {
                expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
                purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
            }
            
            const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
            const totalPaid = expenses.reduce((sum, exp) => sum + (exp.paid || 0), 0);
            const totalRemaining = expenses.reduce((sum, exp) => {
                const remaining = exp.remaining !== undefined ? exp.remaining : (exp.amount || 0) - (exp.paid || 0);
                return sum + remaining;
            }, 0);
            const totalPurchases = purchases.reduce((sum, pur) => sum + (pur.totalAmount || 0), 0);
            
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyExpenses = expenses
                .filter(exp => {
                    const expDate = new Date(exp.date);
                    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
                })
                .reduce((sum, exp) => sum + (exp.amount || 0), 0);
            
            const els = {
                totalExpenses: document.getElementById('totalExpensesAmount'),
                totalPaid: document.getElementById('totalPaidAmount'),
                totalRemaining: document.getElementById('totalRemainingAmount'),
                totalPurchases: document.getElementById('totalPurchasesAmount'),
                monthlyExpenses: document.getElementById('monthlyExpensesAmount'),
                totalCount: document.getElementById('totalExpensesCount')
            };
            
            if (els.totalExpenses) els.totalExpenses.textContent = totalExpenses.toLocaleString() + ' دينار';
            if (els.totalPaid) els.totalPaid.textContent = totalPaid.toLocaleString() + ' دينار';
            if (els.totalRemaining) els.totalRemaining.textContent = totalRemaining.toLocaleString() + ' دينار';
            if (els.totalPurchases) els.totalPurchases.textContent = totalPurchases.toLocaleString() + ' دينار';
            if (els.monthlyExpenses) els.monthlyExpenses.textContent = monthlyExpenses.toLocaleString() + ' دينار';
            if (els.totalCount) els.totalCount.textContent = (expenses.length + purchases.length).toLocaleString();
            
            console.log('✅ تم تحديث الإحصائيات');
        } catch (error) {
            console.error('❌ خطأ في تحديث الإحصائيات:', error);
        }
    }
    
    // ==================== دوال التقارير ====================
    
    async function updateExpensesReports() {
        console.log('📊 تحديث تقارير المصاريف...');
        const periodFilter = document.getElementById('reportsPeriodFilter');
        if (!periodFilter) {
            console.warn('⚠️ عنصر فلتر الفترة غير موجود');
            return;
        }
        
        const period = periodFilter.value;
        showNotification('جاري تحديث التقارير...', 'info');
        
        // يمكن إضافة منطق التقارير هنا
        console.log('📊 فترة التقرير:', period);
    }
    
    function exportExpensesReport(format) {
        showNotification(`جاري تصدير التقرير بصيغة ${format}...`, 'info');
        
        if (typeof window.exportData === 'function') {
            window.exportData('expenses', format);
        } else {
            console.warn('⚠️ دالة التصدير غير متوفرة');
        }
    }
    
    // ==================== دالة showNotification المساعدة ====================
    
    function showNotification(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
    
    // ==================== التهيئة ====================
    
    async function initExpensesPage() {
        console.log('🎬 تهيئة صفحة المصاريف...');
        try {
            await loadExpenses();
            await loadPurchases();
            await updateExpensesStats();
            
            const today = new Date().toISOString().split('T')[0];
            const dateFromEl = document.getElementById('reportsDateFrom');
            const dateToEl = document.getElementById('reportsDateTo');
            
            if (dateFromEl) dateFromEl.value = today;
            if (dateToEl) dateToEl.value = today;
            
            console.log('✅ تم تهيئة صفحة المصاريف بنجاح');
        } catch (error) {
            console.error('❌ خطأ في تهيئة صفحة المصاريف:', error);
        }
    }
    
    // ==================== تصدير الوظائف للنطاق العالمي ====================
    
    // دوال التبويبات
    window.switchExpenseTab = switchExpenseTab;
    
    // دوال النوافذ المنبثقة
    window.showAddExpenseModal = showAddExpenseModal;
    window.closeAddExpenseModal = closeAddExpenseModal;
    window.showAddPurchaseModal = showAddPurchaseModal;
    window.closeAddPurchaseModal = closeAddPurchaseModal;
    window.closeViewPurchaseModal = closeViewPurchaseModal;
    
    // دوال إدارة المصاريف
    window.saveExpense = saveExpense;
    window.deleteExpense = deleteExpense;
    window.loadExpenses = loadExpenses;
    window.updateExpensePaidRemaining = updateExpensePaidRemaining;
    window.filterExpenses = filterExpenses;
    window.viewExpenseDetails = viewExpenseDetails;
    window.closeExpenseDetailsModal = closeExpenseDetailsModal;
    window.editExpense = editExpense;
    window.updateExpense = updateExpense;
    window.resetExpenseForm = resetExpenseForm;
    
    // دوال إدارة المشتريات
    window.addPurchaseItem = addPurchaseItem;
    window.removePurchaseItem = removePurchaseItem;
    window.updatePurchaseTotal = updatePurchaseTotal;
    window.savePurchase = savePurchase;
    window.deletePurchase = deletePurchase;
    window.loadPurchases = loadPurchases;
    window.filterPurchases = filterPurchases;
    window.viewPurchaseDetails = viewPurchaseDetails;
    
    // دوال الإحصائيات
    window.updateExpensesStats = updateExpensesStats;
    
    // دوال التقارير
    window.updateExpensesReports = updateExpensesReports;
    window.exportExpensesReport = exportExpensesReport;
    
    // تهيئة تلقائية
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExpensesPage);
    } else {
        initExpensesPage();
    }
    
    console.log('✅ تم تحميل نظام إدارة المصاريف بنجاح');
    console.log('📋 الوظائف المصدرة:', Object.keys(window).filter(k => k.includes('Expense') || k.includes('Purchase') || k.includes('expense') || k.includes('purchase')));
    
})();
