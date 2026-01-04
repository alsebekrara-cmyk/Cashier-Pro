/* ═══════════════════════════════════════════════════════════════
   أمثلة استخدام متقدمة لنظام الإشعارات
   Advanced Usage Examples - Notifications System
   ═══════════════════════════════════════════════════════════════
   شركة الإبداع الرقمي - Digital Creativity Company
   ═══════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════
// 1. أمثلة إضافة إشعارات مختلفة الأنواع
// ═══════════════════════════════════════════════════════════════

// إشعار معلومات بسيط
async function addInfoNotification() {
    await window.addNotification({
        type: 'info',
        title: 'معلومة',
        message: 'تم تحديث قاعدة البيانات بنجاح',
        icon: 'fa-info-circle',
        color: '#3b82f6',
        priority: 'low'
    });
}

// إشعار نجاح
async function addSuccessNotification() {
    await window.addNotification({
        type: 'success',
        title: 'نجحت العملية',
        message: 'تم حفظ البيانات بنجاح',
        icon: 'fa-check-circle',
        color: '#10b981',
        priority: 'normal'
    });
}

// إشعار تحذير
async function addWarningNotification() {
    await window.addNotification({
        type: 'warning',
        title: 'تحذير',
        message: 'اقتربت من الحد الأقصى لعدد المستخدمين',
        icon: 'fa-exclamation-triangle',
        color: '#f59e0b',
        priority: 'high'
    });
}

// إشعار خطأ
async function addErrorNotification() {
    await window.addNotification({
        type: 'error',
        title: 'خطأ',
        message: 'فشل الاتصال بالخادم',
        icon: 'fa-times-circle',
        color: '#ef4444',
        priority: 'critical'
    });
}

// ═══════════════════════════════════════════════════════════════
// 2. إشعارات قابلة للتنفيذ
// ═══════════════════════════════════════════════════════════════

// إشعار مع إجراء - طلب جديد
async function notifyNewOrder(orderData) {
    await window.addNotification({
        type: 'order',
        title: 'طلب جديد',
        message: `طلب جديد من ${orderData.customerName} بقيمة ${formatCurrency(orderData.total)}`,
        icon: 'fa-shopping-cart',
        color: '#10b981',
        priority: 'high',
        actionable: true,
        actionLabel: 'عرض الطلب',
        metadata: {
            orderId: orderData.id,
            customerId: orderData.customerId,
            total: orderData.total
        }
    });
}

// إشعار مع إجراء - رسالة جديدة
async function notifyNewMessage(messageData) {
    await window.addNotification({
        type: 'message',
        title: 'رسالة جديدة',
        message: `رسالة من ${messageData.senderName}: ${messageData.preview}`,
        icon: 'fa-envelope',
        color: '#3b82f6',
        priority: 'normal',
        actionable: true,
        actionLabel: 'قراءة الرسالة',
        metadata: {
            messageId: messageData.id,
            senderId: messageData.senderId
        }
    });
}

// إشعار مع إجراء مخصص - موافقة على عملية
async function notifyPendingApproval(requestData) {
    await window.addNotification({
        type: 'approval',
        title: 'طلب موافقة',
        message: `${requestData.requesterName} يطلب الموافقة على ${requestData.type}`,
        icon: 'fa-user-check',
        color: '#f59e0b',
        priority: 'high',
        actionable: true,
        actionLabel: 'مراجعة الطلب',
        metadata: {
            requestId: requestData.id,
            requestType: requestData.type,
            requesterId: requestData.requesterId
        },
        onClick: () => {
            // دالة مخصصة تُنفذ عند النقر
            openApprovalModal(requestData.id);
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// 3. إشعارات ديناميكية بناءً على أحداث النظام
// ═══════════════════════════════════════════════════════════════

// مراقبة المخزون وإرسال إشعار
async function monitorStockLevels() {
    const products = await window.getAllProducts();
    
    for (const product of products) {
        // المخزون منخفض
        if (product.stock > 0 && product.stock <= 5) {
            await window.addNotification({
                type: 'low_stock',
                title: 'تنبيه: مخزون منخفض جداً',
                message: `المنتج "${product.name}" متبقي منه ${product.stock} وحدات فقط!`,
                icon: 'fa-exclamation-triangle',
                color: '#f59e0b',
                priority: 'critical',
                actionable: true,
                actionLabel: 'طلب توريد',
                metadata: {
                    productId: product.id,
                    productName: product.name,
                    stock: product.stock
                }
            });
        }
    }
}

// مراقبة الديون المتأخرة بشدة
async function monitorCriticalDebts() {
    const debts = await window.getAllDebts();
    const now = new Date();
    
    for (const debt of debts) {
        if (debt.status !== 'paid' && debt.nextPaymentDate) {
            const dueDate = new Date(debt.nextPaymentDate);
            const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
            
            // متأخر أكثر من 30 يوم
            if (daysOverdue > 30) {
                await window.addNotification({
                    type: 'critical_debt',
                    title: 'تحذير: دين متأخر بشدة',
                    message: `دين ${debt.customerName} متأخر ${daysOverdue} يوم بمبلغ ${formatCurrency(debt.remainingAmount)}`,
                    icon: 'fa-exclamation-circle',
                    color: '#ef4444',
                    priority: 'critical',
                    actionable: true,
                    actionLabel: 'التواصل مع العميل',
                    metadata: {
                        debtId: debt.id,
                        customerId: debt.customerId,
                        daysOverdue: daysOverdue
                    }
                });
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// 4. إشعارات مجدولة
// ═══════════════════════════════════════════════════════════════

// إشعار يومي - تقرير المبيعات
async function scheduleDailySalesReport() {
    // تشغيل كل يوم الساعة 6 مساءً
    const now = new Date();
    const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
    
    if (scheduledTime < now) {
        // إذا فات الوقت اليوم، جدول لغداً
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const timeUntil = scheduledTime - now;
    
    setTimeout(async () => {
        const sales = await getTodaysSales();
        
        await window.addNotification({
            type: 'report',
            title: 'تقرير المبيعات اليومي',
            message: `إجمالي المبيعات اليوم: ${formatCurrency(sales.total)} من ${sales.count} عملية`,
            icon: 'fa-chart-line',
            color: '#10b981',
            priority: 'normal',
            actionable: true,
            actionLabel: 'عرض التقرير الكامل'
        });
        
        // جدول للغد
        scheduleDailySalesReport();
    }, timeUntil);
}

// تذكير أسبوعي - جرد المخزون
async function scheduleWeeklyInventoryReminder() {
    // كل يوم جمعة
    setInterval(async () => {
        const today = new Date().getDay();
        if (today === 5) { // الجمعة
            await window.addNotification({
                type: 'reminder',
                title: 'تذكير: جرد المخزون',
                message: 'حان وقت جرد المخزون الأسبوعي',
                icon: 'fa-boxes',
                color: '#3b82f6',
                priority: 'normal',
                actionable: true,
                actionLabel: 'بدء الجرد'
            });
        }
    }, 24 * 60 * 60 * 1000); // تحقق يومياً
}

// ═══════════════════════════════════════════════════════════════
// 5. إشعارات مشروطة ومعقدة
// ═══════════════════════════════════════════════════════════════

// إشعار عند تحقق شرط معين - تجاوز الهدف اليومي
async function checkDailySalesGoal() {
    const sales = await getTodaysSales();
    const dailyGoal = 5000000; // 5 مليون دينار
    
    if (sales.total >= dailyGoal) {
        await window.addNotification({
            type: 'achievement',
            title: '🎉 تهانينا! تم تحقيق الهدف',
            message: `تم تجاوز هدف المبيعات اليومي! المبيعات: ${formatCurrency(sales.total)}`,
            icon: 'fa-trophy',
            color: '#10b981',
            priority: 'high',
            actionable: true,
            actionLabel: 'عرض الإحصائيات'
        });
    }
}

// إشعار متدرج - تحذير المخزون حسب المستوى
async function smartStockAlert(product) {
    const threshold = window.notificationsManager.settings.lowStockThreshold;
    const percentage = (product.stock / product.minStock) * 100;
    
    let priority, color, message;
    
    if (product.stock === 0) {
        priority = 'critical';
        color = '#ef4444';
        message = `نفد المخزون تماماً من "${product.name}"`;
    } else if (percentage <= 25) {
        priority = 'critical';
        color = '#f59e0b';
        message = `المخزون شبه منتهي من "${product.name}" (${product.stock} وحدة)`;
    } else if (percentage <= 50) {
        priority = 'high';
        color = '#f59e0b';
        message = `المخزون منخفض من "${product.name}" (${product.stock} وحدة)`;
    } else {
        return; // لا حاجة لإشعار
    }
    
    await window.addNotification({
        type: 'stock_alert',
        title: 'تنبيه المخزون',
        message: message,
        icon: 'fa-box-open',
        color: color,
        priority: priority,
        actionable: true,
        actionLabel: 'عرض المنتج',
        metadata: {
            productId: product.id,
            stock: product.stock
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// 6. إدارة متقدمة للإشعارات
// ═══════════════════════════════════════════════════════════════

// تجميع الإشعارات المشابهة
async function groupSimilarNotifications() {
    const notifications = window.notificationsManager.getActiveNotifications();
    
    // تجميع إشعارات المخزون المنخفض
    const lowStockNotifs = notifications.filter(n => n.type === 'low_stock');
    
    if (lowStockNotifs.length > 5) {
        // حذف الإشعارات الفردية
        for (const notif of lowStockNotifs) {
            await window.notificationsManager.deleteNotification(notif.id);
        }
        
        // إضافة إشعار مجمع
        await window.addNotification({
            type: 'summary',
            title: 'تنبيه: مخزون منخفض',
            message: `لديك ${lowStockNotifs.length} منتج بمخزون منخفض`,
            icon: 'fa-boxes',
            color: '#f59e0b',
            priority: 'high',
            actionable: true,
            actionLabel: 'عرض القائمة الكاملة'
        });
    }
}

// تصفية الإشعارات القديمة تلقائياً
async function cleanOldNotifications() {
    const notifications = window.notificationsManager.getActiveNotifications();
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const notif of notifications) {
        if (notif.isRead && notif.timestamp < weekAgo) {
            await window.notificationsManager.deleteNotification(notif.id);
        }
    }
}

// إشعارات ذكية - عدم تكرار نفس الإشعار
async function addSmartNotification(notification) {
    const existing = window.notificationsManager.getActiveNotifications();
    
    // البحث عن إشعار مشابه خلال آخر ساعة
    const hourAgo = Date.now() - (60 * 60 * 1000);
    const duplicate = existing.find(n => 
        n.type === notification.type &&
        n.title === notification.title &&
        n.timestamp > hourAgo &&
        !n.isDeleted
    );
    
    if (!duplicate) {
        await window.addNotification(notification);
    } else {
        console.log('تم تجنب إشعار مكرر:', notification.title);
    }
}

// ═══════════════════════════════════════════════════════════════
// 7. إحصائيات وتقارير الإشعارات
// ═══════════════════════════════════════════════════════════════

// الحصول على إحصائيات الإشعارات
function getNotificationStats() {
    const all = window.notificationsManager.getActiveNotifications();
    
    const stats = {
        total: all.length,
        unread: all.filter(n => !n.isRead).length,
        read: all.filter(n => n.isRead).length,
        byType: {},
        byPriority: {},
        last24Hours: all.filter(n => n.timestamp > Date.now() - 86400000).length
    };
    
    // تصنيف حسب النوع
    all.forEach(n => {
        stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
        stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
    });
    
    return stats;
}

// عرض تقرير الإشعارات
async function showNotificationsReport() {
    const stats = getNotificationStats();
    
    console.log('📊 تقرير الإشعارات:');
    console.log('═══════════════════');
    console.log(`إجمالي الإشعارات: ${stats.total}`);
    console.log(`غير المقروءة: ${stats.unread}`);
    console.log(`المقروءة: ${stats.read}`);
    console.log(`خلال 24 ساعة: ${stats.last24Hours}`);
    console.log('\nتوزيع حسب النوع:');
    Object.entries(stats.byType).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
    });
    console.log('\nتوزيع حسب الأولوية:');
    Object.entries(stats.byPriority).forEach(([priority, count]) => {
        console.log(`  - ${priority}: ${count}`);
    });
}

// ═══════════════════════════════════════════════════════════════
// 8. تكامل مع Firebase Real-time
// ═══════════════════════════════════════════════════════════════

// الاستماع للطلبات الجديدة في Firebase
function listenToNewOrders() {
    if (!window.database) return;
    
    const ordersRef = window.database.ref('orders');
    
    ordersRef.on('child_added', async (snapshot) => {
        const order = snapshot.val();
        
        // تجنب الإشعار بالطلبات القديمة عند تحميل الصفحة
        if (Date.now() - order.timestamp < 60000) { // خلال آخر دقيقة
            await notifyNewOrder({
                id: snapshot.key,
                ...order
            });
        }
    });
}

// الاستماع لتحديثات المخزون
function listenToStockUpdates() {
    if (!window.database) return;
    
    const productsRef = window.database.ref('products');
    
    productsRef.on('child_changed', async (snapshot) => {
        const product = snapshot.val();
        
        // إشعار فقط عند انخفاض المخزون
        if (product.stock <= window.notificationsManager.settings.lowStockThreshold) {
            await smartStockAlert({
                id: snapshot.key,
                ...product
            });
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// 9. تصدير واستيراد الإشعارات
// ═══════════════════════════════════════════════════════════════

// تصدير الإشعارات إلى JSON
function exportNotificationsToFile() {
    const data = window.notificationsManager.exportNotifications();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifications_backup_${new Date().toISOString()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

// استيراد الإشعارات من ملف
function importNotificationsFromFile(file) {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            const success = await window.notificationsManager.importNotifications(data);
            
            if (success) {
                alert('تم استيراد الإشعارات بنجاح');
            } else {
                alert('فشل استيراد الإشعارات');
            }
        } catch (error) {
            alert('خطأ في قراءة الملف: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// ═══════════════════════════════════════════════════════════════
// 10. أمثلة تكامل مع UI
// ═══════════════════════════════════════════════════════════════

// عرض عدد الإشعارات في عنوان الصفحة
function updatePageTitle() {
    window.notificationsManager.addObserver((data) => {
        const unread = data.unread;
        if (unread > 0) {
            document.title = `(${unread}) نظام نقاط البيع`;
        } else {
            document.title = 'نظام نقاط البيع';
        }
    });
}

// إنشاء قائمة إشعارات مخصصة
function createCustomNotificationsList() {
    const notifications = window.notificationsManager.getUnreadNotifications();
    const container = document.getElementById('customNotificationsContainer');
    
    container.innerHTML = notifications.map(n => `
        <div class="custom-notification" data-id="${n.id}">
            <i class="fas ${n.icon}" style="color: ${n.color}"></i>
            <div>
                <strong>${n.title}</strong>
                <p>${n.message}</p>
            </div>
            <button onclick="markAsReadAndClose('${n.id}')">✓</button>
        </div>
    `).join('');
}

// دمج مع نظام الإشعارات الأصلي للمتصفح
async function sendBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
            body: notification.message,
            icon: '/path/to/icon.png',
            badge: '/path/to/badge.png'
        });
    } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            await sendBrowserNotification(notification);
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// دوال مساعدة
// ═══════════════════════════════════════════════════════════════

async function getTodaysSales() {
    // تنفيذ حقيقي حسب قاعدة البيانات
    return {
        total: 0,
        count: 0
    };
}

function formatCurrency(amount) {
    return window.formatCurrency ? 
        window.formatCurrency(amount) : 
        `${amount.toLocaleString('ar-IQ')} د.ع`;
}

function openApprovalModal(requestId) {
    console.log('فتح نافذة الموافقة:', requestId);
}

function markAsReadAndClose(notificationId) {
    window.notificationsManager.markAsRead(notificationId);
}

/* ═══════════════════════════════════════════════════════════════
   نهاية ملف الأمثلة
   
   للمزيد من المعلومات، راجع:
   - NOTIFICATIONS_README.md
   - notifications-system.js
   - notifications-ui.js
   ═══════════════════════════════════════════════════════════════ */
