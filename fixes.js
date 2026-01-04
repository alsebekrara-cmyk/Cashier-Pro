/**
 * ملف الإصلاحات الشامل - النسخة 4 النهائية
 * حل مشكلة عدم ظهور إشعارات الرسائل من تطبيق المحامي
 * 
 * التحديثات في v4:
 * - مراقبة مباشرة لكل lawyerMessages/{lawyerId}
 * - معالجة فورية للرسائل الجديدة
 * - إزالة جميع الشروط المعقدة
 * - إضافة سجلات مفصلة جداً
 */

console.log('🔧 تحميل ملف الإصلاحات الشامل v4 - إصلاح نهائي للرسائل...');

// ===========================================
// 1. إصلاح نظام الإشعارات
// ===========================================

/**
 * فتح/إغلاق نافذة الإشعارات
 */
window.toggleNotificationModal = function() {
    const modal = document.getElementById('notification-modal');
    if (!modal) {
        console.warn('⚠️ نافذة الإشعارات غير موجودة');
        return;
    }
    
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'flex';
        renderNotificationsList();
        console.log('✅ فتح نافذة الإشعارات');
    } else {
        modal.style.display = 'none';
        console.log('✅ إغلاق نافذة الإشعارات');
    }
};

/**
 * حذف جميع الإشعارات من النافذة
 */
window.clearAllNotificationsFromModal = async function() {
    if (!confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) return;
    
    try {
        console.log('🗑️ حذف جميع الإشعارات...');
        
        // حذف من Firebase
        if (typeof db !== 'undefined' && db && typeof DB_PATHS !== 'undefined') {
            await db.ref(DB_PATHS.NOTIFICATIONS).remove();
            console.log('✅ تم الحذف من Firebase');
        }
        
        // حذف من البيانات المحلية
        data.notifications = [];
        
        if (typeof saveToLocalStorage === 'function') {
            saveToLocalStorage();
        }
        
        // تحديث العرض
        renderNotificationsList();
        updateNotificationBell();
        
        if (typeof showToast === 'function') {
            showToast('تم حذف جميع الإشعارات بنجاح', 'success');
        }
        
        console.log('✅ تم حذف جميع الإشعارات بنجاح');
    } catch (error) {
        console.error('❌ خطأ في حذف الإشعارات:', error);
        if (typeof showToast === 'function') {
            showToast('فشل حذف الإشعارات', 'error');
        }
    }
};

/**
 * عرض قائمة الإشعارات في النافذة
 */
