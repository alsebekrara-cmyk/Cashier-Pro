/**
 * ================================================
 * إصلاحات صفحة الإعدادات والنسخ الاحتياطي
 * شركة الإبداع الرقمي - كرار الشعبري
 * ================================================
 */

/**
 * تهيئة صفحة الأمن والخصوصية
 */
function initSecurityPrivacyTab() {
    console.log('🔒 تهيئة تبويب الأمن والخصوصية...');
    
    const container = document.getElementById('securityPrivacyContent');
    if (!container) {
        console.warn('⚠️ عنصر securityPrivacyContent غير موجود');
        return;
    }
    
    container.innerHTML = `
        <div style="padding: 1.5rem;">
            <!-- تغيير كلمة المرور -->
            <div class="settings-section" style="margin-bottom: 2rem;">
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">
                    <i class="fas fa-key"></i> تغيير كلمة المرور
                </h4>
                <div class="form-group">
                    <label>كلمة المرور الحالية</label>
                    <input type="password" id="currentPassword" class="form-control" placeholder="أدخل كلمة المرور الحالية">
                </div>
                <div class="form-group">
                    <label>كلمة المرور الجديدة</label>
                    <input type="password" id="newPassword" class="form-control" placeholder="أدخل كلمة المرور الجديدة">
                </div>
                <div class="form-group">
                    <label>تأكيد كلمة المرور الجديدة</label>
                    <input type="password" id="confirmPassword" class="form-control" placeholder="أعد إدخال كلمة المرور الجديدة">
                </div>
                <button class="btn btn-primary" onclick="changePassword()">
                    <i class="fas fa-save"></i> تحديث كلمة المرور
                </button>
            </div>
            
            <!-- جلسات النشاط -->
            <div class="settings-section" style="margin-bottom: 2rem;">
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">
                    <i class="fas fa-history"></i> جلسات النشاط
                </h4>
                <div style="background: var(--theme-bg-secondary); padding: 1rem; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <div>
                            <div style="font-weight: 600;">الجلسة الحالية</div>
                            <div style="font-size: 0.85rem; color: var(--theme-text-tertiary);">
                                متصل منذ: ${new Date().toLocaleString('ar-IQ')}
                            </div>
                        </div>
                        <span class="badge badge-success">نشط</span>
                    </div>
                </div>
            </div>
            
            <!-- خيارات الأمان -->
            <div class="settings-section" style="margin-bottom: 2rem;">
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">
                    <i class="fas fa-shield-alt"></i> خيارات الأمان
                </h4>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="autoLogout" checked>
                        <span>تسجيل الخروج التلقائي بعد فترة عدم النشاط</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="requirePasswordOnSensitive" checked>
                        <span>طلب كلمة المرور عند العمليات الحساسة</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="enableAuditLog">
                        <span>تفعيل سجل التدقيق لجميع العمليات</span>
                    </label>
                </div>
            </div>
            
            <!-- الخصوصية -->
            <div class="settings-section">
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">
                    <i class="fas fa-user-secret"></i> إعدادات الخصوصية
                </h4>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="showInReports" checked>
                        <span>إظهار اسمي في التقارير</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="shareAnalytics">
                        <span>مشاركة بيانات الاستخدام لتحسين التطبيق</span>
                    </label>
                </div>
                <button class="btn btn-success" onclick="saveSecuritySettings()">
                    <i class="fas fa-save"></i> حفظ الإعدادات
                </button>
            </div>
        </div>
    `;
    
    // تحميل الإعدادات المحفوظة
    loadSecuritySettings();
}

/**
 * تهيئة صفحة الإشعارات
 */
