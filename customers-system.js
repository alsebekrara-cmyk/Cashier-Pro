/**
 * ================================================
 * نظام إدارة العملاء - Customers Management System
 * شركة الإبداع الرقمي - كرار الشعبري
 * ================================================
 */

// متغيرات النظام
let customersData = [];
let currentCustomerFilter = 'all';
let currentCustomerSort = 'name_asc';

/**
 * تهيئة صفحة العملاء
 */
async function initCustomersPage() {
    console.log('🙍 تهيئة صفحة العملاء...');
    
    // تحميل العملاء
    await loadCustomers();
    
    // تحديث الإحصائيات
    updateCustomersStats();
    
    console.log('✅ تم تهيئة صفحة العملاء بنجاح');
}

/**
 * تحميل بيانات العملاء
 */
async function loadCustomers() {
    try {
        // جمع العملاء من الديون والمبيعات
        let debts = [];
        let sales = [];
        
        if (window.electronAPI && window.electronAPI.getAllData) {
            debts = await window.electronAPI.getAllData('debts') || [];
            sales = await window.electronAPI.getAllData('sales') || [];
        } else {
            debts = JSON.parse(localStorage.getItem('debts') || '[]');
            sales = JSON.parse(localStorage.getItem('sales') || '[]');
        }
        
        // استخراج العملاء الفريدين
        const customersMap = new Map();
        
        // إضافة العملاء من الديون
        debts.forEach(debt => {
            if (debt.customer_name && debt.customer_phone) {
                const key = debt.customer_phone;
                if (!customersMap.has(key)) {
                    customersMap.set(key, {
                        id: debt.customer_phone,
                        name: debt.customer_name,
                        phone: debt.customer_phone,
                        address: debt.customer_address || '',
                        totalPurchases: 0,
                        totalDebt: 0,
                        paidAmount: 0,
                        remainingDebt: 0,
                        purchaseCount: 0,
                        lastPurchaseDate: debt.date,
                        status: 'active',
                        notes: '',
                        createdAt: debt.created_at || debt.date
                    });
                }
                
                const customer = customersMap.get(key);
                customer.totalDebt += parseFloat(debt.total_amount || 0);
                customer.remainingDebt += parseFloat(debt.remaining_amount || 0);
                customer.paidAmount += parseFloat(debt.paid_amount || 0);
                
                if (new Date(debt.date) > new Date(customer.lastPurchaseDate)) {
                    customer.lastPurchaseDate = debt.date;
                }
            }
        });
        
        // إضافة معلومات من المبيعات
        sales.forEach(sale => {
            if (sale.customer_name && sale.customer_phone) {
                const key = sale.customer_phone;
                if (!customersMap.has(key)) {
                    customersMap.set(key, {
                        id: sale.customer_phone,
                        name: sale.customer_name,
                        phone: sale.customer_phone,
                        address: sale.customer_address || '',
                        totalPurchases: 0,
                        totalDebt: 0,
                        paidAmount: 0,
                        remainingDebt: 0,
                        purchaseCount: 0,
                        lastPurchaseDate: sale.date,
                        status: 'active',
                        notes: '',
                        createdAt: sale.date
                    });
                }
                
                const customer = customersMap.get(key);
                customer.totalPurchases += parseFloat(sale.final_total || 0);
                customer.purchaseCount++;
                
                if (new Date(sale.date) > new Date(customer.lastPurchaseDate)) {
                    customer.lastPurchaseDate = sale.date;
                }
            }
        });
        
        // تحويل إلى مصفوفة
        customersData = Array.from(customersMap.values());
        
        // تحديد حالة العميل
        customersData.forEach(customer => {
            if (customer.remainingDebt > 0) {
                customer.status = 'has_debt';
            } else if (customer.totalPurchases > 0) {
                customer.status = 'active';
            } else {
                customer.status = 'inactive';
            }
        });
        
        // عرض الجدول
        renderCustomersTable();
        
        console.log('✅ تم تحميل', customersData.length, 'عميل');
        
    } catch (error) {
        console.error('❌ خطأ في تحميل العملاء:', error);
        if (typeof showNotification === 'function') {
            showNotification('حدث خطأ أثناء تحميل العملاء', 'error');
        }
    }
}

/**
 * عرض جدول العملاء
 */
