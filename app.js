// دوال وهمية لمنع الخطأ بعد تعطيل النظام القديم
var notificationsState = [];

function deleteAllNotifications() {
    // النظام الجديد في fixes.js هو المسؤول عن حذف الإشعارات
}

function markAllNotificationsRead() {
    // النظام الجديد في fixes.js هو المسؤول عن تعيين الإشعارات كمقروءة
}
// دوال وهمية لمنع الخطأ بعد تعطيل النظام القديم
function getNotifications() {
    // النظام الجديد في fixes.js هو المسؤول عن الإشعارات
    return [];
}

function updateChatBadge() {
    // النظام الجديد في fixes.js هو المسؤول عن شارة الدردشة
}
// تم تعطيل نظام الإشعارات القديم بالكامل لصالح fixes.js


function markAllNotificationsRead() {
    notificationsState.forEach(n => n.read = true);
    updateNotificationBell();
}

function markNotificationRead(id) {
    const n = notificationsState.find(n => n.id === id);
    if (n) n.read = true;
    updateNotificationBell();
}

async function deleteNotification(id) {
    // إشعار دردشة: حذف فعلي
    const notif = (data.notifications || []).find(n => n.id === id);
    if (notif && firebaseInitialized) {
        try {
            await db.ref(DB_PATHS.NOTIFICATIONS).child(id).remove();
            data.notifications = data.notifications.filter(n => n.id !== id);
            notificationsState = notificationsState.filter(n => n.id !== id);
        } catch (err) {
            console.error('فشل حذف الإشعار من Firebase:', err);
            showToast('فشل حذف الإشعار من قاعدة البيانات', 'error');
        }
    } else {
        // إشعار دعوى: أضف المعرف لقائمة المحذوفين
        if (!deletedNotificationIds.includes(id)) {
            deletedNotificationIds.push(id);
            saveDeletedNotificationIds();
        }
        notificationsState = notificationsState.filter(n => n.id !== id);
    }
    updateNotificationBell();
}
// دالة لإضافة إشعار دردشة إلى Firebase وقائمة الإشعارات
async function addChatNotification(lawyerId, lawyerName, message) {
    const notification = {
        id: generateId(),
        type: 'chat',
        message: `<b>رسالة جديدة من المحامي ${lawyerName}:</b> ${message}`,
        reason: 'رسالة دردشة جديدة',
        read: false,
        timestamp: new Date().toISOString(),
        lawyerId: lawyerId,
        lawyerName: lawyerName
    };
    // أضف إلى Firebase
    if (firebaseInitialized) {
        try {
            await db.ref(DB_PATHS.NOTIFICATIONS).child(notification.id).set(notification);
            data.notifications.push(notification);
        } catch (err) {
            console.error('فشل إضافة إشعار الدردشة إلى Firebase:', err);
        }
    } else {
        data.notifications.push(notification);
    }
    updateNotificationBell();
}

function updateNotificationBell() {
    const notifications = getNotifications();
    // عد فقط الإشعارات غير المقروءة
    const count = notifications.filter(n => !n.read).length;
    const bell = document.getElementById('notification-bell');
    const countSpan = document.getElementById('notification-count');
    const modal = document.getElementById('notification-modal');
    const list = document.getElementById('notification-list');
    if (!bell || !countSpan || !modal || !list) return;
    if (count > 0) {
        countSpan.textContent = count;
        countSpan.style.display = 'inline-block';
    } else {
        countSpan.style.display = 'none';
    }
    // بناء قائمة الإشعارات
    list.innerHTML = notifications.map((n, idx) => {
        let icon = '<i class="fas fa-bell"></i>';
        if (n.type === 'new') icon = '<i class="fas fa-plus-circle" style="color:#10b981;"></i>';
        if (n.type === 'deducted-mobile') icon = '<i class="fas fa-mobile-alt" style="color:#10b981;"></i>';
        if (n.type === 'late') icon = '<i class="fas fa-exclamation-triangle" style="color:#ef4444;"></i>';
        if (n.type === 'chat') icon = '<i class="fas fa-comments" style="color:#6366f1;"></i>';
        let liStyle = `padding:10px 18px;border-bottom:1px solid #eee;display:flex;align-items:center;gap:10px;cursor:pointer;${n.read ? 'opacity:0.5;' : ''}`;
        let deleteBtn = `<button onclick=\"event.stopPropagation();(async()=>{await deleteNotification('${n.id}');updateNotificationBell();})()\" style=\"margin-right:auto;background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px;\" title=\"حذف الإشعار\"><i class='fas fa-trash'></i></button>`;
        // إشعار دردشة ينقل للمحادثة
        if (n.type === 'chat' && n.lawyerId) {
            return `<li style="${liStyle}" onclick="markNotificationRead('${n.id}');goToChatByLawyerId('${n.lawyerId}')">
                ${icon}
                <span>${n.message}<br><span style='color:#64748b;font-size:0.95em;'>${n.reason || ''}</span></span>
                ${deleteBtn}
            </li>`;
        } else if (n.type === 'deducted-mobile' && n.message.includes('رقم')) {
            const match = n.message.match(/رقم <b>(\d+)<\/b>/);
            const caseNumber = match ? match[1] : null;
            const amountMatch = n.message.match(/مبلغ <b>([\d,\.]+)<\/b>/);
            const amount = amountMatch ? amountMatch[1].replace(/,/g, '') : null;
            return `<li style="${liStyle}" onclick="markNotificationRead('${n.id}');goToDeductionByCaseAndAmount('${caseNumber}','${amount}')">
                ${icon}
                <span>${n.message}<br><span style='color:#64748b;font-size:0.95em;'>${n.reason}</span></span>
                ${deleteBtn}
            </li>`;
        } else if ((n.type === 'new' || n.type === 'late') && n.caseNumber) {
            return `<li style="${liStyle}" onclick="markNotificationRead('${n.id}');goToCaseByNumber('${n.caseNumber}')">
                ${icon}
                <span>${n.message}<br><span style='color:#64748b;font-size:0.95em;'>${n.reason}</span></span>
                ${deleteBtn}
            </li>`;
        } else {
            return `<li style="${liStyle}">
                ${icon}
                <span>${n.message}<br><span style='color:#64748b;font-size:0.95em;'>${n.reason || ''}</span></span>
                ${deleteBtn}
            </li>`;
        }
    }).join('');
// دالة التنقل إلى صفحة الدعوى والتركيز عليها
window.goToCaseByNumber = function(caseNumber) {
    // الانتقال إلى صفحة الدعاوى
    const casesBtn = document.querySelector('[data-page="cases"]');
    if (casesBtn) {
        casesBtn.click();
    }
    // بعد الانتقال، انتظر حتى يتم عرض الجدول ثم ركز على الدعوى
    setTimeout(() => {
        const rows = document.querySelectorAll('#cases-table tr');
        rows.forEach(row => {
            if (row.innerHTML.includes(caseNumber)) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                row.style.background = '#fffbe6';
                setTimeout(() => { row.style.background = ''; }, 2000);
            }
        });
    }, 500);
}
}

// دالة التنقل إلى صفحة الاستقطاعات والتركيز على الاستقطاع المرتبط
window.goToDeductionByCaseAndAmount = function(caseNumber, amount) {
    // الانتقال إلى صفحة الاستقطاعات
    const deductionsBtn = document.querySelector('[data-page="deductions"]');
    if (deductionsBtn) {
        deductionsBtn.click();
    }
    // بعد الانتقال، انتظر حتى يتم عرض الجدول ثم ركز على الاستقطاع
    setTimeout(() => {
        const rows = document.querySelectorAll('#deductions-table tr');
        rows.forEach(row => {
            if (row.innerHTML.includes(caseNumber) && row.innerHTML.includes(amount)) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                row.style.background = '#fffbe6';
                setTimeout(() => { row.style.background = ''; }, 2000);
            }
        });
    }, 500);
}

// دالة التنقل إلى صفحة الاستقطاعات والتركيز على الاستقطاع المرتبط
window.goToDeductionByCase = function(caseNumber) {
    // الانتقال إلى صفحة الاستقطاعات
    const deductionsBtn = document.querySelector('[data-page="deductions"]');
    if (deductionsBtn) {
        deductionsBtn.click();
    }
    // بعد الانتقال، انتظر حتى يتم عرض الجدول ثم ركز على الاستقطاع
    setTimeout(() => {
        const rows = document.querySelectorAll('#deductions-table tr');
        rows.forEach(row => {
            if (row.innerHTML.includes(caseNumber)) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                row.style.background = '#fffbe6';
                setTimeout(() => { row.style.background = ''; }, 2000);
            }
        });
    }, 500);
}

// تفعيل عرض قائمة الإشعارات عند الضغط على الجرس
document.addEventListener('DOMContentLoaded', () => {
    const bell = document.getElementById('notification-bell');
    const modal = document.getElementById('notification-modal');
    const closeBtn = document.getElementById('close-notification-modal');
    const deleteAllBtn = document.getElementById('delete-all-notifications-btn');
    updateNotificationBell();
    if (bell && modal) {
        bell.addEventListener('click', (e) => {
            e.stopPropagation();
            modal.style.display = 'flex';
            markAllNotificationsRead();
        });
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                modal.style.display = 'none';
            });
        }
        // إغلاق النافذة عند النقر خارجها
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        // زر حذف جميع الإشعارات (سيتم تفعيله لاحقاً)
        if (deleteAllBtn) {
            deleteAllBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await deleteAllNotifications();
                updateNotificationBell();
            });
        }
    }
});

// تحديث الإشعارات عند أي تغيير في البيانات
function refreshNotifications() {
    updateNotificationBell();
}
// استدعاء التحديث بعد عمليات الإضافة أو التعديل أو الاستيراد
// مثال: بعد إضافة استقطاع جديد أو استيراد بيانات
// refreshNotifications();
// دالة البحث في الاستقطاعات

// تحديث renderDeductionsTable لقبول مصفوفة مفلترة
// دالة عرض جدول الاستقطاعات مع دعم التصفية
// البحث عن قضية أو مدعى عليه في نافذة الاستقطاع الجديد
function searchCaseOrDefendant() {
    const input = document.getElementById('deduction-search-input');
    const resultsBox = document.getElementById('deduction-search-results');
    const value = input.value.trim().toLowerCase();
    if (!value) {
        resultsBox.style.display = 'none';
        resultsBox.innerHTML = '';
        return;
    }
    // البحث في القضايا والمدعى عليهم بشكل ذكي
    let results = [];
    // البحث في القضايا
    data.cases.forEach(c => {
        const caseNumber = (c.caseNumber || '').toString();
        const defendant = (c.defendantName || c.defendant || '').toString();
        // البحث في أي جزء من رقم الدعوى أو اسم المدعى عليه (غير حساس لحالة الأحرف)
        if (
            caseNumber.toLowerCase().includes(value) ||
            defendant.toLowerCase().includes(value)
        ) {
            results.push({
                type: 'case',
                caseNumber: c.caseNumber,
                defendant: defendant,
                display: `الدعوى رقم <strong>${c.caseNumber}</strong> - المدعى عليه: <strong>${defendant || 'غير محدد'}</strong>`
            });
        }
    });
    // البحث في المدعى عليهم (دعم البحث الجزئي)
    if (data.defendants) {
        data.defendants.forEach(d => {
            const name = (d.name || '').toString();
            if (name.toLowerCase().includes(value)) {
                results.push({
                    type: 'defendant',
                    defendant: name,
                    display: `مدعى عليه: <strong>${name}</strong>`
                });
            }
        });
    }
    if (results.length === 0) {
        resultsBox.innerHTML = '<div style="padding:8px;color:#64748b;">لا توجد نتائج</div>';
        resultsBox.style.display = 'block';
        return;
    }
    resultsBox.innerHTML = results.map(r => `<div style="padding:8px;cursor:pointer;border-bottom:1px solid #eee;" onclick="selectDeductionSearchResult('${r.caseNumber||''}','${r.defendant||''}')">${r.display}</div>`).join('');
    resultsBox.style.display = 'block';
}

// عند اختيار نتيجة البحث تعبئة النموذج تلقائياً
function selectDeductionSearchResult(caseNumber, defendant) {
    document.getElementById('new-deduction-case').value = caseNumber;
    document.getElementById('deduction-search-input').value = caseNumber || defendant;
    // إخفاء النتائج بعد اختيار أي نتيجة
    setTimeout(() => {
        document.getElementById('deduction-search-results').style.display = 'none';
        document.getElementById('deduction-search-results').innerHTML = '';
    }, 100);
}
// دالة عرض إشعار Toast في التطبيق
function showToast(message, type = 'info', title = '') {
    // إنشاء عنصر التوست إذا لم يكن موجوداً
    let toast = document.getElementById('main-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'main-toast';
        toast.style.position = 'fixed';
        toast.style.top = '30px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.zIndex = '9999';
        toast.style.minWidth = '220px';
        toast.style.maxWidth = '400px';
        toast.style.padding = '16px 24px';
        toast.style.borderRadius = '12px';
        toast.style.fontSize = '16px';
        toast.style.fontWeight = 'bold';
        toast.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
        toast.style.textAlign = 'center';
        toast.style.display = 'none';
        document.body.appendChild(toast);
    }
    // تحديد لون التوست حسب النوع
    let bg = '#6366f1', color = 'white';
    if (type === 'success') bg = '#10b981';
    if (type === 'error') bg = '#ef4444';
    if (type === 'warning') bg = '#f59e0b';
    if (type === 'info') bg = '#6366f1';
    toast.style.background = bg;
    toast.style.color = color;
    toast.innerHTML = title ? `<div style='font-size:14px;'>${title}</div>${message}` : message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2500);
}
// دالة بحث المدعى عليه وعرض المبلغ المتبقي عليه في نافذة استقطاع جديد
function searchDefendantForDeduction() {
    const searchInput = document.getElementById('deduction-defendant-search');
    const remainingInput = document.getElementById('deduction-defendant-remaining');
    const name = searchInput.value.trim();
    if (!name) {
        remainingInput.value = '';
        return;
    }
    // البحث في قائمة المدعى عليهم
    const defendant = data.defendants.find(d => d.name.includes(name));
    if (defendant) {
        // حساب المبلغ المتبقي عليه من جميع الدعاوى المرتبطة
        let totalAmount = 0;
        let paidAmount = 0;
        // البحث عن الدعاوى المرتبطة بهذا المدعى عليه
        data.cases.forEach(c => {
            if ((c.defendantName || c.defendant) === defendant.name) {
                totalAmount += parseFloat(c.amount) || 0;
                // جمع الاستقطاعات المدفوعة
                data.deductions.forEach(ded => {
                    if (ded.caseNumber === c.caseNumber && ded.defendant === defendant.name) {
                        paidAmount += parseFloat(ded.amount) || 0;
                    }
                });
            }
        });
        const remaining = totalAmount - paidAmount;
        remainingInput.value = remaining > 0 ? remaining.toLocaleString() + ' د.ع' : 'لا يوجد مبلغ متبقي';
    } else {
        remainingInput.value = 'لم يتم العثور على المدعى عليه';
    }
}
// استيراد بيانات الاستقطاعات من ملف JSON
function importDeductions() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    data.deductions = data.deductions.concat(imported);
                } else if (imported.deductions && Array.isArray(imported.deductions)) {
                    data.deductions = data.deductions.concat(imported.deductions);
                }
                renderDeductionsTable();
                alert('تم استيراد البيانات بنجاح');
            } catch (err) {
                alert('حدث خطأ في قراءة الملف: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// تصدير بيانات الاستقطاعات إلى ملف JSON
function exportDeductions() {
    const exportData = JSON.stringify(data.deductions, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deductions-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ربط الأزرار بوظائف الاستيراد والتصدير
document.getElementById('import-deductions-btn')?.addEventListener('click', importDeductions);
document.getElementById('export-deductions-btn')?.addEventListener('click', exportDeductions);
// تحديث حالة الاستقطاع مباشرة من الجدول
function updateDeductionStatus(id, newStatus) {
    const deduction = data.deductions.find(d => d.id === id);
    if (deduction) {
        deduction.status = newStatus;
        // يمكن هنا إضافة كود لحفظ التغيير في قاعدة البيانات أو ملف خارجي إذا لزم الأمر
        renderDeductionsTable();
    }
}
/**
 * تطبيق الإدارة القانونية - الملف الرئيسي
 * جميع الوظائف والمنطق الأساسي للتطبيق
 */

// ==================== المتغيرات العامة ====================
let db = null;
let currentUser = null;
let data = {
    cases: [],
    defendants: [],
    lawyers: [],
    deductions: [],
    notifications: [],
    templates: [],
    chatMessages: {}
};

let selectedLawyerForChat = null;
let firebaseInitialized = false;

// ==================== تهيئة Firebase ====================
function initFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.database();
        firebaseInitialized = true;
        console.log('✅ تم تهيئة Firebase بنجاح');
        
        // بدء الاستماع للتحديثات
        setupFirebaseListeners();
        
        // تحميل البيانات من Firebase
        loadDataFromFirebase();
        
    } catch (error) {
        console.error('خطأ في تهيئة Firebase:', error);
        firebaseInitialized = false;
        showToast('تحذير', 'فشل الاتصال بالسحابة، سيتم العمل بوضع محلي فقط', 'warning');
    }
}

// ==================== إعداد مستمعي Firebase ====================
function setupFirebaseListeners() {
    if (!firebaseInitialized) return;

    // مستمع الدعاوى
    db.ref(DB_PATHS.CASES).on('value', (snapshot) => {
        if (snapshot.exists()) {
            const cases = [];
            snapshot.forEach((child) => {
                const caseData = child.val();
                if (caseData && !caseData.deleted) {
                    // ✅ تحويل ID إلى string ووضعه بعد spread
                    cases.push({ ...caseData, id: String(child.key) });
                }
            });
            data.cases = cases;
            saveToLocalStorage();
            updateDashboard();
            renderCasesTable();
        }
    });

    // مستمع المدعى عليهم
    db.ref(DB_PATHS.DEFENDANTS).on('value', (snapshot) => {
        if (snapshot.exists()) {
            const defendants = [];
            snapshot.forEach((child) => {
                const defendantData = child.val();
                if (defendantData && !defendantData.deleted) {
                    defendants.push({ ...defendantData, id: String(child.key) });
                }
            });
            data.defendants = defendants;
            saveToLocalStorage();
            renderDefendantsTable();
        }
    });

    // مستمع المحامين
    db.ref(DB_PATHS.LAWYERS).on('value', (snapshot) => {
        if (snapshot.exists()) {
            const lawyers = [];
            snapshot.forEach((child) => {
                const lawyerData = child.val();
                if (lawyerData && !lawyerData.deleted) {
                    lawyers.push({ ...lawyerData, id: String(child.key) });
                }
            });
            data.lawyers = lawyers;
            saveToLocalStorage();
            renderLawyersTable();
            updateLawyerSelectOptions();
            renderLawyersChatList();
        }
    });

    // مستمع الاستقطاعات
    db.ref(DB_PATHS.DEDUCTIONS).on('value', (snapshot) => {
        if (snapshot.exists()) {
            const deductions = [];
            snapshot.forEach((child) => {
                const deductionData = child.val();
                if (deductionData && !deductionData.deleted) {
                    deductions.push({ ...deductionData, id: String(child.key) });
                }
            });
            data.deductions = deductions;
            saveToLocalStorage();
            renderDeductionsTable();
            // تحديث الإشعارات بعد جلب الاستقطاعات
            refreshNotifications();
        }
    });

    // مستمع الإشعارات
    db.ref(DB_PATHS.NOTIFICATIONS).on('value', (snapshot) => {
        if (snapshot.exists()) {
            const notifications = [];
            snapshot.forEach((child) => {
                const notifData = child.val();
                if (notifData && !notifData.deleted) {
                    notifications.push({ ...notifData, id: String(child.key) });
                }
            });
            data.notifications = notifications;
            saveToLocalStorage();
            updateNotificationBadge();
            renderNotifications();
        }
    });

    // مستمع رسائل المحامين
    db.ref(DB_PATHS.CHAT).on('value', (snapshot) => {
        if (snapshot.exists()) {
            const chatMessages = {};
            const previousMessages = { ...data.chatMessages }; // حفظ الرسائل القديمة
            
            snapshot.forEach((lawyerSnapshot) => {
                const lawyerId = lawyerSnapshot.key;
                const messages = [];
                lawyerSnapshot.forEach((msgSnapshot) => {
                    const msgData = msgSnapshot.val();
                    if (msgData) {
                        messages.push({ ...msgData, id: String(msgSnapshot.key) });
                    }
                });
                // ترتيب الرسائل حسب التاريخ
                messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                chatMessages[lawyerId] = messages;
                
                // 🔔 التحقق من وجود رسائل جديدة من المحامي
                if (previousMessages[lawyerId]) {
                    const newMessages = messages.filter(msg => 
                        msg.sender === 'lawyer' && 
                        !previousMessages[lawyerId].find(oldMsg => oldMsg.id === msg.id)
                    );
                    
                    // إظهار إشعار للرسائل الجديدة
                    newMessages.forEach(newMsg => {
                        const lawyer = data.lawyers.find(l => l.id === lawyerId);
                        const lawyerName = lawyer ? lawyer.name : 'محامي';
                        
                        // إضافة إشعار دردشة إلى النظام
                        addChatNotification(lawyerId, lawyerName, newMsg.message);
                        
                        // تشغيل صوت الإشعار
                        playChatNotificationSound();
                    });
                }
            });
            
            data.chatMessages = chatMessages;
            saveToLocalStorage();
            
            // تحديث قائمة المحامين لإظهار العداد
            renderLawyersChatList();
            
            // تحديث شارة الدردشة العامة
            updateChatBadge();
            
            // تحديث عرض الرسائل إذا كان المحامي المحدد موجود
            if (selectedLawyerForChat && document.getElementById('chat-page').classList.contains('active')) {
                renderChatMessages();
            }
        }
    });

    console.log('✅ تم إعداد مستمعي Firebase');
}

// ==================== تحميل البيانات من Firebase ====================
async function loadDataFromFirebase() {
    if (!firebaseInitialized) {
        loadFromLocalStorage();
        return;
    }

    try {
        // تحميل الدعاوى
        const casesSnapshot = await db.ref(DB_PATHS.CASES).once('value');
        if (casesSnapshot.exists()) {
            data.cases = [];
            casesSnapshot.forEach((child) => {
                const caseData = child.val();
                if (!caseData.deleted) {
                    // ✅ وضع id بعد spread لضمان أن child.key له الأولوية
                    data.cases.push({ ...caseData, id: String(child.key) });
                }
            });
        }

        // تحميل المدعى عليهم
        const defendantsSnapshot = await db.ref(DB_PATHS.DEFENDANTS).once('value');
        if (defendantsSnapshot.exists()) {
            data.defendants = [];
            defendantsSnapshot.forEach((child) => {
                const defendantData = child.val();
                if (!defendantData.deleted) {
                    data.defendants.push({ ...defendantData, id: String(child.key) });
                }
            });
        }

        // تحميل المحامين
        const lawyersSnapshot = await db.ref(DB_PATHS.LAWYERS).once('value');
        if (lawyersSnapshot.exists()) {
            data.lawyers = [];
            lawyersSnapshot.forEach((child) => {
                const lawyerData = child.val();
                if (!lawyerData.deleted) {
                    data.lawyers.push({ ...lawyerData, id: String(child.key) });
                }
            });
        }

        // تحميل الاستقطاعات
        const deductionsSnapshot = await db.ref(DB_PATHS.DEDUCTIONS).once('value');
        if (deductionsSnapshot.exists()) {
            data.deductions = [];
            deductionsSnapshot.forEach((child) => {
                const deductionData = child.val();
                if (!deductionData.deleted) {
                    data.deductions.push({ ...deductionData, id: String(child.key) });
                }
            });
        }

        // تحميل الإشعارات
        const notificationsSnapshot = await db.ref(DB_PATHS.NOTIFICATIONS).once('value');
        if (notificationsSnapshot.exists()) {
            data.notifications = [];
            notificationsSnapshot.forEach((child) => {
                const notifData = child.val();
                if (!notifData.deleted) {
                    data.notifications.push({ ...notifData, id: String(child.key) });
                }
            });
        }

        saveToLocalStorage();
        console.log('✅ تم تحميل البيانات من Firebase');
        
    } catch (error) {
        console.error('خطأ في تحميل البيانات من Firebase:', error);
        loadFromLocalStorage();
    }
}

// ==================== حفظ/تحميل البيانات المحلية ====================
function saveToLocalStorage() {
    try {
        localStorage.setItem('legalAppData', JSON.stringify(data));
        localStorage.setItem('lastUpdate', new Date().toISOString());
    } catch (error) {
        console.error('خطأ في حفظ البيانات المحلية:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('legalAppData');
        if (savedData) {
            data = JSON.parse(savedData);
            
            // ✅ إصلاح IDs تلقائياً عند التحميل لجميع الكيانات
            let fixed = 0;
            
            // إصلاح IDs الدعاوى
            data.cases = data.cases.map(c => {
                if (typeof c.id !== 'string') {
                    c.id = String(c.id);
                    fixed++;
                }
                return c;
            });
            
            // إصلاح IDs المدعى عليهم
            data.defendants = data.defendants.map(d => {
                if (typeof d.id !== 'string') {
                    d.id = String(d.id);
                    fixed++;
                }
                return d;
            });
            
            // إصلاح IDs المحامين
            data.lawyers = data.lawyers.map(l => {
                if (typeof l.id !== 'string') {
                    l.id = String(l.id);
                    fixed++;
                }
                return l;
            });
            
            // إصلاح IDs الاستقطاعات
            data.deductions = data.deductions.map(d => {
                if (typeof d.id !== 'string') {
                    d.id = String(d.id);
                    fixed++;
                }
                return d;
            });
            
            if (fixed > 0) {
                console.log(`🔧 تم إصلاح ${fixed} معرّف تلقائياً`);
                localStorage.setItem('legalAppData', JSON.stringify(data));
            }
            
            console.log('✅ تم تحميل البيانات المحلية');
        }
        
        const lastUpdate = localStorage.getItem('lastUpdate');
        if (lastUpdate) {
            const lastUpdateEl = document.getElementById('last-update-time');
            if (lastUpdateEl) {
                lastUpdateEl.textContent = new Date(lastUpdate).toLocaleString('ar-IQ');
            }
        }
    } catch (error) {
        console.error('خطأ في تحميل البيانات المحلية:', error);
    }
}

// ==================== دوال مساعدة ====================
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function formatCurrency(amount) {
    if (!amount && amount !== 0) return '0 IQD';
    return new Intl.NumberFormat('ar-IQ', {
        style: 'currency',
        currency: 'IQD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ar-IQ');
}

function formatDateTime(date) {
    if (!date) return '';
    return new Date(date).toLocaleString('ar-IQ');
}

// ==================== التنقل ====================
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.getAttribute('data-page');
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // إظهار الصفحة المطلوبة
    document.getElementById(page + '-page').classList.add('active');
    
    // تحديث الأزرار
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-page') === page) {
            btn.classList.add('active');
        }
    });
    
    // تحديث العنوان الفرعي
    const titles = {
        'dashboard': 'لوحة التحكم',
        'cases': 'إدارة الدعاوى',
        'defendants': 'المدعى عليهم',
        'lawyers': 'المحامين',
        'deductions': 'الاستقطاعات',
        'templates': 'قوالب الدعاوى',
        'chat': 'الدردشة',
        'settings': 'الإعدادات'
    };
    
    const subtitleElement = document.getElementById('page-subtitle');
    if (subtitleElement) {
        subtitleElement.textContent = titles[page] || 'لوحة التحكم';
    }
    
    // تحديث العنوان القديم إذا كان موجوداً (للتوافق)
    const pageTitleElement = document.getElementById('page-title');
    if (pageTitleElement) {
        pageTitleElement.textContent = titles[page] || 'لوحة التحكم';
    }
    
    // تحديث المحتوى
    if (page === 'dashboard') updateDashboard();
    if (page === 'cases') renderCasesTable();
    if (page === 'defendants') renderDefendantsTable();
    if (page === 'lawyers') renderLawyersTable();
    if (page === 'deductions') renderDeductionsTable();
    if (page === 'templates') updateTemplate();
    if (page === 'recent-cases') {
        renderRecentCasesFullTable();
    }
    if (page === 'chat') {
        // إعادة تعيين حالة الدردشة عند الدخول للصفحة
        backToLawyersList();
        renderLawyersChatList();
    }
}

