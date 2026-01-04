// ============================================
// صفحة التسديدات المحدثة - v2.0.5
// Digital Creativity Company - Kraar Al-Saabry
// ============================================
//
// تحديث صفحة التسديدات لعرض معلومات المدينين
// بدلاً من الجدول التقليدي
//
// ============================================

/**
 * عرض التسديدات كبطاقات بدلاً من جدول
 */
function displayPaymentsAsCards() {
    const container = document.getElementById('paymentsCardsContainer');
    
    if (!container) {
        console.error('لم يتم العثور على حاوية البطاقات');
        return;
    }
    
    container.innerHTML = '';
    
    if (!debtsData || debtsData.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 20px;"></i>
                <p>لا توجد ديون مسجلة</p>
            </div>
        `;
        return;
    }
    
    // فلترة الديون حسب الفلاتر الحالية
    let filteredDebts = filterDebtsByCurrentFilter();
    
    filteredDebts.forEach(debt => {
        const card = createDebtorPaymentCard(debt);
        container.appendChild(card);
    });
    
    console.log(`✅ تم عرض ${filteredDebts.length} بطاقة مديون`);
}

/**
 * إنشاء بطاقة مديون
 */
function createDebtorPaymentCard(debt) {
    const card = document.createElement('div');
    card.className = 'debtor-payment-card';
    card.setAttribute('data-debt-id', debt.id || debt.__backendId);
    
    // حساب الإحصائيات
    const totalAmount = debt.total_amount || debt.final_total || 0;
    const paidAmount = debt.paid_amount || 0;
    const remainingAmount = debt.remaining_amount || (totalAmount - paidAmount);
    const monthlyAmount = debt.monthly_amount || 0;
    const totalMonths = debt.installment_months || (debt.installments ? debt.installments.length : 0);
    
    // عدد الأقساط المدفوعة
    let paidMonths = 0;
    if (debt.installments && Array.isArray(debt.installments)) {
        paidMonths = debt.installments.filter(inst => inst.status === 'paid').length;
    }
    
    // التسديدات السابقة
    const payments = debt.payments || [];
    
    // تحديد حالة الدين
    let statusClass = 'active';
    let statusText = 'نشط';
    let statusIcon = 'fa-clock';
    
    if (paidMonths === totalMonths && totalMonths > 0) {
        statusClass = 'paid';
        statusText = 'مسدد';
        statusIcon = 'fa-check-circle';
    } else if (debt.installments && Array.isArray(debt.installments)) {
        const hasOverdue = debt.installments.some(inst => {
            if (inst.status === 'paid') return false;
            const dueDate = new Date(inst.due_date);
            return dueDate < new Date();
        });
        
        if (hasOverdue) {
            statusClass = 'overdue';
            statusText = 'متأخر';
            statusIcon = 'fa-exclamation-triangle';
        }
    }
    
    card.innerHTML = `
        <div class="debtor-card-header ${statusClass}">
            <div class="debtor-name-section">
                <h3>
                    <i class="fas fa-user"></i>
                    ${debt.customer_name || 'غير محدد'}
                </h3>
                <span class="debt-status-badge ${statusClass}">
                    <i class="fas ${statusIcon}"></i>
                    ${statusText}
                </span>
            </div>
            <div class="debt-id-section">
                <span class="debt-id">#${debt.invoice_id || debt.debt_id || 'N/A'}</span>
            </div>
        </div>
        
        <div class="debtor-card-body">
            <div class="debtor-info-grid">
                <div class="info-item">
                    <i class="fas fa-phone icon-primary"></i>
                    <div>
                        <label>رقم الهاتف:</label>
                        <value>${debt.customer_phone || 'غير متوفر'}</value>
                    </div>
                </div>
                
                <div class="info-item">
                    <i class="fas fa-money-bill-wave icon-success"></i>
                    <div>
                        <label>المبلغ الكلي:</label>
                        <value>${formatCurrencyUnified(totalAmount)}</value>
                    </div>
                </div>
                
                <div class="info-item">
                    <i class="fas fa-calendar-alt icon-warning"></i>
                    <div>
                        <label>القسط الشهري:</label>
                        <value>${formatCurrencyUnified(monthlyAmount)}</value>
                    </div>
                </div>
                
                <div class="info-item">
                    <i class="fas fa-calendar-check icon-info"></i>
                    <div>
                        <label>تاريخ الدين:</label>
                        <value>${formatDateUnified(debt.date || debt.timestamp)}</value>
                    </div>
                </div>
                
                <div class="info-item">
                    <i class="fas fa-check-double icon-success"></i>
                    <div>
                        <label>المبلغ المدفوع:</label>
                        <value>${formatCurrencyUnified(paidAmount)}</value>
                    </div>
                </div>
                
                <div class="info-item">
                    <i class="fas fa-hourglass-half icon-danger"></i>
                    <div>
                        <label>المتبقي:</label>
                        <value>${formatCurrencyUnified(remainingAmount)}</value>
                    </div>
                </div>
                
                <div class="info-item">
                    <i class="fas fa-list-ol icon-primary"></i>
                    <div>
                        <label>الأقساط:</label>
                        <value>${formatNumberUnified(paidMonths)} / ${formatNumberUnified(totalMonths)}</value>
                    </div>
                </div>
                
                <div class="info-item">
                    <i class="fas fa-percent icon-info"></i>
                    <div>
                        <label>نسبة السداد:</label>
                        <value>${totalAmount > 0 ? formatNumberUnified(Math.round((paidAmount / totalAmount) * 100)) : '0'}%</value>
                    </div>
                </div>
            </div>
            
            <!-- شريط التقدم -->
            <div class="payment-progress-bar">
                <div class="progress-track">
                    <div class="progress-fill ${statusClass}" style="width: ${totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0}%"></div>
                </div>
            </div>
            
            <!-- التسديدات السابقة -->
            <div class="payments-history-section">
                <h4>
                    <i class="fas fa-history"></i>
                    التسديدات السابقة
                    <span class="payments-count">(${payments.length})</span>
                </h4>
                
                ${payments.length > 0 ? `
                    <div class="payments-list">
                        ${payments.slice(0, 5).map((payment, index) => `
                            <div class="payment-item">
                                <div class="payment-number">#${index + 1}</div>
                                <div class="payment-details">
                                    <div class="payment-date">
                                        <i class="fas fa-calendar"></i>
                                        ${formatDateUnified(payment.date)}
                                    </div>
                                    <div class="payment-amount">
                                        <i class="fas fa-money-bill"></i>
                                        ${formatCurrencyUnified(payment.amount)}
                                    </div>
                                    ${payment.month ? `
                                        <div class="payment-month">
                                            <i class="fas fa-hashtag"></i>
                                            القسط ${formatNumberUnified(payment.month)}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                        
                        ${payments.length > 5 ? `
                            <div class="more-payments-notice">
                                <i class="fas fa-ellipsis-h"></i>
                                و ${formatNumberUnified(payments.length - 5)} تسديدات إضافية
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="no-payments-message">
                        <i class="fas fa-info-circle"></i>
                        لا توجد تسديدات سابقة
                    </div>
                `}
            </div>
            
            <!-- أزرار الإجراءات -->
            <div class="card-actions">
                <button class="action-btn primary" onclick="showDebtDetails('${debt.id || debt.__backendId}')" title="عرض التفاصيل">
                    <i class="fas fa-eye"></i>
                    التفاصيل
                </button>
                
                ${statusClass !== 'paid' ? `
                    <button class="action-btn success" onclick="showQuickPayModal('${debt.id || debt.__backendId}')" title="تسديد قسط">
                        <i class="fas fa-money-bill-wave"></i>
                        تسديد
                    </button>
                ` : ''}
                
                <button class="action-btn info" onclick="printDebtReport('${debt.id || debt.__backendId}')" title="طباعة التقرير">
                    <i class="fas fa-print"></i>
                    طباعة
                </button>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * تصفية الديون حسب الفلتر الحالي
 */
function filterDebtsByCurrentFilter() {
    if (!debtsData) return [];
    
    let filtered = [...debtsData];
    
    // فلتر البحث النصي
    const searchTerm = document.getElementById('paymentsSearchInput')?.value.toLowerCase() || '';
    if (searchTerm) {
        filtered = filtered.filter(debt => 
            (debt.customer_name && debt.customer_name.toLowerCase().includes(searchTerm)) ||
            (debt.customer_phone && debt.customer_phone.includes(searchTerm)) ||
            (debt.invoice_id && String(debt.invoice_id).includes(searchTerm))
        );
    }
    
    // فلتر الحالة
    const statusFilter = document.getElementById('paymentsStatusFilter')?.value || 'all';
    if (statusFilter !== 'all') {
        filtered = filtered.filter(debt => {
            const totalMonths = debt.installment_months || (debt.installments ? debt.installments.length : 0);
            let paidMonths = 0;
            
            if (debt.installments && Array.isArray(debt.installments)) {
                paidMonths = debt.installments.filter(inst => inst.status === 'paid').length;
            }
            
            const isPaid = paidMonths === totalMonths && totalMonths > 0;
            
            switch (statusFilter) {
                case 'paid':
                    return isPaid;
                case 'pending':
                    return !isPaid && paidMonths > 0;
                case 'overdue':
                    if (!debt.installments) return false;
                    return debt.installments.some(inst => {
                        if (inst.status === 'paid') return false;
                        const dueDate = new Date(inst.due_date);
                        return dueDate < new Date();
                    });
                case 'upcoming':
                    if (!debt.installments) return false;
                    return debt.installments.some(inst => {
                        if (inst.status === 'paid') return false;
                        const dueDate = new Date(inst.due_date);
                        const now = new Date();
                        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        return dueDate >= now && dueDate <= weekFromNow;
                    });
                default:
                    return true;
            }
        });
    }
    
    // فلتر التاريخ
    const dateFrom = document.getElementById('paymentsDateFrom')?.value;
    const dateTo = document.getElementById('paymentsDateTo')?.value;
    
    if (dateFrom || dateTo) {
        filtered = filtered.filter(debt => {
            const debtDate = new Date(debt.date || debt.timestamp);
            
            if (dateFrom && debtDate < new Date(dateFrom)) return false;
            if (dateTo && debtDate > new Date(dateTo + 'T23:59:59')) return false;
            
            return true;
        });
    }
    
    // الترتيب
    const sortBy = document.getElementById('paymentsSortFilter')?.value || 'date_desc';
    
    switch (sortBy) {
        case 'date_desc':
            filtered.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
            break;
        case 'date_asc':
            filtered.sort((a, b) => new Date(a.date || a.timestamp) - new Date(b.date || b.timestamp));
            break;
        case 'amount_desc':
            filtered.sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0));
            break;
        case 'amount_asc':
            filtered.sort((a, b) => (a.total_amount || 0) - (b.total_amount || 0));
            break;
        case 'customer_asc':
            filtered.sort((a, b) => (a.customer_name || '').localeCompare(b.customer_name || '', 'ar'));
            break;
        case 'customer_desc':
            filtered.sort((a, b) => (b.customer_name || '').localeCompare(a.customer_name || '', 'ar'));
            break;
    }
    
    return filtered;
}

/**
 * تحديث إحصائيات صفحة التسديدات
 */
function updatePaymentsStatistics() {
    if (!debtsData) return;
    
    let totalPayments = 0;
    let paidPayments = 0;
    let overduePayments = 0;
    let upcomingPayments = 0;
    let totalPaidAmount = 0;
    let totalRemainingAmount = 0;
    
    debtsData.forEach(debt => {
        if (!debt.installments || !Array.isArray(debt.installments)) return;
        
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        debt.installments.forEach(inst => {
            totalPayments++;
            
            if (inst.status === 'paid') {
                paidPayments++;
                totalPaidAmount += inst.paid_amount || inst.amount || 0;
            } else {
                const dueDate = new Date(inst.due_date);
                totalRemainingAmount += inst.amount || 0;
                
                if (dueDate < now) {
                    overduePayments++;
                } else if (dueDate >= now && dueDate <= weekFromNow) {
                    upcomingPayments++;
                }
            }
        });
    });
    
    // تحديث العناصر
    document.getElementById('totalPaymentsCount').textContent = formatNumberUnified(totalPayments);
    document.getElementById('paidPaymentsCount').textContent = formatNumberUnified(paidPayments);
    document.getElementById('overduePaymentsCount').textContent = formatNumberUnified(overduePayments);
    document.getElementById('upcomingPaymentsCount').textContent = formatNumberUnified(upcomingPayments);
    document.getElementById('totalPaidAmount').textContent = formatCurrencyUnified(totalPaidAmount);
    document.getElementById('totalRemainingAmount').textContent = formatCurrencyUnified(totalRemainingAmount);
}

// ============================================
// تصدير الدوال
// ============================================

console.log('✅ تم تحميل وحدة صفحة التسديدات المحدثة v2.0.5');