function renderNotificationsList() {
    const list = document.getElementById('notification-list');
    if (!list) {
        console.warn('⚠️ قائمة الإشعارات غير موجودة');
        return;
    }
    
    const notifications = data.notifications || [];
    
    console.log(`📋 عرض ${notifications.length} إشعار`);
    
    if (notifications.length === 0) {
        list.innerHTML = `
            <li style="padding:40px;text-align:center;color:#94a3b8;">
                <i class="fas fa-bell-slash" style="font-size:3em;opacity:0.3;"></i>
                <p style="margin-top:10px;">لا توجد إشعارات</p>
            </li>
        `;
        return;
    }
    
    // ترتيب الإشعارات من الأحدث إلى الأقدم
    const sortedNotifications = [...notifications].sort((a, b) => {
        const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
        const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
        return timeB - timeA;
    });
    
    list.innerHTML = sortedNotifications.map(notif => {
        const icon = getNotificationIcon(notif.type);
        const time = formatNotificationTime(notif.timestamp || notif.createdAt);
        
        return `
            <li style="padding:12px 18px;border-bottom:1px solid #f1f5f9;cursor:pointer;transition:all 0.2s;" 
                onclick="handleNotificationClick('${notif.id}')"
                onmouseover="this.style.background='#f8fafc'"
                onmouseout="this.style.background='white'">
                <div style="display:flex;align-items:start;gap:12px;">
                    <i class="${icon}" style="color:#6366f1;font-size:1.2em;margin-top:3px;"></i>
                    <div style="flex:1;">
                        <div style="font-weight:600;color:#1e293b;margin-bottom:4px;">
                            ${notif.title || 'إشعار'}
                        </div>
                        <div style="font-size:0.9em;color:#64748b;line-height:1.5;">
                            ${notif.message || notif.text || ''}
                        </div>
                        <div style="font-size:0.8em;color:#94a3b8;margin-top:4px;">
                            <i class="fas fa-clock"></i> ${time}
                        </div>
                    </div>
                    <button onclick="event.stopPropagation(); deleteNotification('${notif.id}')" 
                            style="background:transparent;border:none;color:#94a3b8;cursor:pointer;padding:5px;"
                            onmouseover="this.style.color='#ef4444'"
                            onmouseout="this.style.color='#94a3b8'"
                            title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
    }).join('');
}

/**
 * الحصول على أيقونة الإشعار حسب النوع
 */
function getNotificationIcon(type) {
    const icons = {
        'message': 'fas fa-comment-dots',
        'chat': 'fas fa-comments',
        'case_status_update': 'fas fa-exchange-alt',
        'new_deduction': 'fas fa-money-bill-wave',
        'case_update': 'fas fa-gavel',
        'deduction_added': 'fas fa-plus-circle',
        'status_changed': 'fas fa-sync-alt',
        'deduction': 'fas fa-coins'
    };
    return icons[type] || 'fas fa-bell';
}

/**
 * تنسيق وقت الإشعار
 */
function formatNotificationTime(timestamp) {
    if (!timestamp) return 'الآن';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    
    return date.toLocaleDateString('ar-IQ');
}

/**
 * معالجة النقر على الإشعار
 */
window.handleNotificationClick = function(notificationId) {
    const notification = data.notifications.find(n => n.id === notificationId);
    if (!notification) {
        console.warn('⚠️ الإشعار غير موجود:', notificationId);
        return;
    }
    
    console.log('👆 نقر على الإشعار:', notification);
    
    // تحديد الإشعار كمقروء
    notification.read = true;
    updateNotificationBell();
    
    if (typeof saveToLocalStorage === 'function') {
        saveToLocalStorage();
    }
    
    // التصرف حسب نوع الإشعار
    if (notification.type === 'message' || notification.type === 'chat') {
        // فتح صفحة الدردشة مع المحامي
        if (notification.lawyerId && typeof openChatWithLawyer === 'function') {
            openChatWithLawyer(notification.lawyerId);
        } else if (notification.lawyerId && typeof navigateTo === 'function') {
            navigateTo('chat');
            setTimeout(() => {
                if (typeof selectLawyerForChat === 'function') {
                    selectLawyerForChat(notification.lawyerId);
                } else if (typeof selectLawyer === 'function') {
                    selectLawyer(notification.lawyerId);
                }
            }, 300);
        }
    } else if (notification.caseNumber && typeof navigateTo === 'function') {
        // فتح صفحة الدعاوى والبحث عن الدعوى
        navigateTo('cases');
        setTimeout(() => {
            const searchInput = document.getElementById('cases-search');
            if (searchInput) {
                searchInput.value = notification.caseNumber;
                if (typeof searchCases === 'function') {
                    searchCases();
                }
            }
        }, 300);
    }
    
    toggleNotificationModal();
};

/**
 * حذف إشعار محدد
 */
window.deleteNotification = async function(notificationId) {
    try {
        console.log('🗑️ حذف الإشعار:', notificationId);
        
        // حذف من البيانات المحلية
        const index = data.notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            data.notifications.splice(index, 1);
        }
        
        // حفظ في Firebase والتخزين المحلي
        if (typeof db !== 'undefined' && db && typeof DB_PATHS !== 'undefined') {
            await db.ref(DB_PATHS.NOTIFICATIONS).set(data.notifications);
        }
        
        if (typeof saveToLocalStorage === 'function') {
            saveToLocalStorage();
        }
        
        // تحديث العرض
        renderNotificationsList();
        updateNotificationBell();
        
        if (typeof showToast === 'function') {
            showToast('تم حذف الإشعار', 'success');
        }
        
        console.log('✅ تم حذف الإشعار بنجاح');
    } catch (error) {
        console.error('❌ خطأ في حذف الإشعار:', error);
        if (typeof showToast === 'function') {
            showToast('فشل حذف الإشعار', 'error');
        }
    }
};

/**
 * تحديث عداد الإشعارات
 */
window.updateNotificationBell = function() {
    const countElement = document.getElementById('notification-count');
    if (!countElement) {
        console.warn('⚠️ عنصر العداد غير موجود');
        return;
    }
    
    const unreadCount = (data.notifications || []).filter(n => !n.read).length;
    
    console.log(`🔔 عدد الإشعارات غير المقروءة: ${unreadCount}`);
    
    countElement.textContent = unreadCount;
    if (unreadCount > 0) {
        countElement.style.display = 'inline-block';
    } else {
        countElement.style.display = 'none';
    }
    
    // تحديث الشارة الأخرى إذا كانت موجودة
    if (typeof updateNotificationBadge === 'function') {
        updateNotificationBadge();
    }
};

// ===========================================
// 2. نظام مراقبة الرسائل المباشر
// ===========================================

// متغيرات لتتبع المراقبات
let messageListenersActive = false;
const trackedMessages = new Set(); // تتبع الرسائل التي تم معالجتها
const trackedDeductions = new Set(); // تتبع الاستقطاعات التي تم معالجتها

/**
 * إنشاء إشعار جديد
 */
function createNotification(notificationData) {
    console.log('📢 إنشاء إشعار:', notificationData.title);
    
    // تهيئة البيانات إذا لم تكن موجودة
    if (!data.notifications) {
        data.notifications = [];
    }
    
    // إنشاء معرف فريد
    const notifId = 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const newNotification = {
        ...notificationData,
        id: notifId,
        read: false,
        timestamp: notificationData.timestamp || new Date().toISOString()
    };
    
    // إضافة للبيانات المحلية
    data.notifications.unshift(newNotification);
    
    console.log('✅ تم إضافة الإشعار للبيانات المحلية:', newNotification);
    
    // حفظ في Firebase
    if (typeof db !== 'undefined' && db && typeof DB_PATHS !== 'undefined') {
        db.ref(DB_PATHS.NOTIFICATIONS).set(data.notifications)
            .then(() => console.log('✅ تم حفظ الإشعار في Firebase'))
            .catch(err => console.error('❌ خطأ في حفظ الإشعار:', err));
    }
    
    // حفظ محلياً
    if (typeof saveToLocalStorage === 'function') {
        saveToLocalStorage();
    }
    
    // تحديث العداد
    updateNotificationBell();
    
    // عرض إشعار النظام
    showSystemNotification(notificationData.title, notificationData.message);
    
    // تشغيل صوت
    playChatNotificationSound();
    
    // تحديث واجهة الإشعارات إذا كانت مفتوحة
    const modal = document.getElementById('notification-modal');
    if (modal && modal.style.display === 'flex') {
        renderNotificationsList();
    }
    
    console.log('🎉 تم إنشاء الإشعار بنجاح!');
}

/**
 * مراقبة الرسائل من تطبيق المحامي - النسخة المباشرة
 */
function setupDirectMessageListeners() {
    if (typeof db === 'undefined' || !db) {
        console.error('❌ Firebase غير متاح!');
        return;
    }
    
    if (messageListenersActive) {
        console.log('ℹ️ مراقبة الرسائل مفعّلة مسبقاً');
        return;
    }
    
    console.log('💬 بدء مراقبة الرسائل المباشرة...');
    
    // تحميل الرسائل الموجودة أولاً لتجنب الإشعارات المكررة
    db.ref('lawyerMessages').once('value', (snapshot) => {
        console.log('📊 تحميل الرسائل الموجودة...');
        
        if (snapshot.exists()) {
            snapshot.forEach((lawyerSnap) => {
                const lawyerId = lawyerSnap.key;
                lawyerSnap.forEach((msgSnap) => {
                    const msgId = msgSnap.key;
                    const uniqueKey = `${lawyerId}_${msgId}`;
                    trackedMessages.add(uniqueKey);
                });
            });
        }
        
        console.log(`✅ تم تحميل ${trackedMessages.size} رسالة موجودة`);
        
        // الآن نبدأ المراقبة الحقيقية
        startMessageMonitoring();
    });
    
    messageListenersActive = true;
}

/**
 * بدء مراقبة الرسائل الجديدة
 */
function startMessageMonitoring() {
    console.log('🔍 بدء مراقبة الرسائل الجديدة...');
    
    // مراقبة كل رسالة جديدة
    db.ref('lawyerMessages').on('child_added', (lawyerSnapshot) => {
        const lawyerId = lawyerSnapshot.key;
        console.log(`👨‍⚖️ مراقبة المحامي: ${lawyerId}`);
        
        // مراقبة رسائل هذا المحامي
        db.ref(`lawyerMessages/${lawyerId}`).on('child_added', (messageSnapshot) => {
            const messageId = messageSnapshot.key;
            const message = messageSnapshot.val();
            const uniqueKey = `${lawyerId}_${messageId}`;
            
            console.log('📨 رسالة مستلمة:', {
                lawyerId,
                messageId,
                sender: message?.sender,
                uniqueKey
            });
            
            // تخطي إذا تم معالجتها مسبقاً
            if (trackedMessages.has(uniqueKey)) {
                console.log('⏭️ الرسالة موجودة مسبقاً - تخطي');
                return;
            }
            
            // تخطي إذا لم تكن من المحامي
            if (!message || message.sender !== 'lawyer') {
                console.log('⏭️ الرسالة ليست من المحامي - تخطي');
                return;
            }
            
            // إضافة للتتبع
            trackedMessages.add(uniqueKey);
            
            console.log('✨ رسالة جديدة من المحامي!');
            
            // إضافة للبيانات المحلية
            if (!data.chatMessages) {
                data.chatMessages = {};
            }
            if (!data.chatMessages[lawyerId]) {
                data.chatMessages[lawyerId] = [];
            }
            
            // التحقق من عدم وجودها
            const exists = data.chatMessages[lawyerId].some(m => 
                m.id === messageId || 
                (m.timestamp === message.timestamp && m.message === message.message)
            );
            
            if (!exists) {
                data.chatMessages[lawyerId].push({
                    ...message,
                    id: messageId,
                    read: false
                });
                
                if (typeof saveToLocalStorage === 'function') {
                    saveToLocalStorage();
                }
                
                console.log('✅ تم إضافة الرسالة للبيانات المحلية');
            }
            
            // الحصول على اسم المحامي
            const lawyer = data.lawyers?.find(l => l.id === lawyerId);
            const lawyerName = lawyer ? lawyer.name : 'محامي';
            
            const messageText = message.message || message.text || '';
            
            // إنشاء الإشعار
            console.log('📤 إنشاء إشعار للرسالة...');
            createNotification({
                type: 'message',
                title: `رسالة جديدة من ${lawyerName}`,
                message: messageText.substring(0, 100) + (messageText.length > 100 ? '...' : ''),
                lawyerId: lawyerId,
                messageId: messageId
            });
            
            // تحديث واجهة الدردشة إذا كانت مفتوحة
            if (typeof renderChatMessages === 'function' && window.selectedLawyerForChat === lawyerId) {
                renderChatMessages();
            }
        });
    });
    
    console.log('✅ تم تفعيل مراقبة الرسائل بنجاح');
}

/**
 * مراقبة الاستقطاعات الجديدة
 */
function setupDirectDeductionListeners() {
    if (typeof db === 'undefined' || !db) {
        console.error('❌ Firebase غير متاح!');
        return;
    }
    
    console.log('💰 بدء مراقبة الاستقطاعات...');
    
    // تحميل الاستقطاعات الموجودة أولاً
    db.ref('deductions').once('value', (snapshot) => {
        console.log('📊 تحميل الاستقطاعات الموجودة...');
        
        if (snapshot.exists()) {
            snapshot.forEach((dedSnap) => {
                trackedDeductions.add(dedSnap.key);
            });
        }
        
        console.log(`✅ تم تحميل ${trackedDeductions.size} استقطاع موجود`);
    });
    
    // مراقبة الاستقطاعات الجديدة
    db.ref('deductions').on('child_added', (snapshot) => {
        const deductionId = snapshot.key;
        const deduction = snapshot.val();
        
        console.log('💰 استقطاع مستلم:', {
            id: deductionId,
            caseNumber: deduction?.caseNumber,
            amount: deduction?.amount
        });
        
        // تخطي إذا تم معالجته مسبقاً
        if (trackedDeductions.has(deductionId)) {
            console.log('⏭️ الاستقطاع موجود مسبقاً - تخطي');
            return;
        }
        
        // إضافة للتتبع
        trackedDeductions.add(deductionId);
        
        console.log('✨ استقطاع جديد!');
        
        // إضافة للبيانات المحلية
        if (!data.deductions) {
            data.deductions = [];
        }
        
        const exists = data.deductions.some(d => 
            d.id === deductionId ||
            (d.caseNumber === deduction.caseNumber && 
             d.amount === deduction.amount && 
             d.date === deduction.date)
        );
        
        if (!exists) {
            data.deductions.push({
                ...deduction,
                id: deductionId
            });
            
            if (typeof saveToLocalStorage === 'function') {
                saveToLocalStorage();
            }
            
            console.log('✅ تم إضافة الاستقطاع للبيانات المحلية');
            
            // إعادة رسم الجدول
            if (typeof renderDeductionsTable === 'function') {
                renderDeductionsTable();
            }
        }
        
        // إنشاء الإشعار
        console.log('📤 إنشاء إشعار للاستقطاع...');
        createNotification({
            type: 'new_deduction',
            title: 'استقطاع جديد',
            message: `تم إضافة استقطاع جديد للدعوى ${deduction.caseNumber} بمبلغ ${formatCurrency(deduction.amount)}`,
            caseNumber: deduction.caseNumber,
            amount: deduction.amount
        });
        
        // تحديث لوحة المعلومات
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
    });
    
    console.log('✅ تم تفعيل مراقبة الاستقطاعات بنجاح');
}

/**
 * مراقبة تحديثات حالة الدعوى
 */
function setupDirectCaseListeners() {
    if (typeof db === 'undefined' || !db) {
        console.error('❌ Firebase غير متاح!');
        return;
    }
    
    console.log('📝 بدء مراقبة تحديثات الدعاوى...');
    
    db.ref('cases').on('child_changed', (snapshot) => {
        const caseId = snapshot.key;
        const updatedCase = snapshot.val();
        
        console.log('📝 تحديث دعوى:', updatedCase?.caseNumber);
        
        // تحديث في البيانات المحلية
        const index = data.cases?.findIndex(c => c.id === caseId);
        if (index !== -1 && index !== undefined) {
            const oldCase = data.cases[index];
            data.cases[index] = { ...updatedCase, id: caseId };
            
            if (typeof saveToLocalStorage === 'function') {
                saveToLocalStorage();
            }
            
            // إنشاء إشعار إذا تغيرت الحالة
            if (oldCase.status !== updatedCase.status) {
                console.log('📤 إنشاء إشعار لتحديث الحالة...');
                createNotification({
                    type: 'case_status_update',
                    title: 'تحديث حالة الدعوى',
                    message: `تم تحديث حالة الدعوى ${updatedCase.caseNumber} من "${oldCase.status}" إلى "${updatedCase.status}"`,
                    caseNumber: updatedCase.caseNumber,
                    caseId: caseId
                });
            }
            
            // إعادة رسم الجداول
            if (typeof renderCasesTable === 'function') {
                renderCasesTable();
            }
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
        }
    });
    
    console.log('✅ تم تفعيل مراقبة الدعاوى بنجاح');
}

/**
 * عرض إشعار النظام
 */
function showSystemNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification(title, {
                body: body,
                icon: 'lawyer-mobile-app/new-favicon.png',
                badge: 'lawyer-mobile-app/new-favicon.png'
            });
        } catch (e) {
            console.log('لا يمكن عرض إشعار النظام');
        }
    }
}

/**
 * تشغيل صوت الإشعار
 */
function playChatNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('لا يمكن تشغيل صوت الإشعار');
    }
}

/**
 * تنسيق العملة
 */
function formatCurrency(amount) {
    if (!amount && amount !== 0) return '0 د.ع';
    return new Intl.NumberFormat('ar-IQ').format(amount) + ' د.ع';
}

/**
 * تهيئة جميع المراقبات
 */
function initializeAllDirectListeners() {
    console.log('🚀 تهيئة جميع المراقبات المباشرة...');
    
    // طلب إذن الإشعارات
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('إذن الإشعارات:', permission);
        });
    }
    
    // تهيئة البيانات
    if (!data.notifications) data.notifications = [];
    if (!data.chatMessages) data.chatMessages = {};
    if (!data.deductions) data.deductions = [];
    if (!data.cases) data.cases = [];
    
    // تهيئة المراقبات
    setupDirectMessageListeners();
    setupDirectDeductionListeners();
    setupDirectCaseListeners();
    
    // تحديث العداد
    updateNotificationBell();
    
    console.log('✅ تم تفعيل جميع المراقبات المباشرة بنجاح!');
}

// ===========================================
// 3. التهيئة التلقائية
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 بدء التهيئة التلقائية v4...');
    
    let attempts = 0;
    const maxAttempts = 60;
    
    const checkReady = setInterval(() => {
        attempts++;
        
        const firebaseReady = typeof db !== 'undefined' && db;
        const dataReady = typeof data !== 'undefined' && data;
        const pathsReady = typeof DB_PATHS !== 'undefined';
        
        if (firebaseReady && dataReady && pathsReady) {
            clearInterval(checkReady);
            console.log('✅ النظام جاهز - بدء التهيئة');
            
            setTimeout(() => {
                initializeAllDirectListeners();
            }, 2000);
            
        } else if (attempts >= maxAttempts) {
            clearInterval(checkReady);
            console.error('❌ فشل التهيئة بعد 30 ثانية');
            console.log('حالة النظام:', { firebaseReady, dataReady, pathsReady });
        } else if (attempts % 10 === 0) {
            console.log(`⏳ انتظار النظام... (${attempts}/${maxAttempts})`);
        }
    }, 500);
});

// تصدير الوظائف
window.DirectNotifications = {
    toggleNotificationModal,
    clearAllNotificationsFromModal,
    handleNotificationClick,
    deleteNotification,
    updateNotificationBell,
    initializeAllDirectListeners,
    createNotification
};

console.log('✅ تم تحميل ملف الإصلاحات الشامل v4 بنجاح!');