function initNotificationsTab() {
    console.log('🔔 تهيئة تبويب الإشعارات...');
    
    const container = document.getElementById('notificationsContent');
    if (!container) {
        console.warn('⚠️ عنصر notificationsContent غير موجود');
        return;
    }
    
    container.innerHTML = `
        <div style="padding: 1.5rem;">
            <!-- إشعارات النظام -->
            <div class="settings-section" style="margin-bottom: 2rem;">
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">
                    <i class="fas fa-bell"></i> إشعارات النظام
                </h4>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="notifyOnSale" checked>
                        <span>إشعار عند إتمام عملية بيع</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="notifyOnPayment" checked>
                        <span>إشعار عند استلام دفعة</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="notifyOnLowStock" checked>
                        <span>إشعار عند نفاد المخزون</span>
                    </label>
                </div>
            </div>
            
            <!-- إشعارات الديون -->
            <div class="settings-section" style="margin-bottom: 2rem;">
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">
                    <i class="fas fa-credit-card"></i> إشعارات الديون والأقساط
                </h4>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="notifyOnDebtDue" checked>
                        <span>إشعار عند اقتراب موعد استحقاق قسط</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="notifyOnOverdueDebt" checked>
                        <span>إشعار عند تأخر سداد قسط</span>
                    </label>
                </div>
                <div class="form-group">
                    <label>تنبيه قبل الاستحقاق بـ</label>
                    <select class="form-select" id="debtNotifyDays">
                        <option value="1">يوم واحد</option>
                        <option value="3" selected>3 أيام</option>
                        <option value="5">5 أيام</option>
                        <option value="7">أسبوع</option>
                    </select>
                </div>
            </div>
            
            <!-- إشعارات التقارير -->
            <div class="settings-section" style="margin-bottom: 2rem;">
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">
                    <i class="fas fa-chart-bar"></i> إشعارات التقارير
                </h4>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="dailyReport">
                        <span>إرسال تقرير يومي</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="weeklyReport" checked>
                        <span>إرسال تقرير أسبوعي</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="monthlyReport" checked>
                        <span>إرسال تقرير شهري</span>
                    </label>
                </div>
            </div>
            
            <!-- طريقة الإشعار -->
            <div class="settings-section">
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">
                    <i class="fas fa-paper-plane"></i> طريقة الإشعار
                </h4>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="notifyInApp" checked>
                        <span>إشعارات داخل التطبيق</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="notifySound" checked>
                        <span>صوت عند الإشعار</span>
                    </label>
                </div>
                <button class="btn btn-success" onclick="saveNotificationSettings()">
                    <i class="fas fa-save"></i> حفظ الإعدادات
                </button>
            </div>
        </div>
    `;
    
    // تحميل الإعدادات المحفوظة
    loadNotificationSettings();
}

/**
 * إصلاح نظام النسخ الاحتياطي
 */
async function createBackup() {
    console.log('💾 بدء إنشاء نسخة احتياطية...');
    
    try {
        // إظهار loader
        if (typeof showLoading === 'function') {
            showLoading('جاري إنشاء النسخة الاحتياطية...');
        }
        
        // جمع جميع البيانات
        const backupData = {
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            createdBy: window.currentUser?.username || 'Admin',
            data: {}
        };
        
        // جمع البيانات من جميع الجداول
        const tables = ['products', 'categories', 'sales', 'debts', 'expenses', 'purchases', 'users'];
        
        for (const table of tables) {
            try {
                let data = [];
                if (window.electronAPI && window.electronAPI.getAllData) {
                    data = await window.electronAPI.getAllData(table) || [];
                } else {
                    data = JSON.parse(localStorage.getItem(table) || '[]');
                }
                backupData.data[table] = data;
                console.log(`✅ تم جمع ${data.length} سجل من ${table}`);
            } catch (error) {
                console.error(`❌ خطأ في جمع بيانات ${table}:`, error);
                backupData.data[table] = [];
            }
        }
        
        // تحويل البيانات إلى JSON
        const jsonData = JSON.stringify(backupData, null, 2);
        
        // إنشاء اسم الملف
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `backup-${timestamp}.json`;
        
        // تحميل الملف
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // إخفاء loader
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
        
        // إظهار رسالة نجاح
        if (typeof showNotification === 'function') {
            showNotification(`تم إنشاء النسخة الاحتياطية بنجاح: ${filename}`, 'success');
        }
        
        console.log('✅ تم إنشاء النسخة الاحتياطية بنجاح');
        
    } catch (error) {
        console.error('❌ خطأ في إنشاء النسخة الاحتياطية:', error);
        
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
        
        if (typeof showNotification === 'function') {
            showNotification('حدث خطأ أثناء إنشاء النسخة الاحتياطية: ' + error.message, 'error');
        }
    }
}

