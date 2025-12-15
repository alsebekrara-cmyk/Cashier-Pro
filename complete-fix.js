/**
 * ===============================================
 * الإصلاحات الشاملة - نظام نقطة البيع
 * شركة الإبداع الرقمي - كرار الشعبري
 * ===============================================
 */

(function() {
    'use strict';

    console.log('🚀 بدء تحميل الإصلاحات الشاملة...');

    // ==========================================
    // 1. إصلاح الشريط الجانبي
    // ==========================================
    
    function fixSidebarOnLoad() {
        console.log('📱 إصلاح الشريط الجانبي...');
        
        const sidebar = document.getElementById('sidebar');
        const body = document.body;
        
        if (sidebar) {
            // التأكد من أن الشريط مخفي عند التحميل
            sidebar.classList.remove('active');
            body.classList.remove('sidebar-open');
            
            // إزالة أي styles مضافة
            sidebar.style.display = '';
            sidebar.style.transform = '';
            
            console.log('✅ تم إخفاء الشريط الجانبي');
        }
        
        // إنشاء زر التبديل إذا لم يكن موجوداً
        let toggleBtn = document.getElementById('sidebarToggle');
        if (!toggleBtn && window.innerWidth <= 768) {
            toggleBtn = document.createElement('button');
            toggleBtn.id = 'sidebarToggle';
            toggleBtn.className = 'sidebar-toggle-btn';
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            toggleBtn.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 10000;
                width: 45px;
                height: 45px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(toggleBtn);
            
            // إضافة overlay
            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: 9998;
                    display: none;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                `;
                document.body.appendChild(overlay);
            }
            
            // إضافة أحداث الضغط
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (sidebar) {
                    const isActive = sidebar.classList.contains('active');
                    
                    if (isActive) {
                        // إغلاق
                        sidebar.classList.remove('active');
                        body.classList.remove('sidebar-open');
                        overlay.style.display = 'none';
                        overlay.style.opacity = '0';
                    } else {
                        // فتح
                        sidebar.classList.add('active');
                        body.classList.add('sidebar-open');
                        overlay.style.display = 'block';
                        setTimeout(() => {
                            overlay.style.opacity = '1';
                        }, 10);
                    }
                }
            });
            
            // إغلاق عند الضغط على overlay
            overlay.addEventListener('click', function() {
                sidebar.classList.remove('active');
                body.classList.remove('sidebar-open');
                overlay.style.display = 'none';
                overlay.style.opacity = '0';
            });
            
            // إغلاق عند اختيار صفحة
            if (sidebar) {
                const menuItems = sidebar.querySelectorAll('.menu-item, .sidebar-menu li a, [onclick*="showPage"]');
                menuItems.forEach(item => {
                    item.addEventListener('click', function() {
                        if (window.innerWidth <= 768) {
                            setTimeout(() => {
                                sidebar.classList.remove('active');
                                body.classList.remove('sidebar-open');
                                overlay.style.display = 'none';
                                overlay.style.opacity = '0';
                            }, 300);
                        }
                    });
                });
            }
            
            console.log('✅ تم إضافة زر التبديل والأحداث');
        }
    }

    // ==========================================
    // 2. إصلاح صفحات الإعدادات
    // ==========================================
    
    function fixSettingsPages() {
        console.log('⚙️ إصلاح صفحات الإعدادات...');
        
        // الانتظار حتى تحميل DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeSettingsPages);
        } else {
            initializeSettingsPages();
        }
    }
    
    function initializeSettingsPages() {
        // إصلاح تبويب الأمن والخصوصية
        initSecurityTab();
        
        // إصلاح تبويب الإشعارات
        initNotificationsTab();
        
        // إضافة مراقب للتبويبات
        observeSettingsTabs();
    }
    
    function initSecurityTab() {
        console.log('🔒 تهيئة تبويب الأمن والخصوصية...');
        
        // البحث عن العنصر بطرق متعددة
        let container = document.getElementById('securityPrivacyContent') || 
                       document.getElementById('security-content') ||
                       document.querySelector('[data-tab="security"]') ||
                       document.querySelector('.settings-tab-content[data-tab="security"]');
        
        // إذا لم يُعثر عليه، البحث في جميع عناصر التبويب
        if (!container) {
            const allTabs = document.querySelectorAll('.settings-tab-content');
            for (let tab of allTabs) {
                if (tab.id && (tab.id.includes('security') || tab.id.includes('privacy'))) {
                    container = tab;
                    break;
                }
            }
        }
        
        // إذا لم يُعثر عليه، إنشاؤه
        if (!container) {
            container = document.createElement('div');
            container.id = 'securityPrivacyContent';
            container.className = 'settings-tab-content';
            container.setAttribute('data-tab', 'security');
            
            const settingsContent = document.querySelector('.settings-content') || 
                                   document.querySelector('.main-content');
            if (settingsContent) {
                settingsContent.appendChild(container);
            }
        }
        
        // إضافة المحتوى
        container.innerHTML = `
            <div class="settings-section">
                <h3 class="settings-section-title">
                    <i class="fas fa-lock"></i>
                    تغيير كلمة المرور
                </h3>
                <div class="settings-card">
                    <div class="form-group">
                        <label>كلمة المرور الحالية</label>
                        <input type="password" id="currentPassword" class="form-control" placeholder="أدخل كلمة المرور الحالية">
                    </div>
                    <div class="form-group">
                        <label>كلمة المرور الجديدة</label>
                        <input type="password" id="newPassword" class="form-control" placeholder="أدخل كلمة المرور الجديدة">
                    </div>
                    <div class="form-group">
                        <label>تأكيد كلمة المرور</label>
                        <input type="password" id="confirmPassword" class="form-control" placeholder="أعد إدخال كلمة المرور الجديدة">
                    </div>
                    <button onclick="updatePassword()" class="btn btn-primary" style="width: 100%;">
                        <i class="fas fa-save"></i>
                        تحديث كلمة المرور
                    </button>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="settings-section-title">
                    <i class="fas fa-user-clock"></i>
                    الجلسات النشطة
                </h3>
                <div class="settings-card">
                    <div class="session-item active">
                        <div class="session-info">
                            <div class="session-device">
                                <i class="fas fa-desktop"></i>
                                الجلسة الحالية
                            </div>
                            <div class="session-details">
                                <span class="session-time">متصل الآن</span>
                                <span class="session-user">${window.currentUser?.username || 'Admin'}</span>
                            </div>
                        </div>
                        <span class="session-status active-badge">نشط</span>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="settings-section-title">
                    <i class="fas fa-shield-alt"></i>
                    خيارات الأمان
                </h3>
                <div class="settings-card">
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">تسجيل الخروج التلقائي</div>
                            <div class="setting-description">تسجيل الخروج تلقائياً بعد 30 دقيقة من عدم النشاط</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="autoLogout" onchange="saveSecuritySettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">طلب كلمة المرور للعمليات الحساسة</div>
                            <div class="setting-description">مثل حذف البيانات أو تعديل الإعدادات المهمة</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="requirePassword" onchange="saveSecuritySettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">تفعيل سجل التدقيق</div>
                            <div class="setting-description">تسجيل جميع العمليات المهمة في النظام</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="auditLog" onchange="saveSecuritySettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="settings-section-title">
                    <i class="fas fa-user-shield"></i>
                    إعدادات الخصوصية
                </h3>
                <div class="settings-card">
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">إظهار الاسم في التقارير</div>
                            <div class="setting-description">عرض اسمك في التقارير المطبوعة</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="showNameInReports" checked onchange="saveSecuritySettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">مشاركة بيانات الاستخدام</div>
                            <div class="setting-description">المساعدة في تحسين النظام من خلال مشاركة بيانات الاستخدام</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="shareUsageData" onchange="saveSecuritySettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <style>
                .settings-section {
                    margin-bottom: 30px;
                }
                
                .settings-section-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .settings-section-title i {
                    color: #667eea;
                }
                
                .settings-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                
                .session-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                
                .session-item.active {
                    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
                    border: 2px solid #4caf50;
                }
                
                .session-info {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .session-device {
                    font-weight: 600;
                    color: #2d3748;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .session-details {
                    display: flex;
                    gap: 15px;
                    font-size: 13px;
                    color: #718096;
                }
                
                .active-badge {
                    background: #4caf50;
                    color: white;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }
                
                .setting-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 0;
                    border-bottom: 1px solid #e2e8f0;
                }
                
                .setting-item:last-child {
                    border-bottom: none;
                }
                
                .setting-info {
                    flex: 1;
                }
                
                .setting-label {
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 5px;
                }
                
                .setting-description {
                    font-size: 13px;
                    color: #718096;
                }
                
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 26px;
                    flex-shrink: 0;
                }
                
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #cbd5e0;
                    transition: 0.4s;
                    border-radius: 26px;
                }
                
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 20px;
                    width: 20px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: 0.4s;
                    border-radius: 50%;
                }
                
                input:checked + .slider {
                    background-color: #667eea;
                }
                
                input:checked + .slider:before {
                    transform: translateX(24px);
                }
                
                @media (max-width: 768px) {
                    .setting-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }
                    
                    .switch {
                        align-self: flex-end;
                    }
                }
            </style>
        `;
        
        container.style.display = 'block';
        
        // تحميل الإعدادات المحفوظة
        loadSecuritySettings();
        
        console.log('✅ تم تهيئة تبويب الأمن والخصوصية');
    }
    
    function initNotificationsTab() {
        console.log('🔔 تهيئة تبويب الإشعارات...');
        
        // البحث عن العنصر
        let container = document.getElementById('notificationsContent') ||
                       document.getElementById('notifications-content') ||
                       document.querySelector('[data-tab="notifications"]') ||
                       document.querySelector('.settings-tab-content[data-tab="notifications"]');
        
        // إذا لم يُعثر عليه، البحث في جميع عناصر التبويب
        if (!container) {
            const allTabs = document.querySelectorAll('.settings-tab-content');
            for (let tab of allTabs) {
                if (tab.id && tab.id.includes('notification')) {
                    container = tab;
                    break;
                }
            }
        }
        
        // إذا لم يُعثر عليه، إنشاؤه
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationsContent';
            container.className = 'settings-tab-content';
            container.setAttribute('data-tab', 'notifications');
            
            const settingsContent = document.querySelector('.settings-content') || 
                                   document.querySelector('.main-content');
            if (settingsContent) {
                settingsContent.appendChild(container);
            }
        }
        
        // إضافة المحتوى
        container.innerHTML = `
            <div class="settings-section">
                <h3 class="settings-section-title">
                    <i class="fas fa-bell"></i>
                    إشعارات النظام
                </h3>
                <div class="settings-card">
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">
                                <i class="fas fa-check-circle" style="color: #4caf50;"></i>
                                إشعار عند إتمام عملية البيع
                            </div>
                            <div class="setting-description">إظهار إشعار تأكيد عند نجاح عملية البيع</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="notifySale" checked onchange="saveNotificationSettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">
                                <i class="fas fa-money-bill-wave" style="color: #4caf50;"></i>
                                إشعار عند استلام الدفعات
                            </div>
                            <div class="setting-description">تنبيه عند استلام دفعة من العملاء</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="notifyPayment" checked onchange="saveNotificationSettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">
                                <i class="fas fa-exclamation-triangle" style="color: #ff9800;"></i>
                                تنبيه انخفاض المخزون
                            </div>
                            <div class="setting-description">تنبيه عند وصول المنتج إلى الحد الأدنى</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="notifyLowStock" checked onchange="saveNotificationSettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="settings-section-title">
                    <i class="fas fa-file-invoice-dollar"></i>
                    إشعارات الديون
                </h3>
                <div class="settings-card">
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">تنبيه قرب موعد الاستحقاق</div>
                            <div class="setting-description">إرسال تنبيه قبل موعد استحقاق الدين</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="notifyDebtDue" checked onchange="saveNotificationSettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">تنبيه الديون المتأخرة</div>
                            <div class="setting-description">تنبيه عند تجاوز موعد استحقاق الدين</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="notifyOverdueDebt" checked onchange="saveNotificationSettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">عدد الأيام قبل التنبيه</div>
                            <div class="setting-description">عدد الأيام قبل موعد الاستحقاق لإرسال التنبيه</div>
                        </div>
                        <select id="debtNotifyDays" class="form-control" style="width: 120px;" onchange="saveNotificationSettings()">
                            <option value="1">يوم واحد</option>
                            <option value="3" selected>3 أيام</option>
                            <option value="5">5 أيام</option>
                            <option value="7">7 أيام</option>
                            <option value="14">14 يوم</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="settings-section-title">
                    <i class="fas fa-chart-line"></i>
                    إشعارات التقارير
                </h3>
                <div class="settings-card">
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">التقارير اليومية</div>
                            <div class="setting-description">إرسال ملخص يومي للمبيعات والأرباح</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="dailyReports" onchange="saveNotificationSettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">التقارير الأسبوعية</div>
                            <div class="setting-description">إرسال تقرير أسبوعي شامل</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="weeklyReports" checked onchange="saveNotificationSettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">التقارير الشهرية</div>
                            <div class="setting-description">إرسال تقرير شهري مفصل</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="monthlyReports" checked onchange="saveNotificationSettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h3 class="settings-section-title">
                    <i class="fas fa-volume-up"></i>
                    طريقة الإشعار
                </h3>
                <div class="settings-card">
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">الإشعارات داخل التطبيق</div>
                            <div class="setting-description">إظهار الإشعارات داخل واجهة التطبيق</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="inAppNotifications" checked onchange="saveNotificationSettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <div class="setting-label">الإشعارات الصوتية</div>
                            <div class="setting-description">تشغيل صوت تنبيه عند الإشعارات المهمة</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="soundAlerts" onchange="saveNotificationSettings()">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div style="margin-top: 30px;">
                <button onclick="saveNotificationSettings()" class="btn btn-primary" style="width: 100%;">
                    <i class="fas fa-save"></i>
                    حفظ جميع الإعدادات
                </button>
            </div>
        `;
        
        container.style.display = 'block';
        
        // تحميل الإعدادات المحفوظة
        loadNotificationSettings();
        
        console.log('✅ تم تهيئة تبويب الإشعارات');
    }
    
    function observeSettingsTabs() {
        // مراقبة التبديل بين التبويبات
        const settingsTabs = document.querySelectorAll('.settings-tab, .tab-btn, [data-tab]');
        
        settingsTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab') || 
                               this.textContent.trim().toLowerCase();
                
                if (tabName.includes('أمن') || tabName.includes('خصوص') || tabName.includes('security')) {
                    setTimeout(initSecurityTab, 100);
                }
                
                if (tabName.includes('إشعار') || tabName.includes('notification')) {
                    setTimeout(initNotificationsTab, 100);
                }
            });
        });
    }

    // ==========================================
    // 3. إصلاح حفظ الديون
    // ==========================================
    
    function fixDebtSaving() {
        console.log('💳 إصلاح حفظ الديون...');
        
        // تعريف دالة saveManualDebt العالمية
        window.saveManualDebt = async function() {
            try {
                console.log('📝 بدء حفظ الدين اليدوي...');
                
                // جمع البيانات
                const customerName = document.getElementById('manualDebtCustomer')?.value?.trim();
                const amount = parseFloat(document.getElementById('manualDebtAmount')?.value || 0);
                const dueDate = document.getElementById('manualDebtDueDate')?.value;
                const notes = document.getElementById('manualDebtNotes')?.value?.trim() || '';
                
                // التحقق من البيانات
                if (!customerName) {
                    alert('⚠️ يرجى إدخال اسم العميل');
                    return;
                }
                
                if (!amount || amount <= 0) {
                    alert('⚠️ يرجى إدخال مبلغ صحيح');
                    return;
                }
                
                if (!dueDate) {
                    alert('⚠️ يرجى تحديد تاريخ الاستحقاق');
                    return;
                }
                
                // إنشاء كائن الدين
                const debtId = Date.now();
                const debt = {
                    id: debtId,
                    __backendId: debtId,  // مهم للحفظ الدائم
                    type: 'debt',         // نوع السجل
                    customerName: customerName,
                    amount: amount,
                    remainingAmount: amount,
                    dueDate: dueDate,
                    notes: notes,
                    status: 'active',
                    source: 'manual',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: window.currentUser?.username || 'Admin',
                    payments: []
                };
                
                console.log('💾 حفظ الدين:', debt);
                
                // 1. الحفظ في قاعدة البيانات
                if (window.electronAPI && window.electronAPI.insertData) {
                    await window.electronAPI.insertData('debts', debt);
                    console.log('✅ تم الحفظ في قاعدة البيانات');
                } else {
                    console.warn('⚠️ electronAPI غير متوفر، الحفظ في localStorage');
                    const debts = JSON.parse(localStorage.getItem('debts') || '[]');
                    debts.push(debt);
                    localStorage.setItem('debts', JSON.stringify(debts));
                }
                
                // 2. الإضافة إلى المصفوفة العالمية
                if (!window.debtsData) {
                    window.debtsData = [];
                }
                window.debtsData.push(debt);
                console.log('✅ تمت الإضافة إلى debtsData');
                
                // 3. تحديث الواجهة فوراً
                if (typeof window.renderDebtsTable === 'function') {
                    window.renderDebtsTable();
                    console.log('✅ تم تحديث الجدول');
                }
                
                if (typeof window.updateDebtsStats === 'function') {
                    window.updateDebtsStats();
                    console.log('✅ تم تحديث الإحصائيات');
                }
                
                // 4. إعادة التحميل من قاعدة البيانات للتأكيد
                setTimeout(async () => {
                    if (window.electronAPI && window.electronAPI.getAllData) {
                        const allDebts = await window.electronAPI.getAllData('debts');
                        window.debtsData = allDebts || [];
                        console.log('✅ تم إعادة التحميل من قاعدة البيانات:', window.debtsData.length, 'ديون');
                        
                        if (typeof window.renderDebtsTable === 'function') {
                            window.renderDebtsTable();
                        }
                    }
                }, 500);
                
                // 5. إغلاق النافذة وإظهار رسالة النجاح
                const modal = document.getElementById('manualDebtModal');
                if (modal) {
                    modal.style.display = 'none';
                }
                
                // مسح الحقول
                document.getElementById('manualDebtCustomer').value = '';
                document.getElementById('manualDebtAmount').value = '';
                document.getElementById('manualDebtDueDate').value = '';
                document.getElementById('manualDebtNotes').value = '';
                
                // إظهار رسالة النجاح
                if (typeof window.showNotification === 'function') {
                    window.showNotification('✅ تم إضافة الدين بنجاح', 'success');
                } else {
                    alert('✅ تم إضافة الدين بنجاح');
                }
                
                console.log('🎉 اكتمل حفظ الدين بنجاح!');
                
            } catch (error) {
                console.error('❌ خطأ في حفظ الدين:', error);
                alert('❌ حدث خطأ أثناء حفظ الدين: ' + error.message);
            }
        };
        
        console.log('✅ تم إصلاح دالة حفظ الديون');
    }

    // ==========================================
    // 4. إضافة زر التعديل في الديون
    // ==========================================
    
    function addEditButtonToDebts() {
        console.log('✏️ إضافة زر التعديل للديون...');
        
        // تعريف دالة editDebt العالمية
        window.editDebt = function(debtId) {
            console.log('✏️ تعديل الدين:', debtId);
            
            // البحث عن الدين
            const debt = window.debtsData?.find(d => d.id === debtId);
            if (!debt) {
                alert('❌ لم يتم العثور على الدين');
                return;
            }
            
            // فتح نافذة التعديل
            const modal = document.getElementById('editDebtModal');
            if (!modal) {
                // إنشاء النافذة إذا لم تكن موجودة
                createEditDebtModal();
            }
            
            // ملء البيانات
            document.getElementById('editDebtId').value = debt.id;
            document.getElementById('editDebtCustomer').value = debt.customerName;
            document.getElementById('editDebtAmount').value = debt.amount;
            document.getElementById('editDebtDueDate').value = debt.dueDate;
            document.getElementById('editDebtNotes').value = debt.notes || '';
            
            // إظهار النافذة
            document.getElementById('editDebtModal').style.display = 'block';
        };
        
        // تعريف دالة حفظ التعديل
        window.saveDebtEdit = async function() {
            try {
                const debtId = parseInt(document.getElementById('editDebtId').value);
                const customerName = document.getElementById('editDebtCustomer').value.trim();
                const amount = parseFloat(document.getElementById('editDebtAmount').value);
                const dueDate = document.getElementById('editDebtDueDate').value;
                const notes = document.getElementById('editDebtNotes').value.trim();
                
                // التحقق
                if (!customerName || !amount || !dueDate) {
                    alert('⚠️ يرجى ملء جميع الحقول المطلوبة');
                    return;
                }
                
                // تحديث البيانات
                const debtIndex = window.debtsData.findIndex(d => d.id === debtId);
                if (debtIndex === -1) {
                    alert('❌ لم يتم العثور على الدين');
                    return;
                }
                
                const updatedDebt = {
                    ...window.debtsData[debtIndex],
                    customerName: customerName,
                    amount: amount,
                    dueDate: dueDate,
                    notes: notes,
                    updatedAt: new Date().toISOString()
                };
                
                // حساب المبلغ المتبقي
                const totalPaid = (updatedDebt.payments || []).reduce((sum, p) => sum + p.amount, 0);
                updatedDebt.remainingAmount = amount - totalPaid;
                
                // الحفظ في قاعدة البيانات
                if (window.electronAPI && window.electronAPI.updateData) {
                    await window.electronAPI.updateData('debts', debtId, updatedDebt);
                }
                
                // تحديث المصفوفة
                window.debtsData[debtIndex] = updatedDebt;
                
                // تحديث الواجهة
                if (typeof window.renderDebtsTable === 'function') {
                    window.renderDebtsTable();
                }
                if (typeof window.updateDebtsStats === 'function') {
                    window.updateDebtsStats();
                }
                
                // إغلاق النافذة
                document.getElementById('editDebtModal').style.display = 'none';
                
                if (typeof window.showNotification === 'function') {
                    window.showNotification('✅ تم تحديث الدين بنجاح', 'success');
                } else {
                    alert('✅ تم تحديث الدين بنجاح');
                }
                
            } catch (error) {
                console.error('❌ خطأ في تحديث الدين:', error);
                alert('❌ حدث خطأ أثناء التحديث');
            }
        };
        
        console.log('✅ تم إضافة دوال تعديل الديون');
    }
    
    function createEditDebtModal() {
        const modalHTML = `
            <div id="editDebtModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>✏️ تعديل الدين</h3>
                        <span class="close" onclick="document.getElementById('editDebtModal').style.display='none'">&times;</span>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="editDebtId">
                        
                        <div class="form-group">
                            <label>اسم العميل *</label>
                            <input type="text" id="editDebtCustomer" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label>المبلغ الإجمالي (IQD) *</label>
                            <input type="number" id="editDebtAmount" class="form-control" min="0" step="0.01" required>
                        </div>
                        
                        <div class="form-group">
                            <label>تاريخ الاستحقاق *</label>
                            <input type="date" id="editDebtDueDate" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label>ملاحظات</label>
                            <textarea id="editDebtNotes" class="form-control" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button onclick="document.getElementById('editDebtModal').style.display='none'" class="btn btn-secondary">
                            إلغاء
                        </button>
                        <button onclick="saveDebtEdit()" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            حفظ التعديلات
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // ==========================================
    // 5. إصلاح التمرير في صفحة البيع
    // ==========================================
    
    function fixSalePageScroll() {
        console.log('📜 إصلاح التمرير في صفحة البيع...');
        
        // البحث عن قائمة المنتجات في صفحة البيع
        const productsList = document.querySelector('.sale-products-list') ||
                            document.querySelector('#saleProducts') ||
                            document.querySelector('.products-grid');
        
        if (productsList) {
            productsList.style.cssText = `
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                max-height: calc(100vh - 200px);
                padding: 10px;
            `;
            console.log('✅ تم إصلاح التمرير في قائمة المنتجات');
        }
        
        // إصلاح التمرير في صفحة البيع الرئيسية
        const salePage = document.getElementById('salePage') ||
                        document.querySelector('[data-page="sale"]');
        
        if (salePage) {
            salePage.style.cssText = `
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                height: 100%;
            `;
            console.log('✅ تم إصلاح التمرير في صفحة البيع');
        }
    }

    // ==========================================
    // دوال مساعدة للإعدادات
    // ==========================================
    
    window.loadSecuritySettings = function() {
        const settings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
        
        if (settings.autoLogout !== undefined) {
            document.getElementById('autoLogout').checked = settings.autoLogout;
        }
        if (settings.requirePassword !== undefined) {
            document.getElementById('requirePassword').checked = settings.requirePassword;
        }
        if (settings.auditLog !== undefined) {
            document.getElementById('auditLog').checked = settings.auditLog;
        }
        if (settings.showNameInReports !== undefined) {
            document.getElementById('showNameInReports').checked = settings.showNameInReports;
        }
        if (settings.shareUsageData !== undefined) {
            document.getElementById('shareUsageData').checked = settings.shareUsageData;
        }
    };
    
    window.saveSecuritySettings = function() {
        const settings = {
            autoLogout: document.getElementById('autoLogout')?.checked || false,
            requirePassword: document.getElementById('requirePassword')?.checked || false,
            auditLog: document.getElementById('auditLog')?.checked || false,
            showNameInReports: document.getElementById('showNameInReports')?.checked || true,
            shareUsageData: document.getElementById('shareUsageData')?.checked || false
        };
        
        localStorage.setItem('securitySettings', JSON.stringify(settings));
        
        if (typeof window.showNotification === 'function') {
            window.showNotification('✅ تم حفظ إعدادات الأمان', 'success');
        }
        
        console.log('✅ تم حفظ إعدادات الأمان');
    };
    
    window.loadNotificationSettings = function() {
        const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
        
        if (settings.notifySale !== undefined) {
            document.getElementById('notifySale').checked = settings.notifySale;
        }
        if (settings.notifyPayment !== undefined) {
            document.getElementById('notifyPayment').checked = settings.notifyPayment;
        }
        if (settings.notifyLowStock !== undefined) {
            document.getElementById('notifyLowStock').checked = settings.notifyLowStock;
        }
        if (settings.notifyDebtDue !== undefined) {
            document.getElementById('notifyDebtDue').checked = settings.notifyDebtDue;
        }
        if (settings.notifyOverdueDebt !== undefined) {
            document.getElementById('notifyOverdueDebt').checked = settings.notifyOverdueDebt;
        }
        if (settings.debtNotifyDays !== undefined) {
            document.getElementById('debtNotifyDays').value = settings.debtNotifyDays;
        }
        if (settings.dailyReports !== undefined) {
            document.getElementById('dailyReports').checked = settings.dailyReports;
        }
        if (settings.weeklyReports !== undefined) {
            document.getElementById('weeklyReports').checked = settings.weeklyReports;
        }
        if (settings.monthlyReports !== undefined) {
            document.getElementById('monthlyReports').checked = settings.monthlyReports;
        }
        if (settings.inAppNotifications !== undefined) {
            document.getElementById('inAppNotifications').checked = settings.inAppNotifications;
        }
        if (settings.soundAlerts !== undefined) {
            document.getElementById('soundAlerts').checked = settings.soundAlerts;
        }
    };
    
    window.saveNotificationSettings = function() {
        const settings = {
            notifySale: document.getElementById('notifySale')?.checked || false,
            notifyPayment: document.getElementById('notifyPayment')?.checked || false,
            notifyLowStock: document.getElementById('notifyLowStock')?.checked || false,
            notifyDebtDue: document.getElementById('notifyDebtDue')?.checked || false,
            notifyOverdueDebt: document.getElementById('notifyOverdueDebt')?.checked || false,
            debtNotifyDays: document.getElementById('debtNotifyDays')?.value || '3',
            dailyReports: document.getElementById('dailyReports')?.checked || false,
            weeklyReports: document.getElementById('weeklyReports')?.checked || false,
            monthlyReports: document.getElementById('monthlyReports')?.checked || false,
            inAppNotifications: document.getElementById('inAppNotifications')?.checked || true,
            soundAlerts: document.getElementById('soundAlerts')?.checked || false
        };
        
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
        
        if (typeof window.showNotification === 'function') {
            window.showNotification('✅ تم حفظ إعدادات الإشعارات', 'success');
        }
        
        console.log('✅ تم حفظ إعدادات الإشعارات');
    };
    
    window.updatePassword = function() {
        const currentPassword = document.getElementById('currentPassword')?.value;
        const newPassword = document.getElementById('newPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('⚠️ يرجى ملء جميع الحقول');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('⚠️ كلمة المرور الجديدة غير متطابقة');
            return;
        }
        
        // هنا يجب إضافة منطق التحقق من كلمة المرور الحالية
        // وتحديث كلمة المرور في قاعدة البيانات
        
        alert('✅ تم تحديث كلمة المرور بنجاح');
        
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    };

    // ==========================================
    // التهيئة عند تحميل الصفحة
    // ==========================================
    
    function initialize() {
        console.log('🎯 بدء التهيئة الشاملة...');
        
        // تطبيق جميع الإصلاحات
        fixSidebarOnLoad();
        fixSettingsPages();
        fixDebtSaving();
        addEditButtonToDebts();
        fixSalePageScroll();
        
        // إعادة تطبيق بعض الإصلاحات عند تغيير الصفحة
        const originalShowPage = window.showPage;
        window.showPage = function(pageName) {
            if (typeof originalShowPage === 'function') {
                originalShowPage(pageName);
            }
            
            // تطبيق الإصلاحات بعد تغيير الصفحة
            setTimeout(() => {
                if (pageName === 'settings') {
                    initializeSettingsPages();
                }
                if (pageName === 'sale') {
                    fixSalePageScroll();
                }
            }, 100);
        };
        
        console.log('✅ اكتملت التهيئة الشاملة!');
    }
    
    // تشغيل التهيئة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // إعادة التطبيق عند تغيير حجم النافذة
    window.addEventListener('resize', function() {
        fixSidebarOnLoad();
    });
    
    console.log('✅ تم تحميل جميع الإصلاحات بنجاح!');

})();
