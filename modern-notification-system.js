// ==========================================
// 🔔 نظام الإشعارات الحديث v2.0
// ==========================================
// تصميم حديث مع حل مشاكل التعارض
// Developer: كرار السعبري - الإبداع الرقمي
// ==========================================

/* 
========================
📌 CSS للنظام الجديد
========================
*/

const NOTIFICATION_CSS = `
/* ==========================================
   🎨 نظام الإشعارات الحديث - الأنماط
   ========================================== */

/* زر الإشعارات في الهيدر */
.modern-notification-btn {
    position: relative;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    padding: 10px 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 10px;
}

.modern-notification-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.modern-notification-btn:active {
    transform: translateY(0);
}

.modern-notification-btn i {
    font-size: 20px;
    color: #fff;
    animation: bellRing 2s ease-in-out infinite;
}

@keyframes bellRing {
    0%, 100% { transform: rotate(0deg); }
    10%, 30% { transform: rotate(-10deg); }
    20%, 40% { transform: rotate(10deg); }
}

/* شارة العدد */
.modern-notification-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
    color: #fff;
    border-radius: 12px;
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 700;
    min-width: 24px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
    animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

.modern-notification-badge.zero {
    display: none;
}

/* نافذة الإشعارات الرئيسية */
.modern-notifications-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    z-index: 10000;
    animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.modern-notifications-modal.active {
    display: flex;
    align-items: center;
    justify-content: center;
}

.modern-notifications-container {
    background: #fff;
    border-radius: 24px;
    width: 90%;
    max-width: 900px;
    max-height: 85vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: containerSlideUp 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
    display: flex;
    flex-direction: column;
}

@keyframes containerSlideUp {
    from {
        transform: translateY(50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* رأس النافذة */
.modern-notifications-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 24px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modern-notifications-header h2 {
    font-size: 24px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
}

.modern-notifications-header h2 i {
    font-size: 28px;
}

.modern-close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.modern-close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}

.modern-close-btn i {
    font-size: 20px;
    color: #fff;
}

/* شريط الإحصائيات */
.modern-notifications-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    padding: 20px 28px;
    background: linear-gradient(to bottom, #f8f9fa, #fff);
    border-bottom: 1px solid #e9ecef;
}

.modern-stat-card {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    cursor: pointer;
    border: 2px solid transparent;
}

.modern-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.modern-stat-card.active {
    border-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.modern-stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 12px;
}

.modern-stat-card.all .modern-stat-icon {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
}

.modern-stat-card.debt .modern-stat-icon {
    background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
    color: #fff;
}

.modern-stat-card.stock .modern-stat-icon {
    background: linear-gradient(135deg, #feca57, #ff9ff3);
    color: #fff;
}

.modern-stat-card.sales .modern-stat-icon {
    background: linear-gradient(135deg, #48dbfb, #0abde3);
    color: #fff;
}

.modern-stat-card.system .modern-stat-icon {
    background: linear-gradient(135deg, #1dd1a1, #10ac84);
    color: #fff;
}

.modern-stat-label {
    font-size: 13px;
    color: #6c757d;
    margin-bottom: 4px;
    font-weight: 500;
}

.modern-stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
}

/* شريط الأدوات */
.modern-notifications-toolbar {
    padding: 16px 28px;
    background: #fff;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
}

.modern-search-box {
    flex: 1;
    min-width: 250px;
    position: relative;
}

.modern-search-box input {
    width: 100%;
    padding: 12px 16px 12px 45px;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    font-size: 14px;
    transition: all 0.3s;
    font-family: 'Cairo', sans-serif;
}

.modern-search-box input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modern-search-box i {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    font-size: 16px;
}

.modern-action-btn {
    padding: 12px 20px;
    border: 2px solid #e9ecef;
    background: #fff;
    border-radius: 12px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Cairo', sans-serif;
}

.modern-action-btn:hover {
    border-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
    transform: translateY(-2px);
}

.modern-action-btn i {
    font-size: 16px;
}

.modern-action-btn.danger {
    color: #ff6b6b;
}

.modern-action-btn.danger:hover {
    border-color: #ff6b6b;
    background: rgba(255, 107, 107, 0.05);
}

/* قائمة الإشعارات */
.modern-notifications-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px 28px;
    background: #f8f9fa;
}

.modern-notifications-list::-webkit-scrollbar {
    width: 8px;
}

.modern-notifications-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.modern-notifications-list::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 10px;
}

.modern-notifications-list::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #764ba2, #667eea);
}

/* بطاقة الإشعار */
.modern-notification-card {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    cursor: pointer;
    border-right: 4px solid;
    position: relative;
    overflow: hidden;
    animation: cardSlideIn 0.4s ease-out;
}

@keyframes cardSlideIn {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.modern-notification-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.05), transparent);
    transition: width 0.3s;
}

.modern-notification-card:hover::before {
    width: 100%;
}

.modern-notification-card:hover {
    transform: translateX(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.modern-notification-card.debt {
    border-right-color: #ff6b6b;
}

.modern-notification-card.stock {
    border-right-color: #feca57;
}

.modern-notification-card.sales {
    border-right-color: #48dbfb;
}

.modern-notification-card.system {
    border-right-color: #1dd1a1;
}

.modern-notification-card.high-priority {
    background: linear-gradient(to right, rgba(255, 107, 107, 0.05), #fff);
}

.modern-notification-card.pinned {
    background: linear-gradient(to right, rgba(102, 126, 234, 0.05), #fff);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.modern-notification-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.modern-notification-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modern-notification-card.debt .modern-notification-icon {
    background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
    color: #fff;
}

.modern-notification-card.stock .modern-notification-icon {
    background: linear-gradient(135deg, #feca57, #ff9ff3);
    color: #fff;
}

.modern-notification-card.sales .modern-notification-icon {
    background: linear-gradient(135deg, #48dbfb, #0abde3);
    color: #fff;
}

.modern-notification-card.system .modern-notification-icon {
    background: linear-gradient(135deg, #1dd1a1, #10ac84);
    color: #fff;
}

.modern-notification-content {
    flex: 1;
    margin-right: 16px;
    position: relative;
    z-index: 1;
}

.modern-notification-title {
    font-size: 16px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.modern-priority-badge {
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 6px;
    font-weight: 600;
    text-transform: uppercase;
}

.modern-priority-badge.high {
    background: #ff6b6b;
    color: #fff;
}

.modern-priority-badge.medium {
    background: #feca57;
    color: #fff;
}

.modern-priority-badge.low {
    background: #1dd1a1;
    color: #fff;
}

.modern-notification-message {
    font-size: 14px;
    color: #6c757d;
    line-height: 1.6;
    margin-bottom: 8px;
}

.modern-notification-meta {
    display: flex;
    gap: 16px;
    align-items: center;
    font-size: 12px;
    color: #95a5a6;
}

.modern-notification-meta i {
    margin-left: 4px;
}

.modern-notification-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

.modern-pin-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.modern-pin-btn:hover {
    background: rgba(102, 126, 234, 0.2);
    transform: rotate(15deg);
}

.modern-pin-btn.pinned {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
}

.modern-pin-btn i {
    font-size: 16px;
}

.modern-delete-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    color: #ff6b6b;
}

.modern-delete-btn:hover {
    background: rgba(255, 107, 107, 0.2);
    transform: scale(1.1);
}

.modern-delete-btn i {
    font-size: 16px;
}

/* حالة فارغة */
.modern-empty-state {
    text-align: center;
    padding: 60px 20px;
}

.modern-empty-icon {
    font-size: 80px;
    color: #e9ecef;
    margin-bottom: 20px;
}

.modern-empty-title {
    font-size: 20px;
    font-weight: 700;
    color: #6c757d;
    margin-bottom: 8px;
}

.modern-empty-message {
    font-size: 14px;
    color: #95a5a6;
}

/* تأثيرات responsive */
@media (max-width: 768px) {
    .modern-notifications-container {
        width: 95%;
        max-height: 90vh;
        border-radius: 16px;
    }
    
    .modern-notifications-header {
        padding: 20px;
    }
    
    .modern-notifications-header h2 {
        font-size: 20px;
    }
    
    .modern-notifications-stats {
        grid-template-columns: repeat(2, 1fr);
        padding: 16px 20px;
    }
    
    .modern-notifications-toolbar {
        padding: 12px 20px;
        flex-direction: column;
    }
    
    .modern-search-box {
        width: 100%;
    }
    
    .modern-action-btn {
        width: 100%;
        justify-content: center;
    }
    
    .modern-notifications-list {
        padding: 16px 20px;
    }
    
    .modern-notification-card {
        padding: 16px;
    }
}

/* تنسيقات إضافية للتكامل */
.modern-notification-detail-view {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    z-index: 10001;
    align-items: center;
    justify-content: center;
}

.modern-notification-detail-view.active {
    display: flex;
}

.modern-detail-container {
    background: #fff;
    border-radius: 24px;
    width: 90%;
    max-width: 700px;
    max-height: 85vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: containerSlideUp 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.modern-detail-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 24px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modern-detail-body {
    padding: 28px;
    max-height: calc(85vh - 120px);
    overflow-y: auto;
}

.modern-detail-section {
    margin-bottom: 24px;
}

.modern-detail-section h3 {
    font-size: 18px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.modern-detail-info {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
}

.modern-detail-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e9ecef;
}

.modern-detail-row:last-child {
    border-bottom: none;
}

.modern-detail-label {
    font-weight: 600;
    color: #6c757d;
}

.modern-detail-value {
    font-weight: 700;
    color: #2c3e50;
}

.modern-detail-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
}

.modern-detail-btn {
    flex: 1;
    padding: 14px;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    font-family: 'Cairo', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.modern-detail-btn.primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.modern-detail-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.modern-detail-btn.secondary {
    background: #e9ecef;
    color: #6c757d;
}

.modern-detail-btn.secondary:hover {
    background: #dee2e6;
}
`;