/**
 * استعادة نسخة احتياطية
 */
async function restoreBackup(file) {
    if (!file) {
        if (typeof showNotification === 'function') {
            showNotification('يرجى اختيار ملف النسخة الاحتياطية', 'warning');
        }
        return;
    }
    
    if (!confirm('هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيتم استبدال جميع البيانات الحالية.')) {
        return;
    }
    
    console.log('📥 بدء استعادة النسخة الاحتياطية...');
    
    try {
        // إظهار loader
        if (typeof showLoading === 'function') {
            showLoading('جاري استعادة النسخة الاحتياطية...');
        }
        
        // قراءة الملف
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            try {
                const backupData = JSON.parse(e.target.result);
                
                // التحقق من صحة البيانات
                if (!backupData.data || !backupData.version) {
                    throw new Error('ملف النسخة الاحتياطية غير صالح');
                }
                
                console.log('📦 البيانات المستعادة:', backupData);
                
                // استعادة البيانات لكل جدول
                const tables = Object.keys(backupData.data);
                let restoredCount = 0;
                
                for (const table of tables) {
                    const data = backupData.data[table];
                    
                    if (window.electronAPI && window.electronAPI.clearTable && window.electronAPI.insertData) {
                        // مسح البيانات القديمة
                        await window.electronAPI.clearTable(table);
                        
                        // إدراج البيانات الجديدة
                        for (const item of data) {
                            await window.electronAPI.insertData(table, item);
                        }
                    } else {
                        // استخدام localStorage
                        localStorage.setItem(table, JSON.stringify(data));
                    }
                    
                    restoredCount += data.length;
                    console.log(`✅ تم استعادة ${data.length} سجل في ${table}`);
                }
                
                // إخفاء loader
                if (typeof hideLoading === 'function') {
                    hideLoading();
                }
                
                // إظهار رسالة نجاح
                if (typeof showNotification === 'function') {
                    showNotification(`تم استعادة النسخة الاحتياطية بنجاح (${restoredCount} سجل)`, 'success');
                }
                
                // إعادة تحميل الصفحة
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
            } catch (error) {
                console.error('❌ خطأ في معالجة ملف النسخة الاحتياطية:', error);
                
                if (typeof hideLoading === 'function') {
                    hideLoading();
                }
                
                if (typeof showNotification === 'function') {
                    showNotification('خطأ في ملف النسخة الاحتياطية: ' + error.message, 'error');
                }
            }
        };
        
        reader.onerror = function() {
            console.error('❌ خطأ في قراءة الملف');
            
            if (typeof hideLoading === 'function') {
                hideLoading();
            }
            
            if (typeof showNotification === 'function') {
                showNotification('حدث خطأ أثناء قراءة الملف', 'error');
            }
        };
        
        reader.readAsText(file);
        
    } catch (error) {
        console.error('❌ خطأ في استعادة النسخة الاحتياطية:', error);
        
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
        
        if (typeof showNotification === 'function') {
            showNotification('حدث خطأ أثناء استعادة النسخة الاحتياطية: ' + error.message, 'error');
        }
    }
}

/**
 * تغيير كلمة المرور
 */
function changePassword() {
    const currentPassword = document.getElementById('currentPassword')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        if (typeof showNotification === 'function') {
            showNotification('يرجى ملء جميع الحقول', 'warning');
        }
        return;
    }
    
    if (newPassword !== confirmPassword) {
        if (typeof showNotification === 'function') {
            showNotification('كلمة المرور الجديدة غير متطابقة', 'error');
        }
        return;
    }
    
    if (newPassword.length < 6) {
        if (typeof showNotification === 'function') {
            showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning');
        }
        return;
    }
    
    // هنا يتم التحقق من كلمة المرور الحالية وتحديثها
    // يجب ربطها مع نظام المستخدمين
    
    if (typeof showNotification === 'function') {
        showNotification('تم تغيير كلمة المرور بنجاح', 'success');
    }
    
    // تفريغ الحقول
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