function renderCustomersTable() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    
    // تطبيق الفلتر
    let filteredCustomers = [...customersData];
    
    if (currentCustomerFilter !== 'all') {
        filteredCustomers = filteredCustomers.filter(c => c.status === currentCustomerFilter);
    }
    
    // تطبيق الترتيب
    filteredCustomers.sort((a, b) => {
        switch (currentCustomerSort) {
            case 'name_asc':
                return a.name.localeCompare(b.name, 'ar');
            case 'name_desc':
                return b.name.localeCompare(a.name, 'ar');
            case 'purchases_desc':
                return b.totalPurchases - a.totalPurchases;
            case 'purchases_asc':
                return a.totalPurchases - b.totalPurchases;
            case 'debt_desc':
                return b.remainingDebt - a.remainingDebt;
            case 'debt_asc':
                return a.remainingDebt - b.remainingDebt;
            case 'date_desc':
                return new Date(b.lastPurchaseDate) - new Date(a.lastPurchaseDate);
            case 'date_asc':
                return new Date(a.lastPurchaseDate) - new Date(b.lastPurchaseDate);
            default:
                return 0;
        }
    });
    
    // عرض النتائج
    if (filteredCustomers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 3rem; color: var(--theme-text-tertiary);">لا يوجد عملاء</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredCustomers.map((customer, index) => {
        const statusBadge = getCustomerStatusBadge(customer.status);
        const avgPurchase = customer.purchaseCount > 0 ? (customer.totalPurchases / customer.purchaseCount) : 0;
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div style="font-weight: 600;">${customer.name}</div>
                    <div style="font-size: 0.85rem; color: var(--theme-text-tertiary);">
                        <i class="fas fa-phone"></i> ${customer.phone}
                    </div>
                </td>
                <td>${customer.address || '-'}</td>
                <td>${customer.totalPurchases.toLocaleString()} د.ع</td>
                <td>
                    <span style="color: ${customer.remainingDebt > 0 ? 'var(--danger-color)' : 'var(--success-color)'}; font-weight: 600;">
                        ${customer.remainingDebt.toLocaleString()} د.ع
                    </span>
                </td>
                <td>${customer.purchaseCount}</td>
                <td>${new Date(customer.lastPurchaseDate).toLocaleDateString('ar-IQ')}</td>
                <td>
                    ${statusBadge}
                </td>
                <td>
                    <button class="action-btn view-btn" onclick="viewCustomerDetails('${customer.id}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editCustomer('${customer.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteCustomer('${customer.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * الحصول على شارة حالة العميل
 */
function getCustomerStatusBadge(status) {
    const badges = {
        'active': '<span class="badge badge-success"><i class="fas fa-check-circle"></i> نشط</span>',
        'has_debt': '<span class="badge badge-warning"><i class="fas fa-exclamation-circle"></i> لديه دين</span>',
        'inactive': '<span class="badge badge-secondary"><i class="fas fa-pause-circle"></i> غير نشط</span>'
    };
    return badges[status] || badges['inactive'];
}

/**
 * تحديث إحصائيات العملاء
 */
function updateCustomersStats() {
    const totalCustomers = customersData.length;
    const activeCustomers = customersData.filter(c => c.status === 'active' || c.status === 'has_debt').length;
    const customersWithDebt = customersData.filter(c => c.remainingDebt > 0).length;
    const totalDebt = customersData.reduce((sum, c) => sum + c.remainingDebt, 0);
    
    // تحديث العناصر
    const elements = {
        'totalCustomersCount': totalCustomers,
        'activeCustomersCount': activeCustomers,
        'customersWithDebtCount': customersWithDebt,
        'totalCustomersDebt': totalDebt.toLocaleString() + ' د.ع'
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
}

/**
 * تطبيق فلتر العملاء
 */
function applyCustomerFilter(filter) {
    currentCustomerFilter = filter;
    
    // تحديث أزرار الفلتر
    document.querySelectorAll('.customer-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="applyCustomerFilter('${filter}')"]`)?.classList.add('active');
    
    renderCustomersTable();
}

/**
 * تطبيق ترتيب العملاء
 */
function applyCustomerSort() {
    const select = document.getElementById('customerSortSelect');
    if (select) {
        currentCustomerSort = select.value;
        renderCustomersTable();
    }
}

/**
 * البحث في العملاء
 */
function searchCustomers() {
    const input = document.getElementById('customersSearchInput');
    if (!input) return;
    
    const searchTerm = input.value.toLowerCase();
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

/**
 * عرض تفاصيل العميل
 */
function viewCustomerDetails(customerId) {
    const customer = customersData.find(c => c.id === customerId);
    if (!customer) {
        if (typeof showNotification === 'function') {
            showNotification('لم يتم العثور على العميل', 'error');
        }
        return;
    }
    
    // إنشاء محتوى التفاصيل
    const content = `
        <div style="padding: 1.5rem;">
            <!-- معلومات العميل الأساسية -->
            <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div style="width: 60px; height: 60px; background: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold;">
                        ${customer.name.charAt(0)}
                    </div>
                    <div>
                        <h3 style="margin: 0; color: var(--primary-color);">${customer.name}</h3>
                        <p style="margin: 0.25rem 0; color: var(--theme-text-tertiary);">
                            <i class="fas fa-phone"></i> ${customer.phone}
                        </p>
                        ${customer.address ? `<p style="margin: 0.25rem 0; color: var(--theme-text-tertiary);"><i class="fas fa-map-marker-alt"></i> ${customer.address}</p>` : ''}
                    </div>
                </div>
                ${getCustomerStatusBadge(customer.status)}
            </div>
            
            <!-- إحصائيات العميل -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: var(--theme-bg-secondary); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.85rem; color: var(--theme-text-tertiary); margin-bottom: 0.5rem;">إجمالي المشتريات</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--success-color);">${customer.totalPurchases.toLocaleString()} د.ع</div>
                </div>
                
                <div style="background: var(--theme-bg-secondary); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.85rem; color: var(--theme-text-tertiary); margin-bottom: 0.5rem;">الدين المتبقي</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--danger-color);">${customer.remainingDebt.toLocaleString()} د.ع</div>
                </div>
                
                <div style="background: var(--theme-bg-secondary); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.85rem; color: var(--theme-text-tertiary); margin-bottom: 0.5rem;">عدد المشتريات</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${customer.purchaseCount}</div>
                </div>
                
                <div style="background: var(--theme-bg-secondary); padding: 1rem; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.85rem; color: var(--theme-text-tertiary); margin-bottom: 0.5rem;">آخر عملية شراء</div>
                    <div style="font-size: 1rem; font-weight: bold;">${new Date(customer.lastPurchaseDate).toLocaleDateString('ar-IQ')}</div>
                </div>
            </div>
            
            <!-- معلومات إضافية -->
            <div style="background: var(--theme-bg-secondary); padding: 1rem; border-radius: 8px;">
                <div style="display: grid; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--theme-text-tertiary);">المبلغ المدفوع:</span>
                        <span style="font-weight: 600;">${customer.paidAmount.toLocaleString()} د.ع</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--theme-text-tertiary);">متوسط الشراء:</span>
                        <span style="font-weight: 600;">${(customer.purchaseCount > 0 ? customer.totalPurchases / customer.purchaseCount : 0).toLocaleString()} د.ع</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--theme-text-tertiary);">تاريخ التسجيل:</span>
                        <span style="font-weight: 600;">${new Date(customer.createdAt).toLocaleDateString('ar-IQ')}</span>
                    </div>
                </div>
            </div>
            
            <!-- أزرار الإجراءات -->
            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="closeCustomerDetailsModal()">إغلاق</button>
                <button class="btn btn-primary" onclick="closeCustomerDetailsModal(); editCustomer('${customer.id}');">
                    <i class="fas fa-edit"></i> تعديل
                </button>
            </div>
        </div>
    `;
    
    // إظهار النافذة
    let modal = document.getElementById('customerDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customerDetailsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="fas fa-user"></i> تفاصيل العميل</h3>
                    <button class="close-btn" onclick="closeCustomerDetailsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" id="customerDetailsContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('customerDetailsContent').innerHTML = content;
    modal.style.display = 'flex';
}

/**
 * إغلاق نافذة تفاصيل العميل
 */
function closeCustomerDetailsModal() {
    const modal = document.getElementById('customerDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * تعديل بيانات العميل
 */
function editCustomer(customerId) {
    // هذه الوظيفة تحتاج إلى تنفيذ أكثر تعقيداً
    // لأن بيانات العملاء مستمدة من الديون والمبيعات
    if (typeof showNotification === 'function') {
        showNotification('لتعديل بيانات العميل، قم بتعديل بيانات المبيعات أو الديون المرتبطة به', 'info');
    }
}

/**
 * حذف عميل
 */
function deleteCustomer(customerId) {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟ سيتم حذف جميع البيانات المرتبطة به.')) {
        if (typeof showNotification === 'function') {
            showNotification('لحذف العميل، يجب حذف جميع المبيعات والديون المرتبطة به أولاً', 'warning');
        }
    }
}

/**
 * تصدير بيانات العملاء
 */
function exportCustomersData(format) {
    if (typeof exportData === 'function') {
        // استخدام نظام التصدير الموجود
        const data = {
            customers: customersData,
            exportDate: new Date().toISOString(),
            totalCustomers: customersData.length
        };
        
        // يمكن تطوير هذا لاحقاً
        console.log('تصدير بيانات العملاء بصيغة:', format);
        if (typeof showNotification === 'function') {
            showNotification('جاري العمل على ميزة التصدير...', 'info');
        }
    }
}

// تشغيل التهيئة عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('customers')) {
            initCustomersPage();
        }
    });
} else {
    if (document.getElementById('customers')) {
        initCustomersPage();
    }
}

console.log('👥 تم تحميل نظام إدارة العملاء - شركة الإبداع الرقمي');