/* 
========================
📌 HTML للنظام الجديد
========================
*/

const NOTIFICATION_HTML = `
<!-- 🔔 نظام الإشعارات الحديث -->

<!-- زر الإشعارات في الهيدر -->
<div class="modern-notification-btn" id="modernNotificationBtn">
    <i class="fas fa-bell"></i>
    <span class="modern-notification-badge" id="modernNotificationBadge">0</span>
</div>

<!-- نافذة الإشعارات الرئيسية -->
<div class="modern-notifications-modal" id="modernNotificationsModal">
    <div class="modern-notifications-container">
        <!-- رأس النافذة -->
        <div class="modern-notifications-header">
            <h2><i class="fas fa-bell"></i> الإشعارات</h2>
            <button class="modern-close-btn" id="modernCloseNotifications">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <!-- شريط الإحصائيات -->
        <div class="modern-notifications-stats">
            <div class="modern-stat-card all active" data-filter="all">
                <div class="modern-stat-icon">
                    <i class="fas fa-th"></i>
                </div>
                <div class="modern-stat-label">الكل</div>
                <div class="modern-stat-value" id="modernStatAll">0</div>
            </div>
            <div class="modern-stat-card debt" data-filter="debt">
                <div class="modern-stat-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="modern-stat-label">الديون</div>
                <div class="modern-stat-value" id="modernStatDebt">0</div>
            </div>
            <div class="modern-stat-card stock" data-filter="stock">
                <div class="modern-stat-icon">
                    <i class="fas fa-box"></i>
                </div>
                <div class="modern-stat-label">المخزون</div>
                <div class="modern-stat-value" id="modernStatStock">0</div>
            </div>
            <div class="modern-stat-card sales" data-filter="sales">
                <div class="modern-stat-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="modern-stat-label">المبيعات</div>
                <div class="modern-stat-value" id="modernStatSales">0</div>
            </div>
            <div class="modern-stat-card system" data-filter="system">
                <div class="modern-stat-icon">
                    <i class="fas fa-cog"></i>
                </div>
                <div class="modern-stat-label">النظام</div>
                <div class="modern-stat-value" id="modernStatSystem">0</div>
            </div>
        </div>

        <!-- شريط الأدوات -->
        <div class="modern-notifications-toolbar">
            <div class="modern-search-box">
                <input type="text" id="modernNotificationSearch" placeholder="البحث في الإشعارات...">
                <i class="fas fa-search"></i>
            </div>
            <button class="modern-action-btn" id="modernMarkAllRead">
                <i class="fas fa-check-double"></i>
                تعليم الكل كمقروء
            </button>
            <button class="modern-action-btn danger" id="modernClearAll">
                <i class="fas fa-trash"></i>
                مسح الكل
            </button>
        </div>

        <!-- قائمة الإشعارات -->
        <div class="modern-notifications-list" id="modernNotificationsList">
            <!-- سيتم ملء الإشعارات هنا ديناميكياً -->
        </div>
    </div>
</div>

<!-- نافذة تفاصيل الإشعار -->
<div class="modern-notification-detail-view" id="modernNotificationDetail">
    <div class="modern-detail-container">
        <div class="modern-detail-header">
            <h2 id="modernDetailTitle">تفاصيل الإشعار</h2>
            <button class="modern-close-btn" id="modernCloseDetail">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modern-detail-body" id="modernDetailBody">
            <!-- سيتم ملء التفاصيل هنا ديناميكياً -->
        </div>
    </div>
</div>
`;

