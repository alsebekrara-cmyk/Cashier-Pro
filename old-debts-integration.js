// ====================================================================================================
// 🏦 نظام إدارة الديون القديمة - ملف التكامل مع التطبيق الرئيسي
// Old Debts Management System - Main Application Integration
// ====================================================================================================

(function() {
    'use strict';
    
    // ====================================================================================================
    // المتغيرات العامة
    // ====================================================================================================
    
    const OLD_DEBTS_COLLECTION = 'oldDebts';
    let oldDebtsCache = [];
    let oldDebtsInitialized = false;
    
    // ====================================================================================================
    // دالة التهيئة
    // ====================================================================================================
    
    /**
     * تهيئة نظام إدارة الديون القديمة
     */
    function initializeOldDebtsSystem() {
        if (oldDebtsInitialized) {
            console.log('✅ Old Debts System already initialized');
            return;
        }
        
        console.log('🔄 Initializing Old Debts Management System...');
        
        // التحقق من وجود Firebase
        if (!window.database || !window.firestore) {
            console.error('❌ Firebase not initialized');
            return;
        }
        
        // إضافة عنصر القائمة الجانبية
        addSidebarMenuItem();
        
        // تحميل البيانات من Firebase
        loadOldDebtsData();
        
        // إعداد المستمعين
        setupOldDebtsListeners();
        
        oldDebtsInitialized = true;
        console.log('✅ Old Debts Management System initialized successfully');
    }
    
    // ====================================================================================================
    // إضافة عنصر إلى الشريط الجانبي
    // ====================================================================================================
    
    function addSidebarMenuItem() {
        // البحث عن عنصر إدارة الديون الحالي
        const debtsNavItem = document.getElementById('debtsNavItem');
        
        if (!debtsNavItem) {
            console.error('❌ Debts nav item not found');
            return;
        }
        
        // إنشاء عنصر جديد لإدارة الديون القديمة
        const oldDebtsNavItem = document.createElement('div');
        oldDebtsNavItem.className = 'nav-item';
        oldDebtsNavItem.id = 'oldDebtsNavItem';
        oldDebtsNavItem.innerHTML = `
            <a class="nav-link" onclick="showOldDebtsPage()">
                <i class="fas fa-clock-rotate-left nav-icon"></i>
                <span class="nav-text">إدارة الديون القديمة</span>
            </a>
        `;
        
        // إضافة العنصر بعد إدارة الديون الحالية
        debtsNavItem.parentNode.insertBefore(oldDebtsNavItem, debtsNavItem.nextSibling);
        
        console.log('✅ Sidebar menu item added');
    }
    
    // ====================================================================================================
    // عرض صفحة إدارة الديون القديمة
    // ====================================================================================================
    
    window.showOldDebtsPage = function() {
        // فتح الصفحة في نافذة جديدة أو iframe
        const pageUrl = 'old-debts-management.html';
        
        // يمكنك اختيار أحد الخيارين:
        
        // الخيار 1: فتح في نافذة جديدة
        window.open(pageUrl, 'oldDebtsManagement', 'width=1400,height=900');
        
        // الخيار 2: تضمين في iframe (يتطلب تعديل في التطبيق الرئيسي)
        // const iframe = document.createElement('iframe');
        // iframe.src = pageUrl;
        // iframe.style.cssText = 'width: 100%; height: 100vh; border: none;';
        // document.getElementById('mainContent').innerHTML = '';
        // document.getElementById('mainContent').appendChild(iframe);
    };
    
    // ====================================================================================================
    // تحميل بيانات الديون القديمة
    // ====================================================================================================
    
    function loadOldDebtsData() {
        database.ref(OLD_DEBTS_COLLECTION).on('value', (snapshot) => {
            oldDebtsCache = [];
            
            snapshot.forEach((childSnapshot) => {
                const debt = childSnapshot.val();
                debt.id = childSnapshot.key;
                oldDebtsCache.push(debt);
            });
            
            // تحديث الإحصائيات في الصفحة الرئيسية إذا لزم الأمر
            updateMainPageStats();
            
            // إطلاق حدث تحديث البيانات
            window.dispatchEvent(new CustomEvent('old-debts-updated', {
                detail: { debts: oldDebtsCache }
            }));
        });
    }
    
    // ====================================================================================================
    // إعداد المستمعين
    // ====================================================================================================
    
    function setupOldDebtsListeners() {
        // الاستماع لإضافة ديون جديدة
        database.ref(OLD_DEBTS_COLLECTION).on('child_added', (snapshot) => {
            const debt = snapshot.val();
            debt.id = snapshot.key;
            
            // إرسال إشعار
            sendOldDebtNotification('إضافة دين قديم', `تم إضافة دين جديد للعميل: ${debt.customerName}`);
        });
        
        // الاستماع لتحديث الديون
        database.ref(OLD_DEBTS_COLLECTION).on('child_changed', (snapshot) => {
            const debt = snapshot.val();
            debt.id = snapshot.key;
            
            // التحقق من التسديد
            const remaining = parseFloat(debt.totalAmount) - parseFloat(debt.paidAmount);
            if (remaining <= 0) {
                sendOldDebtNotification('تسديد دين', `تم تسديد دين العميل: ${debt.customerName} بالكامل`);
            }
        });
    }
    
    // ====================================================================================================
    // إرسال الإشعارات
    // ====================================================================================================
    
    function sendOldDebtNotification(title, message) {
        // محاولة استخدام نظام الإشعارات في التطبيق الرئيسي
        if (typeof window.showNotification === 'function') {
            window.showNotification(title, message);
        } else if (typeof window.showToast === 'function') {
            window.showToast(message, 'info');
        } else {
            console.log(`📢 Notification: ${title} - ${message}`);
        }
        
        // إضافة الإشعار إلى قاعدة البيانات
        if (window.database) {
            const notificationData = {
                title: title,
                message: message,
                type: 'old_debt',
                timestamp: new Date().toISOString(),
                read: false
            };
            
            window.database.ref('notifications').push(notificationData);
        }
    }
    
    // ====================================================================================================
    // تحديث الإحصائيات في الصفحة الرئيسية
    // ====================================================================================================
    
    function updateMainPageStats() {
        // يمكنك إضافة بطاقة إحصائيات في الصفحة الرئيسية
        const stats = calculateOldDebtsStats();
        
        // إطلاق حدث لتحديث الإحصائيات
        window.dispatchEvent(new CustomEvent('old-debts-stats-updated', {
            detail: stats
        }));
    }
    
    function calculateOldDebtsStats() {
        const stats = {
            total: oldDebtsCache.length,
            totalAmount: 0,
            paidAmount: 0,
            remainingAmount: 0,
            activeCount: 0,
            overdueCount: 0,
            paidCount: 0
        };
        
        oldDebtsCache.forEach(debt => {
            stats.totalAmount += parseFloat(debt.totalAmount || 0);
            stats.paidAmount += parseFloat(debt.paidAmount || 0);
            stats.remainingAmount += (parseFloat(debt.totalAmount || 0) - parseFloat(debt.paidAmount || 0));
            
            const status = getOldDebtStatus(debt);
            if (status === 'paid') stats.paidCount++;
            else if (status === 'overdue') stats.overdueCount++;
            else if (status === 'active') stats.activeCount++;
        });
        
        return stats;
    }
    
    function getOldDebtStatus(debt) {
        const remaining = parseFloat(debt.totalAmount || 0) - parseFloat(debt.paidAmount || 0);
        
        if (remaining <= 0) return 'paid';
        
        if (debt.installments && Array.isArray(debt.installments)) {
            const now = new Date();
            const hasOverdue = debt.installments.some(inst => {
                if (inst.status !== 'paid') {
                    const dueDate = new Date(inst.dueDate);
                    return dueDate < now;
                }
                return false;
            });
            
            if (hasOverdue) return 'overdue';
        }
        
        return 'active';
    }
    
    // ====================================================================================================
    // دوال مساعدة للاستخدام في التطبيق الرئيسي
    // ====================================================================================================
    
    /**
     * الحصول على جميع الديون القديمة
     */
    window.getOldDebts = function() {
        return oldDebtsCache;
    };
    
    /**
     * الحصول على إحصائيات الديون القديمة
     */
    window.getOldDebtsStats = function() {
        return calculateOldDebtsStats();
    };
    
    /**
     * إضافة دين قديم جديد
     */
    window.addOldDebt = function(debtData) {
        return database.ref(OLD_DEBTS_COLLECTION).push().set(debtData)
            .then(() => {
                // حفظ نسخة في Firestore
                const key = database.ref(OLD_DEBTS_COLLECTION).push().key;
                return firestore.collection(OLD_DEBTS_COLLECTION).doc(key).set(debtData);
            });
    };
    
    /**
     * تحديث دين قديم
     */
    window.updateOldDebt = function(debtId, debtData) {
        return database.ref(OLD_DEBTS_COLLECTION + '/' + debtId).update(debtData)
            .then(() => {
                // تحديث في Firestore
                return firestore.collection(OLD_DEBTS_COLLECTION).doc(debtId).update(debtData);
            });
    };
    
    /**
     * حذف دين قديم
     */
    window.deleteOldDebt = function(debtId) {
        return database.ref(OLD_DEBTS_COLLECTION + '/' + debtId).remove()
            .then(() => {
                // حذف من Firestore
                return firestore.collection(OLD_DEBTS_COLLECTION).doc(debtId).delete();
            });
    };
    
    /**
     * البحث في الديون القديمة
     */
    window.searchOldDebts = function(searchTerm) {
        const term = searchTerm.toLowerCase();
        return oldDebtsCache.filter(debt => 
            debt.customerName.toLowerCase().includes(term) ||
            debt.customerPhone.includes(term) ||
            debt.productName.toLowerCase().includes(term) ||
            (debt.id && debt.id.toLowerCase().includes(term))
        );
    };
    
    /**
     * الحصول على ديون عميل معين
     */
    window.getCustomerOldDebts = function(customerName) {
        return oldDebtsCache.filter(debt => 
            debt.customerName.toLowerCase() === customerName.toLowerCase()
        );
    };
    
    /**
     * الحصول على الديون المتأخرة
     */
    window.getOverdueOldDebts = function() {
        return oldDebtsCache.filter(debt => getOldDebtStatus(debt) === 'overdue');
    };
    
    /**
     * الحصول على الديون النشطة
     */
    window.getActiveOldDebts = function() {
        return oldDebtsCache.filter(debt => getOldDebtStatus(debt) === 'active');
    };
    
    // ====================================================================================================
    // التكامل مع النسخة الاحتياطية
    // ====================================================================================================
    
    /**
     * إضافة الديون القديمة إلى النسخة الاحتياطية
     */
    window.includeOldDebtsInBackup = function(backupData) {
        backupData.oldDebts = oldDebtsCache;
        return backupData;
    };
    
    /**
     * استعادة الديون القديمة من النسخة الاحتياطية
     */
    window.restoreOldDebtsFromBackup = function(backupData) {
        if (!backupData.oldDebts || !Array.isArray(backupData.oldDebts)) {
            console.log('⚠️ No old debts data in backup');
            return Promise.resolve();
        }
        
        const promises = backupData.oldDebts.map(debt => {
            const debtRef = database.ref(OLD_DEBTS_COLLECTION).push();
            return debtRef.set(debt)
                .then(() => {
                    // حفظ في Firestore
                    return firestore.collection(OLD_DEBTS_COLLECTION).doc(debtRef.key).set(debt);
                });
        });
        
        return Promise.all(promises);
    };
    
    // ====================================================================================================
    // إخفاء زر "إضافة دين" في صفحة إدارة الديون الحالية
    // ====================================================================================================
    
    function hideAddDebtButton() {
        // البحث عن الزر في صفحة إدارة الديون
        const addDebtButton = document.querySelector('[onclick="showAddManualDebtModal()"]');
        
        if (addDebtButton) {
            addDebtButton.style.display = 'none';
            console.log('✅ Add debt button hidden in main debts page');
        }
    }
    
    // ====================================================================================================
    // التهيئة التلقائية عند تحميل الصفحة
    // ====================================================================================================
    
    // الانتظار حتى يتم تحميل Firebase والتطبيق الرئيسي
    function waitForFirebaseAndInit() {
        if (window.firebaseInitialized && window.database && window.firestore) {
            initializeOldDebtsSystem();
            hideAddDebtButton();
        } else {
            setTimeout(waitForFirebaseAndInit, 500);
        }
    }
    
    // البدء في الانتظار
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForFirebaseAndInit);
    } else {
        waitForFirebaseAndInit();
    }
    
    console.log('📦 Old Debts Management Integration Module loaded');
    
})();