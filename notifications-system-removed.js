/**
 * ========================================
 * نظام الإشعارات المُستخرج من التطبيق
 * Notifications System - Removed from Application
 * ========================================
 * 
 * هذا الملف يحتوي على جميع الأكواد والدوال الخاصة بنظام الإشعارات
 * التي تم إزالتها من التطبيق الرئيسي
 * 
 * الأقسام:
 * 1. CSS الخاص بالإشعارات
 * 2. HTML الخاص بزر الإشعارات وصفحة الإعدادات
 * 3. JavaScript - الدوال والمتغيرات
 * 4. Event Listeners
 * 
 * ========================================
 */

// ========================================
// القسم 1: CSS الخاص بالإشعارات
// ========================================

const NOTIFICATIONS_CSS = `
    /* الإشعارات */
    .notification-btn {
        position: relative;
        background: var(--theme-bg-card);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--theme-text-secondary);
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .notification-btn:hover {
        background: var(--primary-color);
        color: white;
        transform: scale(1.05);
    }

    .notification-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: var(--danger-color);
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        animation: pulse 2s infinite;
    }

    .settings-card-icon.notifications-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    /* تحسين toast notifications */
    .toast-notification {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        min-width: 300px;
        max-width: 500px;
        padding: 1rem 1.5rem;
        background: var(--theme-bg-card);
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        transform: translateX(500px);
        transition: transform 0.3s ease;
        z-index: 10000;
    }

    .toast-notification.show {
        transform: translateX(0);
    }
`;

// ========================================
// القسم 2: HTML الخاص بالإشعارات
// ========================================

const NOTIFICATIONS_HTML = {
    // زر الإشعارات في الهيدر
    notificationButton: `
        <div class="notification-btn" id="notificationBtn" onclick="showNotificationsPanel()">
            <i class="fas fa-bell"></i> 
            <span class="notification-badge" id="notificationCount">0</span>
        </div>
    `,

    // بطاقة إعدادات الإشعارات في صفحة الإعدادات
    settingsCard: `
        <div class="settings-card" onclick="showSettingsPage('notifications')">
            <div class="settings-card-icon notifications-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="settings-card-content">
                <h3>إعدادات الإشعارات</h3>
                <p>تنبيهات المخزون، المبيعات والديون</p>
            </div>
            <div class="settings-card-arrow">
                <i class="fas fa-chevron-left"></i>
            </div>
        </div>
    `,

    // صفحة إعدادات الإشعارات الكاملة
    settingsPage: `
        <div id="settings-notifications" class="page" style="display: none;">
            <div class="section-header">
                <button class="btn btn-secondary" onclick="showPage('settings')" style="margin-left: 1rem;">
                    <i class="fas fa-arrow-right"></i> رجوع
                </button>
                <div class="section-title"><i class="fas fa-bell"></i> إعدادات الإشعارات</div>
            </div>

            <div class="settings-full-width">
                <div class="settings-content-wrapper">
                    
                    <!-- إشعارات المخزون -->
                    <div class="settings-section">
                        <h3 style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid rgba(255,255,255,0.1);">
                            <i class="fas fa-boxes"></i> إشعارات المخزون
                        </h3>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="lowStockNotifications" checked style="width: auto;">
                                <span>تنبيه عند انخفاض المخزون</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label class="form-label">نسبة التحذير (%)</label>
                            <input type="number" class="form-input" id="lowStockThreshold" value="20" min="0" max="100">
                            <small style="color: var(--theme-text-secondary); margin-top: 0.5rem; display: block;">
                                تنبيه عندما يصل المخزون إلى هذه النسبة من الحد الأدنى
                            </small>
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="outOfStockNotifications" checked style="width: auto;">
                                <span>تنبيه عند نفاذ المخزون</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="expiryNotifications" checked style="width: auto;">
                                <span>تنبيه عند اقتراب تاريخ الصلاحية</span>
                            </label>
                        </div>
                    </div>

                    <!-- إشعارات المبيعات -->
                    <div class="settings-section">
                        <h3 style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid rgba(255,255,255,0.1);">
                            <i class="fas fa-shopping-cart"></i> إشعارات المبيعات
                        </h3>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="salesNotifications" checked style="width: auto;">
                                <span>إشعارات المبيعات اليومية</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="largeSaleNotifications" style="width: auto;">
                                <span>تنبيه عند بيع بمبلغ كبير</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label class="form-label">المبلغ الكبير (دينار)</label>
                            <input type="number" class="form-input" id="largeSaleAmount" value="1000000">
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="dailySalesReport" checked style="width: auto;">
                                <span>تقرير مبيعات يومي (نهاية اليوم)</span>
                            </label>
                        </div>
                    </div>

                    <!-- إشعارات الديون -->
                    <div class="settings-section">
                        <h3 style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid rgba(255,255,255,0.1);">
                            <i class="fas fa-file-invoice-dollar"></i> إشعارات الديون
                        </h3>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="debtNotifications" checked style="width: auto;">
                                <span>تنبيه عند إضافة دين جديد</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="debtDueNotifications" checked style="width: auto;">
                                <span>تنبيه عند اقتراب موعد سداد دين</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label class="form-label">التنبيه قبل الموعد بـ (أيام)</label>
                            <input type="number" class="form-input" id="debtDueDays" value="3" min="1">
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="overdueDebtNotifications" checked style="width: auto;">
                                <span>تنبيه يومي للديون المتأخرة</span>
                            </label>
                        </div>
                    </div>

                    <!-- إشعارات النظام -->
                    <div class="settings-section">
                        <h3 style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid rgba(255,255,255,0.1);">
                            <i class="fas fa-desktop"></i> إشعارات النظام
                        </h3>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="updateNotifications" checked style="width: auto;">
                                <span>إشعارات التحديثات المتوفرة</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="backupReminders" checked style="width: auto;">
                                <span>تذكير بإنشاء نسخة احتياطية</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="soundNotifications" checked style="width: auto;">
                                <span>تشغيل الأصوات مع الإشعارات</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button class="btn btn-primary" onclick="saveNotificationSettings()">
                            <i class="fas fa-save"></i> حفظ جميع الإعدادات
                        </button>
                        <button class="btn btn-secondary" onclick="showPage('settings')">
                            <i class="fas fa-times"></i> إلغاء
                        </button>
                    </div>

                </div>
            </div>
        </div>
    `
};