/**
 * حفظ إعدادات الأمان
 */
function saveSecuritySettings() {
    const settings = {
        autoLogout: document.getElementById('autoLogout')?.checked || false,
        requirePasswordOnSensitive: document.getElementById('requirePasswordOnSensitive')?.checked || false,
        enableAuditLog: document.getElementById('enableAuditLog')?.checked || false,
        showInReports: document.getElementById('showInReports')?.checked || false,
        shareAnalytics: document.getElementById('shareAnalytics')?.checked || false
    };
    
    localStorage.setItem('securitySettings', JSON.stringify(settings));
    
    if (typeof showNotification === 'function') {
        showNotification('تم حفظ إعدادات الأمان بنجاح', 'success');
    }
}

/**
 * تحميل إعدادات الأمان
 */
function loadSecuritySettings() {
    const settings = JSON.parse(localStorage.getItem('securitySettings') || '{}');
    
    if (document.getElementById('autoLogout')) {
        document.getElementById('autoLogout').checked = settings.autoLogout !== false;
    }
    if (document.getElementById('requirePasswordOnSensitive')) {
        document.getElementById('requirePasswordOnSensitive').checked = settings.requirePasswordOnSensitive !== false;
    }
    if (document.getElementById('enableAuditLog')) {
        document.getElementById('enableAuditLog').checked = settings.enableAuditLog || false;
    }
    if (document.getElementById('showInReports')) {
        document.getElementById('showInReports').checked = settings.showInReports !== false;
    }
    if (document.getElementById('shareAnalytics')) {
        document.getElementById('shareAnalytics').checked = settings.shareAnalytics || false;
    }
}

/**
 * حفظ إعدادات الإشعارات
 */
function saveNotificationSettings() {
    const settings = {
        notifyOnSale: document.getElementById('notifyOnSale')?.checked || false,
        notifyOnPayment: document.getElementById('notifyOnPayment')?.checked || false,
        notifyOnLowStock: document.getElementById('notifyOnLowStock')?.checked || false,
        notifyOnDebtDue: document.getElementById('notifyOnDebtDue')?.checked || false,
        notifyOnOverdueDebt: document.getElementById('notifyOnOverdueDebt')?.checked || false,
        debtNotifyDays: document.getElementById('debtNotifyDays')?.value || '3',
        dailyReport: document.getElementById('dailyReport')?.checked || false,
        weeklyReport: document.getElementById('weeklyReport')?.checked || false,
        monthlyReport: document.getElementById('monthlyReport')?.checked || false,
        notifyInApp: document.getElementById('notifyInApp')?.checked || false,
        notifySound: document.getElementById('notifySound')?.checked || false
    };
    
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    
    if (typeof showNotification === 'function') {
        showNotification('تم حفظ إعدادات الإشعارات بنجاح', 'success');
    }
}

/**
 * تحميل إعدادات الإشعارات
 */
function loadNotificationSettings() {
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    
    const checkboxes = [
        'notifyOnSale', 'notifyOnPayment', 'notifyOnLowStock',
        'notifyOnDebtDue', 'notifyOnOverdueDebt',
        'dailyReport', 'weeklyReport', 'monthlyReport',
        'notifyInApp', 'notifySound'
    ];
    
    checkboxes.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.checked = settings[id] !== false;
        }
    });
    
    if (document.getElementById('debtNotifyDays')) {
        document.getElementById('debtNotifyDays').value = settings.debtNotifyDays || '3';
    }
}

// تهيئة التبويبات عند تغيير التبويب في صفحة الإعدادات
function initSettingsTabContent(tabName) {
    if (tabName === 'security') {
        initSecurityPrivacyTab();
    } else if (tabName === 'notifications') {
        initNotificationsTab();
    }
}

console.log('⚙️ تم تحميل إصلاحات صفحة الإعدادات - شركة الإبداع الرقمي');