// ==================== لوحة التحكم ====================
function updateDashboard() {
    // إحصائيات الدعاوى
    const totalCases = data.cases.length;
    const pendingCases = data.cases.filter(c => 
        c.status === 'مرفوع' || c.status === 'في المحكمة'
    ).length;
    const completedCases = data.cases.filter(c => c.status === 'مغلق').length;
    
    // إحصائيات مالية
    const totalAmount = data.cases.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    // عدد القضايا الفريدة التي تم استقطاعها
    const uniqueDeductedCases = new Set(data.deductions.map(d => d.caseNumber));
    const totalDeductions = data.deductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    
    // حساب عدد الدعاوى الأخيرة (آخر 20 دعوى)
    const recentCasesCount = data.cases.length >= 20 ? 20 : data.cases.length;
    
    // حساب عدد المحامين
    const totalLawyers = data.lawyers.length;
    
    // تحديث العرض (مع التحقق من وجود العناصر)
    const statRecentCases = document.getElementById('stat-recent-cases');
    const statTotalLawyers = document.getElementById('stat-total-lawyers');
    const statTotalCases = document.getElementById('stat-total-cases');
    const statPendingCases = document.getElementById('stat-pending-cases');
    const statCompletedCases = document.getElementById('stat-completed-cases');
    const statTotalAmount = document.getElementById('stat-total-amount');
    const statTotalDeductions = document.getElementById('stat-total-deductions');
    const statTotalDeductionsAmount = document.getElementById('stat-total-deductions-amount');

    if (statTotalCases) statTotalCases.textContent = totalCases;
    if (statPendingCases) statPendingCases.textContent = pendingCases;
    if (statCompletedCases) statCompletedCases.textContent = completedCases;
    if (statTotalAmount) statTotalAmount.textContent = formatCurrency(totalAmount);
    // عدد القضايا التي تم استقطاعها
    if (statTotalDeductions) statTotalDeductions.textContent = uniqueDeductedCases.size;
    // مجموع المبالغ المستقطعة فقط
    if (statTotalDeductionsAmount) statTotalDeductionsAmount.textContent = totalDeductions.toLocaleString() + ' د.ع';
    // عدد الدعاوى الأخيرة
    if (statRecentCases) statRecentCases.textContent = recentCasesCount;
    // عدد المحامين
    if (statTotalLawyers) statTotalLawyers.textContent = totalLawyers;
    
    // عرض الدعاوى الأخيرة
    renderRecentCases();
    
    // عرض الجلسات القادمة
    renderUpcomingHearings();
}