/* 
========================
📌 JavaScript للنظام الجديد
========================
*/

const NotificationSystem = {
    // البيانات
    notifications: [],
    currentFilter: 'all',
    searchTerm: '',
    pinnedNotifications: [],
    
    // التهيئة
    init() {
        console.log('🔔 تهيئة نظام الإشعارات الحديث...');
        
        // إضافة CSS
        this.injectCSS();
        
        // إضافة HTML
        this.injectHTML();
        
        // تحميل البيانات
        this.loadNotifications();
        this.loadPinnedNotifications();
        
        // ربط الأحداث
        this.bindEvents();
        
        // تحديث الإشعارات
        this.updateNotifications();
        
        // تحديث دوري كل دقيقة
        setInterval(() => this.updateNotifications(), 60000);
        
        console.log('✅ نظام الإشعارات جاهز!');
    },
    
    // إضافة CSS
    injectCSS() {
        const style = document.createElement('style');
        style.textContent = NOTIFICATION_CSS;
        document.head.appendChild(style);
    },
    
    // إضافة HTML
    injectHTML() {
        // إزالة أي نظام قديم
        const oldBtn = document.querySelector('.notification-btn');
        if (oldBtn) oldBtn.remove();
        
        // إضافة الزر في الهيدر
        const header = document.querySelector('.header');
        if (header) {
            const btnContainer = document.createElement('div');
            btnContainer.innerHTML = NOTIFICATION_HTML.split('<!-- نافذة')[0];
            const themeBtn = header.querySelector('.theme-toggle') || header.querySelector('.user-info');
            if (themeBtn) {
                themeBtn.parentNode.insertBefore(btnContainer.firstElementChild, themeBtn);
            }
        }
        
        // إضافة النوافذ في body
        const modalsContainer = document.createElement('div');
        modalsContainer.innerHTML = NOTIFICATION_HTML.split('<!-- نافذة')[1] ? '<!-- نافذة' + NOTIFICATION_HTML.split('<!-- نافذة')[1] : '';
        document.body.appendChild(modalsContainer);
    },
    
    // ربط الأحداث
    bindEvents() {
        // زر فتح الإشعارات
        const btn = document.getElementById('modernNotificationBtn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showModal();
            });
        }
        
        // زر إغلاق النافذة
        const closeBtn = document.getElementById('modernCloseNotifications');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hideModal();
            });
        }
        
        // إغلاق عند الضغط على الخلفية
        const modal = document.getElementById('modernNotificationsModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
        
        // منع إغلاق النافذة عند الضغط على المحتوى
        const container = document.querySelector('.modern-notifications-container');
        if (container) {
            container.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        // بطاقات التصفية
        const filterCards = document.querySelectorAll('.modern-stat-card');
        filterCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                const filter = card.getAttribute('data-filter');
                this.setFilter(filter);
            });
        });
        
        // البحث
        const searchInput = document.getElementById('modernNotificationSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.renderNotifications();
            });
        }
        
        // تعليم الكل كمقروء
        const markAllBtn = document.getElementById('modernMarkAllRead');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.markAllAsRead();
            });
        }
        
        // مسح الكل
        const clearAllBtn = document.getElementById('modernClearAll');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearAll();
            });
        }
        
        // إغلاق نافذة التفاصيل
        const closeDetailBtn = document.getElementById('modernCloseDetail');
        if (closeDetailBtn) {
            closeDetailBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hideDetailView();
            });
        }
        
        // إغلاق التفاصيل عند الضغط على الخلفية
        const detailView = document.getElementById('modernNotificationDetail');
        if (detailView) {
            detailView.addEventListener('click', (e) => {
                if (e.target === detailView) {
                    this.hideDetailView();
                }
            });
        }
    },
    
    // عرض النافذة
    showModal() {
        const modal = document.getElementById('modernNotificationsModal');
        if (modal) {
            modal.classList.add('active');
            this.renderNotifications();
        }
    },
    
    // إخفاء النافذة
    hideModal() {
        const modal = document.getElementById('modernNotificationsModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    // عرض نافذة التفاصيل
    showDetailView() {
        const view = document.getElementById('modernNotificationDetail');
        if (view) {
            view.classList.add('active');
        }
    },
    
    // إخفاء نافذة التفاصيل
    hideDetailView() {
        const view = document.getElementById('modernNotificationDetail');
        if (view) {
            view.classList.remove('active');
        }
    },
    
    // تعيين الفلتر
    setFilter(filter) {
        this.currentFilter = filter;
        
        // تحديث البطاقات النشطة
        const cards = document.querySelectorAll('.modern-stat-card');
        cards.forEach(card => {
            if (card.getAttribute('data-filter') === filter) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
        
        // عرض الإشعارات
        this.renderNotifications();
    },
    
    // تحديث الإشعارات
    updateNotifications() {
        console.log('🔄 تحديث الإشعارات...');
        
        this.notifications = [];
        
        // فحص الديون المتأخرة
        this.checkOverdueDebts();
        
        // فحص المخزون المنخفض
        this.checkLowStock();
        
        // فحص المنتجات المنتهية الصلاحية
        this.checkExpiredProducts();
        
        // حفظ الإشعارات
        this.saveNotifications();
        
        // تحديث الشارة
        this.updateBadge();
        
        // تحديث الإحصائيات
        this.updateStats();
        
        console.log(`✅ تم العثور على ${this.notifications.length} إشعار`);
    },
    
    // فحص الديون المتأخرة
    checkOverdueDebts() {
        try {
            const debts = dataSdk.getAllDebts();
            const today = new Date().setHours(0, 0, 0, 0);
            
            debts.forEach(debt => {
                if (debt.status === 'active' && debt.installments) {
                    debt.installments.forEach(installment => {
                        if (installment.status !== 'paid') {
                            const dueDate = new Date(installment.due_date).setHours(0, 0, 0, 0);
                            
                            if (dueDate < today) {
                                const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                                
                                this.notifications.push({
                                    id: `debt-${debt.debt_id}-${installment.month}`,
                                    type: 'debt',
                                    priority: daysOverdue > 7 ? 'high' : daysOverdue > 3 ? 'medium' : 'low',
                                    title: 'دين متأخر',
                                    message: `العميل ${debt.customer_name} لديه قسط متأخر ${daysOverdue} يوم`,
                                    timestamp: Date.now(),
                                    data: {
                                        debtId: debt.debt_id,
                                        customerId: debt.customer_id,
                                        customerName: debt.customer_name,
                                        amount: installment.amount,
                                        daysOverdue: daysOverdue,
                                        dueDate: installment.due_date
                                    },
                                    read: false
                                });
                            }
                        }
                    });
                }
            });
        } catch (error) {
            console.error('❌ خطأ في فحص الديون:', error);
        }
    },
    
    // فحص المخزون المنخفض
    checkLowStock() {
        try {
            const products = dataSdk.getAllProducts();
            
            products.forEach(product => {
                const stock = product.stock || 0;
                const minStock = product.min_stock || 5;
                
                if (stock <= minStock && stock > 0) {
                    this.notifications.push({
                        id: `stock-low-${product.id}`,
                        type: 'stock',
                        priority: stock <= minStock / 2 ? 'high' : 'medium',
                        title: 'مخزون منخفض',
                        message: `المنتج "${product.name}" وصل المخزون إلى ${stock} قطعة`,
                        timestamp: Date.now(),
                        data: {
                            productId: product.id,
                            productName: product.name,
                            currentStock: stock,
                            minStock: minStock
                        },
                        read: false
                    });
                } else if (stock === 0) {
                    this.notifications.push({
                        id: `stock-out-${product.id}`,
                        type: 'stock',
                        priority: 'high',
                        title: 'نفذ من المخزون',
                        message: `المنتج "${product.name}" نفذ من المخزون بالكامل`,
                        timestamp: Date.now(),
                        data: {
                            productId: product.id,
                            productName: product.name,
                            currentStock: 0
                        },
                        read: false
                    });
                }
            });
        } catch (error) {
            console.error('❌ خطأ في فحص المخزون:', error);
        }
    },
    
    // فحص المنتجات المنتهية الصلاحية
    checkExpiredProducts() {
        try {
            const products = dataSdk.getAllProducts();
            const today = new Date().setHours(0, 0, 0, 0);
            
            products.forEach(product => {
                if (product.expiry_date) {
                    const expiryDate = new Date(product.expiry_date).setHours(0, 0, 0, 0);
                    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
                    
                    if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
                        this.notifications.push({
                            id: `expiry-${product.id}`,
                            type: 'stock',
                            priority: daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 14 ? 'medium' : 'low',
                            title: 'منتج قارب على انتهاء الصلاحية',
                            message: `المنتج "${product.name}" ستنتهي صلاحيته خلال ${daysUntilExpiry} يوم`,
                            timestamp: Date.now(),
                            data: {
                                productId: product.id,
                                productName: product.name,
                                expiryDate: product.expiry_date,
                                daysUntilExpiry: daysUntilExpiry
                            },
                            read: false
                        });
                    } else if (daysUntilExpiry < 0) {
                        this.notifications.push({
                            id: `expired-${product.id}`,
                            type: 'stock',
                            priority: 'high',
                            title: 'منتج منتهي الصلاحية',
                            message: `المنتج "${product.name}" انتهت صلاحيته منذ ${Math.abs(daysUntilExpiry)} يوم`,
                            timestamp: Date.now(),
                            data: {
                                productId: product.id,
                                productName: product.name,
                                expiryDate: product.expiry_date,
                                daysExpired: Math.abs(daysUntilExpiry)
                            },
                            read: false
                        });
                    }
                }
            });
        } catch (error) {
            console.error('❌ خطأ في فحص الصلاحية:', error);
        }
    },
    
    // تحديث الشارة
    updateBadge() {
        const badge = document.getElementById('modernNotificationBadge');
        if (badge) {
            const unreadCount = this.notifications.filter(n => !n.read).length;
            badge.textContent = unreadCount;
            
            if (unreadCount === 0) {
                badge.classList.add('zero');
            } else {
                badge.classList.remove('zero');
            }
        }
    },
    
    // تحديث الإحصائيات
    updateStats() {
        const all = this.notifications.length;
        const debt = this.notifications.filter(n => n.type === 'debt').length;
        const stock = this.notifications.filter(n => n.type === 'stock').length;
        const sales = this.notifications.filter(n => n.type === 'sales').length;
        const system = this.notifications.filter(n => n.type === 'system').length;
        
        const statAll = document.getElementById('modernStatAll');
        const statDebt = document.getElementById('modernStatDebt');
        const statStock = document.getElementById('modernStatStock');
        const statSales = document.getElementById('modernStatSales');
        const statSystem = document.getElementById('modernStatSystem');
        
        if (statAll) statAll.textContent = all;
        if (statDebt) statDebt.textContent = debt;
        if (statStock) statStock.textContent = stock;
        if (statSales) statSales.textContent = sales;
        if (statSystem) statSystem.textContent = system;
    },
    
    // عرض الإشعارات
    renderNotifications() {
        const container = document.getElementById('modernNotificationsList');
        if (!container) return;
        
        // تصفية الإشعارات
        let filtered = this.notifications;
        
        // حسب النوع
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(n => n.type === this.currentFilter);
        }
        
        // حسب البحث
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(n => 
                n.title.toLowerCase().includes(term) ||
                n.message.toLowerCase().includes(term)
            );
        }
        
        // ترتيب: المثبتة أولاً ثم حسب الأولوية والوقت
        filtered.sort((a, b) => {
            const aIsPinned = this.pinnedNotifications.includes(a.id);
            const bIsPinned = this.pinnedNotifications.includes(b.id);
            
            if (aIsPinned && !bIsPinned) return -1;
            if (!aIsPinned && bIsPinned) return 1;
            
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            
            return b.timestamp - a.timestamp;
        });
        
        // عرض النتائج
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="modern-empty-state">
                    <div class="modern-empty-icon">
                        <i class="fas fa-bell-slash"></i>
                    </div>
                    <div class="modern-empty-title">لا توجد إشعارات</div>
                    <div class="modern-empty-message">
                        ${this.searchTerm ? 'لم يتم العثور على نتائج للبحث' : 'جميع الأمور تسير بشكل جيد!'}
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = filtered.map(notification => this.renderNotificationCard(notification)).join('');
            
            // ربط أحداث البطاقات
            this.bindCardEvents();
        }
    },
    
    // عرض بطاقة الإشعار
    renderNotificationCard(notification) {
        const isPinned = this.pinnedNotifications.includes(notification.id);
        const icons = {
            debt: 'fa-money-bill-wave',
            stock: 'fa-box',
            sales: 'fa-chart-line',
            system: 'fa-cog'
        };
        
        const priorityText = {
            high: 'عالية',
            medium: 'متوسطة',
            low: 'منخفضة'
        };
        
        const timeAgo = this.getTimeAgo(notification.timestamp);
        
        return `
            <div class="modern-notification-card ${notification.type} ${notification.priority}-priority ${isPinned ? 'pinned' : ''}" 
                 data-notification-id="${notification.id}">
                <div class="modern-notification-header-row">
                    <div class="modern-notification-icon">
                        <i class="fas ${icons[notification.type]}"></i>
                    </div>
                    <div class="modern-notification-content">
                        <div class="modern-notification-title">
                            ${notification.title}
                            <span class="modern-priority-badge ${notification.priority}">${priorityText[notification.priority]}</span>
                            ${isPinned ? '<i class="fas fa-thumbtack" style="color: #667eea;"></i>' : ''}
                        </div>
                        <div class="modern-notification-message">${notification.message}</div>
                        <div class="modern-notification-meta">
                            <span><i class="far fa-clock"></i>${timeAgo}</span>
                            <span><i class="fas fa-tag"></i>${this.getTypeLabel(notification.type)}</span>
                        </div>
                    </div>
                    <div class="modern-notification-actions">
                        <button class="modern-pin-btn ${isPinned ? 'pinned' : ''}" 
                                onclick="NotificationSystem.togglePin('${notification.id}', event)">
                            <i class="fas fa-thumbtack"></i>
                        </button>
                        <button class="modern-delete-btn" 
                                onclick="NotificationSystem.deleteNotification('${notification.id}', event)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // ربط أحداث البطاقات
    bindCardEvents() {
        const cards = document.querySelectorAll('.modern-notification-card');
        cards.forEach(card => {
            // إزالة أي مستمعات سابقة
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            // إضافة مستمع جديد
            newCard.addEventListener('click', (e) => {
                // تجاهل إذا كان الضغط على زر
                if (e.target.closest('.modern-pin-btn') || e.target.closest('.modern-delete-btn')) {
                    return;
                }
                
                const notificationId = newCard.getAttribute('data-notification-id');
                this.showNotificationDetail(notificationId);
            });
        });
    },
    
    // عرض تفاصيل الإشعار
    showNotificationDetail(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;
        
        const detailBody = document.getElementById('modernDetailBody');
        const detailTitle = document.getElementById('modernDetailTitle');
        
        if (!detailBody || !detailTitle) return;
        
        detailTitle.textContent = notification.title;
        
        // بناء المحتوى حسب النوع
        if (notification.type === 'debt') {
            detailBody.innerHTML = this.renderDebtDetail(notification);
        } else if (notification.type === 'stock') {
            detailBody.innerHTML = this.renderStockDetail(notification);
        } else {
            detailBody.innerHTML = this.renderGenericDetail(notification);
        }
        
        // عرض النافذة
        this.showDetailView();
        
        // تعليم كمقروء
        this.markAsRead(notificationId);
    },
    
    // عرض تفاصيل الدين
    renderDebtDetail(notification) {
        const data = notification.data;
        
        return `
            <div class="modern-detail-section">
                <h3><i class="fas fa-info-circle"></i> معلومات الدين</h3>
                <div class="modern-detail-info">
                    <div class="modern-detail-row">
                        <span class="modern-detail-label">اسم العميل:</span>
                        <span class="modern-detail-value">${data.customerName}</span>
                    </div>
                    <div class="modern-detail-row">
                        <span class="modern-detail-label">المبلغ المستحق:</span>
                        <span class="modern-detail-value">${data.amount.toLocaleString()} د.ع</span>
                    </div>
                    <div class="modern-detail-row">
                        <span class="modern-detail-label">أيام التأخير:</span>
                        <span class="modern-detail-value" style="color: #ff6b6b;">${data.daysOverdue} يوم</span>
                    </div>
                    <div class="modern-detail-row">
                        <span class="modern-detail-label">تاريخ الاستحقاق:</span>
                        <span class="modern-detail-value">${new Date(data.dueDate).toLocaleDateString('ar-IQ')}</span>
                    </div>
                </div>
            </div>
            
            <div class="modern-detail-section">
                <h3><i class="fas fa-exclamation-triangle"></i> الوصف</h3>
                <div class="modern-detail-info">
                    <p style="color: #6c757d; line-height: 1.8;">
                        ${notification.message}
                    </p>
                </div>
            </div>
            
            <div class="modern-detail-actions">
                <button class="modern-detail-btn primary" onclick="NotificationSystem.goToDebt('${data.debtId}')">
                    <i class="fas fa-external-link-alt"></i>
                    الانتقال للدين
                </button>
                <button class="modern-detail-btn secondary" onclick="NotificationSystem.hideDetailView()">
                    <i class="fas fa-times"></i>
                    إغلاق
                </button>
            </div>
        `;
    },
    
    // عرض تفاصيل المخزون
    renderStockDetail(notification) {
        const data = notification.data;
        
        return `
            <div class="modern-detail-section">
                <h3><i class="fas fa-info-circle"></i> معلومات المنتج</h3>
                <div class="modern-detail-info">
                    <div class="modern-detail-row">
                        <span class="modern-detail-label">اسم المنتج:</span>
                        <span class="modern-detail-value">${data.productName}</span>
                    </div>
                    <div class="modern-detail-row">
                        <span class="modern-detail-label">الكمية الحالية:</span>
                        <span class="modern-detail-value" style="color: ${data.currentStock === 0 ? '#ff6b6b' : '#feca57'};">
                            ${data.currentStock} قطعة
                        </span>
                    </div>
                    ${data.minStock ? `
                        <div class="modern-detail-row">
                            <span class="modern-detail-label">الحد الأدنى:</span>
                            <span class="modern-detail-value">${data.minStock} قطعة</span>
                        </div>
                    ` : ''}
                    ${data.daysUntilExpiry !== undefined ? `
                        <div class="modern-detail-row">
                            <span class="modern-detail-label">
                                ${data.daysUntilExpiry >= 0 ? 'الأيام المتبقية:' : 'مضى على انتهاء الصلاحية:'}
                            </span>
                            <span class="modern-detail-value" style="color: #ff6b6b;">
                                ${Math.abs(data.daysUntilExpiry)} يوم
                            </span>
                        </div>
                    ` : ''}
                    ${data.expiryDate ? `
                        <div class="modern-detail-row">
                            <span class="modern-detail-label">تاريخ انتهاء الصلاحية:</span>
                            <span class="modern-detail-value">${new Date(data.expiryDate).toLocaleDateString('ar-IQ')}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="modern-detail-section">
                <h3><i class="fas fa-exclamation-triangle"></i> الوصف</h3>
                <div class="modern-detail-info">
                    <p style="color: #6c757d; line-height: 1.8;">
                        ${notification.message}
                    </p>
                </div>
            </div>
            
            <div class="modern-detail-actions">
                <button class="modern-detail-btn primary" onclick="NotificationSystem.goToProduct('${data.productId}')">
                    <i class="fas fa-external-link-alt"></i>
                    الانتقال للمنتج
                </button>
                <button class="modern-detail-btn secondary" onclick="NotificationSystem.hideDetailView()">
                    <i class="fas fa-times"></i>
                    إغلاق
                </button>
            </div>
        `;
    },
    
    // عرض تفاصيل عامة
    renderGenericDetail(notification) {
        return `
            <div class="modern-detail-section">
                <h3><i class="fas fa-info-circle"></i> التفاصيل</h3>
                <div class="modern-detail-info">
                    <p style="color: #6c757d; line-height: 1.8;">
                        ${notification.message}
                    </p>
                </div>
            </div>
            
            <div class="modern-detail-actions">
                <button class="modern-detail-btn secondary" onclick="NotificationSystem.hideDetailView()">
                    <i class="fas fa-times"></i>
                    إغلاق
                </button>
            </div>
        `;
    },
    
    // الانتقال للدين
    goToDebt(debtId) {
        this.hideDetailView();
        this.hideModal();
        
        // الانتقال لصفحة الديون
        if (typeof showSection === 'function') {
            showSection('debts-section');
        }
        
        // تأخير بسيط للسماح بتحميل الصفحة
        setTimeout(() => {
            // البحث عن الدين وعرض تفاصيله
            const debtRow = document.querySelector(`[data-debt-id="${debtId}"]`);
            if (debtRow) {
                debtRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                debtRow.style.background = 'rgba(102, 126, 234, 0.1)';
                setTimeout(() => {
                    debtRow.style.background = '';
                }, 2000);
                
                // محاولة فتح التفاصيل
                const detailBtn = debtRow.querySelector('.view-details-btn');
                if (detailBtn) {
                    setTimeout(() => detailBtn.click(), 500);
                }
            }
        }, 300);
    },
    
    // الانتقال للمنتج
    goToProduct(productId) {
        this.hideDetailView();
        this.hideModal();
        
        // الانتقال لصفحة المخزون
        if (typeof showSection === 'function') {
            showSection('inventory-section');
        }
        
        // تأخير بسيط للسماح بتحميل الصفحة
        setTimeout(() => {
            // البحث عن المنتج وعرض تفاصيله
            const productRow = document.querySelector(`[data-product-id="${productId}"]`);
            if (productRow) {
                productRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                productRow.style.background = 'rgba(102, 126, 234, 0.1)';
                setTimeout(() => {
                    productRow.style.background = '';
                }, 2000);
                
                // محاولة فتح التفاصيل
                const detailBtn = productRow.querySelector('.view-details-btn');
                if (detailBtn) {
                    setTimeout(() => detailBtn.click(), 500);
                }
            }
        }, 300);
    },
    
    // تبديل التثبيت
    togglePin(notificationId, event) {
        if (event) {
            event.stopPropagation();
        }
        
        const index = this.pinnedNotifications.indexOf(notificationId);
        if (index > -1) {
            this.pinnedNotifications.splice(index, 1);
        } else {
            this.pinnedNotifications.push(notificationId);
        }
        
        this.savePinnedNotifications();
        this.renderNotifications();
    },
    
    // حذف إشعار
    deleteNotification(notificationId, event) {
        if (event) {
            event.stopPropagation();
        }
        
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index > -1) {
            this.notifications.splice(index, 1);
            this.saveNotifications();
            this.updateBadge();
            this.updateStats();
            this.renderNotifications();
        }
    },
    
    // تعليم كمقروء
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.saveNotifications();
            this.updateBadge();
        }
    },
    
    // تعليم الكل كمقروء
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.updateBadge();
        this.renderNotifications();
    },
    
    // مسح الكل
    clearAll() {
        if (confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
            this.notifications = [];
            this.pinnedNotifications = [];
            this.saveNotifications();
            this.savePinnedNotifications();
            this.updateBadge();
            this.updateStats();
            this.renderNotifications();
        }
    },
    
    // حفظ الإشعارات
    saveNotifications() {
        try {
            localStorage.setItem('modern_notifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.error('❌ خطأ في حفظ الإشعارات:', error);
        }
    },
    
    // تحميل الإشعارات
    loadNotifications() {
        try {
            const saved = localStorage.getItem('modern_notifications');
            if (saved) {
                this.notifications = JSON.parse(saved);
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل الإشعارات:', error);
            this.notifications = [];
        }
    },
    
    // حفظ المثبتة
    savePinnedNotifications() {
        try {
            localStorage.setItem('modern_pinned_notifications', JSON.stringify(this.pinnedNotifications));
        } catch (error) {
            console.error('❌ خطأ في حفظ الإشعارات المثبتة:', error);
        }
    },
    
    // تحميل المثبتة
    loadPinnedNotifications() {
        try {
            const saved = localStorage.getItem('modern_pinned_notifications');
            if (saved) {
                this.pinnedNotifications = JSON.parse(saved);
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل الإشعارات المثبتة:', error);
            this.pinnedNotifications = [];
        }
    },
    
    // الحصول على وقت نسبي
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        return `منذ ${days} يوم`;
    },
    
    // الحصول على تسمية النوع
    getTypeLabel(type) {
        const labels = {
            debt: 'ديون',
            stock: 'مخزون',
            sales: 'مبيعات',
            system: 'نظام'
        };
        return labels[type] || type;
    }
};

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // انتظار تحميل dataSdk
    const waitForDataSdk = setInterval(() => {
        if (typeof dataSdk !== 'undefined') {
            clearInterval(waitForDataSdk);
            NotificationSystem.init();
        }
    }, 100);
});