// ========================================
// القسم 3: JavaScript - المتغيرات والدوال
// ========================================

// متغير عام لتخزين الإشعارات
let notifications = [];

/**
 * عرض لوحة الإشعارات الرئيسية
 * تعرض قائمة بجميع الإشعارات المتوفرة
 */
function showNotificationsPanel() {
    if (notifications.length === 0) {
        showToast('لا توجد إشعارات جديدة', 'info');
        return;
    }
    
    let notificationsHTML = notifications.map((notif, index) => {
        return `
            <div class="notification-card" style="background: var(--theme-bg-secondary); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border-right: 4px solid var(--${notif.type}-color); cursor: pointer; transition: all 0.3s ease;" onclick="showNotificationDetails(${index})" onmouseenter="this.style.transform='translateX(-5px)'" onmouseleave="this.style.transform='translateX(0)'">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="font-size: 2rem; color: var(--${notif.type}-color);">
                        <i class="fas fa-${notif.icon}"></i>
                    </div>
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 0.5rem; color: var(--theme-text-primary); font-size: 1.1rem;">${notif.title}</h4>
                        <p style="color: var(--theme-text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">${notif.message}</p>
                        <span style="background: var(--${notif.type}-color); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; display: inline-block;">
                            ${notif.count} ${notif.category === 'debts' ? 'دين' : 'منتج'}
                        </span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-left" style="color: var(--theme-text-secondary);"></i>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'notificationsModal';
    modal.innerHTML = `
        <div class="modal-content animate__animated animate__fadeInDown" style="max-width: 700px;">
            <div class="modal-header">
                <h3 class="modal-title"><i class="fas fa-bell"></i> الإشعارات (${notifications.length})</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="max-height: 70vh; overflow-y: auto; padding: 1rem;">
                ${notificationsHTML}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * عرض تفاصيل إشعار معين
 * @param {number} notificationIndex - فهرس الإشعار في المصفوفة
 */
function showNotificationDetails(notificationIndex) {
    const notif = notifications[notificationIndex];
    if (!notif || !notif.items || notif.items.length === 0) return;
    
    // إغلاق نافذة الإشعارات الرئيسية
    const mainModal = document.getElementById('notificationsModal');
    if (mainModal) mainModal.remove();
    
    let itemsHTML = '';
    
    if (notif.category === 'debts') {
        // عرض الديون المتأخرة
        itemsHTML = notif.items.map(debt => {
            const totalAmount = debt.total_amount || debt.final_total || 0;
            let paidAmount = 0;
            let paidMonths = 0;
            
            if (debt.installments && Array.isArray(debt.installments)) {
                debt.installments.forEach(inst => {
                    if (inst.status === 'paid') {
                        paidAmount += parseFloat(inst.paid_amount || inst.amount || 0);
                        paidMonths++;
                    }
                });
            }
            
            const remainingAmount = totalAmount - paidAmount;
            const totalMonths = debt.installment_months || 0;
            const daysOverdue = Math.floor((new Date() - new Date(debt.due_date)) / (1000 * 60 * 60 * 24));
            
            return `
                <div class="notification-detail-item" style="background: var(--theme-bg-secondary); padding: 1.25rem; border-radius: 12px; margin-bottom: 1rem; border-right: 4px solid var(--danger-color); cursor: pointer; transition: all 0.3s ease;" onclick="goToDebt('${debt.id || debt.__backendId}')" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                            <h4 style="color: var(--theme-text-primary); font-size: 1.1rem; margin-bottom: 0.5rem;">
                                <i class="fas fa-user-circle" style="color: var(--danger-color);"></i>
                                ${debt.customer_name}
                            </h4>
                            <p style="color: var(--theme-text-secondary); font-size: 0.9rem; margin-bottom: 0.25rem;">
                                <i class="fas fa-phone"></i> ${debt.customer_phone}
                            </p>
                            <p style="color: var(--theme-text-secondary); font-size: 0.85rem;">
                                <i class="fas fa-map-marker-alt"></i> ${debt.customer_address || 'غير محدد'}
                            </p>
                        </div>
                        <div style="text-align: left;">
                            <span style="background: var(--danger-color); color: white; padding: 0.35rem 0.85rem; border-radius: 20px; font-size: 0.85rem; display: inline-block; margin-bottom: 0.5rem;">
                                <i class="fas fa-exclamation-triangle"></i> متأخر ${daysOverdue} يوم
                            </span>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; background: var(--theme-bg-primary); padding: 1rem; border-radius: 8px;">
                        <div>
                            <p style="color: var(--theme-text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">المبلغ الإجمالي</p>
                            <p style="color: var(--theme-text-primary); font-size: 1rem; font-weight: bold;">${formatCurrency(totalAmount)}</p>
                        </div>
                        <div>
                            <p style="color: var(--theme-text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">المبلغ المتبقي</p>
                            <p style="color: var(--danger-color); font-size: 1rem; font-weight: bold;">${formatCurrency(remainingAmount)}</p>
                        </div>
                        <div>
                            <p style="color: var(--theme-text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">القسط الشهري</p>
                            <p style="color: var(--theme-text-primary); font-size: 1rem; font-weight: bold;">${formatCurrency(debt.monthly_amount || 0)}</p>
                        </div>
                        <div>
                            <p style="color: var(--theme-text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">الأقساط المدفوعة</p>
                            <p style="color: var(--success-color); font-size: 1rem; font-weight: bold;">${paidMonths}/${totalMonths}</p>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--theme-border);">
                        <span style="color: var(--primary-color); font-size: 0.9rem;">
                            <i class="fas fa-hand-pointer"></i> انقر للانتقال إلى تفاصيل الدين
                        </span>
                    </div>
                </div>
            `;
        }).join('');
        
    } else if (notif.category === 'outOfStock' || notif.category === 'lowStock') {
        // عرض المنتجات النافذة أو القريبة من النفاذ
        itemsHTML = notif.items.map(product => {
            const category = categories.find(c => c.category_id === product.product_category);
            const categoryName = category ? category.category_name : 'غير محدد';
            const categoryIcon = category ? category.category_icon : 'fas fa-box';
            const isOutOfStock = product.stock_quantity === 0;
            
            return `
                <div class="notification-detail-item" style="background: var(--theme-bg-secondary); padding: 1.25rem; border-radius: 12px; margin-bottom: 1rem; border-right: 4px solid var(--${isOutOfStock ? 'danger' : 'warning'}-color); cursor: pointer; transition: all 0.3s ease;" onclick="goToProduct('${product.product_id}')" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
                    <div style="display: flex; gap: 1rem; align-items: start;">
                        <div style="font-size: 3rem; color: var(--${isOutOfStock ? 'danger' : 'warning'}-color); min-width: 60px; text-align: center;">
                            <i class="${categoryIcon}"></i>
                        </div>
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                                <div>
                                    <h4 style="color: var(--theme-text-primary); font-size: 1.1rem; margin-bottom: 0.5rem;">
                                        ${product.product_name}
                                    </h4>
                                    <p style="color: var(--theme-text-secondary); font-size: 0.9rem;">
                                        <i class="fas fa-tag"></i> ${categoryName}
                                    </p>
                                </div>
                                <span style="background: var(--${isOutOfStock ? 'danger' : 'warning'}-color); color: white; padding: 0.35rem 0.85rem; border-radius: 20px; font-size: 0.85rem;">
                                    <i class="fas fa-${isOutOfStock ? 'times-circle' : 'exclamation-triangle'}"></i>
                                    ${isOutOfStock ? 'نفذ من المخزون' : 'قارب على النفاذ'}
                                </span>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; background: var(--theme-bg-primary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                <div>
                                    <p style="color: var(--theme-text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">الكمية المتوفرة</p>
                                    <p style="color: var(--${isOutOfStock ? 'danger' : 'warning'}-color); font-size: 1.1rem; font-weight: bold;">
                                        ${product.stock_quantity}
                                    </p>
                                </div>
                                <div>
                                    <p style="color: var(--theme-text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">الحد الأدنى</p>
                                    <p style="color: var(--theme-text-primary); font-size: 1.1rem; font-weight: bold;">
                                        ${product.min_stock}
                                    </p>
                                </div>
                                <div>
                                    <p style="color: var(--theme-text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">السعر</p>
                                    <p style="color: var(--theme-text-primary); font-size: 1.1rem; font-weight: bold;">
                                        ${formatCurrency(product.product_price_retail)}
                                    </p>
                                </div>
                            </div>
                            ${product.product_barcode ? `
                                <p style="color: var(--theme-text-secondary); font-size: 0.85rem; margin-bottom: 0.5rem;">
                                    <i class="fas fa-barcode"></i> ${product.product_barcode}
                                </p>
                            ` : ''}
                            ${product.supplier ? `
                                <p style="color: var(--theme-text-secondary); font-size: 0.85rem;">
                                    <i class="fas fa-truck"></i> ${product.supplier}
                                </p>
                            ` : ''}
                            <div style="text-align: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--theme-border);">
                                <span style="color: var(--primary-color); font-size: 0.9rem;">
                                    <i class="fas fa-hand-pointer"></i> انقر للانتقال إلى صفحة المخزون
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content animate__animated animate__zoomIn" style="max-width: 900px;">
            <div class="modal-header">
                <h3 class="modal-title">
                    <i class="fas fa-${notif.icon}" style="color: var(--${notif.type}-color);"></i>
                    ${notif.title} (${notif.count})
                </h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="max-height: 70vh; overflow-y: auto; padding: 1rem;">
                ${itemsHTML}
            </div>
            <div style="padding: 1rem; border-top: 1px solid var(--theme-border); text-align: center;">
                <button onclick="this.closest('.modal').remove()" style="padding: 0.75rem 2rem; background: var(--theme-bg-secondary); color: var(--theme-text-primary); border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                    <i class="fas fa-times"></i> إغلاق
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * الانتقال إلى صفحة الدين وتمييزه
 * @param {string} debtId - معرف الدين
 */
function goToDebt(debtId) {
    // إغلاق النافذة المنبثقة
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.remove());
    
    // الانتقال إلى صفحة الديون
    showPage('debts');
    
    // التمرير إلى الدين المحدد
    setTimeout(() => {
        const debtRow = document.querySelector(`tr[data-debt-id="${debtId}"]`);
        if (debtRow) {
            debtRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            debtRow.style.background = 'var(--primary-color)';
            debtRow.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                debtRow.style.background = '';
            }, 2000);
        }
    }, 300);
}

/**
 * الانتقال إلى صفحة المخزون وتمييز المنتج
 * @param {string} productId - معرف المنتج
 */
function goToProduct(productId) {
    // إغلاق النافذة المنبثقة
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.remove());
    
    // الانتقال إلى صفحة المخزون
    showPage('inventory');
    
    // التمرير إلى المنتج المحدد
    setTimeout(() => {
        const productRow = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (productRow) {
            productRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            productRow.style.background = 'var(--warning-color)';
            productRow.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                productRow.style.background = '';
            }, 2000);
        }
    }, 300);
}

/**
 * تحديث الإشعارات
 * يفحص جميع البيانات ويولد الإشعارات المناسبة
 */
function updateNotifications() {
    notifications = [];
    
    // إشعارات الديون المتأخرة
    const overdueDebts = debtsData.filter(d => {
        let paidAmount = 0;
        if (d.installments && Array.isArray(d.installments)) {
            d.installments.forEach(inst => {
                if (inst.status === 'paid') {
                    paidAmount += parseFloat(inst.paid_amount || inst.amount || 0);
                }
            });
        }
        const totalAmount = d.total_amount || d.final_total || 0;
        const remaining = totalAmount - paidAmount;
        return new Date(d.due_date) < new Date() && remaining > 0;
    });
    
    if (overdueDebts.length > 0) {
        notifications.push({
            type: 'danger',
            icon: 'exclamation-triangle',
            title: 'ديون متأخرة',
            message: `لديك ${overdueDebts.length} دين متأخر عن الموعد المحدد`,
            count: overdueDebts.length,
            items: overdueDebts,
            category: 'debts'
        });
    }
    
    // إشعارات المخزون المنخفض
    const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.min_stock);
    
    if (lowStockProducts.length > 0) {
        notifications.push({
            type: 'warning',
            icon: 'box-open',
            title: 'منتجات قاربت على النفاذ',
            message: `لديك ${lowStockProducts.length} منتج قارب على النفاذ من المخزون`,
            count: lowStockProducts.length,
            items: lowStockProducts,
            category: 'lowStock'
        });
    }
    
    // إشعارات المنتجات النافذة
    const outOfStockProducts = products.filter(p => p.stock_quantity === 0);
    
    if (outOfStockProducts.length > 0) {
        notifications.push({
            type: 'danger',
            icon: 'times-circle',
            title: 'منتجات نفذت من المخزون',
            message: `لديك ${outOfStockProducts.length} منتج نفذ من المخزون بالكامل`,
            count: outOfStockProducts.length,
            items: outOfStockProducts,
            category: 'outOfStock'
        });
    }
    
    // تحديث شارة الإشعارات
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
        if (notifications.length > 0) {
            notificationBadge.textContent = notifications.length;
            notificationBadge.style.display = 'flex';
        } else {
            notificationBadge.style.display = 'none';
        }
    }
}

/**
 * حفظ إعدادات الإشعارات
 */
function saveNotificationSettings() {
    const notificationSettings = {
        lowStock: document.getElementById('lowStockNotifications')?.checked !== false,
        lowStockThreshold: document.getElementById('lowStockThreshold')?.value || 20,
        outOfStock: document.getElementById('outOfStockNotifications')?.checked !== false,
        expiry: document.getElementById('expiryNotifications')?.checked !== false,
        sales: document.getElementById('salesNotifications')?.checked !== false,
        largeSale: document.getElementById('largeSaleNotifications')?.checked || false,
        largeSaleAmount: document.getElementById('largeSaleAmount')?.value || 1000000,
        dailySalesReport: document.getElementById('dailySalesReport')?.checked !== false,
        debt: document.getElementById('debtNotifications')?.checked !== false,
        debtDue: document.getElementById('debtDueNotifications')?.checked !== false,
        debtDueDays: document.getElementById('debtDueDays')?.value || 3,
        overdueDebt: document.getElementById('overdueDebtNotifications')?.checked !== false,
        updates: document.getElementById('updateNotifications')?.checked !== false,
        backupReminders: document.getElementById('backupReminders')?.checked !== false,
        sound: document.getElementById('soundNotifications')?.checked !== false
    };

    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    
    // تطبيق إعدادات الإشعارات
    applyNotificationSettings(notificationSettings);
    
    showToast('تم حفظ وتطبيق إعدادات الإشعارات بنجاح', 'success');
}

/**
 * تطبيق إعدادات الإشعارات
 * @param {Object} settings - إعدادات الإشعارات
 */
function applyNotificationSettings(settings) {
    // حفظ الإعدادات في متغيرات عامة
    window.notificationSettings = settings;
    
    // تفعيل/تعطيل الأصوات
    window.soundEnabled = settings.sound !== false;
}

/**
 * تحميل إعدادات الإشعارات
 */
function loadNotificationSettings() {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        if (document.getElementById('lowStockNotifications')) document.getElementById('lowStockNotifications').checked = settings.lowStock !== false;
        if (document.getElementById('lowStockThreshold')) document.getElementById('lowStockThreshold').value = settings.lowStockThreshold || 20;
        if (document.getElementById('outOfStockNotifications')) document.getElementById('outOfStockNotifications').checked = settings.outOfStock !== false;
        if (document.getElementById('expiryNotifications')) document.getElementById('expiryNotifications').checked = settings.expiry !== false;
        if (document.getElementById('salesNotifications')) document.getElementById('salesNotifications').checked = settings.sales !== false;
        if (document.getElementById('largeSaleNotifications')) document.getElementById('largeSaleNotifications').checked = settings.largeSale || false;
        if (document.getElementById('largeSaleAmount')) document.getElementById('largeSaleAmount').value = settings.largeSaleAmount || 1000000;
        if (document.getElementById('dailySalesReport')) document.getElementById('dailySalesReport').checked = settings.dailySalesReport !== false;
        if (document.getElementById('debtNotifications')) document.getElementById('debtNotifications').checked = settings.debt !== false;
        if (document.getElementById('debtDueNotifications')) document.getElementById('debtDueNotifications').checked = settings.debtDue !== false;
        if (document.getElementById('debtDueDays')) document.getElementById('debtDueDays').value = settings.debtDueDays || 3;
        if (document.getElementById('overdueDebtNotifications')) document.getElementById('overdueDebtNotifications').checked = settings.overdueDebt !== false;
        if (document.getElementById('updateNotifications')) document.getElementById('updateNotifications').checked = settings.updates !== false;
        if (document.getElementById('backupReminders')) document.getElementById('backupReminders').checked = settings.backupReminders !== false;
        if (document.getElementById('soundNotifications')) document.getElementById('soundNotifications').checked = settings.sound !== false;
        
        // تطبيق الإعدادات
        applyNotificationSettings(settings);
    }
}

// ========================================
// القسم 4: Event Listeners
// ========================================

/**
 * استدعاءات الإشعارات في التطبيق:
 * 
 * 1. عند تهيئة التطبيق (تقريباً السطر 12392):
 *    updateNotifications();
 * 
 * 2. عند النقر على زر الإشعارات (السطر 15839):
 *    notificationBtn.addEventListener('click', showNotificationsPanel);
 * 
 * 3. عند تحميل الإعدادات (السطر 24266):
 *    loadNotificationSettings();
 */

// ========================================
// نهاية ملف نظام الإشعارات المُستخرج
// ========================================

console.log('📦 ملف نظام الإشعارات المُستخرج - تم إنشاؤه بنجاح');
console.log('ℹ️ هذا الملف يحتوي على جميع الأكواد التي تم إزالتها من التطبيق الرئيسي');
console.log('ℹ️ يمكنك الرجوع إلى هذا الملف إذا احتجت لاستعادة أي وظيفة من وظائف الإشعارات');