function renderRecentCases() {
    const tbody = document.getElementById('recent-cases-table');
    if (!tbody) return; // العنصر غير موجود
    
    const recentCases = data.cases.slice(-5).reverse();
    
    if (recentCases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>لا توجد دعاوى حالياً</h3>
                    <p>ابدأ بإضافة دعوى جديدة</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = recentCases.map(c => {
        const statusClass = getStatusBadgeClass(c.status);
        const remaining = (parseFloat(c.amount) || 0) - 
            data.deductions.filter(d => d.caseNumber === c.caseNumber)
                .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        
        return `
            <tr onclick="showCaseDetails('${c.id}')">
                <td>${c.caseNumber}</td>
                <td>${c.plaintiffName}</td>
                <td>${c.defendantName}</td>
                <td><span class="badge ${statusClass}">${c.status}</span></td>
                <td>${formatCurrency(c.amount)}</td>
                <td>${c.nextHearing ? formatDateTime(c.nextHearing) : '-'}</td>
            </tr>
        `;
    }).join('');
}

function renderUpcomingHearings() {
    const tbody = document.getElementById('upcoming-hearings-table');
    if (!tbody) return; // العنصر غير موجود
    
    const upcoming = data.cases
        .filter(c => c.nextHearing && new Date(c.nextHearing) > new Date())
        .sort((a, b) => new Date(a.nextHearing) - new Date(b.nextHearing))
        .slice(0, 5);
    
    if (upcoming.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <h3>لا توجد جلسات مجدولة</h3>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = upcoming.map(c => {
        const hearingDate = new Date(c.nextHearing);
        return `
            <tr>
                <td>${c.caseNumber}</td>
                <td>${c.plaintiffName}</td>
                <td>${c.lawyerName || '-'}</td>
                <td>${formatDate(c.nextHearing)}</td>
                <td>${hearingDate.toLocaleTimeString('ar-IQ', {hour: '2-digit', minute: '2-digit'})}</td>
            </tr>
        `;
    }).join('');
}

// ==================== جدول الدعاوى ====================
function renderCasesTable() {
    const tbody = document.getElementById('cases-table');
    const cardsContainer = document.getElementById('cases-cards');
    
    if (!tbody && !cardsContainer) return; // العنصر غير موجود (ليس في صفحة الدعاوى)
    
    // عرض رسالة فارغة
    if (data.cases.length === 0) {
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h3>لا توجد دعاوى</h3>
                        <p>ابدأ بإضافة دعوى جديدة من الزر أعلاه</p>
                    </td>
                </tr>
            `;
        }
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>لا توجد دعاوى</h3>
                    <p>ابدأ بإضافة دعوى جديدة من الزر أعلاه</p>
                </div>
            `;
        }
        return;
    }
    
    // عرض الجدول على الشاشات الكبيرة
    if (tbody) {
        const now = Date.now();
        tbody.innerHTML = [...data.cases].sort((a, b) => {
            // Sort by createdAt descending, fallback to id or date
            const aTime = new Date(a.createdAt || a.date || 0).getTime();
            const bTime = new Date(b.createdAt || b.date || 0).getTime();
            return bTime - aTime;
        }).map(c => {
            const statusClass = getStatusBadgeClass(c.status);
            const priorityClass = getPriorityBadgeClass(c.priority);
            const totalDeductions = data.deductions
                .filter(d => d.caseNumber === c.caseNumber)
                .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
            const remaining = (parseFloat(c.amount) || 0) - totalDeductions;
            const createdAt = new Date(c.createdAt || c.date || 0).getTime();
            const isNew = (now - createdAt) < 24 * 60 * 60 * 1000; // 24 hours
            return `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${c.caseNumber}
                            ${isNew ? '<span style="background: #6366f1; color: #fff; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; margin-right: 4px;"><i class="fas fa-ship"></i> جديد</span>' : ''}
                            ${c.status === 'تنفيذ' && (c.executionDeduction || c.executionSeizure) ? `
                                <div style="display: flex; gap: 4px;">
                                    ${c.executionDeduction ? '<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;"><i class="fas fa-money-bill-wave"></i></span>' : ''}
                                    ${c.executionSeizure ? '<span style="background: #f59e0b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;"><i class="fas fa-lock"></i></span>' : ''}
                                </div>
                            ` : ''}
                        </div>
                    </td>
                    <td>${c.plaintiffName}</td>
                    <td>${c.defendantName}</td>
                    <td>${c.lawyerName || '-'}</td>
                    <td><span class="badge ${statusClass}">${c.status}</span></td>
                    <td><span class="badge ${priorityClass}">${c.priority || 'عادية'}</span></td>
                    <td>${formatCurrency(c.amount)}</td>
                    <td>${formatCurrency(remaining)}</td>
                    <td>${c.nextHearing ? formatDateTime(c.nextHearing) : '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-primary btn-icon" onclick="showCaseDetails('${c.id}')" title="عرض التفاصيل">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-secondary btn-icon" onclick="editCase('${c.id}')" title="تحرير">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="btn whatsapp-btn btn-icon" onclick="sendWhatsAppToDefendant('${c.id}')" title="إرسال واتساب">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                            <button class="btn btn-danger btn-icon" onclick="deleteCase('${c.id}')" title="حذف">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // عرض البطاقات على الشاشات الصغيرة
    if (cardsContainer) {
        cardsContainer.innerHTML = data.cases.map(c => {
            const statusClass = getStatusBadgeClass(c.status);
            const priorityClass = getPriorityBadgeClass(c.priority);
            
            const totalDeductions = data.deductions
                .filter(d => d.caseNumber === c.caseNumber)
                .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
            const remaining = (parseFloat(c.amount) || 0) - totalDeductions;
            
            return `
                <div class="data-card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-gavel"></i>
                            <span>قضية رقم ${c.caseNumber}</span>
                            ${c.status === 'تنفيذ' && (c.executionDeduction || c.executionSeizure) ? `
                                <div style="display: flex; gap: 4px; margin-right: 8px;">
                                    ${c.executionDeduction ? '<span style="background: #10b981; color: white; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;"><i class="fas fa-money-bill-wave"></i> استقطاع</span>' : ''}
                                    ${c.executionSeizure ? '<span style="background: #f59e0b; color: white; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;"><i class="fas fa-lock"></i> حجز</span>' : ''}
                                </div>
                            ` : ''}
                        </div>
                        <div class="card-badges">
                            <span class="badge ${statusClass}">${c.status}</span>
                            <span class="badge ${priorityClass}">${c.priority || 'عادية'}</span>
                        </div>
                    </div>
                    
                    <div class="card-body">
                        <div class="card-info-row">
                            <span class="info-label"><i class="fas fa-user"></i> المدعي:</span>
                            <span class="info-value">${c.plaintiffName}</span>
                        </div>
                        <div class="card-info-row">
                            <span class="info-label"><i class="fas fa-user-tie"></i> المدعى عليه:</span>
                            <span class="info-value">${c.defendantName}</span>
                        </div>
                        <div class="card-info-row">
                            <span class="info-label"><i class="fas fa-balance-scale"></i> المحامي:</span>
                            <span class="info-value">${c.lawyerName || '-'}</span>
                        </div>
                        <div class="card-info-row">
                            <span class="info-label"><i class="fas fa-dollar-sign"></i> المبلغ:</span>
                            <span class="info-value">${formatCurrency(c.amount)}</span>
                        </div>
                        <div class="card-info-row">
                            <span class="info-label"><i class="fas fa-money-bill-wave"></i> المتبقي:</span>
                            <span class="info-value highlight">${formatCurrency(remaining)}</span>
                        </div>
                        ${c.nextHearing ? `
                        <div class="card-info-row">
                            <span class="info-label"><i class="fas fa-calendar-alt"></i> الجلسة القادمة:</span>
                            <span class="info-value">${formatDateTime(c.nextHearing)}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="card-actions">
                        <button class="btn btn-primary btn-sm" onclick="showCaseDetails('${c.id}')" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i> عرض
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editCase('${c.id}')" title="تحرير">
                            <i class="fas fa-pen"></i> تعديل
                        </button>
                        <button class="btn whatsapp-btn btn-sm" onclick="sendWhatsAppToDefendant('${c.id}')" title="إرسال واتساب">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCase('${c.id}')" title="حذف">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function getStatusBadgeClass(status) {
    const classes = {
        'مسودة': 'badge-draft',
        'مرفوع': 'badge-filed',
        'في المحكمة': 'badge-in-court',
        'صدور حكم': 'badge-judgment',
        'تنفيذ': 'badge-execution',
        'مغلق': 'badge-closed'
    };
    return classes[status] || 'badge-draft';
}

function getPriorityBadgeClass(priority) {
    const classes = {
        'عادية': 'badge-normal',
        'مهمة': 'badge-important',
        'عاجلة': 'badge-urgent',
        'طارئة': 'badge-emergency'
    };
    return classes[priority] || 'badge-normal';
}

// ==================== نوافذ الدعاوى ====================
function showNewCaseModal() {
    updateLawyerSelectOptions();
    document.getElementById('new-case-date').valueAsDate = new Date();
    
    // إخفاء خيارات التنفيذ عند فتح النموذج
    document.getElementById('execution-options-container').style.display = 'none';
    document.getElementById('execution-deduction').checked = false;
    document.getElementById('execution-seizure').checked = false;
    
    modalManager.open('new-case-modal');
}

function toggleExecutionOptions() {
    const status = document.getElementById('new-case-status').value;
    const container = document.getElementById('execution-options-container');
    
    if (status === 'تنفيذ') {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        document.getElementById('execution-deduction').checked = false;
        document.getElementById('execution-seizure').checked = false;
    }
}

function updateLawyerSelectOptions() {
    const select = document.getElementById('new-case-lawyer');
    select.innerHTML = '<option value="">اختر محامي...</option>' +
        data.lawyers.map(l => `<option value="${l.name}">${l.name}</option>`).join('');
    
    const deductionSelect = document.getElementById('new-deduction-case');
    if (deductionSelect) {
        deductionSelect.innerHTML = '<option value="">اختر دعوى...</option>' +
            data.cases.map(c => `<option value="${c.caseNumber}">${c.caseNumber} - ${c.plaintiffName}</option>`).join('');
    }
}

function saveNewCase(event) {
    event.preventDefault();
    
    const form = event.target;
    const editId = form.dataset.editId;
    const isEditing = !!editId;
    
    const caseData = {
        id: isEditing ? editId : generateId(),
        caseNumber: document.getElementById('new-case-number').value,
        filingDate: document.getElementById('new-case-date').value,
        priority: document.getElementById('new-case-priority').value,
        status: document.getElementById('new-case-status').value,
        stage: document.getElementById('new-case-stage') ? document.getElementById('new-case-stage').value : '',
        amount: document.getElementById('new-case-amount').value,
    plaintiffName: document.getElementById('new-case-plaintiff').value,
        plaintiffPhone: document.getElementById('new-case-plaintiff-phone').value,
        plaintiffAddress: document.getElementById('new-case-plaintiff-address') ? document.getElementById('new-case-plaintiff-address').value : '',
    defendantName: document.getElementById('new-case-defendant').value,
        defendantPhone: document.getElementById('new-case-defendant-phone').value,
        defendantAddress: document.getElementById('new-case-defendant-address') ? document.getElementById('new-case-defendant-address').value : '',
        lawyerName: document.getElementById('new-case-lawyer').value,
        court: document.getElementById('new-case-court').value,
        courtSection: document.getElementById('new-case-court-section') ? document.getElementById('new-case-court-section').value : '',
        nextHearing: document.getElementById('new-case-next-hearing').value,
        notes: document.getElementById('new-case-notes').value,
        executionDeduction: document.getElementById('execution-deduction').checked,
        executionSeizure: document.getElementById('execution-seizure').checked,
        createdAt: isEditing ? data.cases.find(c => c.id === editId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // حفظ في Firebase
    if (firebaseInitialized) {
        db.ref(DB_PATHS.CASES).child(caseData.id).set(caseData);
    }
    
    // حفظ محلياً
    if (isEditing) {
        const index = data.cases.findIndex(c => c.id === editId);
        if (index !== -1) {
            data.cases[index] = caseData;
        }
    } else {
        data.cases.push(caseData);
    }
    saveToLocalStorage();
    
    // إعادة تعيين النموذج
    delete form.dataset.editId;
    const modalTitle = document.querySelector('#new-case-modal .modal-header h2');
    if (modalTitle) modalTitle.textContent = 'دعوى جديدة';
    const submitBtn = document.querySelector('#new-case-form button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> إضافة الدعوى';
    
    // إغلاق النافذة وتحديث العرض
    modalManager.close('new-case-modal');
    form.reset();
    
    showToast(isEditing ? 'تم تعديل الدعوى بنجاح' : 'تم إضافة الدعوى بنجاح', 'success');
    
    updateDashboard();
    renderCasesTable();
    
    // إضافة إشعار
    if (!isEditing) {
        addNotification('دعوى جديدة', `تم إضافة دعوى جديدة رقم ${caseData.caseNumber}`, 'info', caseData.caseNumber);
    }
    
    // إرسال واتساب للمدعى عليه (فقط للدعاوى الجديدة)
    if (!isEditing && caseData.defendantPhone) {
        const phone = caseData.defendantPhone.replace(/[^\d+]/g, '');
        if (phone.length >= 10) {
            sendWhatsAppMessage(
                phone,
                `تنبيه هام: نود إعلامك بأنه تم رفع دعوى قضائية ضدك رقم ${caseData.caseNumber} باسمك (${caseData.defendantName}). المبلغ المالي المطلوب: ${formatCurrency(caseData.amount)}. يرجى زيارة الشركة في أقرب وقت ممكن لإبلاغنا باستلام هذا التنبيه ولمناقشة التفاصيل قبل اتخاذ أي إجراءات قانونية بحقك. للاستفسار أو التواصل يرجى الرد على هذه الرسالة.`
            );
        }
    }
}

// ==================== إرسال واتساب ====================
function sendWhatsAppToDefendant(caseId) {
    const caseData = data.cases.find(c => c.id === caseId);
    if (!caseData) return;
    
    if (!caseData.defendantPhone) {
        showToast('لا يوجد رقم هاتف للمدعى عليه', 'warning');
        return;
    }
    
    // تنسيق رقم الهاتف مع رمز الدولة
    const formattedPhone = formatPhoneForWhatsApp(caseData.defendantPhone);
    
    if (!formattedPhone) {
        showToast('رقم الهاتف غير صالح', 'warning');
        return;
    }
    
    const message = `تنبيه هام: نود إعلامك بأنه تم رفع دعوى قضائية ضدك رقم ${caseData.caseNumber} باسمك (${caseData.defendantName}). المبلغ المالي المطلوب: ${formatCurrency(caseData.amount)}. يرجى زيارة الشركة في أقرب وقت ممكن لإبلاغنا باستلام هذا التنبيه ولمناقشة التفاصيل قبل اتخاذ أي إجراءات قانونية بحقك. للاستفسار أو التواصل يرجى الرد على هذه الرسالة.`;
    
    sendWhatsAppMessage(formattedPhone, message);
}

/**
 * تنسيق رقم الهاتف للواتساب مع إضافة رمز الدولة العراقية تلقائياً
 */
function formatPhoneForWhatsApp(phone) {
    if (!phone) return null;
    
    // إزالة جميع المسافات والرموز الخاصة ما عدا +
    let cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    // إزالة الأصفار البادئة
    cleanPhone = cleanPhone.replace(/^0+/, '');
    
    // إذا كان الرقم يبدأ بـ + فهو يحتوي على رمز الدولة
    if (cleanPhone.startsWith('+')) {
        // عرض البطاقات على الشاشات الصغيرة
        if (cardsContainer) {
            const now = Date.now();
            cardsContainer.innerHTML = [...data.cases].sort((a, b) => {
                const aTime = new Date(a.createdAt || a.date || 0).getTime();
                const bTime = new Date(b.createdAt || b.date || 0).getTime();
                return bTime - aTime;
            }).map(c => {
                const statusClass = getStatusBadgeClass(c.status);
                const priorityClass = getPriorityBadgeClass(c.priority);
                const totalDeductions = data.deductions
                    .filter(d => d.caseNumber === c.caseNumber)
                    .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
                const remaining = (parseFloat(c.amount) || 0) - totalDeductions;
                const createdAt = new Date(c.createdAt || c.date || 0).getTime();
                const isNew = (now - createdAt) < 24 * 60 * 60 * 1000;
                return `
                    <div class="data-card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-gavel"></i>
                                <span>قضية رقم ${c.caseNumber}</span>
                                ${isNew ? '<span style="background: #6366f1; color: #fff; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; margin-right: 4px;"><i class="fas fa-ship"></i> جديد</span>' : ''}
                                ${c.status === 'تنفيذ' && (c.executionDeduction || c.executionSeizure) ? `
                                    <div style="display: flex; gap: 4px; margin-right: 8px;">
                                        ${c.executionDeduction ? '<span style="background: #10b981; color: white; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;"><i class="fas fa-money-bill-wave"></i> استقطاع</span>' : ''}
                                        ${c.executionSeizure ? '<span style="background: #f59e0b; color: white; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;"><i class="fas fa-lock"></i> حجز</span>' : ''}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="card-badges">
                                <span class="badge ${statusClass}">${c.status}</span>
                                <span class="badge ${priorityClass}">${c.priority || 'عادية'}</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="card-info-row">
                                <span class="info-label"><i class="fas fa-user"></i> المدعي:</span>
                                <span class="info-value">${c.plaintiffName}</span>
                            </div>
                            <div class="card-info-row">
                                <span class="info-label"><i class="fas fa-user-tie"></i> المدعى عليه:</span>
                                <span class="info-value">${c.defendantName}</span>
                            </div>
                            <div class="card-info-row">
                                <span class="info-label"><i class="fas fa-balance-scale"></i> المحامي:</span>
                                <span class="info-value">${c.lawyerName || '-'}</span>
                            </div>
                            <div class="card-info-row">
                                <span class="info-label"><i class="fas fa-dollar-sign"></i> المبلغ:</span>
                                <span class="info-value">${formatCurrency(c.amount)}</span>
                            </div>
                            <div class="card-info-row">
                                <span class="info-label"><i class="fas fa-money-bill-wave"></i> المتبقي:</span>
                                <span class="info-value highlight">${formatCurrency(remaining)}</span>
                            </div>
                            <div class="card-info-row">
                                <span class="info-label"><i class="fas fa-calendar-alt"></i> الجلسة القادمة:</span>
                                <span class="info-value">${c.nextHearing ? formatDateTime(c.nextHearing) : '-'}</span>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-primary btn-sm" onclick="showCaseDetails('${c.id}')" title="عرض التفاصيل">
                                <i class="fas fa-eye"></i> عرض
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="editCase('${c.id}')" title="تعديل">
                                <i class="fas fa-pen"></i> تعديل
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteCase('${c.id}')" title="حذف">
                                <i class="fas fa-trash-alt"></i> حذف
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } else {
        // متصفح - فتح واتساب ويب
        const webUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`;
        window.open(webUrl, '_blank');
        showToast('تم فتح واتساب ويب', 'success');
    }
}

// ==================== تفاصيل الدعوى ====================
function showCaseDetails(caseId) {
    try {
        console.log('🔍 عرض تفاصيل الدعوى:', caseId);
        console.log('📊 إجمالي الدعاوى:', data.cases.length);
        console.log('🔑 أول 3 IDs:', data.cases.slice(0, 3).map(c => ({ id: c.id, number: c.caseNumber })));
        
        const caseData = data.cases.find(c => c.id === caseId);
        if (!caseData) {
            console.error('❌ الدعوى غير موجودة:', caseId);
            console.log('💡 جميع IDs المتاحة:', data.cases.map(c => c.id));
            showToast('الدعوى غير موجودة', 'error');
            return;
        }
        
        console.log('✅ تم العثور على الدعوى:', caseData.caseNumber);
        
        const totalDeductions = data.deductions
            .filter(d => d.caseNumber === caseData.caseNumber)
            .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        const remaining = (parseFloat(caseData.amount) || 0) - totalDeductions;
    
    const content = document.getElementById('case-details-content');
    content.innerHTML = `
        <div class="stats-grid" style="margin-bottom: 25px;">
            <div class="stat-card">
                <div class="stat-content">
                    <div class="stat-label">رقم الدعوى</div>
                    <div class="stat-value" style="font-size: 24px;">${caseData.caseNumber}</div>
                </div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                <div class="stat-content">
                    <div class="stat-label">المبلغ</div>
                    <div class="stat-value" style="font-size: 20px;">${formatCurrency(caseData.amount)}</div>
                </div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #059669);">
                <div class="stat-content">
                    <div class="stat-label">المبلغ المتبقي</div>
                    <div class="stat-value" style="font-size: 20px;">${formatCurrency(remaining)}</div>
                </div>
            </div>
        </div>
        
        <div class="form-grid">
            <div class="form-group">
                <label>الحالة</label>
                <p><span class="badge ${getStatusBadgeClass(caseData.status)}">${caseData.status}</span></p>
            </div>
            ${caseData.status === 'تنفيذ' && (caseData.executionDeduction || caseData.executionSeizure) ? `
            <div class="form-group">
                <label>خيارات التنفيذ</label>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${caseData.executionDeduction ? `
                        <span class="badge" style="background: linear-gradient(135deg, #10b981, #059669); display: inline-flex; align-items: center; gap: 6px; width: fit-content;">
                            <i class="fas fa-money-bill-wave"></i> تم الاستقطاع
                        </span>
                    ` : ''}
                    ${caseData.executionSeizure ? `
                        <span class="badge" style="background: linear-gradient(135deg, #f59e0b, #d97706); display: inline-flex; align-items: center; gap: 6px; width: fit-content;">
                            <i class="fas fa-lock"></i> تم الحجز
                        </span>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            <div class="form-group">
                <label>الأولوية</label>
                <p><span class="badge ${getPriorityBadgeClass(caseData.priority)}">${caseData.priority || 'عادية'}</span></p>
            </div>
            <div class="form-group">
                <label>تاريخ الرفع</label>
                <p>${caseData.filingDate ? formatDate(caseData.filingDate) : '-'}</p>
            </div>
            <div class="form-group">
                <label>المرحلة</label>
                <p>${caseData.stage || '-'}</p>
            </div>
            <div class="form-group">
                <label>المدعي</label>
                <p>${caseData.plaintiffName || '-'}</p>
            </div>
            <div class="form-group">
                <label>عنوان المدعي</label>
                <p>${caseData.plaintiffAddress || '-'}</p>
            </div>
            <div class="form-group">
                <label>المدعى عليه</label>
                <p>${caseData.defendantName || '-'}</p>
            </div>
            <div class="form-group">
                <label>عنوان المدعى عليه</label>
                <p>${caseData.defendantAddress || '-'}</p>
            </div>
            <div class="form-group">
                <label>هاتف المدعى عليه</label>
                <p>${caseData.defendantPhone || '-'}</p>
            </div>
            <div class="form-group">
                <label>المحامي</label>
                <p>${caseData.lawyerName || '-'}</p>
            </div>
            <div class="form-group">
                <label>المحكمة</label>
                <p>${caseData.court || '-'}</p>
            </div>
            <div class="form-group">
                <label>اسم الدائرة</label>
                <p>${caseData.courtSection || '-'}</p>
            </div>
            <div class="form-group">
                <label>الجلسة القادمة</label>
                <p>${caseData.nextHearing ? formatDateTime(caseData.nextHearing) : '-'}</p>
            </div>
        </div>
        
        ${caseData.notes ? `
            <div class="form-group" style="margin-top: 20px;">
                <label>الملاحظات</label>
                <p style="padding: 15px; background: var(--bg-light); border-radius: 10px;">${caseData.notes}</p>
            </div>
        ` : ''}
        
        <div class="section-divider"></div>
        
        <h4 style="margin-bottom: 15px; color: var(--primary-blue);">الاستقطاعات</h4>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>المبلغ</th>
                        <th>الطريقة</th>
                        <th>الملاحظات</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.deductions.filter(d => d.caseNumber === caseData.caseNumber).length > 0 ?
                        data.deductions.filter(d => d.caseNumber === caseData.caseNumber).map(d => `
                            <tr>
                                <td>${formatDate(d.date)}</td>
                                <td>${formatCurrency(d.amount)}</td>
                                <td>${d.method}</td>
                                <td>${d.notes || '-'}</td>
                            </tr>
                        `).join('') :
                        '<tr><td colspan="4" style="text-align: center; color: var(--text-gray);">لا توجد استقطاعات</td></tr>'
                    }
                </tbody>
            </table>
        </div>
    `;
    
        console.log('✅ تم تجهيز المحتوى، فتح النافذة...');
        
        // التحقق من وجود modalManager
        if (typeof modalManager === 'undefined') {
            console.error('❌ modalManager غير معرف!');
            alert('حدث خطأ: نظام النوافذ غير متاح');
            return;
        }
        
        // التحقق من وجود النافذة المنبثقة
        const modal = document.getElementById('case-details-modal');
        if (!modal) {
            console.error('❌ النافذة case-details-modal غير موجودة في HTML');
            alert('حدث خطأ: النافذة المنبثقة غير موجودة');
            return;
        }
        
        console.log('📱 النافذة موجودة:', modal);
        const opened = modalManager.open('case-details-modal');
        console.log('📱 حالة فتح النافذة:', opened);
        
        if (!opened) {
            console.error('❌ فشل فتح النافذة');
            // محاولة فتح النافذة يدوياً
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log('🔧 تم فتح النافذة يدوياً');
        }
        
    } catch (error) {
        console.error('❌ خطأ في عرض تفاصيل الدعوى:', error);
        showToast('حدث خطأ في عرض التفاصيل', 'error');
    }
}

// ==================== البحث والتصفية ====================
function searchCases() {
    const searchTerm = document.getElementById('cases-search').value.toLowerCase();
    const statusFilter = document.getElementById('cases-status-filter').value;
    const priorityFilter = document.getElementById('cases-priority-filter').value;
    
    let filteredCases = data.cases;
    
    if (searchTerm) {
        filteredCases = filteredCases.filter(c => 
            c.caseNumber.toLowerCase().includes(searchTerm) ||
            c.plaintiffName.toLowerCase().includes(searchTerm) ||
            c.defendantName.toLowerCase().includes(searchTerm) ||
            (c.lawyerName && c.lawyerName.toLowerCase().includes(searchTerm))
        );
    }
    
    if (statusFilter) {
        filteredCases = filteredCases.filter(c => c.status === statusFilter);
    }
    
    if (priorityFilter) {
        filteredCases = filteredCases.filter(c => c.priority === priorityFilter);
    }
    
    renderFilteredCases(filteredCases);
}

function filterAndNavigate(status) {
    // الانتقال إلى صفحة الدعاوى
    navigateTo('cases');
    // تعيين الفلتر المناسب
    const statusFilter = document.getElementById('cases-status-filter');
    if (status === 'تم الاستقطاع') {
        statusFilter.value = '';
        // تصفية القضايا التي بها استقطاع
        let filteredCases = data.cases.filter(c => c.executionDeduction === true);
        renderFilteredCases(filteredCases);
    } else if (status === 'تم الحجز') {
        statusFilter.value = '';
        // تصفية القضايا التي بها حجز
        let filteredCases = data.cases.filter(c => c.executionSeizure === true);
        renderFilteredCases(filteredCases);
    } else {
        statusFilter.value = status;
        filterCases();
    }
}

function filterCases() {
    // إضافة دعم لفلاتر "تم الاستقطاع" و"تم الحجز"
    const statusFilter = document.getElementById('cases-status-filter').value;
    let filteredCases = data.cases;
    if (statusFilter === 'تم الاستقطاع') {
        filteredCases = filteredCases.filter(c => c.executionDeduction === true);
        renderFilteredCases(filteredCases);
        return;
    }
    if (statusFilter === 'تم الحجز') {
        filteredCases = filteredCases.filter(c => c.executionSeizure === true);
        renderFilteredCases(filteredCases);
        return;
    }
    searchCases();
}

function renderFilteredCases(cases) {
    const tbody = document.getElementById('cases-table');
    
    if (cases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>لا توجد نتائج</h3>
                    <p>جرب تغيير معايير البحث</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = cases.map(c => {
        const totalDeductions = data.deductions
            .filter(d => d.caseNumber === c.caseNumber)
            .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        const remaining = (parseFloat(c.amount) || 0) - totalDeductions;
        
        return `
            <tr>
                <td><strong>${c.caseNumber}</strong></td>
                <td>${c.plaintiffName}</td>
                <td>${c.defendantName}</td>
                <td>${c.lawyerName || '-'}</td>
                <td><span class="badge ${getStatusBadgeClass(c.status)}">${c.status}</span></td>
                <td><span class="badge ${getPriorityBadgeClass(c.priority || 'عادية')}">${c.priority || 'عادية'}</span></td>
                <td>${formatCurrency(c.amount)}</td>
                <td>${formatCurrency(remaining)}</td>
                <td>${c.nextHearing ? formatDate(c.nextHearing) : '-'}</td>
                <td>
                    <button class="btn-icon" onclick="showCaseDetails('${c.id}')" title="التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editCase('${c.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="sendWhatsAppToDefendant('${c.id}')" title="واتساب">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteCase('${c.id}')" title="حذف" style="color: var(--error-red);">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function searchDefendants() {
    const searchTerm = document.getElementById('defendants-search').value.toLowerCase();
    
    const filtered = data.defendants.filter(d =>
        d.name.toLowerCase().includes(searchTerm) ||
        (d.phone && d.phone.includes(searchTerm)) ||
        (d.email && d.email.toLowerCase().includes(searchTerm))
    );
    
    renderFilteredDefendants(filtered);
}

function renderFilteredDefendants(defendants) {
    const tbody = document.getElementById('defendants-table');
    
    if (defendants.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>لا توجد نتائج</h3>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = defendants.map(d => `
        <tr>
            <td><strong>${d.name}</strong></td>
            <td>${d.phone || '-'}</td>
            <td>${d.email || '-'}</td>
            <td>${d.workplace || '-'}</td>
            <td>${d.address || '-'}</td>
            <td>
                <button class="btn-icon" onclick="editDefendant('${d.id}')" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="deleteDefendant('${d.id}')" title="حذف" style="color: var(--error-red);">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ==================== المدعى عليهم ====================
function showNewDefendantModal() {
    modalManager.open('new-defendant-modal');
}

function saveNewDefendant(event) {
    event.preventDefault();
    
    const form = event.target;
    const editId = form.dataset.editId;
    const isEditing = !!editId;
    
    const defendant = {
        id: isEditing ? editId : generateId(),
        name: document.getElementById('new-defendant-name').value,
        phone: document.getElementById('new-defendant-phone').value,
        workplace: document.getElementById('new-defendant-workplace').value,
        address: document.getElementById('new-defendant-address').value,
        createdAt: isEditing ? data.defendants.find(d => d.id === editId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (firebaseInitialized) {
        db.ref(DB_PATHS.DEFENDANTS).child(defendant.id).set(defendant);
    }
    
    if (isEditing) {
        const index = data.defendants.findIndex(d => d.id === editId);
        if (index !== -1) {
            data.defendants[index] = defendant;
        }
    } else {
        data.defendants.push(defendant);
    }
    
    saveToLocalStorage();
    renderDefendantsTable();
    
    // إعادة تعيين النموذج
    delete form.dataset.editId;
    const modalTitle = document.querySelector('#new-defendant-modal .modal-header h2');
    if (modalTitle) modalTitle.textContent = 'مدعى عليه جديد';
    const submitBtn = document.querySelector('#new-defendant-form button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> إضافة المدعى عليه';
    
    modalManager.close('new-defendant-modal');
    form.reset();
    showToast(isEditing ? 'تم تعديل المدعى عليه بنجاح' : 'تم إضافة المدعى عليه بنجاح', 'success');
}

function renderDefendantsTable() {
    const tbody = document.getElementById('defendants-table');
    const cardsContainer = document.getElementById('defendants-cards');
    
    if (!tbody && !cardsContainer) return; // العنصر غير موجود
    
    // عرض رسالة فارغة
    if (data.defendants.length === 0) {
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>لا يوجد مدعى عليهم</h3>
                        <p>ابدأ بإضافة مدعى عليه جديد</p>
                    </td>
                </tr>
            `;
        }
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>لا يوجد مدعى عليهم</h3>
                    <p>ابدأ بإضافة مدعى عليه جديد</p>
                </div>
            `;
        }
        return;
    }
    
    // عرض الجدول على الشاشات الكبيرة
    if (tbody) {
        tbody.innerHTML = data.defendants.map(d => {
            const casesCount = data.cases.filter(c => c.defendantName === d.name).length;
            return `
            <tr onclick="showDefendantCases('${d.id}')" style="cursor: pointer;">
                <td><strong>${d.name}</strong></td>
                <td>${d.phone || '-'}</td>
                <td>${d.workplace || '-'}</td>
                <td>${d.address || '-'}</td>
                <td><span class="badge badge-normal">${casesCount} قضية</span></td>
                <td onclick="event.stopPropagation();">
                    <div class="action-buttons">
                        <button class="btn btn-secondary btn-icon" onclick="editDefendant('${d.id}')" title="تعديل">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="btn btn-danger btn-icon" onclick="deleteDefendant('${d.id}')" title="حذف">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
    }
    
    // عرض البطاقات على الشاشات الصغيرة
    if (cardsContainer) {
        cardsContainer.innerHTML = data.defendants.map(d => {
            const casesCount = data.cases.filter(c => c.defendantName === d.name).length;
            return `
            <div class="data-card" onclick="showDefendantCases('${d.id}')" style="cursor: pointer;">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-user-shield"></i>
                        <span>${d.name}</span>
                    </div>
                    <span class="badge badge-info">${casesCount} قضية</span>
                </div>
                
                <div class="card-body">
                    ${d.phone ? `
                    <div class="card-info-row">
                        <span class="info-label"><i class="fas fa-phone-alt"></i> الهاتف:</span>
                        <span class="info-value">${d.phone}</span>
                    </div>
                    ` : ''}
                    ${d.workplace ? `
                    <div class="card-info-row">
                        <span class="info-label"><i class="fas fa-building"></i> مكان العمل:</span>
                        <span class="info-value">${d.workplace}</span>
                    </div>
                    ` : ''}
                    ${d.address ? `
                    <div class="card-info-row">
                        <span class="info-label"><i class="fas fa-map-marker-alt"></i> العنوان:</span>
                        <span class="info-value">${d.address}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="card-actions" onclick="event.stopPropagation();">
                    <button class="btn btn-secondary btn-sm" onclick="editDefendant('${d.id}')" title="تعديل">
                        <i class="fas fa-pen"></i> تعديل
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteDefendant('${d.id}')" title="حذف">
                        <i class="fas fa-trash-alt"></i> حذف
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="showDefendantCases('${d.id}')" title="عرض القضايا">
                        <i class="fas fa-gavel"></i> القضايا
                    </button>
                </div>
            </div>
        `;
        }).join('');
    }
}

function editDefendant(id) {
    const defendant = data.defendants.find(d => d.id === id);
    if (!defendant) {
        showToast('المدعى عليه غير موجود', 'error');
        return;
    }
    
    // ملء النموذج بالبيانات الحالية
    document.getElementById('new-defendant-name').value = defendant.name || '';
    document.getElementById('new-defendant-phone').value = defendant.phone || '';
    document.getElementById('new-defendant-workplace').value = defendant.workplace || '';
    document.getElementById('new-defendant-address').value = defendant.address || '';
    
    // تغيير عنوان النافذة
    const modalTitle = document.querySelector('#new-defendant-modal .modal-header h2');
    if (modalTitle) modalTitle.textContent = 'تعديل المدعى عليه';
    
    // تغيير نص الزر
    const submitBtn = document.querySelector('#new-defendant-form button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات';
    
    // حفظ معرف المدعى عليه المراد تعديله
    document.getElementById('new-defendant-form').dataset.editId = id;
    
    // فتح النافذة
    modalManager.open('new-defendant-modal');
}

function deleteDefendant(id) {
    if (confirm('هل أنت متأكد من حذف هذا المدعى عليه؟')) {
        if (firebaseInitialized) {
            db.ref(DB_PATHS.DEFENDANTS).child(id).remove();
        }
        
        data.defendants = data.defendants.filter(d => d.id !== id);
        saveToLocalStorage();
        renderDefendantsTable();
        showToast('تم حذف المدعى عليه', 'success');
    }
}

function showDefendantCases(defendantId) {
    const defendant = data.defendants.find(d => d.id === defendantId);
    if (!defendant) {
        showToast('المدعى عليه غير موجود', 'error');
        return;
    }
    
    // البحث عن القضايا المرتبطة بهذا المدعى عليه
    const defendantCases = data.cases.filter(c => c.defendantName === defendant.name);
    
    if (defendantCases.length === 0) {
        showToast('لا توجد قضايا لهذا المدعى عليه', 'info');
        return;
    }
    
    // الانتقال لصفحة الدعاوى
    navigateTo('cases');
    
    // تطبيق فلتر البحث
    setTimeout(() => {
        const searchInput = document.getElementById('cases-search');
        if (searchInput) {
            searchInput.value = defendant.name;
            searchCases();
        }
    }, 100);
}

// ==================== المحامين ====================
function showNewLawyerModal() {
    modalManager.open('new-lawyer-modal');
}

function saveNewLawyer(event) {
    event.preventDefault();
    
    const form = event.target;
    const editId = form.dataset.editId;
    const isEditing = !!editId;
    
    const lawyer = {
        id: isEditing ? editId : generateId(),
        name: document.getElementById('new-lawyer-name').value,
        licenseNumber: document.getElementById('new-lawyer-license').value,
        phone: document.getElementById('new-lawyer-phone').value,
        specialty: document.getElementById('new-lawyer-specialty').value,
        experience: document.getElementById('new-lawyer-experience').value,
        createdAt: isEditing ? data.lawyers.find(l => l.id === editId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (firebaseInitialized) {
        db.ref(DB_PATHS.LAWYERS).child(lawyer.id).set(lawyer);
    }
    
    if (isEditing) {
        const index = data.lawyers.findIndex(l => l.id === editId);
        if (index !== -1) {
            data.lawyers[index] = lawyer;
        }
    } else {
        data.lawyers.push(lawyer);
    }
    
    saveToLocalStorage();
    renderLawyersTable();
    updateLawyerSelectOptions();
    
    // إعادة تعيين النموذج
    delete form.dataset.editId;
    const modalTitle = document.querySelector('#new-lawyer-modal .modal-header h2');
    if (modalTitle) modalTitle.textContent = 'محامي جديد';
    const submitBtn = document.querySelector('#new-lawyer-form button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> إضافة المحامي';
    
    modalManager.close('new-lawyer-modal');
    form.reset();
    showToast(isEditing ? 'تم تعديل المحامي بنجاح' : 'تم إضافة المحامي بنجاح', 'success');
}

function renderLawyersTable() {
    const tbody = document.getElementById('lawyers-table');
    const cardsContainer = document.getElementById('lawyers-cards');
    
    if (!tbody && !cardsContainer) return; // العنصر غير موجود
    
    // عرض رسالة فارغة
    if (data.lawyers.length === 0) {
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-user-tie"></i>
                        <h3>لا يوجد محامين</h3>
                        <p>ابدأ بإضافة محامي جديد</p>
                    </td>
                </tr>
            `;
        }
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-tie"></i>
                    <h3>لا يوجد محامين</h3>
                    <p>ابدأ بإضافة محامي جديد</p>
                </div>
            `;
        }
        return;
    }
    
    // عرض الجدول على الشاشات الكبيرة
    if (tbody) {
        tbody.innerHTML = data.lawyers.map(l => {
            const casesCount = data.cases.filter(c => c.lawyerName === l.name).length;
            const licenseNum = l.licenseNumber || l.license || '-';
            return `
                <tr>
                    <td><strong>${l.name}</strong></td>
                    <td>${licenseNum}</td>
                    <td>${l.phone || '-'}</td>
                    <td>${l.specialty || l.specialization || '-'}</td>
                    <td>${l.experience || '-'}</td>
                    <td><span class="badge badge-normal">${casesCount}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-primary btn-icon" onclick="showLawyerDetails('${l.id}')" title="عرض التفاصيل">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-secondary btn-icon" onclick="editLawyer('${l.id}')" title="تعديل">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="btn btn-danger btn-icon" onclick="deleteLawyer('${l.id}')" title="حذف">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // عرض البطاقات على الشاشات الصغيرة
    if (cardsContainer) {
        cardsContainer.innerHTML = data.lawyers.map(l => {
            const casesCount = data.cases.filter(c => c.lawyerName === l.name).length;
            const licenseNum = l.licenseNumber || l.license;
            const specialty = l.specialty || l.specialization;
            return `
                <div class="data-card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-balance-scale"></i>
                            <span>${l.name}</span>
                        </div>
                        <span class="badge badge-normal">${casesCount} قضية</span>
                    </div>
                    
                    <div class="card-body">
                        ${licenseNum ? `
                        <div class="card-info-row">
                            <span class="info-label"><i class="fas fa-id-card"></i> رقم الترخيص:</span>
                            <span class="info-value">${licenseNum}</span>
                        </div>
                        ` : ''}
                        ${l.phone ? `
                        <div class="card-info-row">
                            <span class="info-label"><i class="fas fa-phone-alt"></i> الهاتف:</span>
                            <span class="info-value">${l.phone}</span>
                        </div>
                        ` : ''}
                        ${specialty ? `
                        <div class="card-info-row">
                            <span class="info-label"><i class="fas fa-briefcase"></i> التخصص:</span>
                            <span class="info-value">${specialty}</span>
                        </div>
                        ` : ''}
                        ${l.experience ? `
                        <div class="card-info-row">
                            <span class="info-label"><i class="fas fa-award"></i> الخبرة:</span>
                            <span class="info-value">${l.experience}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="card-actions">
                        <button class="btn btn-primary btn-sm" onclick="showLawyerDetails('${l.id}')" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i> عرض
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editLawyer('${l.id}')" title="تعديل">
                            <i class="fas fa-pen"></i> تعديل
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteLawyer('${l.id}')" title="حذف">
                            <i class="fas fa-trash-alt"></i> حذف
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function showLawyerDetails(id) {
    const lawyer = data.lawyers.find(l => l.id === id);
    if (!lawyer) {
        showToast('المحامي غير موجود', 'error');
        return;
    }
    // عرض نافذة التفاصيل
    const modalTitle = document.querySelector('#lawyer-details-modal .modal-header h2');
    if (modalTitle) modalTitle.textContent = `تفاصيل المحامي: ${lawyer.name}`;

    document.getElementById('lawyer-details-name').textContent = lawyer.name || '-';
    document.getElementById('lawyer-details-license').textContent = lawyer.licenseNumber || lawyer.license || '-';
    document.getElementById('lawyer-details-phone').textContent = lawyer.phone || '-';
    document.getElementById('lawyer-details-specialty').textContent = lawyer.specialty || lawyer.specialization || '-';
    document.getElementById('lawyer-details-experience').textContent = lawyer.experience || '-';

    modalManager.open('lawyer-details-modal');
}

function editLawyer(id) {
    const lawyer = data.lawyers.find(l => l.id === id);
    if (!lawyer) {
        showToast('المحامي غير موجود', 'error');
        return;
    }
    
    // ملء النموذج بالبيانات الحالية
    document.getElementById('new-lawyer-name').value = lawyer.name || '';
    document.getElementById('new-lawyer-license').value = lawyer.licenseNumber || lawyer.license || '';
    document.getElementById('new-lawyer-phone').value = lawyer.phone || '';
    document.getElementById('new-lawyer-specialty').value = lawyer.specialty || lawyer.specialization || '';
    document.getElementById('new-lawyer-experience').value = lawyer.experience || '';
    
    // تغيير عنوان النافذة
    const modalTitle = document.querySelector('#new-lawyer-modal .modal-header h2');
    if (modalTitle) modalTitle.textContent = 'تعديل المحامي';
    
    // تغيير نص الزر
    const submitBtn = document.querySelector('#new-lawyer-form button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات';
    
    // حفظ معرف المحامي المراد تعديله
    document.getElementById('new-lawyer-form').dataset.editId = id;
    
    // فتح النافذة
    modalManager.open('new-lawyer-modal');
}

function deleteLawyer(id) {
    if (confirm('هل أنت متأكد من حذف هذا المحامي؟')) {
        if (firebaseInitialized) {
            db.ref(DB_PATHS.LAWYERS).child(id).remove();
        }
        data.lawyers = data.lawyers.filter(l => l.id !== id);
        saveToLocalStorage();
        renderLawyersTable();
        updateLawyerSelectOptions();
        showToast('تم حذف المحامي', 'success');
    }
}

function showAllLawyerCases(lawyerId) {
    const lawyer = data.lawyers.find(l => l.id === lawyerId);
    if (!lawyer) return;
    
    const lawyerCases = data.cases.filter(c => c.lawyerName === lawyer.name);
    const casesList = document.getElementById(`lawyer-cases-list-${lawyerId}`);
    
    if (!casesList) return;
    
    // عرض جميع القضايا
    casesList.innerHTML = lawyerCases.map(c => `
        <div class="case-item" onclick="showCaseDetails('${c.id}')" style="cursor: pointer; padding: 10px; border-bottom: 1px solid var(--border-color); transition: background 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>قضية رقم ${c.caseNumber}</strong>
                    <div style="color: var(--text-secondary); font-size: 13px;">${c.plaintiffName} ضد ${c.defendantName}</div>
                </div>
                <span class="badge ${getStatusBadgeClass(c.status)}">${c.status}</span>
            </div>
        </div>
    `).join('');
    
    // إخفاء زر "عرض جميع القضايا"
    const showAllBtn = casesList.nextElementSibling;
    if (showAllBtn && showAllBtn.querySelector('button')) {
        showAllBtn.style.display = 'none';
    }
}

// ==================== الاستقطاعات ====================
function showNewDeductionModal() {
    updateLawyerSelectOptions();
    document.getElementById('new-deduction-date').valueAsDate = new Date();
    modalManager.open('new-deduction-modal');
}

function saveNewDeduction(event) {
    event.preventDefault();
    
    const deduction = {
        id: generateId(),
        caseNumber: document.getElementById('new-deduction-case').value,
        defendant: document.getElementById('new-deduction-defendant').value,
        addedBy: document.getElementById('new-deduction-addedby').value,
        amount: document.getElementById('new-deduction-amount').value,
        date: document.getElementById('new-deduction-date').value,
        method: 'نقدي',
        notes: document.getElementById('new-deduction-notes').value,
        createdAt: new Date().toISOString()
    };
    
    if (firebaseInitialized) {
        db.ref(DB_PATHS.DEDUCTIONS).push(deduction);
    }
    
    data.deductions.push(deduction);
    saveToLocalStorage();
    renderDeductionsTable();
    updateDashboard();
    
    modalManager.close('new-deduction-modal');
    document.getElementById('new-deduction-form').reset();
    showToast('تم إضافة الاستقطاع بنجاح', 'success');
    
    // إضافة إشعار للاستقطاع الجديد
    addNotification('استقطاع جديد', `تم إضافة استقطاع جديد بمبلغ ${formatCurrency(deduction.amount)} للدعوى ${deduction.caseNumber}`, 'info', null, deduction.id);
}


function showDeductionDetails(id) {
    const deduction = data.deductions.find(d => d.id === id);
    if (!deduction) {
        showToast('الاستقطاع غير موجود', 'error');
        return;
    }
    
    const caseData = data.cases.find(c => c.caseNumber === deduction.caseNumber);
    
    const content = `
        <div class="details-section">
            <h3><i class="fas fa-money-bill-wave"></i> تفاصيل الاستقطاع</h3>
            <div class="details-grid">
                <div class="detail-item">
                    <span class="detail-label">رقم القضية:</span>
                    <span class="detail-value"><strong>${deduction.caseNumber}</strong></span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">المبلغ:</span>
                    <span class="detail-value highlight">${formatCurrency(deduction.amount)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">التاريخ:</span>
                    <span class="detail-value">${formatDate(deduction.date)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">طريقة الدفع:</span>
                    <span class="detail-value">${deduction.method}</span>
                </div>
                ${deduction.notes ? `
                <div class="detail-item" style="grid-column: 1 / -1;">
                    <span class="detail-label">ملاحظات:</span>
                    <span class="detail-value">${deduction.notes}</span>
                </div>
                ` : ''}
            </div>
        </div>
        
        ${caseData ? `
        <div class="details-section">
            <h3><i class="fas fa-gavel"></i> معلومات القضية</h3>
            <div class="details-grid">
                <div class="detail-item">
                    <span class="detail-label">المدعي:</span>
                    <span class="detail-value">${caseData.plaintiffName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">المدعى عليه:</span>
                    <span class="detail-value">${caseData.defendantName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">المبلغ الكلي:</span>
                    <span class="detail-value">${formatCurrency(caseData.amount)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">الحالة:</span>
                    <span class="detail-value"><span class="badge ${getStatusBadgeClass(caseData.status)}">${caseData.status}</span></span>
                </div>
            </div>
            <div style="margin-top: 15px;">
                <button class="btn btn-primary" onclick="showCaseDetails('${caseData.id}')">
                    <i class="fas fa-eye"></i> عرض تفاصيل القضية
                </button>
            </div>
        </div>
        ` : ''}
    `;
    
    document.getElementById('deduction-details-content').innerHTML = content;
    modalManager.open('deduction-details-modal');
}

function editDeduction(id) {
    const deduction = data.deductions.find(d => d.id === id);
    if (!deduction) {
        showToast('لم يتم العثور على الاستقطاع', 'error');
        return;
    }
    // Populate case number select with all cases
    const caseSelect = document.getElementById('edit-deduction-case');
    if (caseSelect) {
        caseSelect.innerHTML = '<option value="">اختر دعوى...</option>' +
            data.cases.map(c => `<option value="${c.caseNumber}">${c.caseNumber} - ${c.plaintiffName} ضد ${c.defendantName}</option>`).join('');
        caseSelect.value = deduction.caseNumber || '';
    }
    document.getElementById('edit-deduction-id').value = deduction.id;
    document.getElementById('edit-deduction-amount').value = deduction.amount || '';
    document.getElementById('edit-deduction-date').value = deduction.date || '';
    document.getElementById('edit-deduction-method').value = deduction.method || 'نقد';
    document.getElementById('edit-deduction-notes').value = deduction.notes || '';
    modalManager.open('edit-deduction-modal');
}

    // حفظ تعديل الاستقطاع
    function saveEditDeduction(event) {
        event.preventDefault();
        const id = document.getElementById('edit-deduction-id').value;
        const deduction = data.deductions.find(d => d.id === id);
        if (!deduction) {
            showToast('لم يتم العثور على الاستقطاع', 'error');
            return;
        }
        deduction.amount = parseFloat(document.getElementById('edit-deduction-amount').value) || 0;
        deduction.date = document.getElementById('edit-deduction-date').value;
        deduction.method = document.getElementById('edit-deduction-method').value;
        deduction.notes = document.getElementById('edit-deduction-notes').value;
        saveToLocalStorage();
        renderDeductionsTable();
        updateDashboard();
        modalManager.close('edit-deduction-modal');
        showToast('تم تحديث بيانات الاستقطاع بنجاح', 'success');
    }

function deleteDeduction(id) {
    if (confirm('هل أنت متأكد من حذف هذا الاستقطاع؟')) {
        if (firebaseInitialized) {
            db.ref(DB_PATHS.DEDUCTIONS).child(id).remove();
        }
        
        data.deductions = data.deductions.filter(d => d.id !== id);
        saveToLocalStorage();
        renderDeductionsTable();
        updateDashboard();
        showToast('تم حذف الاستقطاع', 'success');
    }
}

function editCase(id) {
    const caseData = data.cases.find(c => c.id === id);
    if (!caseData) {
        showToast('الدعوى غير موجودة', 'error');
        return;
    }
    
    // ملء النموذج بالبيانات الحالية
    document.getElementById('new-case-number').value = caseData.caseNumber || '';
    document.getElementById('new-case-date').value = caseData.filingDate || '';
    document.getElementById('new-case-priority').value = caseData.priority || 'عادية';
    document.getElementById('new-case-status').value = caseData.status || 'مسودة';
    if (document.getElementById('new-case-stage')) {
        document.getElementById('new-case-stage').value = caseData.stage || '';
    }
    document.getElementById('new-case-amount').value = caseData.amount || '';
    document.getElementById('new-case-plaintiff').value = caseData.plaintiffName || '';
    document.getElementById('new-case-plaintiff-phone').value = caseData.plaintiffPhone || '';
    if (document.getElementById('new-case-plaintiff-address')) {
        document.getElementById('new-case-plaintiff-address').value = caseData.plaintiffAddress || '';
    }
    document.getElementById('new-case-defendant').value = caseData.defendantName || '';
    document.getElementById('new-case-defendant-phone').value = caseData.defendantPhone || '';
    if (document.getElementById('new-case-defendant-address')) {
        document.getElementById('new-case-defendant-address').value = caseData.defendantAddress || '';
    }
    document.getElementById('new-case-lawyer').value = caseData.lawyerName || '';
    document.getElementById('new-case-court').value = caseData.court || '';
    if (document.getElementById('new-case-court-section')) {
        document.getElementById('new-case-court-section').value = caseData.courtSection || '';
    }
    document.getElementById('new-case-next-hearing').value = caseData.nextHearing || '';
    document.getElementById('new-case-notes').value = caseData.notes || '';
    
    // تحديث خيارات التنفيذ
    document.getElementById('execution-deduction').checked = caseData.executionDeduction || false;
    document.getElementById('execution-seizure').checked = caseData.executionSeizure || false;
    
    // إظهار خيارات التنفيذ إذا كانت الحالة "تنفيذ"
    if (caseData.status === 'تنفيذ') {
        document.getElementById('execution-options-container').style.display = 'block';
    } else {
        document.getElementById('execution-options-container').style.display = 'none';
    }
    
    // تغيير عنوان النافذة
    const modalTitle = document.querySelector('#new-case-modal .modal-header h2');
    if (modalTitle) modalTitle.textContent = 'تعديل الدعوى';
    
    // تغيير نص الزر
    const submitBtn = document.querySelector('#new-case-form button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات';
    
    // حفظ معرف الدعوى المراد تعديلها
    document.getElementById('new-case-form').dataset.editId = id;
    
    // فتح النافذة
    modalManager.open('new-case-modal');
}

function deleteCase(id) {
    if (confirm('هل أنت متأكد من حذف هذه الدعوى؟')) {
        // حذف من Firebase
        if (firebaseInitialized) {
            db.ref(DB_PATHS.CASES).child(id).remove();
        }
        
        data.cases = data.cases.filter(c => c.id !== id);
        saveToLocalStorage();
        renderCasesTable();
        updateDashboard();
        showToast('تم حذف الدعوى', 'success');
    }
}

// ==================== الإشعارات ====================
function toggleNotifications() {
    const panel = document.getElementById('notificationsPanel');
    const wasActive = panel.classList.contains('active');
    
    panel.classList.toggle('active');
    
    if (!wasActive) {
        // عند فتح اللوحة: تحديد جميع الإشعارات كمقروءة فوراً
        markAllNotificationsAsRead();
        // ثم عرض الإشعارات
        renderNotifications();
    }
}

function updateNotificationBadge() {
    const unreadCount = data.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = unreadCount;
        if (unreadCount > 0) {
            badge.classList.add('active');
        } else {
            badge.classList.remove('active');
        }
    }
}

function markAllNotificationsAsRead() {
    data.notifications.forEach(n => n.read = true);
    saveToLocalStorage();
    
    // تحديث Firebase
    if (firebaseInitialized) {
        db.ref(DB_PATHS.NOTIFICATIONS).set(data.notifications);
    }
    
    updateNotificationBadge();
}

function renderNotifications() {
    const panel = document.getElementById('notificationsPanel');
    if (!panel) return;
    
    // تحديث العداد فقط
    updateNotificationBadge();
    
    const notifications = getNotifications();
    const header = `
        <div class="notifications-header">
            <h3>الإشعارات</h3>
            <div style="display: flex; gap: 10px;">
                ${notifications.length > 0 ? '<button class="btn btn-danger" onclick="clearAllNotifications()" style="padding: 5px 12px; font-size: 13px;"><i class="fas fa-trash-alt"></i> حذف الكل</button>' : ''}
                <button class="close-btn" onclick="toggleNotifications()">&times;</button>
            </div>
        </div>
    `;

    if (notifications.length === 0) {
        panel.innerHTML = header + `
            <div class="notifications-list">
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <h3>لا توجد إشعارات</h3>
                </div>
            </div>
        `;
        return;
    }

    const list = notifications.map(n => {
        let onclick = '';
        let actionText = '';

        // التحقق من نوع الإشعار والحصول على المعرف
        if (n.caseNumber) {
            // إشعار خاص بدعوى
            onclick = `onclick="handleNotificationClick('${n.id}', 'case', '${n.caseNumber}')"`;
            actionText = '<div style="margin-top: 8px; color: var(--primary-blue); font-size: 12px;"><i class="fas fa-external-link-alt"></i> انقر للذهاب إلى الدعوى</div>';
        } else if (n.deductionId) {
            // إشعار خاص باستقطاع
            onclick = `onclick="handleNotificationClick('${n.id}', 'deduction', '${n.deductionId}')"`;
            actionText = '<div style="margin-top: 8px; color: var(--primary-blue); font-size: 12px;"><i class="fas fa-external-link-alt"></i> انقر للذهاب إلى الاستقطاع</div>';
        }
        
         else if (n.lawyerId) {
            // إشعار خاص برسالة
            onclick = `onclick="openChatWithLawyer('${n.lawyerId}')"`;
            actionText = '<div style="margin-top: 8px; color: var(--primary-blue); font-size: 12px;"><i class="fas fa-comment"></i> انقر لفتح المحادثة</div>';

        return `
            <div class="notification-item ${n.read ? '' : 'unread'}" style="position: relative;">
                <div ${onclick} style="cursor: ${onclick ? 'pointer' : 'default'}; padding-left: 40px;">
                    <div class="notification-title">${n.title || ''}</div>
                    <div class="notification-text">${n.text || ''}</div>
                    <div class="notification-time">${formatDateTime(n.createdAt || n.timestamp)}</div>
                    ${actionText}
                </div>
                <button class="notification-delete-btn" onclick="event.stopPropagation(); deleteNotification('${n.id}')" title="حذف الإشعار">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }}).join('');

    panel.innerHTML = header + '<div class="notifications-list">' + list + '</div>';
}


function handleNotificationClick(notificationId, type, targetId) {
    // تحديد الإشعار كمقروء
    const notification = data.notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        saveToLocalStorage();
    }
    
    // إغلاق لوحة الإشعارات
    toggleNotifications();
    
    // الانتقال إلى الصفحة المناسبة
    if (type === 'case') {
        navigateToCase(targetId);
    } else if (type === 'deduction') {
        navigateToDeduction(targetId);
    }
    
    // تحديث عداد الإشعارات
    renderNotifications();
}

function navigateToDeduction(deductionId) {
    // إغلاق لوحة الإشعارات
    const panel = document.getElementById('notificationsPanel');
    if (panel) {
        panel.classList.remove('active');
    }
    
    // الانتقال إلى صفحة الاستقطاعات
    navigateTo('deductions');
    
    // البحث عن الاستقطاع
    const deduction = data.deductions.find(d => d.id === deductionId);
    if (deduction) {
        // عرض تفاصيل الاستقطاع مباشرة
        setTimeout(() => {
            showDeductionDetails(deductionId);
        }, 300);
    } else {
        showToast('لم يتم العثور على الاستقطاع', 'error');
    }
}

function markNotificationRead(id) {
    const notification = data.notifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        saveToLocalStorage();
        renderNotifications();
    }
}

async function deleteNotification(id) {
    // إشعار دردشة: حذف فعلي من data.notifications وFirebase
    const notif = (data.notifications || []).find(n => n.id === id);
    if (notif) {
        data.notifications = data.notifications.filter(n => n.id !== id);
        saveToLocalStorage();
        if (firebaseInitialized) {
            await db.ref(DB_PATHS.NOTIFICATIONS).set(data.notifications);
        }
    }
    // إشعار دعوى أو إشعار نظامي أو استقطاع: أضف المعرف لقائمة المحذوفين محلياً دائماً إذا لم يكن إشعار دردشة
    if (!notif && !deletedNotificationIds.includes(id)) {
        deletedNotificationIds.push(id);
        saveDeletedNotificationIds();
    }
    // تحديث واجهة المستخدم
    renderNotifications();
    updateNotificationBell && updateNotificationBell();
    showToast('تم حذف الإشعار', 'success');
}

async function clearAllNotifications() {
    if (confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
        // حذف جميع إشعارات الدردشة من data.notifications وFirebase
        data.notifications = [];
        saveToLocalStorage();
        if (firebaseInitialized) {
            await db.ref(DB_PATHS.NOTIFICATIONS).remove();
        }

        // حذف جميع إشعارات الدعاوى (new/late) من قائمة المحذوفين
        if (data.cases && Array.isArray(data.cases)) {
            data.cases.forEach(c => {
                const newId = `new-${c.caseNumber}`;
                const lateId = `late-${c.caseNumber}`;
                if (!deletedNotificationIds.includes(newId)) {
                    deletedNotificationIds.push(newId);
                }
                if (!deletedNotificationIds.includes(lateId)) {
                    deletedNotificationIds.push(lateId);
                }
            });
        }
        // إشعارات الاستقطاع من الهاتف أو المحامي
        if (data.deductions && Array.isArray(data.deductions)) {
            data.deductions.forEach(d => {
                if (d.source === 'mobile' || d.source === 'lawyer') {
                    const dedId = `deducted-${d.caseNumber}-${d.amount}`;
                    if (!deletedNotificationIds.includes(dedId)) {
                        deletedNotificationIds.push(dedId);
                    }
                }
            });
        }
        // حفظ قائمة المحذوفين بعد التحديث
        saveDeletedNotificationIds();

        renderNotifications();
        updateNotificationBell && updateNotificationBell();
        showToast('تم حذف جميع الإشعارات', 'success');
    }
}

function addNotification(title, text, type = 'info', caseNumber = null, deductionId = null) {
    const notification = {
        id: generateId(),
        title: title,
        text: text,
        type: type,
        read: false,
        createdAt: new Date().toISOString()
    };
    
    // إضافة معلومات الدعوى أو الاستقطاع إذا كانت متوفرة
    if (caseNumber) {
        notification.caseNumber = caseNumber;
    }
    if (deductionId) {
        notification.deductionId = deductionId;
    }
    
    data.notifications.unshift(notification);
    saveToLocalStorage();
    
    // حفظ في Firebase
    if (firebaseInitialized) {
        db.ref(DB_PATHS.NOTIFICATIONS).set(data.notifications);
    }
    
    renderNotifications();
    // إشعار النظام
    showNotification(notification.title || title, notification.text || text);
}

// ==================== قوالب الدعاوى ====================

/**
 * تحديث القالب بناءً على المدخلات
 */
function updateTemplate() {
    const plaintiff = document.getElementById('template-plaintiff').value || 'المدعي';
    const plaintiffAddress = document.getElementById('template-plaintiff-address').value || 'اسامه علي حسن / بسكن / الهاشمية / اليوسفية';
    const defendant = document.getElementById('template-defendant').value || 'المدعى عليه';
    const defendantAddress = document.getElementById('template-defendant-address').value || 'حسن كاظم عنوان بسكن | المحكمة | الديار';
    const amount = document.getElementById('template-amount').value || '0';
    const amountText = numberToArabicWords(amount);
    const lawyer = document.getElementById('template-lawyer').value || 'حيدر علي هادي';
    const defendantLawyer = document.getElementById('template-defendant-lawyer').value || 'علي أباذر سالم';
    const evidence = document.getElementById('template-evidence').value || 'سائر البيانات القانونية';
    
    // تحديث المبلغ كتابة
    document.getElementById('template-amount-text').value = amountText;

    // تحديث نص جهة الدعوى يدويًا إذا توفر
    let customClaimText = '';
    const customClaimInput = document.getElementById('template-claim-text');
    if (customClaimInput && customClaimInput.value.trim() !== '') {
        customClaimText = customClaimInput.value.trim();
    } else {
        customClaimText = `لموكلي بذمة المدعى عليه مبلغ قدره <span style="font-weight: bold;">(${amount} د.ع)</span> <span style="font-weight: bold;">${amountText}</span> وذلك لأنه ممتنع عن تسديد المبلغ المذكور رغم المطالبة المستمرة ونظراً لامتناعه وتماطله فجئنا محكمتكم الموقرة ندعوه وتستمعون أقواله وبعد المطالبة المستمرة واصراره على عدم تسديد المبلغ المذكور أعلاه وتحميله كافة الرسوم والمصاريف وأتعاب المحاماة.`;
    }
    
    // إنشاء محتوى القالب
    const templateHTML = `

        <div class="template-header" style="font-size: 16pt; padding-top: 8mm;">
            <div style="text-align: right; margin-bottom: 8mm; font-size: 12pt;">
                <strong>السيد قاضي بداءة</strong>
                <span style="margin: 0 20mm;"></span>
                <strong>المحترم</strong>
            </div>
            <div style="text-align: right; margin-bottom: 4mm; font-size: 11pt; line-height: 1.7;">
                <strong>المدعي/ ${plaintiff}</strong> يسكن/ ${plaintiffAddress}
            </div>
            <div style="text-align: right; margin-bottom: 6mm; font-size: 11pt; line-height: 1.7;">
                <strong>المدعى عليه/ ${defendant}</strong> يسكن/ ${defendantAddress}
            </div>
        </div>

        <div class="template-section" style="margin: 10mm 0 8mm 0;">
            <h2 style="text-align: right; font-size: 12pt; font-weight: bold; margin-bottom: 4mm; letter-spacing: 1px;">جهة الدعوى:</h2>
            <div class="template-content" style="text-align: justify; line-height: 2.0; font-size: 10pt; padding: 0; background: none; border: none;">
                <div style="margin-top: 0; text-align: justify; font-size: 10pt;">
                    ${customClaimText}
                </div>
            </div>
        </div>

        <div class="template-section">
            <div style="text-align: center; margin: 30px 0;">
                <strong style="font-size: 18px;">ولكم فائق الشكر والتقدير</strong>
            </div>
        </div>

        <div class="template-footer" style="display: flex; flex-direction: column; margin-top: 40mm; font-size: 12pt; padding-top: 0; border: none;">
            <div style="display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; gap: 10mm;">
                <div style="flex: 2; text-align: right; display: flex; flex-direction: column; align-items: flex-start;">
                    <div style="font-size: 12pt; font-weight: bold; margin-bottom: 4px;">الأدلة الثبوتية</div>
                    <div style="font-size: 11pt; margin-bottom: 4px;">1- ${evidence}</div>
                </div>
            </div>
            <div style="font-size: 10pt; color: #888; text-align: right; margin-top: 8px;">سائر البيانات القانونية</div>
            <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-end; width: 100%; margin-top: 40mm; margin-bottom: 6mm;">
                <div style="font-size: 11pt; text-align: right;"><span style="font-weight: bold;">المحامي:</span> ${lawyer}</div>
                <div style="font-size: 11pt; text-align: left;"><span style="font-weight: bold;">وكيل المدعي:</span> ${defendantLawyer}</div>
            </div>
         </div>
    `;
    
    document.getElementById('template-preview').innerHTML = templateHTML;
}

/**
 * تحويل الأرقام إلى كلمات عربية
 */
function numberToArabicWords(num) {
    if (!num || num == 0) return 'صفر دينار';
    
    const number = parseInt(num);
    
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    
    function convertThreeDigits(n) {
        let result = '';
        const h = Math.floor(n / 100);
        const t = Math.floor((n % 100) / 10);
        const o = n % 10;
        
        if (h > 0) result += hundreds[h] + ' ';
        
        if (t === 1) {
            result += teens[o];
        } else {
            if (t > 0) result += tens[t] + ' ';
            if (o > 0) result += ones[o];
        }
        
        return result.trim();
    }
    
    let result = '';
    
    // الملايين
    if (number >= 1000000) {
        const millions = Math.floor(number / 1000000);
        if (millions === 1) result += 'مليون ';
        else if (millions === 2) result += 'مليونان ';
        else result += convertThreeDigits(millions) + ' مليون ';
    }
    
    // الآلاف
    const thousands = Math.floor((number % 1000000) / 1000);
    if (thousands > 0) {
        if (thousands === 1) result += 'ألف ';
        else if (thousands === 2) result += 'ألفان ';
        else result += convertThreeDigits(thousands) + ' ألف ';
    }
    
    // المئات والعشرات والآحاد
    const remainder = number % 1000;
    if (remainder > 0) {
        result += convertThreeDigits(remainder);
    }
    
    return result.trim() + ' دينار';
}

/**
 * طباعة القالب
 */
function printTemplate() {
    // تحديث القالب قبل الطباعة
    updateTemplate();
    
    // الانتظار قليلاً لضمان تحديث DOM
    setTimeout(() => {
        window.print();
    }, 100);
}

// ==================== النسخ الاحتياطي والتصدير ====================
function backupData() {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('تم تنزيل النسخة الاحتياطية', 'success');
}

function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const restored = JSON.parse(event.target.result);
                
                console.log('📥 بدء استيراد البيانات...');
                
                // التحقق من نوع الملف
                if (restored.cases && typeof restored.cases === 'object' && !Array.isArray(restored.cases)) {
                    // ملف Firebase - تحويل البيانات
                    console.log('🔄 اكتشاف ملف Firebase - جاري التحويل...');
                    data = convertFirebaseDataToLocal(restored);
                } else if (restored.cases && Array.isArray(restored.cases)) {
                    // ملف محلي عادي
                    console.log('✅ ملف محلي - استيراد مباشر');
                    data = restored;
                } else {
                    throw new Error('تنسيق الملف غير صحيح');
                }
                
                // حفظ البيانات مباشرة
                console.log('💾 حفظ البيانات في localStorage...');
                saveToLocalStorage();
                
                // عرض الإحصائيات
                console.log('📊 تم الاستيراد بنجاح:');
                console.log('  - الدعاوى:', data.cases.length);
                console.log('  - المدعى عليهم:', data.defendants.length);
                console.log('  - المحامين:', data.lawyers.length);
                console.log('  - الاستقطاعات:', data.deductions.length);
                
                showToast(`تم استيراد ${data.cases.length} دعوى و ${data.lawyers.length} محامي بنجاح!`, 'success');
                
                console.log('🔄 إعادة تحميل الصفحة...');
                // إعادة تحميل الصفحة مباشرة لضمان قراءة البيانات من localStorage
                setTimeout(() => {
                    location.reload();
                }, 800);
                
            } catch (error) {
                console.error('❌ خطأ في استعادة البيانات:', error);
                showToast('فشل استعادة البيانات - ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ==================== تحويل بيانات Firebase ====================
function convertFirebaseDataToLocal(firebaseData) {
    console.log('🔄 بدء تحويل بيانات Firebase...');
    
    const localData = {
        cases: [],
        defendants: [],
        lawyers: [],
        deductions: [],
        notifications: [],
        templates: [],
        chatMessages: {}
    };
    
    // تحويل الدعاوى
    if (firebaseData.cases && typeof firebaseData.cases === 'object') {
        console.log('📋 تحويل الدعاوى...');
        const casesArray = Array.isArray(firebaseData.cases) 
            ? firebaseData.cases 
            : Object.values(firebaseData.cases);
            
        casesArray.forEach((c, index) => {
            if (!c) return; // تخطي القيم الفارغة
            
            const caseData = {
                id: String(c.id || generateId()), // ✅ تحويل إلى string
                caseNumber: c.caseNumber || `CASE-${index + 1}`,
                filingDate: c.fileDate || c.filingDate || c.createdAt || new Date().toISOString(),
                priority: c.priority || 'عادية',
                status: c.status || 'مسودة',
                stage: c.stage || '',
                amount: parseFloat(c.amount) || 0,
                plaintiffName: c.plaintiffName || '',
                plaintiffPhone: c.plaintiffPhone || '',
                plaintiffAddress: c.plaintiffAddress || '',
                defendantName: c.defendantName || '',
                defendantPhone: c.defendantPhone || '',
                defendantAddress: c.defendantAddress || '',
                lawyerName: c.lawyerName || '',
                court: c.courtName || c.court || '',
                courtSection: c.courtSection || '',
                nextHearing: c.nextHearing || '',
                notes: c.notes || '',
                createdAt: c.createdAt || new Date().toISOString(),
                updatedAt: c.lastModified || c.updatedAt || c.createdAt || new Date().toISOString()
            };
            
            localData.cases.push(caseData);
        });
        console.log(`  ✅ تم تحويل ${localData.cases.length} دعوى`);
    }
    
    // تحويل المدعى عليهم
    if (firebaseData.defendants && typeof firebaseData.defendants === 'object') {
        console.log('👥 تحويل المدعى عليهم...');
        const defendantsArray = Array.isArray(firebaseData.defendants) 
            ? firebaseData.defendants 
            : Object.values(firebaseData.defendants);
            
        defendantsArray.forEach(d => {
            if (!d) return;
            
            localData.defendants.push({
                id: String(d.id || generateId()), // ✅ تحويل إلى string
                name: d.name || '',
                phone: d.phone || '',
                email: d.email || '',
                workplace: d.workplace || '',
                address: d.address || '',
                createdAt: d.createdAt || d.registrationDate || new Date().toISOString()
            });
        });
        console.log(`  ✅ تم تحويل ${localData.defendants.length} مدعى عليه`);
    }
    
    // تحويل المحامين
    if (firebaseData.lawyers && typeof firebaseData.lawyers === 'object') {
        console.log('👨‍⚖️ تحويل المحامين...');
        const lawyersArray = Array.isArray(firebaseData.lawyers) 
            ? firebaseData.lawyers 
            : Object.values(firebaseData.lawyers);
            
        lawyersArray.forEach(l => {
            if (!l) return;
            
            localData.lawyers.push({
                id: String(l.id || generateId()), // ✅ تحويل إلى string
                name: l.name || '',
                licenseNumber: l.license || l.licenseNumber || '',
                phone: l.phone || '',
                specialty: l.specialization || l.specialty || '',
                experience: l.experience || '',
                address: l.address || '',
                notes: l.notes || '',
                createdAt: l.createdAt || l.registrationDate || new Date().toISOString()
            });
        });
        console.log(`  ✅ تم تحويل ${localData.lawyers.length} محامي`);
    }
    
    // تحويل الاستقطاعات
    if (firebaseData.deductions && typeof firebaseData.deductions === 'object') {
        console.log('💰 تحويل الاستقطاعات...');
        const deductionsArray = Array.isArray(firebaseData.deductions) 
            ? firebaseData.deductions 
            : Object.values(firebaseData.deductions);
            
        deductionsArray.forEach(d => {
            if (!d) return;
            
            localData.deductions.push({
                id: String(d.id || generateId()), // ✅ تحويل إلى string
                caseNumber: d.caseNumber || '',
                amount: parseFloat(d.amount) || 0,
                date: d.date || new Date().toISOString().split('T')[0],
                method: d.source || d.method || 'نقدي',
                notes: d.notes || '',
                status: d.status || '',
                plaintiffName: d.plaintiffName || '',
                createdAt: d.createdAt || new Date().toISOString()
            });
        });
        console.log(`  ✅ تم تحويل ${localData.deductions.length} استقطاع`);
    }
    
    // تحويل الإشعارات
    if (firebaseData.notifications && typeof firebaseData.notifications === 'object') {
        console.log('🔔 تحويل الإشعارات...');
        const notificationsArray = Array.isArray(firebaseData.notifications) 
            ? firebaseData.notifications 
            : Object.values(firebaseData.notifications);
            
        notificationsArray.forEach(n => {
            if (!n) return;
            
            localData.notifications.push({
                id: n.id || generateId(),
                title: n.title || 'إشعار',
                text: n.description || n.text || '',
                type: n.type || 'info',
                read: n.read || false,
                createdAt: n.timestamp || n.createdAt || new Date().toISOString()
            });
        });
        console.log(`  ✅ تم تحويل ${localData.notifications.length} إشعار`);
    }
    
    console.log('✅ اكتمل تحويل البيانات من Firebase');
    console.log('📊 الملخص النهائي:');
    console.log('  � الدعاوى:', localData.cases.length);
    console.log('  👥 المدعى عليهم:', localData.defendants.length);
    console.log('  👨‍⚖️ المحامين:', localData.lawyers.length);
    console.log('  💰 الاستقطاعات:', localData.deductions.length);
    console.log('  🔔 الإشعارات:', localData.notifications.length);
    
    return localData;
}

function exportData() {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('تم تصدير البيانات', 'success');
}

function generateReport() {
    showToast('هذه الميزة قيد التطوير', 'info');
}

// ==================== الدردشة ====================
function renderLawyersChatList() {
    const container = document.getElementById('lawyers-chat-list');
    if (!container) return;
    
    if (data.lawyers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>لا يوجد محامين</h3>
                <p>أضف محامين للبدء بالدردشة</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.lawyers.map(l => {
        // حساب عدد الرسائل غير المقروءة
        const unreadCount = (data.chatMessages[l.id] || []).filter(m => 
            m.sender === 'lawyer' && !m.read && !m.deletedForAdmin
        ).length;
        
        return `
        <div class="lawyer-chat-item ${selectedLawyerForChat === l.id ? 'active' : ''}" 
             onclick="selectLawyerForChat('${l.id}')"
             style="padding: 15px; border-bottom: 1px solid #e2e8f0; cursor: pointer; transition: all 0.3s; position: relative;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); 
                            display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; flex-shrink: 0;">
                    ${l.name.charAt(0)}
                    ${unreadCount > 0 ? `
                        <div style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; 
                                    border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; 
                                    justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white;
                                    box-shadow: 0 2px 5px rgba(239, 68, 68, 0.5);">
                            ${unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                    ` : ''}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                        ${l.name}
                        ${unreadCount > 0 ? `
                            <span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 12px; 
                                         font-size: 11px; font-weight: bold;">
                                ${unreadCount} جديد
                            </span>
                        ` : ''}
                    </div>
                    <div style="font-size: 12px; color: #64748b;">${l.phone || 'لا يوجد هاتف'}</div>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function selectLawyerForChat(lawyerId) {
    console.log('🔍 اختيار محامي للدردشة:', lawyerId);
    console.log('📋 جميع المحامين:', data.lawyers.map(l => ({ id: l.id, name: l.name })));
    
    selectedLawyerForChat = lawyerId;
    renderLawyersChatList();
    renderChatMessages();
    document.getElementById('chat-input-area').style.display = 'block';
    
    // إظهار زر مسح المحادثة
    const clearChatBtn = document.getElementById('clear-chat-btn');
    if (clearChatBtn) clearChatBtn.style.display = 'inline-block';
    
    // للهواتف: إخفاء قائمة المحامين وإظهار منطقة الدردشة
    const chatPage = document.getElementById('chat-page');
    const backBtn = document.getElementById('chat-back-btn');
    const chatTitle = document.getElementById('chat-page-title');
    const lawyer = data.lawyers.find(l => l.id === lawyerId);
    
    console.log('👨‍⚖️ المحامي المختار:', lawyer);
    
    if (window.innerWidth <= 768) {
        chatPage.classList.add('chat-active');
        if (backBtn) backBtn.style.display = 'inline-flex';
        if (chatTitle && lawyer) chatTitle.textContent = `دردشة مع ${lawyer.name}`;
    }
}

function backToLawyersList() {
    const chatPage = document.getElementById('chat-page');
    const backBtn = document.getElementById('chat-back-btn');
    const chatTitle = document.getElementById('chat-page-title');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    
    chatPage.classList.remove('chat-active');
    if (backBtn) backBtn.style.display = 'none';
    if (chatTitle) chatTitle.textContent = 'الدردشة مع المحامين';
    if (clearChatBtn) clearChatBtn.style.display = 'none';
    
    // إخفاء منطقة الإدخال
    document.getElementById('chat-input-area').style.display = 'none';
    selectedLawyerForChat = null;
    renderLawyersChatList();
}

/**
 * مسح المحادثة الحالية
 */
function clearCurrentChat() {
    if (selectedLawyerForChat) {
        const lawyer = data.lawyers.find(l => l.id === selectedLawyerForChat);
        const lawyerName = lawyer ? lawyer.name : 'المحامي';
        
        if (confirm(`هل أنت متأكد من حذف جميع الرسائل مع ${lawyerName}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
            clearChatMessages(selectedLawyerForChat);
        }
    }
}

function renderChatMessages() {
    const container = document.getElementById('chat-messages');
    if (!container || !selectedLawyerForChat) return;
    
    const lawyer = data.lawyers.find(l => l.id === selectedLawyerForChat);
    if (!lawyer) return;
    
    const messages = data.chatMessages[selectedLawyerForChat] || [];
    
    // تصفية الرسائل المحذوفة للإدارة
    const visibleMessages = messages.filter(m => !m.deletedForAdmin);
    
    if (visibleMessages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comment-dots"></i>
                <h3>لا توجد رسائل</h3>
                <p>ابدأ محادثة مع ${lawyer.name}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = visibleMessages.map((m, index) => {
        const isAdmin = m.sender === 'admin';
        const senderName = isAdmin ? 'الإدارة' : (m.senderName || lawyer.name);
        const messageId = m.id || index;
        
        // حالة المشاهدة
        let readStatus = '';
        if (isAdmin) {
            if (m.lawyerRead) {
                readStatus = '<i class="fas fa-check-double" style="color: #10b981; margin-right: 5px;" title="تم المشاهدة"></i>';
            } else if (m.read) {
                readStatus = '<i class="fas fa-check-double" style="opacity: 0.5; margin-right: 5px;" title="تم التسليم"></i>';
            } else {
                readStatus = '<i class="fas fa-check" style="opacity: 0.5; margin-right: 5px;" title="تم الإرسال"></i>';
            }
        }
        
        return `
            <div class="chat-message-wrapper" style="margin-bottom: 15px; display: flex; ${isAdmin ? 'justify-content: flex-end' : 'justify-content: flex-start'};">
                <div class="chat-message-container" style="max-width: 70%; position: relative; group;">
                    <!-- قائمة الخيارات -->
                    <div class="message-options" style="position: absolute; top: -8px; ${isAdmin ? 'left: -8px' : 'right: -8px'}; 
                                display: none; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                                padding: 5px; z-index: 10;">
                        <button onclick="copyMessage('${messageId}')" title="نسخ" 
                                style="background: none; border: none; color: #6366f1; padding: 5px 8px; cursor: pointer; border-radius: 5px;">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="deleteMessage('${messageId}', '${selectedLawyerForChat}')" title="حذف" 
                                style="background: none; border: none; color: #ef4444; padding: 5px 8px; cursor: pointer; border-radius: 5px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <div class="chat-bubble" 
                         onmouseenter="this.parentElement.querySelector('.message-options').style.display='flex'" 
                         onmouseleave="this.parentElement.querySelector('.message-options').style.display='none'"
                         style="padding: 12px 16px; border-radius: 12px; 
                                background: ${isAdmin ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f1f5f9'}; 
                                color: ${isAdmin ? 'white' : '#1e293b'}; cursor: pointer;">
                        <div style="font-size: 11px; opacity: 0.8; margin-bottom: 5px; font-weight: bold;">
                            ${senderName}
                        </div>
                        <div class="message-text" data-message-id="${messageId}">${m.message}</div>
                        <div style="font-size: 11px; opacity: 0.7; margin-top: 5px; display: flex; align-items: center; justify-content: ${isAdmin ? 'flex-start' : 'flex-end'}; gap: 5px;">
                            ${formatDateTime(m.timestamp)}
                            ${readStatus}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.scrollTop = container.scrollHeight;
    
    // تحديث حالة القراءة للرسائل غير المقروءة من المحامي
    visibleMessages.forEach((m, index) => {
        if (m.sender !== 'admin' && !m.read) {
            const messageId = m.id || index;
            markMessageAsRead(messageId, selectedLawyerForChat);
        }
    });
}

function sendChatMessage() {
    if (!selectedLawyerForChat) {
        showToast('الرجاء اختيار محامي أولاً', 'warning');
        return;
    }
    
    const input = document.getElementById('chat-message-input');
    const message = input.value.trim();
    
    if (!message) {
        showToast('الرجاء كتابة رسالة', 'warning');
        return;
    }

    const lawyer = data.lawyers.find(l => l.id === selectedLawyerForChat);
    if (!lawyer) {
        console.error('❌ لم يتم العثور على المحامي:', selectedLawyerForChat);
        console.log('📋 المحامين المتاحين:', data.lawyers.map(l => ({ id: l.id, name: l.name })));
        showToast('لم يتم العثور على المحامي', 'error');
        return;
    }
    
    console.log('📤 إرسال رسالة إلى المحامي:', lawyer.name);
    console.log('🔑 معرف المحامي:', selectedLawyerForChat);
    
    const chatMessage = {
        sender: 'admin',
        senderName: 'الإدارة',
        message: message,
        timestamp: new Date().toISOString(),
        read: false,
        lawyerId: selectedLawyerForChat,
        lawyerName: lawyer.name,
        lawyerRead: false  // لم يقرأ المحامي الرسالة بعد
    };
    
    console.log('💬 بيانات الرسالة:', chatMessage);
    
    // حفظ محلياً
    if (!data.chatMessages[selectedLawyerForChat]) {
        data.chatMessages[selectedLawyerForChat] = [];
    }
    
    data.chatMessages[selectedLawyerForChat].push(chatMessage);
    
    // حفظ في Firebase
    if (firebaseInitialized) {
        const chatPath = `${DB_PATHS.CHAT}/${selectedLawyerForChat}`;
        console.log('🔥 حفظ في Firebase:', chatPath);
        
        db.ref(chatPath).push(chatMessage)
            .then(() => {
                console.log('✅ تم إرسال الرسالة إلى Firebase بنجاح');
            })
            .catch(error => {
                console.error('❌ خطأ في إرسال الرسالة:', error);
                showToast('فشل إرسال الرسالة، حاول مرة أخرى', 'error');
            });
    } else {
        console.warn('⚠️ Firebase غير مفعل');
    }
    
    saveToLocalStorage();
    renderChatMessages();
    
    input.value = '';
    showToast('تم إرسال الرسالة', 'success');
}

// ==================== عدادات الإحصائيات ====================

// تحديث عدادات الإحصائيات في لوحة التحكم
function updateStatsCounters() {
    // إجمالي الدعاوى
    document.getElementById('stat-total-cases').textContent = data.cases.length;

    // الدعاوى المعلقة
    const pendingCases = data.cases.filter(c => c.status === 'معلقة');
    document.getElementById('stat-pending-cases').textContent = pendingCases.length;

    // الدعاوى المكتملة
    const completedCases = data.cases.filter(c => c.status === 'مكتملة');
    document.getElementById('stat-completed-cases').textContent = completedCases.length;

    // إجمالي المبالغ
    const totalAmount = data.cases.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    document.getElementById('stat-total-amount').textContent = totalAmount.toLocaleString() + ' د.ع';

    // الدعاوى المسودة
    const draftCases = data.cases.filter(c => c.status === 'مسودة');
    document.getElementById('stat-draft-cases').textContent = draftCases.length;

    // الدعاوى المرفوعة
    const filedCases = data.cases.filter(c => c.status === 'مرفوع');
    document.getElementById('stat-filed-cases').textContent = filedCases.length;

    // الدعاوى في المحكمة
    const incourtCases = data.cases.filter(c => c.status === 'في المحكمة');
    document.getElementById('stat-incourt-cases').textContent = incourtCases.length;

    // الدعاوى صدور حكم
    const judgmentCases = data.cases.filter(c => c.status === 'صدور حكم');
    document.getElementById('stat-judgment-cases').textContent = judgmentCases.length;

    // الدعاوى التنفيذ
    const executionCases = data.cases.filter(c => c.status === 'تنفيذ');
    document.getElementById('stat-execution-cases').textContent = executionCases.length;

    // الدعاوى المغلقة
    const closedCases = data.cases.filter(c => c.status === 'مغلق');
    document.getElementById('stat-closed-cases').textContent = closedCases.length;

    // الدعاوى تم الاستقطاع
    const deductionCases = data.cases.filter(c => c.executionDeduction === true);
    document.getElementById('stat-deduction-cases').textContent = deductionCases.length;

    // الدعاوى تم الحجز
    const seizedCases = data.cases.filter(c => c.executionSeizure === true);
    document.getElementById('stat-seized-cases').textContent = seizedCases.length;
}

// استدعاء تحديث العدادات بعد تحميل البيانات
function onDataLoaded() {
    updateStatsCounters();
    // ... أي عمليات أخرى بعد تحميل البيانات ...
}

// ==================== التهيئة عند التحميل ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 بدء تحميل التطبيق...');
    
    // تحميل البيانات المحلية
    loadFromLocalStorage();
    
    // تهيئة Firebase
    initFirebase();
    
    // إعداد التنقل
    setupNavigation();
    
    // إعداد القائمة للهواتف
    setupMobileMenu();
    
    // تحديث جميع الجداول
    console.log('📊 تحديث الواجهة...');
    updateDashboard();
    renderCasesTable();
    renderDefendantsTable();
    renderLawyersTable();
    renderDeductionsTable();
    
    // عرض الإشعارات
    renderNotifications();
    
    // تحديث عدادات الإحصائيات
    updateStatsCounters();
    
    console.log('✅ تم تحميل التطبيق بنجاح');
    console.log('📈 الإحصائيات:', {
        cases: data.cases.length,
        defendants: data.defendants.length,
        lawyers: data.lawyers.length,
        deductions: data.deductions.length
    });

    // جلب بيانات الاستقطاعات من ملف JSON إذا لم تكن موجودة في Firebase
    if (!firebaseInitialized && (!data.deductions || data.deductions.length === 0)) {
        fetch('legal-administration-default-rtdb-deductions-export.json')
            .then(response => response.json())
            .then(json => {
                // توقع أن البيانات عبارة عن مصفوفة أو كائن رئيسي يحتوي على مصفوفة
                let deductionsArr = Array.isArray(json) ? json : (json.deductions || Object.values(json));
                data.deductions = deductionsArr;
                renderDeductionsTable();
                updateDashboard();
            })
            .catch(err => {
                console.error('خطأ في تحميل بيانات الاستقطاعات من الملف:', err);
            });
    }
    
    // مراقبة تغيير حجم الشاشة لإعادة ضبط واجهة الدردشة
    window.addEventListener('resize', () => {
        const chatPage = document.getElementById('chat-page');
        const backBtn = document.getElementById('chat-back-btn');
        
        if (window.innerWidth > 768) {
            // على الشاشات الكبيرة: إزالة وضع الهاتف
            if (chatPage) chatPage.classList.remove('chat-active');
            if (backBtn) backBtn.style.display = 'none';
        } else if (window.innerWidth <= 768 && selectedLawyerForChat) {
            // على الهاتف: إذا كان هناك محامي محدد، إظهار زر العودة
            if (chatPage) chatPage.classList.add('chat-active');
            if (backBtn) backBtn.style.display = 'inline-flex';
        }
    });
});

// ==================== القائمة للهواتف ====================
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (!menuToggle || !sidebar || !overlay) return;
    
    // فتح/إغلاق القائمة
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    });
    
    // إغلاق عند النقر على الـ overlay
    overlay.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // إغلاق القائمة عند اختيار صفحة (للهواتف فقط)
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                setTimeout(() => {
                    menuToggle.classList.remove('active');
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }, 300);
            }
        });
    });
}

// ==================== الانتقال إلى دعوى من الإشعار ====================
function navigateToCase(caseNumber) {
    // إغلاق لوحة الإشعارات
    const panel = document.getElementById('notificationsPanel');
    if (panel) {
        panel.classList.remove('active');
    }
    
    // الانتقال إلى صفحة الدعاوى
    navigateTo('cases');
    
    // البحث عن الدعوى
    const caseData = data.cases.find(c => c.caseNumber === caseNumber);
    if (caseData) {
        // عرض تفاصيل الدعوى مباشرة
        setTimeout(() => {
            showCaseDetails(caseData.id);
        }, 300);
    } else {
        showToast('الدعوى غير موجودة', 'error');
    }
}
// دوال JavaScript جديدة للتحديثات

// دالة لعرض جميع الدعاوى عند النقر على الفلاتر الرئيسية
function showAllCases() {
    navigateTo('cases');
    // إعادة تعيين الفلاتر لعرض جميع الدعاوى
    document.getElementById('cases-status-filter').value = '';
    document.getElementById('cases-search').value = '';
    renderCasesTable();
}

// دالة للانتقال إلى صفحة الاستقطاعات
function goToDeductions() {
    navigateTo('deductions');
}

// دالة لعرض صفحة الدعاوى الأخيرة الكاملة
function showRecentCasesPage() {
    navigateTo('recent-cases');
    renderRecentCasesFullTable();
}

// دالة لعرض جدول الدعاوى الأخيرة في الصفحة المخصصة
function renderRecentCasesFullTable() {
    const tbody = document.getElementById('recent-cases-full-table');
    if (!tbody) return;
    
    // أحدث 20 دعوى
    const recentCases = data.cases
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 20);
    
    if (recentCases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>لا توجد دعاوى حالياً</h3>
                    <p>ابدأ بإضافة دعوى جديدة</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = recentCases.map(c => `
        <tr>
            <td><strong>${c.caseNumber}</strong></td>
            <td>${c.plaintiffName || c.plaintiff || ''}</td>
            <td>${c.defendantName || c.defendant || ''}</td>
            <td><span class="badge badge-${c.status && c.status.toLowerCase ? c.status ? c.status.toLowerCase() : 'draft'.replace(/\s/g, '-') : ''}">${c.status || ''}</span></td>
            <td><strong>${formatCurrency(c.amount)}</strong></td>
            <td>${c.nextHearing || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="showCaseDetails('${c.id}')" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="editCase('${c.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCase('${c.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// تحديث دالة filterAndNavigate لتعمل بشكل صحيح
function filterAndNavigate(filterType) {
    if (filterType === 'الاستقطاعات' || filterType === 'مبالغ الاستقطاعات') {
        // الانتقال إلى صفحة الاستقطاعات
        navigateTo('deductions');
    } else if (filterType === 'المبالغ') {
        // عرض جميع الدعاوى عند النقر على مجموع المبالغ
        showAllCases();
    } else if (filterType === 'معلقة' || filterType === 'مكتملة' || filterType === 'مسودة' || 
               filterType === 'مرفوع' || filterType === 'في المحكمة' || filterType === 'صدور حكم' || 
               filterType === 'تنفيذ' || filterType === 'مغلق' || filterType === 'تم الاستقطاع' || filterType === 'تم الحجز') {
        // الانتقال إلى صفحة الدعاوى مع تطبيق الفلتر
        navigateTo('cases');
        setTimeout(() => {
            const statusFilter = document.getElementById('cases-status-filter');
            if (statusFilter) {
                statusFilter.value = filterType;
                filterCases();
            }
        }, 100);
    }
}

console.log('✅ تم تحميل دوال JavaScript الجديدة للتحديثات');// ==================== دوال محدثة وإصلاحات ====================

// دالة لعرض جميع الدعاوى عند النقر على الفلاتر الرئيسية
function showAllCases() {
    navigateTo('cases');
    // إعادة تعيين الفلاتر لعرض جميع الدعاوى
    const statusFilter = document.getElementById('cases-status-filter');
    const searchInput = document.getElementById('cases-search');
    if (statusFilter) statusFilter.value = '';
    if (searchInput) searchInput.value = '';
    renderCasesTable();
}

// دالة للانتقال إلى صفحة الاستقطاعات
function goToDeductions() {
    navigateTo('deductions');
}

// دالة لعرض صفحة الدعاوى الأخيرة الكاملة
function showRecentCasesPage() {
    navigateTo('recent-cases');
    renderRecentCasesFullTable();
}

// دالة لعرض جدول الدعاوى الأخيرة في الصفحة المخصصة
function renderRecentCasesFullTable() {
    const tbody = document.getElementById('recent-cases-full-table');
    if (!tbody) return;
    
    // أحدث 20 دعوى
    const recentCases = data.cases
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 20);
    
    if (recentCases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>لا توجد دعاوى حالياً</h3>
                    <p>ابدأ بإضافة دعوى جديدة</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = recentCases.map(c => `
        <tr>
            <td><strong>${c.caseNumber}</strong></td>
            <td>${c.plaintiffName || c.plaintiff || 'غير محدد'}</td>
            <td>${c.defendantName || c.defendant || 'غير محدد'}</td>
            <td><span class="badge badge-${c.status ? c.status.toLowerCase() : 'draft'.replace(/\s/g, '-')}">${c.status}</span></td>
            <td><strong>${formatCurrency(c.amount)}</strong></td>
            <td>${c.nextHearing || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="showCaseDetails('${c.id}')" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="editCase('${c.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCase('${c.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// تحديث دالة filterAndNavigate لتعمل بشكل صحيح
function filterAndNavigate(filterType) {
    if (filterType === 'الاستقطاعات' || filterType === 'مبالغ الاستقطاعات') {
        // الانتقال إلى صفحة الاستقطاعات
        navigateTo('deductions');
    } else if (filterType === 'المبالغ') {
        // عرض جميع الدعاوى عند النقر على مجموع المبالغ
        showAllCases();
    } else {
        // يمكنك إضافة منطق إضافي هنا إذا لزم الأمر
     }
// ...
showGlobalSearchResults = function(query, results) {
    const totalResults = 
        results.cases.length + 
        results.defendants.length + 
        results.lawyers.length + 
        results.deductions.length + 
        results.hearings.length;
    
    if (totalResults === 0) {
        showNotification(`لم يتم العثور على نتائج لـ "${query}"`, 'info');
        return;
    }
    
    // إنشاء نافذة النتائج
    const modal = document.createElement('div');
    modal.id = 'global-search-results-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 16px;
        max-width: 900px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    `;
    
    let html = `
        <div style="padding: 20px; border-bottom: 2px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; color: #6366f1; font-size: 24px;">
                    <i class="fas fa-search"></i> نتائج البحث عن "${query}"
                </h2>
                <button onclick="window.closeGlobalSearchResults()" style="
                    background: #ef4444;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    <i class="fas fa-times"></i> إغلاق
                </button>
            </div>
            <p style="color: #6b7280; margin-top: 10px;">
                تم العثور على ${totalResults} نتيجة
            </p>
        </div>
        <div style="padding: 20px;">
    `;

     }
    
    // عرض نتائج الدعاوى
    if (results.cases.length > 0) {
        html += `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #6366f1; margin-bottom: 15px;">
                    <i class="fas fa-gavel"></i> الدعاوى (${results.cases.length})
                </h3>
                <div style="display: grid; gap: 12px;">
        `;
        
        results.cases.forEach(c => {
            html += `
                <div style="
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    padding: 15px;
                    border-radius: 12px;
                    border-left: 4px solid #6366f1;
                    cursor: pointer;
                " onclick="showCaseDetails('${c.id}'); window.closeGlobalSearchResults();">
                    <div style="font-weight: bold; color: #1e40af; margin-bottom: 5px;">
                        قضية رقم: ${c.caseNumber}
                    </div>
                    <div style="color: #475569; font-size: 14px;">
                        المدعي: ${c.plaintiffName || c.plaintiff || 'غير محدد'} | 
                        المدعى عليه: ${c.defendantName || c.defendant || 'غير محدد'}
                    </div>
                    <div style="color: #64748b; font-size: 13px; margin-top: 5px;">
                        الحالة: ${c.status} | المحامي: ${c.lawyerName || 'غير محدد'}
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    // عرض نتائج المدعى عليهم
    if (results.defendants.length > 0) {
        html += `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #10b981; margin-bottom: 15px;">
                    <i class="fas fa-users"></i> المدعى عليهم (${results.defendants.length})
                </h3>
                <div style="display: grid; gap: 12px;">
        `;
        
        results.defendants.forEach(d => {
            html += `
                <div style="
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    padding: 15px;
                    border-radius: 12px;
                    border-left: 4px solid #10b981;
                    cursor: pointer;
                " onclick="showDefendantCases({name: '${d.name}', id: '${d.id}'}); window.closeGlobalSearchResults();">
                    <div style="font-weight: bold; color: #065f46; margin-bottom: 5px;">
                        ${d.name}
                    </div>
                    <div style="color: #475569; font-size: 14px;">
                        الهاتف: ${d.phone || 'غير محدد'} | العنوان: ${d.address || 'غير محدد'}
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    // عرض نتائج المحامين
    if (results.lawyers.length > 0) {
        html += `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #f59e0b; margin-bottom: 15px;">
                    <i class="fas fa-user-tie"></i> المحامون (${results.lawyers.length})
                </h3>
                <div style="display: grid; gap: 12px;">
        `;
        
        results.lawyers.forEach(l => {
            html += `
                <div style="
                    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
                    padding: 15px;
                    border-radius: 12px;
                    border-left: 4px solid #f59e0b;
                ">
                    <div style="font-weight: bold; color: #92400e; margin-bottom: 5px;">
                        ${l.name}
                    </div>
                    <div style="color: #475569; font-size: 14px;">
                        الهاتف: ${l.phone || 'غير محدد'} | 
                        التخصص: ${l.specialization || 'غير محدد'}
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    // عرض نتائج الاستقطاعات
    if (results.deductions.length > 0) {
        html += `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #8b5cf6; margin-bottom: 15px;">
                    <i class="fas fa-money-bill-wave"></i> الاستقطاعات (${results.deductions.length})
                </h3>
                <div style="display: grid; gap: 12px;">
        `;
        
        results.deductions.forEach(d => {
            html += `
                <div style="
                    background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
                    padding: 15px;
                    border-radius: 12px;
                    border-left: 4px solid #8b5cf6;
                    cursor: pointer;
                " onclick="showDeductionDetails('${d.id}'); window.closeGlobalSearchResults();">
                    <div style="font-weight: bold; color: #6b21a8; margin-bottom: 5px;">
                        قضية رقم: ${d.caseNumber}
                    </div>
                    <div style="color: #475569; font-size: 14px;">
                        المبلغ: ${formatCurrency(d.amount)} | 
                        التاريخ: ${formatDate(d.date)}
                    </div>
                    <div style="color: #64748b; font-size: 13px; margin-top: 5px;">
                        الحالة: ${d.status} | الطريقة: ${d.method}
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    // عرض نتائج الجلسات
    if (results.hearings.length > 0) {
        html += `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #ec4899; margin-bottom: 15px;">
                    <i class="fas fa-calendar"></i> الجلسات (${results.hearings.length})
                </h3>
                <div style="display: grid; gap: 12px;">
        `;
        
        results.hearings.forEach(h => {
            html += `
                <div style="
                    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
                    padding: 15px;
                    border-radius: 12px;
                    border-left: 4px solid #ec4899;
                ">
                    <div style="font-weight: bold; color: #9f1239; margin-bottom: 5px;">
                        جلسة - قضية رقم: ${h.caseNumber}
                    </div>
                    <div style="color: #475569; font-size: 14px;">
                        التاريخ: ${formatDate(h.date)} | 
                        المحكمة: ${h.courtName}
                    </div>
                    <div style="color: #64748b; font-size: 13px; margin-top: 5px;">
                        الحالة: ${h.status}
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    html += `</div>`;
    
    content.innerHTML = html;
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // إغلاق عند النقر خارج النافذة
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            window.closeGlobalSearchResults();
        }
    });
}

window.closeGlobalSearchResults = function() {
    const modal = document.getElementById('global-search-results-modal');
    if (modal) {
        modal.remove();
    }
}

// إضافة مستمع للضغط على Enter في مربع البحث الشامل
document.addEventListener('DOMContentLoaded', function() {
    const globalSearchInput = document.getElementById('global-search');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                globalSearch();
            }
        });
    }
});

function globalSearch(searchValue) {
    let query;
    
    // إذا تم تمرير searchValue كمعامل، استخدمه
    if (searchValue) {
        query = searchValue.trim().toLowerCase();
    } else {
        // وإلا، استخدم قيمة input
        const input = document.getElementById('global-search') || document.getElementById('global-search-modal');
        if (!input) {
            console.error('❌ مربع البحث غير موجود');
            return;
        }
        query = input.value.trim().toLowerCase();
    }
    
    if (!query) {
        showNotification('الرجاء إدخال كلمة للبحث', 'warning');
        return;
    }
    
    console.log('🔍 البحث الشامل عن:', query);

    // بحث في الدعاوى
    const casesResults = data.cases.filter(c => {
        return (
            (c.caseNumber && c.caseNumber.toLowerCase().includes(query)) ||
            (c.plaintiffName && c.plaintiffName.toLowerCase().includes(query)) ||
            (c.plaintiff && c.plaintiff.toLowerCase().includes(query)) ||
            (c.defendantName && c.defendantName.toLowerCase().includes(query)) ||
            (c.defendant && c.defendant.toLowerCase().includes(query)) ||
            (c.lawyerName && c.lawyerName.toLowerCase().includes(query)) ||
            (c.courtName && c.courtName.toLowerCase().includes(query)) ||
            (c.status && c.status.toLowerCase().includes(query)) ||
            (c.notes && c.notes.toLowerCase().includes(query))
        );
    });

    // بحث في المدعى عليهم
    const defendantsResults = data.defendants.filter(d => {
        return (
            (d.name && d.name.toLowerCase().includes(query)) ||
            (d.phone && d.phone.toLowerCase().includes(query)) ||
            (d.address && d.address.toLowerCase().includes(query)) ||
            (d.nationalId && d.nationalId.toLowerCase().includes(query)) ||
            (d.workplace && d.workplace.toLowerCase().includes(query)) ||
            (d.notes && d.notes.toLowerCase().includes(query))
        );
    });

    // بحث في المحامين
    const lawyersResults = data.lawyers.filter(l => {
        return (
            (l.name && l.name.toLowerCase().includes(query)) ||
            (l.phone && l.phone.toLowerCase().includes(query)) ||
            (l.email && l.email.toLowerCase().includes(query)) ||
            (l.specialization && l.specialization.toLowerCase().includes(query)) ||
            (l.specialty && l.specialty.toLowerCase().includes(query)) ||
            (l.licenseNumber && l.licenseNumber.toLowerCase().includes(query)) ||
            (l.notes && l.notes.toLowerCase().includes(query))
        );
    });

    // بحث في الاستقطاعات
    const deductionsResults = data.deductions.filter(d => {
        return (
            (d.caseNumber && d.caseNumber.toLowerCase().includes(query)) ||
            (d.plaintiff && d.plaintiff.toLowerCase().includes(query)) ||
            (d.plaintiffName && d.plaintiffName.toLowerCase().includes(query)) ||
            (d.defendant && d.defendant.toLowerCase().includes(query)) ||
            (d.defendantName && d.defendantName.toLowerCase().includes(query)) ||
            (d.lawyerName && d.lawyerName.toLowerCase().includes(query)) ||
            (d.amount && String(d.amount).toLowerCase().includes(query)) ||
            (d.method && d.method.toLowerCase().includes(query)) ||
            (d.status && d.status.toLowerCase().includes(query)) ||
            (d.notes && d.notes.toLowerCase().includes(query))
        );
    });

    // بحث في الجلسات القادمة
    const hearingsResults = data.cases.filter(c => {
        return (
            c.nextHearing && (
                c.nextHearing.toLowerCase().includes(query) ||
                (c.courtName && c.courtName.toLowerCase().includes(query)) ||
                (c.court && c.court.toLowerCase().includes(query)) ||
                (c.status && c.status.toLowerCase().includes(query))
            )
        );
    }).map(c => ({
        caseNumber: c.caseNumber,
        date: c.nextHearing,
        courtName: c.courtName || c.court,
        status: c.status
    }));

    console.log('✅ نتائج البحث:', {
        cases: casesResults.length,
        defendants: defendantsResults.length,
        lawyers: lawyersResults.length,
        deductions: deductionsResults.length,
        hearings: hearingsResults.length
    });

    showGlobalSearchResults(query, {
        cases: casesResults,
        defendants: defendantsResults,
        lawyers: lawyersResults,
        deductions: deductionsResults,
        hearings: hearingsResults
    });
}

function showGlobalSearchResults(query, results) {
    const totalResults = 
        results.cases.length + 
        results.defendants.length + 
        results.lawyers.length + 
        results.deductions.length + 
        results.hearings.length;
    
    if (totalResults === 0) {
        // إنشاء نافذة "لا توجد نتائج"
        const modal = document.createElement('div');
        modal.id = 'global-search-results-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 24px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        content.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <div style="
                    width: 120px;
                    height: 120px;
                    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 30px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                ">
                    <i class="fas fa-search" style="font-size: 50px; color: #9ca3af;"></i>
                </div>
                
                <h2 style="
                    margin: 0 0 15px 0;
                    color: #1f2937;
                    font-size: 28px;
                    font-weight: bold;
                ">
                    لا توجد نتائج
                </h2>
                
                <p style="
                    color: #6b7280;
                    font-size: 18px;
                    margin: 0 0 10px 0;
                    line-height: 1.6;
                ">
                    لم يتم العثور على نتائج لـ
                </p>
                
                <div style="
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    padding: 15px 25px;
                    border-radius: 12px;
                    margin: 0 0 30px 0;
                    display: inline-block;
                ">
                    <span style="
                        color: #1e40af;
                        font-size: 20px;
                        font-weight: bold;
                    ">"${query}"</span>
                </div>
                
                <div style="
                    background: #fef3c7;
                    padding: 20px;
                    border-radius: 12px;
                    margin: 0 0 30px 0;
                    border-right: 4px solid #f59e0b;
                ">
                    <h4 style="
                        margin: 0 0 10px 0;
                        color: #92400e;
                        font-size: 16px;
                    ">
                        <i class="fas fa-lightbulb"></i> جرب:
                    </h4>
                    <ul style="
                        margin: 0;
                        padding-right: 20px;
                        color: #78350f;
                        font-size: 15px;
                        line-height: 1.8;
                        text-align: right;
                    ">
                        <li>تأكد من كتابة الكلمة بشكل صحيح</li>
                        <li>استخدم كلمات أقل أو مختلفة</li>
                        <li>استخدم كلمات أكثر عمومية</li>
                    </ul>
                </div>
                
                <button onclick="closeGlobalSearchResults()" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    color: white;
                    padding: 14px 40px;
                    border-radius: 12px;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                    transition: all 0.3s;
                " 
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(102, 126, 234, 0.4)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.3)'">
                    <i class="fas fa-times-circle"></i> إغلاق
                </button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // إغلاق عند النقر خارج النافذة
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeGlobalSearchResults();
            }
        });
        
        return;
    }
    
    // إنشاء نافذة النتائج
    const modal = document.createElement('div');
    modal.id = 'global-search-results-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 16px;
        max-width: 900px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    `;
    
    let html = `
        <div style="padding: 20px; border-bottom: 2px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; color: #6366f1; font-size: 24px;">
                    <i class="fas fa-search"></i> نتائج البحث عن "${query}"
                </h2>
                <button onclick="closeGlobalSearchResults()" style="
                    background: #ef4444;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    <i class="fas fa-times"></i> إغلاق
                </button>
            </div>
            <p style="color: #6b7280; margin-top: 10px;">
                تم العثور على ${totalResults} نتيجة
            </p>
        </div>
        <div style="padding: 20px;">
    `;
    
    // عرض نتائج الدعاوى
    if (results.cases.length > 0) {
        html += `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #6366f1; margin-bottom: 15px;">
                    <i class="fas fa-gavel"></i> الدعاوى (${results.cases.length})
                </h3>
                <div style="display: grid; gap: 12px;">
        `;
        
        results.cases.forEach(c => {
            html += `
                <div style="
                    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                    padding: 15px;
                    border-radius: 12px;
                    border-left: 4px solid #6366f1;
                    cursor: pointer;
                " onclick="showCaseDetails('${c.id}'); closeGlobalSearchResults();">
                    <div style="font-weight: bold; color: #1e40af; margin-bottom: 5px;">
                        قضية رقم: ${c.caseNumber}
                    </div>
                    <div style="color: #475569; font-size: 14px;">
                        المدعي: ${c.plaintiffName || c.plaintiff || 'غير محدد'} | 
                        المدعى عليه: ${c.defendantName || c.defendant || 'غير محدد'}
                    </div>
                    <div style="color: #64748b; font-size: 13px; margin-top: 5px;">
                        الحالة: ${c.status} | المحامي: ${c.lawyerName || 'غير محدد'}
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    // عرض نتائج المدعى عليهم
    if (results.defendants.length > 0) {
        html += `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #10b981; margin-bottom: 15px;">
                    <i class="fas fa-users"></i> المدعى عليهم (${results.defendants.length})
                </h3>
                <div style="display: grid; gap: 12px;">
        `;
        
        results.defendants.forEach(d => {
            html += `
                <div style="
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    padding: 15px;
                    border-radius: 12px;
                    border-left: 4px solid #10b981;
                    cursor: pointer;
                " onclick="showDefendantCases({name: '${d.name}', id: '${d.id}'}); closeGlobalSearchResults();">
                    <div style="font-weight: bold; color: #065f46; margin-bottom: 5px;">
                        ${d.name}
                    </div>
                    <div style="color: #475569; font-size: 14px;">
                        الهاتف: ${d.phone || 'غير محدد'} | العنوان: ${d.address || 'غير محدد'}
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    // عرض نتائج المحامين
    if (results.lawyers.length > 0) {
        html += `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #f59e0b; margin-bottom: 15px;">
                    <i class="fas fa-user-tie"></i> المحامون (${results.lawyers.length})
                </h3>
                <div style="display: grid; gap: 12px;">
        `;
        
        results.lawyers.forEach(l => {
            html += `
                <div style="
                    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
                    padding: 15px;
                    border-radius: 12px;
                    border-left: 4px solid #f59e0b;
                ">
                    <div style="font-weight: bold; color: #92400e; margin-bottom: 5px;">
                        ${l.name}
                    </div>
                    <div style="color: #475569; font-size: 14px;">
                        الهاتف: ${l.phone || 'غير محدد'} | 
                        التخصص: ${l.specialization || 'غير محدد'}
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    // عرض نتائج الاستقطاعات
    if (results.deductions.length > 0) {
        html += `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #8b5cf6; margin-bottom: 15px;">
                    <i class="fas fa-money-bill-wave"></i> الاستقطاعات (${results.deductions.length})
                </h3>
                <div style="display: grid; gap: 12px;">
        `;
        
        results.deductions.forEach(d => {
            html += `
                <div style="
                    background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
                    padding: 15px;
                    border-radius: 12px;
                    border-left: 4px solid #8b5cf6;
                    cursor: pointer;
                " onclick="showDeductionDetails('${d.id}'); closeGlobalSearchResults();">
                    <div style="font-weight: bold; color: #6b21a8; margin-bottom: 5px;">
                        قضية رقم: ${d.caseNumber}
                    </div>
                    <div style="color: #475569; font-size: 14px;">
                        المبلغ: ${formatCurrency(d.amount)} | 
                        التاريخ: ${formatDate(d.date)}
                    </div>
                    <div style="color: #64748b; font-size: 13px; margin-top: 5px;">
                        الحالة: ${d.status} | الطريقة: ${d.method}
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    // عرض نتائج الجلسات
    if (results.hearings.length > 0) {
        html += `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #ec4899; margin-bottom: 15px;">
                    <i class="fas fa-calendar"></i> الجلسات (${results.hearings.length})
                </h3>
                <div style="display: grid; gap: 12px;">
        `;
        
        results.hearings.forEach(h => {
            html += `
                <div style="
                    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
                    padding: 15px;
                    border-radius: 12px;
                    border-left: 4px solid #ec4899;
                ">
                    <div style="font-weight: bold; color: #9f1239; margin-bottom: 5px;">
                        جلسة - قضية رقم: ${h.caseNumber}
                    </div>
                    <div style="color: #475569; font-size: 14px;">
                        التاريخ: ${formatDate(h.date)} | 
                        المحكمة: ${h.courtName}
                    </div>
                    <div style="color: #64748b; font-size: 13px; margin-top: 5px;">
                        الحالة: ${h.status}
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    html += `</div>`;
    
    content.innerHTML = html;
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // إغلاق عند النقر خارج النافذة
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeGlobalSearchResults();
        }
    });
}

function closeGlobalSearchResults() {
    const modal = document.getElementById('global-search-results-modal');
    if (modal) {
        modal.remove();
    }
}

console.log('✅ تم تحميل نظام البحث الشامل');
// ==================== البحث في الاستقطاعات - حل نهائي ====================

function searchDeductions() {
    console.log('🔍 بدء البحث في الاستقطاعات...');
    
    // الحصول على مربع البحث
    const searchInput = document.getElementById('deductions-search');
    if (!searchInput) {
        console.error('❌ مربع البحث غير موجود!');
        return;
    }
    
    // الحصول على قيمة البحث
    const searchValue = searchInput.value.trim().toLowerCase();
    console.log('🔍 قيمة البحث:', searchValue);
    
    // التحقق من وجود البيانات
    if (!data || !data.deductions) {
        console.error('❌ البيانات غير موجودة!');
        return;
    }
    
    console.log('📊 عدد الاستقطاعات الكلي:', data.deductions.length);
    
    let filtered = [];
    
    // إذا كان البحث فارغاً، عرض الكل
    if (!searchValue) {
        filtered = data.deductions;
        console.log('✅ البحث فارغ - عرض جميع الاستقطاعات');
    } else {
        // البحث في جميع الحقول
        filtered = data.deductions.filter(d => {
            // قائمة الحقول للبحث فيها
            const fields = [
                d.caseNumber,
                d.plaintiff,
                d.plaintiffName,
                d.defendant,
                d.defendantName,
                d.lawyerName,
                d.addedBy,
                d.method,
                d.notes,
                d.status,
                d.source,
                d.amount ? d.amount.toString() : '',
                d.date
            ];
            
            // البحث في كل حقل
            for (let field of fields) {
                if (field && field.toString().toLowerCase().includes(searchValue)) {
                    return true;
                }
            }
            return false;
        });
        
        console.log('✅ نتائج البحث:', filtered.length);
    }
    
    // عرض النتائج
    renderDeductionsTable(filtered);
}

// تحديث renderDeductionsTable لتقبل البيانات المفلترة
function renderDeductionsTable(deductionsToRender) {
    console.log('📋 بدء عرض الجدول...');
    
    const tbody = document.getElementById('deductions-table');
    const cardsContainer = document.getElementById('deductions-cards');
    
    // استخدام البيانات المفلترة أو جميع البيانات
    const deductions = deductionsToRender || data.deductions;
    console.log('📊 عدد الاستقطاعات للعرض:', deductions.length);
    
    // حساب المجموع
    const totalDeductions = deductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    
    const statTotal = document.getElementById('stat-total-deductions');
    const statCount = document.getElementById('stat-deductions-count');
    if (statTotal) statTotal.textContent = formatCurrency(totalDeductions);
    if (statCount) statCount.textContent = deductions.length;
    
    // عرض رسالة فارغة
    if (deductions.length === 0) {
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-money-bill-wave"></i>
                        <h3>لا توجد نتائج</h3>
                        <p>لم يتم العثور على استقطاعات تطابق البحث</p>
                    </td>
                </tr>
            `;
        }
        if (cardsContainer) {
            cardsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-money-bill-wave"></i>
                    <h3>لا توجد نتائج</h3>
                    <p>لم يتم العثور على استقطاعات تطابق البحث</p>
                </div>
            `;
        }
        console.log('⚠️ لا توجد نتائج للعرض');
        return;
    }
    
    // عرض الجدول
    if (tbody) {
        tbody.innerHTML = deductions.map(d => {
            const sourceIcon = (d.source === 'mobile' || d.source === 'lawyer') 
                ? '<i class="fas fa-mobile-alt" style="color:#10b981;font-size:20px;"></i>' 
                : '<i class="fas fa-desktop" style="color:#6366f1;font-size:20px;"></i>';
            const statusOptions = `<select onchange="updateDeductionStatus('${d.id}', this.value)" style="background:#e0ffe0;border-radius:8px;padding:4px 10px;font-weight:700;">
                <option value="مستلم" ${d.status === 'مستلم' ? 'selected' : ''}>مستلم</option>
                <option value="غير مستلم" ${d.status === 'غير مستلم' ? 'selected' : ''}>غير مستلم</option>
            </select>`;
            // Always show defendant, show lawyer who created, and set payment method to 'نقدي'
            return `
                <tr>
                    <td>${d.defendant || d.defendantName || 'غير محدد'}</td>
                    <td style="color:#6366f1;font-weight:700;">${d.caseNumber || 'غير محدد'}</td>
                    <td style="color:#10b981;font-weight:700;">${formatCurrency(d.amount)}</td>
                    <td>${formatDate(d.date)}</td>
                    <td style="text-align:center;">${sourceIcon}</td>
                    <td>نقدي</td>
                    <td>${d.lawyerName || d.addedBy || 'غير محدد'}</td>
                    <td>
                        <button class="btn btn-danger btn-icon" title="حذف" onclick="deleteDeduction('${d.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-success btn-icon" title="تعديل" onclick="editDeduction('${d.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-secondary btn-icon" title="عرض التفاصيل" onclick="showDeductionDetails('${d.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        console.log('✅ تم عرض الجدول');
    }
    
    // عرض البطاقات
    if (cardsContainer) {
        cardsContainer.innerHTML = deductions.map(d => `
            <div class="data-card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>قضية رقم ${d.caseNumber}</span>
                    </div>
                    <span class="badge badge-normal">${formatCurrency(d.amount)}</span>
                </div>
                <div class="card-body">
                    <div class="card-info-row">
                        <span class="info-label"><i class="fas fa-user"></i> المدعى عليه:</span>
                        <span class="info-value">${d.defendant || d.defendantName || 'غير محدد'}</span>
                    </div>
                    <div class="card-info-row">
                        <span class="info-label"><i class="fas fa-user-tie"></i> المحامي المنفذ:</span>
                        <span class="info-value">${d.lawyerName || d.addedBy || 'غير محدد'}</span>
                    </div>
                    <div class="card-info-row">
                        <span class="info-label"><i class="fas fa-calendar"></i> التاريخ:</span>
                        <span class="info-value">${formatDate(d.date)}</span>
                    </div>
                    <div class="card-info-row">
                        <span class="info-label"><i class="fas fa-credit-card"></i> طريقة الدفع:</span>
                        <span class="info-value">نقدي</span>
                    </div>
                    <div class="card-info-row">
                        <span class="info-label"><i class="fas fa-check-circle"></i> الحالة:</span>
                        <span class="info-value">${d.status}</span>
                    </div>
                    ${d.notes ? `
                    <div class="card-info-row">
                        <span class="info-label"><i class="fas fa-sticky-note"></i> ملاحظات:</span>
                        <span class="info-value">${d.notes}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary btn-sm" onclick="showDeductionDetails('${d.id}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i> عرض
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="editDeduction('${d.id}')" title="تعديل">
                        <i class="fas fa-pen"></i> تعديل
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteDeduction('${d.id}')" title="حذف">
                        <i class="fas fa-trash-alt"></i> حذف
                    </button>
                </div>
            </div>
        `).join('');
        console.log('✅ تم عرض البطاقات');
    }
}

console.log('✅ تم تحميل نظام البحث في الاستقطاعات بنجاح');

// ==================== البحث في الدعاوى ====================

function searchCases() {
    console.log('🔍 بدء البحث في الدعاوى...');
    
    const searchInput = document.getElementById('cases-search');
    if (!searchInput) {
        console.error('❌ مربع البحث غير موجود!');
        return;
    }
    
    const searchValue = searchInput.value.trim().toLowerCase();
    console.log('🔍 قيمة البحث:', searchValue);
    
    if (!data || !data.cases) {
        console.error('❌ البيانات غير موجودة!');
        return;
    }
    
    let filtered = [];
    
    if (!searchValue) {
        filtered = data.cases;
    } else {
        filtered = data.cases.filter(c => {
            const fields = [
                c.caseNumber,
                c.plaintiff,
                c.plaintiffName,
                c.defendant,
                c.defendantName,
                c.lawyerName,
                c.courtName,
                c.caseType,
                c.status,
                c.notes,
                c.amount ? c.amount.toString() : ''
            ];
            
            for (let field of fields) {
                if (field && field.toString().toLowerCase().includes(searchValue)) {
                    return true;
                }
            }
            return false;
        });
    }
    
    console.log('✅ نتائج البحث:', filtered.length);
    renderCasesTable(filtered);
}

// ==================== البحث في المدعى عليهم ====================

function searchDefendants() {
    console.log('🔍 بدء البحث في المدعى عليهم...');
    
    const searchInput = document.getElementById('defendants-search');
    if (!searchInput) {
        console.error('❌ مربع البحث غير موجود!');
        return;
    }
    
    const searchValue = searchInput.value.trim().toLowerCase();
    console.log('🔍 قيمة البحث:', searchValue);
    
    if (!data || !data.defendants) {
        console.error('❌ البيانات غير موجودة!');
        return;
    }
    
    let filtered = [];
    
    if (!searchValue) {
        filtered = data.defendants;
    } else {
        filtered = data.defendants.filter(d => {
            const fields = [
                d.name,
                d.phone,
                d.address,
                d.nationalId,
                d.notes
            ];
            
            for (let field of fields) {
                if (field && field.toString().toLowerCase().includes(searchValue)) {
                    return true;
                }
            }
            return false;
        });
    }
    
    console.log('✅ نتائج البحث:', filtered.length);
    renderDefendantsTable(filtered);
}

// ==================== البحث في المحامين ====================

function searchLawyers() {
    console.log('🔍 بدء البحث في المحامين...');
    
    const searchInput = document.getElementById('lawyers-search');
    if (!searchInput) {
        console.error('❌ مربع البحث غير موجود!');
        return;
    }
    
    const searchValue = searchInput.value.trim().toLowerCase();
    console.log('🔍 قيمة البحث:', searchValue);
    
    if (!data || !data.lawyers) {
        console.error('❌ البيانات غير موجودة!');
        return;
    }
    
    let filtered = [];
    
    if (!searchValue) {
        filtered = data.lawyers;
    } else {
        filtered = data.lawyers.filter(l => {
            const fields = [
                l.name,
                l.phone,
                l.email,
                l.specialization,
                l.notes
            ];
            
            for (let field of fields) {
                if (field && field.toString().toLowerCase().includes(searchValue)) {
                    return true;
                }
            }
            return false;
        });
    }
    
    console.log('✅ نتائج البحث:', filtered.length);
    renderLawyersTable(filtered);
}

console.log('✅ تم تحميل جميع دوال البحث بنجاح');
// إضافة مستمع للضغط على Enter في مربع البحث الشامل
document.addEventListener('DOMContentLoaded', function() {
    const globalSearchInput = document.getElementById('global-search');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                globalSearch();
            }
        });
    }
});

console.log('✅ تم تحميل جميع دوال البحث الشامل والإصلاحات');// ============================================================
// ملف الإصلاحات والتحديثات الشاملة
// يتم إضافته في نهاية app.js
// ============================================================

console.log('🔧 تحميل الإصلاحات الشاملة...');

// ============ 1. نظام مزامنة الرسائل والإشعارات ============

// متغير لتتبع الرسائل غير المقروءة
let unreadMessagesCount = 0;

// دالة لمراقبة الرسائل الواردة من تطبيق المحامين
window.setupChatMessagesListener = function() {
    if (!firebaseInitialized) {
        console.warn('⚠️ Firebase غير مفعل - لن يتم مراقبة الرسائل');
        return;
    }
    
    console.log('📡 بدء مراقبة الرسائل الواردة من المحامين...');
    
    // مراقبة كل رسالة جديدة
    db.ref(DB_PATHS.CHAT).on('child_added', (snapshot) => {
        const lawyerId = snapshot.key;
        
        snapshot.ref.on('child_added', (messageSnapshot) => {
            const messageId = messageSnapshot.key;
            const message = messageSnapshot.val();
            
            // تجاهل الرسائل القديمة
            if (!message || !message.timestamp) return;
            
            const messageTime = new Date(message.timestamp).getTime();
            const now = Date.now();
            
            // فقط الرسائل الجديدة (خلال آخر 10 ثوان)
            if (now - messageTime > 10000) return;
            
            // إذا كانت الرسالة من المحامي
            if (message.sender === 'lawyer' && !message.read) {
                console.log('📨 رسالة جديدة من المحامي:', message);
                
                // حفظ محلياً
                if (!data.chatMessages[lawyerId]) {
                    data.chatMessages[lawyerId] = [];
                }
                
                // التحقق من عدم تكرار الرسالة
                const exists = data.chatMessages[lawyerId].some(m => 
                    m.timestamp === message.timestamp && m.message === message.message
                );
                
                if (!exists) {
                    data.chatMessages[lawyerId].push({
                        ...message,
                        id: messageId,
                        read: false
                    });
                    
                    saveToLocalStorage();
                    
                    // تحديث واجهة الدردشة إذا كانت مفتوحة
                    if (window.selectedLawyerForChat === lawyerId) {
                        renderChatMessages();
                    }
                    
                    // إنشاء إشعار
                    const lawyer = data.lawyers.find(l => l.id === lawyerId);
                    const lawyerName = lawyer ? lawyer.name : 'محامي';
                    
                    window.addNotificationEnhanced({
                        type: 'message',
                        title: `رسالة جديدة من ${lawyerName}`,
                        message: message.message.substring(0, 50) + (message.message.length > 50 ? '...' : ''),
                        timestamp: new Date().toISOString(),
                        lawyerId: lawyerId,
                        messageId: messageId
                    });
                    
                    // تحديث العداد
                    if (window.updateNotificationBadge) {
                        window.updateNotificationBadge();
                    }
                    
                    // عرض toast
                    showToast(`رسالة جديدة من ${lawyerName}`, 'info');
                }
            }
        });
    });
    
    console.log('✅ تم تفعيل مراقبة الرسائل');
};

// إضافة إشعار جديد محسّن
window.addNotificationEnhanced = function(notification) {
    if (!data.notifications) {
        data.notifications = [];
    }
    
    // إضافة ID فريد
    notification.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    notification.read = false;
    
    data.notifications.unshift(notification);
    
    // حفظ في Firebase
    if (firebaseInitialized) {
        db.ref(DB_PATHS.NOTIFICATIONS).set(data.notifications);
    }
    
    saveToLocalStorage();
    
    if (window.updateNotificationBadge) {
        window.updateNotificationBadge();
    }
    
    // تحديث واجهة الإشعارات إذا كانت مفتوحة
    const panel = document.getElementById('notificationsPanel');
    if (panel && panel.parentElement && panel.parentElement.classList.contains('active')) {
        renderNotifications();
    }
};

// دالة لفتح الدردشة مع محامي معين من الإشعار
window.openChatWithLawyer = function(lawyerId) {
    console.log('💬 فتح الدردشة مع المحامي:', lawyerId);
    
    // إغلاق لوحة الإشعارات
    if (window.toggleNotifications) {
        toggleNotifications();
    }
    
    // الانتقال لصفحة الدردشة
    navigateTo('chat');
    
    // تحديد المحامي
    setTimeout(() => {
        if (window.selectLawyer) {
            selectLawyer(lawyerId);
        }
        
        // تحديد جميع رسائل هذا المحامي كمقروءة
        if (data.chatMessages && data.chatMessages[lawyerId]) {
            data.chatMessages[lawyerId].forEach(m => {
                if (m.sender === 'lawyer') {
                    m.read = true;
                }
            });
            saveToLocalStorage();
            if (window.updateNotificationBadge) {
                updateNotificationBadge();
            }
        }
        
        // إعادة عرض الرسائل
        if (window.renderChatMessages) {
            renderChatMessages();
        }
    }, 300);
};

// دالة مساعدة لعرض الوقت منذ الإشعار
window.formatTimeAgo = function(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    
    return date.toLocaleDateString('ar-IQ');
};

// ============ 2. إصلاح نظام الفلاتر ============

// تحديث دالة filterAndNavigate
window.filterAndNavigate = function(filterType) {
    console.log('🔍 تصفية حسب:', filterType);
    
    // التعامل مع الفلاتر الخاصة
    if (filterType === 'الاستقطاعات' || filterType === 'مبالغ الاستقطاعات') {
        navigateTo('deductions');
        return;
    }
    
    if (filterType === 'المبالغ' || filterType === 'إجمالي') {
        navigateTo('cases');
        renderCasesTable();
        return;
    }
    
    // تصفية الدعاوى حسب الحالة
    const statusMap = {
        'معلقة': 'معلقة',
        'صدور حكم': 'صدور حكم',
        'في المحكمة': 'في المحكمة',
        'مرفوع': 'مرفوع',
        'مسودة': 'مسودة',
        'مكتملة': 'مكتملة',
        'تنفيذ': 'تنفيذ',
        'تم الحجز': 'تم الحجز',
        'تم الاستقطاع': 'تم الاستقطاع',
        'مغلق': 'مغلق'
    };
    
    const status = statusMap[filterType];
    
    if (status) {
        // الانتقال لصفحة الدعاوى
        navigateTo('cases');
        
        // تطبيق الفلتر
        setTimeout(() => {
            // تصفية البيانات
            const filteredCases = data.cases.filter(c => {
                if (status === 'معلقة') {
                    return c.status !== 'مغلق' && c.status !== 'مكتملة';
                }
                return c.status === status;
            });
            
            console.log(`📊 عدد الدعاوى بعد الفلترة (${status}):`, filteredCases.length);
            
            // عرض الدعاوى المصفّاة
            window.displayFilteredCases(filteredCases, status);
        }, 100);
    }
};

// دالة مساعدة لعرض الدعاوى المصفّاة
window.displayFilteredCases = function(cases, status) {
    const tbody = document.querySelector('#casesTable tbody');
    if (!tbody) return;
    
    if (cases.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="12" style="text-align: center; padding: 40px; color: #6b7280;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 10px; display: block;"></i>
                    لا توجد دعاوى بحالة "${status}"
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = cases.map(c => {
        const defendant = data.defendants.find(d => d.id === c.defendantId);
        const lawyer = data.lawyers.find(l => l.id === c.lawyerId);
        const deductions = data.deductions.filter(d => d.caseId === c.id);
        const totalDeductions = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
        
        let statusStyle = '';
        let statusIcon = '';
        
        switch(c.status) {
            case 'مسودة':
                statusStyle = 'background: #f3f4f6; color: #374151;';
                statusIcon = 'fa-file-alt';
                break;
            case 'مرفوع':
                statusStyle = 'background: #dbeafe; color: #1e40af;';
                statusIcon = 'fa-paper-plane';
                break;
            case 'في المحكمة':
                statusStyle = 'background: #fef3c7; color: #92400e;';
                statusIcon = 'fa-balance-scale';
                break;
            case 'صدور حكم':
                statusStyle = 'background: #d1fae5; color: #065f46;';
                statusIcon = 'fa-gavel';
                break;
            case 'تنفيذ':
                statusStyle = 'background: #e0e7ff; color: #3730a3;';
                statusIcon = 'fa-tasks';
                break;
            case 'تم الحجز':
                statusStyle = 'background: #fecaca; color: #991b1b;';
                statusIcon = 'fa-lock';
                break;
            case 'تم الاستقطاع':
                statusStyle = 'background: #e0f2fe; color: #0369a1;';
                statusIcon = 'fa-money-bill-wave';
                break;
            case 'مكتملة':
                statusStyle = 'background: #d1fae5; color: #047857;';
                statusIcon = 'fa-check-circle';
                break;
            case 'مغلق':
                statusStyle = 'background: #f3f4f6; color: #6b7280;';
                statusIcon = 'fa-times-circle';
                break;
            default:
                statusStyle = 'background: #f3f4f6; color: #374151;';
                statusIcon = 'fa-info-circle';
        }
        
        return `
            <tr style="cursor: pointer;" onclick="showCaseDetails('${c.id}')">
                <td>${c.caseNumber || '-'}</td>
                <td>${defendant ? defendant.name : '-'}</td>
                <td>${c.subject || '-'}</td>
                <td>${c.claimAmount ? formatCurrency(c.claimAmount) : '-'}</td>
                <td>${c.court || '-'}</td>
                <td>
                    <span class="badge" style="${statusStyle}">
                        <i class="fas ${statusIcon}"></i> ${c.status}
                    </span>
                </td>
                <td>${c.filingDate ? new Date(c.filingDate).toLocaleDateString('ar-IQ') : '-'}</td>
                <td>${lawyer ? lawyer.name : '-'}</td>
                <td>${totalDeductions > 0 ? formatCurrency(totalDeductions) : '-'}</td>
                <td>${c.nextHearingDate ? new Date(c.nextHearingDate).toLocaleDateString('ar-IQ') : '-'}</td>
                <td>${c.judgmentAmount ? formatCurrency(c.judgmentAmount) : '-'}</td>
                <td class="actions">
                    <div style="display: flex; gap: 5px; justify-content: center;">
                        <button class="btn btn-sm btn-info" onclick="event.stopPropagation(); showCaseDetails('${c.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); editCase('${c.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteCase('${c.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // تحديث عنوان الجدول
    const tableTitle = document.querySelector('.content-header h2');
    if (tableTitle) {
        tableTitle.innerHTML = `<i class="fas fa-gavel"></i> الدعاوى - ${status} (${cases.length})`;
    }
};

// ============ 3. تحسين نظام الإشعارات والعدادات ============

// تحسين دالة updateNotificationBadge
const originalUpdateNotificationBadge = window.updateNotificationBadge;
window.updateNotificationBadge = function() {
    // استدعاء الدالة الأصلية أولاً
    if (originalUpdateNotificationBadge) {
        originalUpdateNotificationBadge();
    }
    
    // حساب الرسائل غير المقروءة وإضافتها للعداد
    let unreadMessages = 0;
    if (data.chatMessages) {
        Object.keys(data.chatMessages).forEach(lawyerId => {
            const messages = data.chatMessages[lawyerId] || [];
            unreadMessages += messages.filter(m => m.sender === 'lawyer' && !m.read).length;
        });
    }
    
    const unreadNotifications = data.notifications ? data.notifications.filter(n => !n.read).length : 0;
    const totalUnread = unreadNotifications + unreadMessages;
    
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = totalUnread;
        if (totalUnread > 0) {
            badge.classList.add('active');
        } else {
            badge.classList.remove('active');
        }
    }
    
    // تحديث عداد الرسائل المنفصل إذا وجد
    const chatBadge = document.getElementById('chatBadge');
    if (chatBadge) {
        chatBadge.textContent = unreadMessages;
        if (unreadMessages > 0) {
            chatBadge.style.display = 'inline-block';
        } else {
            chatBadge.style.display = 'none';
        }
    }
    
    unreadMessagesCount = unreadMessages;
};

console.log('✅ تم تحميل جميع الإصلاحات بنجاح!');

// التهيئة التلقائية
document.addEventListener('DOMContentLoaded', function() {
    // انتظار لحظة لضمان تحميل Firebase
    setTimeout(() => {
        if (window.firebaseInitialized) {
            console.log('🚀 تهيئة الإصلاحات...');
            
            if (window.setupChatMessagesListener) {
                setupChatMessagesListener();
            }
            
            if (window.updateNotificationBadge) {
                updateNotificationBadge();
            }
        }
    }, 2000);
});


// ============================================================
// OVERRIDE: إعادة تعريف الدوال بنسخ محسّنة
// ============================================================

// إعادة تعريف filterAndNavigate
window.filterAndNavigate = function(status) {
    console.log('🚀 filterAndNavigate:', status);
    
    if (status === 'الاستقطاعات' || status === 'مبالغ الاستقطاعات') {
        navigateTo('deductions');
        return;
    }
    
    if (status === 'المبالغ' || status === 'إجمالي') {
        navigateTo('cases');
        setTimeout(() => renderCasesTable(), 150);
        return;
    }
    
    navigateTo('cases');
    setTimeout(() => {
        const statusFilter = document.getElementById('cases-status-filter');
        if (!statusFilter) return;
        
        let filteredCases = data.cases;
        
        if (status === 'تم الاستقطاع') {
            filteredCases = filteredCases.filter(c => c.executionDeduction === true);
        } else if (status === 'تم الحجز') {
            filteredCases = filteredCases.filter(c => c.executionSeizure === true);
        } else if (status === 'معلقة') {
            filteredCases = filteredCases.filter(c => c.status !== 'مكتملة' && c.status !== 'مغلق');
        } else {
            filteredCases = filteredCases.filter(c => c.status === status);
        }
        
        statusFilter.value = status;
        renderFilteredCases(filteredCases);
    }, 200);
};

// إعادة تعريف searchCases
window.searchCases = function() {
    const searchInput = document.getElementById('cases-search');
    const statusFilter = document.getElementById('cases-status-filter');
    const priorityFilter = document.getElementById('cases-priority-filter');
    
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    const statusValue = statusFilter ? statusFilter.value : '';
    const priorityValue = priorityFilter ? priorityFilter.value : '';
    
    let filteredCases = data.cases;
    
    if (searchTerm) {
        filteredCases = filteredCases.filter(c => {
            return (c.caseNumber || '').toLowerCase().includes(searchTerm) ||
                   (c.plaintiffName || '').toLowerCase().includes(searchTerm) ||
                   (c.defendantName || '').toLowerCase().includes(searchTerm) ||
                   (c.lawyerName || '').toLowerCase().includes(searchTerm) ||
                   (c.subject || '').toLowerCase().includes(searchTerm) ||
                   (c.court || '').toLowerCase().includes(searchTerm);
        });
    }
    
    if (statusValue) {
        if (statusValue === 'تم الاستقطاع') {
            filteredCases = filteredCases.filter(c => c.executionDeduction === true);
        } else if (statusValue === 'تم الحجز') {
            filteredCases = filteredCases.filter(c => c.executionSeizure === true);
        } else if (statusValue === 'معلقة') {
            filteredCases = filteredCases.filter(c => c.status !== 'مكتملة' && c.status !== 'مغلق');
        } else {
            filteredCases = filteredCases.filter(c => c.status === statusValue);
        }
    }
    
    if (priorityValue) {
        filteredCases = filteredCases.filter(c => (c.priority || 'عادية') === priorityValue);
    }
    
    renderFilteredCases(filteredCases);
};

// إعادة تعريف filterCases
window.filterCases = function() {
    window.searchCases();
};

console.log('✅ تم تحميل السكريبت المحسّن - جميع الدوال جاهزة');