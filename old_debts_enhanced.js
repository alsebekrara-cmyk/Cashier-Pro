// ============================================
// 📜 نظام إدارة الديون القديمة المحسّن
// ============================================

// مصفوفة المنتجات المؤقتة لنافذة إضافة/تعديل الدين
let oldDebtProducts = [];

// دالة إضافة منتج إلى قائمة المنتجات
function addOldDebtProduct() {
    const product = {
        id: 'prod_' + Date.now(),
        name: '',
        quantity: 1,
        price: 0
    };
    
    oldDebtProducts.push(product);
    renderOldDebtProductsTable();
}

// دالة عرض جدول المنتجات في نافذة الإضافة
function renderOldDebtProductsTable() {
    const tbody = document.getElementById('oldDebtProductsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (oldDebtProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 1rem; color: #999;">لا توجد منتجات. اضغط "إضافة منتج" لبدء الإضافة</td></tr>';
        calculateOldDebtTotals();
        return;
    }
    
    oldDebtProducts.forEach((product, index) => {
        const total = product.quantity * product.price;
        const row = `
            <tr>
                <td>
                    <input type="text" class="form-control" 
                           value="${product.name}" 
                           onchange="updateOldDebtProduct(${index}, 'name', this.value)"
                           placeholder="اسم المنتج">
                </td>
                <td>
                    <input type="number" class="form-control" 
                           value="${product.quantity}" 
                           min="1"
                           onchange="updateOldDebtProduct(${index}, 'quantity', this.value)"
                           style="text-align: center;">
                </td>
                <td>
                    <input type="number" class="form-control" 
                           value="${product.price}" 
                           min="0" step="0.01"
                           onchange="updateOldDebtProduct(${index}, 'price', this.value)"
                           style="text-align: center;">
                </td>
                <td style="text-align: center; font-weight: bold; color: var(--success-color);">
                    ${formatCurrency(total)}
                </td>
                <td style="text-align: center;">
                    <button class="btn btn-sm btn-danger" onclick="removeOldDebtProduct(${index})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    calculateOldDebtTotals();
}

// دالة تحديث منتج
function updateOldDebtProduct(index, field, value) {
    if (oldDebtProducts[index]) {
        if (field === 'quantity' || field === 'price') {
            oldDebtProducts[index][field] = parseFloat(value) || 0;
        } else {
            oldDebtProducts[index][field] = value;
        }
        renderOldDebtProductsTable();
    }
}

// دالة حذف منتج
function removeOldDebtProduct(index) {
    oldDebtProducts.splice(index, 1);
    renderOldDebtProductsTable();
}

// دالة حساب الإجماليات
function calculateOldDebtTotals() {
    // حساب إجمالي المنتجات
    let productsTotal = 0;
    oldDebtProducts.forEach(product => {
        productsTotal += (product.quantity * product.price);
    });
    
    // الحصول على القيم
    const downPayment = parseFloat(document.getElementById('oldDebtDownPayment')?.value) || 0;
    const extraAmount = parseFloat(document.getElementById('oldDebtExtraAmount')?.value) || 0;
    const months = parseInt(document.getElementById('oldDebtMonths')?.value) || 1;
    
    // الحسابات
    const totalAmount = productsTotal + extraAmount;
    const remainingAmount = totalAmount - downPayment;
    const monthlyAmount = remainingAmount / months;
    
    // تحديث الحقول
    document.getElementById('oldDebtProductsTotal').value = formatCurrency(productsTotal);
    document.getElementById('oldDebtTotalAmount').value = totalAmount.toFixed(2);
    document.getElementById('oldDebtRemainingAmount').value = remainingAmount.toFixed(2);
    document.getElementById('oldDebtMonthlyAmount').value = monthlyAmount.toFixed(2);
}

// دالة فتح نافذة تفاصيل الدين
function showOldDebtDetailsPage(debtId) {
    console.log('📄 عرض تفاصيل الدين:', debtId);
    
    const debt = oldDebtsData.find(d => d.id === debtId);
    if (!debt) {
        alert('⚠️ لم يتم العثور على الدين');
        return;
    }
    
    // تخزين ID الدين الحالي
    window.currentOldDebtId = debtId;
    
    // إنشاء صفحة التفاصيل ديناميكياً
    const oldDebtsPage = document.getElementById('oldDebts');
    if (!oldDebtsPage) return;
    
    // إخفاء الجدول الرئيسي
    oldDebtsPage.querySelector('.page-content').style.display = 'none';
    
    // إنشاء صفحة التفاصيل
    let detailsPage = document.getElementById('oldDebtDetailsPage');
    if (!detailsPage) {
        detailsPage = document.createElement('div');
        detailsPage.id = 'oldDebtDetailsPage';
        oldDebtsPage.appendChild(detailsPage);
    }
    
    detailsPage.style.display = 'block';
    detailsPage.innerHTML = generateOldDebtDetailsHTML(debt);
}

// دالة إنشاء HTML لصفحة تفاصيل الدين
function generateOldDebtDetailsHTML(debt) {
    const totalAmount = debt.total_amount || 0;
    const paidAmount = debt.paid_amount || 0;
    const remainingAmount = totalAmount - paidAmount;
    const installments = debt.installments || [];
    
    // حساب الإحصائيات
    const paidInstallments = installments.filter(i => i.status === 'paid').length;
    const pendingInstallments = installments.filter(i => i.status === 'pending').length;
    
    return `
        <div class="debt-details-container" style="padding: 2rem;">
            <!-- رأس الصفحة -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <button class="btn btn-secondary" onclick="hideOldDebtDetailsPage()">
                        <i class="fas fa-arrow-right"></i> رجوع
                    </button>
                    <h2 style="display: inline-block; margin-right: 1rem;">
                        <i class="fas fa-file-invoice"></i> تفاصيل الدين
                    </h2>
                </div>
                <div>
                    <button class="btn btn-primary" onclick="editOldDebt('${debt.id}')">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="btn btn-success" onclick="printOldDebtInvoice('${debt.id}')">
                        <i class="fas fa-print"></i> طباعة الفاتورة
                    </button>
                </div>
            </div>
            
            <!-- معلومات العميل -->
            <div class="info-card" style="background: var(--theme-bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h3><i class="fas fa-user"></i> معلومات العميل</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
                    <div>
                        <strong>الاسم:</strong> ${debt.customer_name}
                    </div>
                    <div>
                        <strong>الهاتف:</strong> ${debt.customer_phone}
                    </div>
                    <div>
                        <strong>العنوان:</strong> ${debt.customer_address || 'غير محدد'}
                    </div>
                </div>
            </div>
            
            <!-- الإحصائيات -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${formatCurrency(totalAmount)}</div>
                    <div style="margin-top: 0.5rem; opacity: 0.9;">المبلغ الإجمالي</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${formatCurrency(remainingAmount)}</div>
                    <div style="margin-top: 0.5rem; opacity: 0.9;">المبلغ المتبقي</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${paidInstallments}</div>
                    <div style="margin-top: 0.5rem; opacity: 0.9;">أقساط مسددة</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 1.5rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold;">${pendingInstallments}</div>
                    <div style="margin-top: 0.5rem; opacity: 0.9;">أقساط معلقة</div>
                </div>
            </div>
            
            <!-- المنتجات -->
            ${debt.products && debt.products.length > 0 ? `
                <div class="products-section" style="background: var(--theme-bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <h3><i class="fas fa-shopping-cart"></i> المنتجات</h3>
                    <table class="table" style="margin-top: 1rem;">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>الكمية</th>
                                <th>السعر</th>
                                <th>الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${debt.products.map(p => `
                                <tr>
                                    <td>${p.name}</td>
                                    <td>${p.quantity}</td>
                                    <td>${formatCurrency(p.price)}</td>
                                    <td>${formatCurrency(p.quantity * p.price)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
            
            <!-- جدول الأقساط -->
            <div class="installments-section">
                <h3><i class="fas fa-calendar-alt"></i> الأقساط الشهرية</h3>
                <div style="overflow-x: auto; margin-top: 1rem;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>تاريخ الاستحقاق</th>
                                <th>المبلغ المطلوب</th>
                                <th>المبلغ المدفوع</th>
                                <th>المتبقي</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${installments.map((inst, idx) => {
                                const instRemaining = inst.amount - (inst.paid_amount || 0);
                                const isPaid = inst.status === 'paid';
                                const isOverdue = !isPaid && new Date(inst.due_date) < new Date();
                                
                                return `
                                    <tr style="${isPaid ? 'background: #e8f5e9;' : isOverdue ? 'background: #ffebee;' : ''}">
                                        <td>${idx + 1}</td>
                                        <td>${formatDate(inst.due_date)}</td>
                                        <td>${formatCurrency(inst.amount)}</td>
                                        <td>${formatCurrency(inst.paid_amount || 0)}</td>
                                        <td style="font-weight: bold; color: ${instRemaining > 0 ? 'var(--danger-color)' : 'var(--success-color)'};">
                                            ${formatCurrency(instRemaining)}
                                        </td>
                                        <td>
                                            ${isPaid ? 
                                                '<span class="status-badge status-paid">مسدد</span>' : 
                                                isOverdue ?
                                                '<span class="status-badge status-overdue">متأخر</span>' :
                                                '<span class="status-badge status-pending">معلق</span>'
                                            }
                                        </td>
                                        <td>
                                            ${!isPaid ? `
                                                <button class="btn btn-sm btn-success" onclick="payOldDebtInstallment('${debt.id}', ${idx})">
                                                    <i class="fas fa-money-bill"></i> تسديد
                                                </button>
                                            ` : `
                                                <span style="color: var(--success-color);">
                                                    <i class="fas fa-check-circle"></i> تم التسديد
                                                </span>
                                            `}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- سجل التسديدات -->
            <div class="payments-history" style="margin-top: 2rem; background: var(--theme-bg-secondary); padding: 1.5rem; border-radius: 8px;">
                <h3><i class="fas fa-history"></i> سجل التسديدات</h3>
                <div id="paymentsHistoryList" style="margin-top: 1rem;">
                    ${generatePaymentsHistoryHTML(debt)}
                </div>
            </div>
        </div>
    `;
}

// دالة إنشاء سجل التسديدات
function generatePaymentsHistoryHTML(debt) {
    const payments = [];
    
    if (debt.installments) {
        debt.installments.forEach((inst, idx) => {
            if (inst.status === 'paid' && inst.paid_date) {
                payments.push({
                    date: inst.paid_date,
                    amount: inst.paid_amount || inst.amount,
                    installment: idx + 1,
                    notes: inst.payment_notes || ''
                });
            }
        });
    }
    
    if (payments.length === 0) {
        return '<p style="text-align: center; color: #999; padding: 2rem;">لا توجد تسديدات بعد</p>';
    }
    
    // ترتيب حسب التاريخ (الأحدث أولاً)
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return `
        <table class="table">
            <thead>
                <tr>
                    <th>التاريخ</th>
                    <th>القسط</th>
                    <th>المبلغ</th>
                    <th>ملاحظات</th>
                </tr>
            </thead>
            <tbody>
                ${payments.map(payment => `
                    <tr>
                        <td>${formatDateTime(payment.date)}</td>
                        <td>القسط ${payment.installment}</td>
                        <td style="color: var(--success-color); font-weight: bold;">
                            ${formatCurrency(payment.amount)}
                        </td>
                        <td>${payment.notes || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// دالة إخفاء صفحة التفاصيل
function hideOldDebtDetailsPage() {
    const detailsPage = document.getElementById('oldDebtDetailsPage');
    const mainContent = document.querySelector('#oldDebts .page-content');
    
    if (detailsPage) detailsPage.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
    
    window.currentOldDebtId = null;
}

// دالة تسديد قسط محسّنة
async function payOldDebtInstallment(debtId, installmentIndex) {
    const debt = oldDebtsData.find(d => d.id === debtId);
    if (!debt || !debt.installments || !debt.installments[installmentIndex]) {
        alert('⚠️ القسط غير موجود');
        return;
    }
    
    const installment = debt.installments[installmentIndex];
    
    if (installment.status === 'paid') {
        alert('⚠️ هذا القسط مدفوع بالفعل');
        return;
    }
    
    const remainingAmount = installment.amount - (installment.paid_amount || 0);
    
    // نافذة التسديد
    const paymentHTML = `
        <div style="padding: 1rem;">
            <h3>تسديد القسط ${installmentIndex + 1}</h3>
            <div style="margin: 1rem 0;">
                <p><strong>المبلغ المطلوب:</strong> ${formatCurrency(installment.amount)}</p>
                <p><strong>المدفوع مسبقاً:</strong> ${formatCurrency(installment.paid_amount || 0)}</p>
                <p><strong>المتبقي:</strong> <span style="color: var(--danger-color); font-weight: bold;">${formatCurrency(remainingAmount)}</span></p>
            </div>
            <div class="form-group">
                <label>المبلغ المدفوع</label>
                <input type="number" id="paymentAmount" class="form-control" 
                       value="${remainingAmount}" min="0.01" max="${remainingAmount}" step="0.01">
            </div>
            <div class="form-group">
                <label>ملاحظات</label>
                <textarea id="paymentNotes" class="form-control" rows="2"></textarea>
            </div>
        </div>
    `;
    
    // يمكن استخدام modal هنا بدلاً من prompt
    const amount = parseFloat(prompt(`المبلغ المدفوع (المتبقي: ${formatCurrency(remainingAmount)}):`, remainingAmount));
    
    if (!amount || amount <= 0) {
        return;
    }
    
    const notes = prompt('ملاحظات (اختياري):') || '';
    
    try {
        const currentPaid = installment.paid_amount || 0;
        const newPaid = currentPaid + amount;
        
        if (newPaid >= installment.amount) {
            // تسديد كامل
            installment.status = 'paid';
            installment.paid_amount = installment.amount;
            installment.paid_date = new Date().toISOString();
            installment.payment_notes = notes;
        } else {
            // تسديد جزئي - نقل الباقي للشهر التالي
            installment.paid_amount = newPaid;
            
            const remaining = installment.amount - newPaid;
            
            // إضافة المبلغ المتبقي للقسط التالي
            if (debt.installments[installmentIndex + 1]) {
                debt.installments[installmentIndex + 1].amount += remaining;
                alert(`✅ تم تسديد ${formatCurrency(amount)}\nتم نقل ${formatCurrency(remaining)} للقسط التالي`);
            }
            
            // تحديث حالة القسط الحالي كمسدد
            installment.status = 'paid';
            installment.paid_date = new Date().toISOString();
            installment.payment_notes = notes + ` (تسديد جزئي - نُقل ${formatCurrency(remaining)} للقسط التالي)`;
        }
        
        // تحديث المبلغ المدفوع الإجمالي
        debt.paid_amount = (debt.paid_amount || 0) + amount;
        debt.remaining_amount = debt.total_amount - debt.paid_amount;
        
        // تحديث الحالة
        const allPaid = debt.installments.every(inst => inst.status === 'paid');
        if (allPaid) {
            debt.status = 'مسدد';
        }
        
        // حفظ
        await saveToLocalStorage('oldDebtsData', oldDebtsData);
        
        // حفظ في Firebase
        if (window.database) {
            try {
                const uid = localStorage.getItem('app_uid');
                if (uid) {
                    await window.database.ref(`users/${uid}/old_debts/${debtId}`).set(debt);
                }
            } catch (e) {
                console.error('Firebase error:', e);
            }
        }
        
        // طباعة الإيصال
        printPaymentReceipt(debt, installmentIndex, amount, notes);
        
        // تحديث العرض
        showOldDebtDetailsPage(debtId);
        renderOldDebtsTable();
        
    } catch (error) {
        console.error('خطأ في التسديد:', error);
        alert('❌ حدث خطأ في التسديد');
    }
}

// دالة طباعة إيصال التسديد
function printPaymentReceipt(debt, installmentIndex, amount, notes) {
    const installment = debt.installments[installmentIndex];
    const receiptHTML = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>إيصال تسديد قسط</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    max-width: 80mm;
                    margin: 0 auto;
                    padding: 10px;
                    direction: rtl;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }
                .title {
                    font-size: 20px;
                    font-weight: bold;
                    margin: 10px 0;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 8px 0;
                    font-size: 14px;
                }
                .label {
                    font-weight: bold;
                }
                .divider {
                    border-top: 1px dashed #000;
                    margin: 15px 0;
                }
                .amount-box {
                    text-align: center;
                    font-size: 24px;
                    font-weight: bold;
                    padding: 15px;
                    border: 2px solid #000;
                    margin: 15px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                }
                .products-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 10px 0;
                }
                .products-table td {
                    padding: 5px;
                    border-bottom: 1px solid #ddd;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">إيصال تسديد قسط</div>
                <div>${new Date().toLocaleString('ar-IQ')}</div>
            </div>
            
            <div class="info-row">
                <span class="label">رقم الإيصال:</span>
                <span>PAY-${Date.now()}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="info-row">
                <span class="label">العميل:</span>
                <span>${debt.customer_name}</span>
            </div>
            
            <div class="info-row">
                <span class="label">الهاتف:</span>
                <span>${debt.customer_phone}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="info-row">
                <span class="label">رقم القسط:</span>
                <span>${installmentIndex + 1} من ${debt.installments.length}</span>
            </div>
            
            <div class="info-row">
                <span class="label">تاريخ الاستحقاق:</span>
                <span>${formatDate(installment.due_date)}</span>
            </div>
            
            <div class="amount-box">
                ${formatCurrency(amount)}
            </div>
            
            ${debt.products && debt.products.length > 0 ? `
                <div class="divider"></div>
                <div style="font-weight: bold; margin-bottom: 10px;">المنتجات:</div>
                <table class="products-table">
                    ${debt.products.map(p => `
                        <tr>
                            <td>${p.name}</td>
                            <td>x${p.quantity}</td>
                        </tr>
                    `).join('')}
                </table>
            ` : ''}
            
            ${notes ? `
                <div class="divider"></div>
                <div class="info-row">
                    <span class="label">ملاحظات:</span>
                </div>
                <div style="font-size: 12px; margin-top: 5px;">${notes}</div>
            ` : ''}
            
            <div class="divider"></div>
            
            <div class="info-row">
                <span class="label">الإجمالي المتبقي:</span>
                <span>${formatCurrency(debt.remaining_amount)}</span>
            </div>
            
            <div class="footer">
                <div>شكراً لثقتكم</div>
                <div style="margin-top: 10px;">تم الإنشاء بواسطة نظام Cash Pro</div>
            </div>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
}

// دالة طباعة فاتورة الدين الكاملة
function printOldDebtInvoice(debtId) {
    const debt = oldDebtsData.find(d => d.id === debtId);
    if (!debt) return;
    
    const invoiceHTML = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>فاتورة دين - ${debt.customer_name}</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    max-width: 210mm;
                    margin: 0 auto;
                    padding: 20px;
                    direction: rtl;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #000;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .title {
                    font-size: 28px;
                    font-weight: bold;
                    margin: 15px 0;
                }
                .info-section {
                    margin: 20px 0;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                    font-size: 16px;
                }
                .table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                .table th, .table td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: center;
                }
                .table th {
                    background: #f5f5f5;
                    font-weight: bold;
                }
                .total-box {
                    text-align: left;
                    font-size: 20px;
                    font-weight: bold;
                    padding: 20px;
                    border: 2px solid #000;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">فاتورة دين</div>
                <div>رقم الفاتورة: ${debt.invoice_id}</div>
                <div>${formatDate(debt.date)}</div>
            </div>
            
            <div class="info-section">
                <h3>معلومات العميل</h3>
                <div class="info-row">
                    <span><strong>الاسم:</strong> ${debt.customer_name}</span>
                    <span><strong>الهاتف:</strong> ${debt.customer_phone}</span>
                </div>
                ${debt.customer_address ? `
                    <div class="info-row">
                        <span><strong>العنوان:</strong> ${debt.customer_address}</span>
                    </div>
                ` : ''}
            </div>
            
            ${debt.products && debt.products.length > 0 ? `
                <div class="info-section">
                    <h3>المنتجات</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>المنتج</th>
                                <th>الكمية</th>
                                <th>السعر</th>
                                <th>الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${debt.products.map((p, idx) => `
                                <tr>
                                    <td>${idx + 1}</td>
                                    <td>${p.name}</td>
                                    <td>${p.quantity}</td>
                                    <td>${formatCurrency(p.price)}</td>
                                    <td>${formatCurrency(p.quantity * p.price)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
            
            <div class="total-box">
                <div>المبلغ الإجمالي: ${formatCurrency(debt.total_amount)}</div>
                <div>المبلغ المدفوع: ${formatCurrency(debt.paid_amount || 0)}</div>
                <div style="color: red;">المبلغ المتبقي: ${formatCurrency(debt.remaining_amount)}</div>
            </div>
            
            <div class="info-section">
                <h3>جدول الأقساط (${debt.installments.length} شهر)</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>القسط</th>
                            <th>تاريخ الاستحقاق</th>
                            <th>المبلغ</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${debt.installments.map((inst, idx) => `
                            <tr>
                                <td>${idx + 1}</td>
                                <td>${formatDate(inst.due_date)}</td>
                                <td>${formatCurrency(inst.amount)}</td>
                                <td>${inst.status === 'paid' ? '✓ مسدد' : 'معلق'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            ${debt.notes ? `
                <div class="info-section">
                    <h3>ملاحظات</h3>
                    <p>${debt.notes}</p>
                </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 50px; font-size: 14px; color: #666;">
                تم الإنشاء بواسطة نظام Cash Pro
            </div>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
}

// دالة تعديل دين قديم
function editOldDebt(debtId) {
    const debt = oldDebtsData.find(d => d.id === debtId);
    if (!debt) {
        alert('⚠️ لم يتم العثور على الدين');
        return;
    }
    
    // تحميل البيانات في النافذة
    document.getElementById('oldDebtCustomerName').value = debt.customer_name;
    document.getElementById('oldDebtCustomerPhone').value = debt.customer_phone;
    document.getElementById('oldDebtCustomerAddress').value = debt.customer_address || '';
    document.getElementById('oldDebtDate').value = debt.date;
    document.getElementById('oldDebtDownPayment').value = debt.paid_amount || 0;
    document.getElementById('oldDebtExtraAmount').value = debt.extra_amount || 0;
    document.getElementById('oldDebtMonths').value = debt.installment_months;
    document.getElementById('oldDebtStartDate').value = debt.start_date;
    document.getElementById('oldDebtNotes').value = debt.notes || '';
    
    // تحميل المنتجات
    oldDebtProducts = debt.products || [];
    renderOldDebtProductsTable();
    
    // تخزين ID للتعديل
    window.editingOldDebtId = debtId;
    
    // فتح النافذة
    showModal('addOldDebtModal');
}

// دالة تنسيق التاريخ والوقت
function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ar-IQ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
