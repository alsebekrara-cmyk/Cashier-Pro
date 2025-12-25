/* =============================================
   نظام الإشعارات المحسّن والمُصلح - Enhanced Notifications System v3.1
   نظام نقاط البيع المتقدم - Digital Creativity
   الإصدار: 3.1 - ديسمبر 2025 (مُحدّث)
   المطور: كرار السعبري
   
   التحديثات الجديدة:
   - ✅ إصلاح منطق التنبيه للمنتجات (ينبه فقط عند stock <= min_stock)
   - ✅ تحسين التوجيه للمنتج مع تأثيرات حديثة
   - ✅ إخفاء العداد تلقائياً عند فتح قائمة الإشعارات
   - ✅ حفظ حالة القراءة بشكل دائم (لا تظهر الإشعارات القديمة مرة أخرى)
   - ✅ إشعارات جديدة فقط تظهر في العداد
   ============================================= */

class EnhancedNotificationSystem {
    constructor() {
        this.notifications = [];
        this.readNotifications = new Set(); // لتتبع الإشعارات المقروءة
        this.isInitialized = false;
        this.updateInterval = null;
        this.settings = {
            checkInterval: 300000, // 5 دقائق
            showBadge: true,
            playSound: true,
            autoCheck: true,
            productsCheckEnabled: true,
            debtsCheckEnabled: true,
            debtsWarningDays: 7,
            debtsOverduePriority: true
        };
        
        this.notificationTypes = {
            LOW_STOCK: 'low_stock',
            OUT_OF_STOCK: 'out_of_stock',
            DEBT_DUE_SOON: 'debt_due_soon',
            DEBT_OVERDUE: 'debt_overdue',
            SYSTEM: 'system'
        };
        
        this.priorityLevels = {
            CRITICAL: 'critical',
            HIGH: 'high',
            MEDIUM: 'medium',
            LOW: 'low'
        };
    }

    /**
     * تهيئة نظام الإشعارات
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('✅ نظام الإشعارات مُهيأ مسبقاً');
            return;
        }

        try {
            console.log('🔄 بدء تهيئة نظام الإشعارات المُحدّث...');
            
            // تحميل الإعدادات والإشعارات المقروءة
            await this.loadSettings();
            await this.loadReadNotifications();
            
            // بناء واجهة الإشعارات
            this.buildNotificationUI();
            
            // إجراء فحص أولي
            await this.checkAll();
            
            // بدء الفحص الدوري
            if (this.settings.autoCheck) {
                this.startPeriodicCheck();
            }
            
            // ربط الأحداث
            this.attachEventListeners();
            
            this.isInitialized = true;
            console.log('✅ تم تهيئة نظام الإشعارات المُحدّث بنجاح');
            
            return true;
        } catch (error) {
            console.error('❌ خطأ في تهيئة نظام الإشعارات:', error);
            return false;
        }
    }

    /**
     * بناء واجهة المستخدم للإشعارات
     */
    buildNotificationUI() {
        let notificationContainer = document.getElementById('notificationSystem');
        
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notificationSystem';
            document.body.appendChild(notificationContainer);
        }

        notificationContainer.innerHTML = `
            <!-- أيقونة الإشعارات في شريط الأدوات -->
            <div class="notification-bell" id="notificationBell" title="الإشعارات">
                <i class="fas fa-bell"></i>
                <span class="notification-badge hidden" id="notificationBadge">0</span>
            </div>

            <!-- قائمة الإشعارات المنسدلة -->
            <div class="notification-dropdown hidden" id="notificationDropdown">
                <div class="notification-header">
                    <h4>
                        <i class="fas fa-bell"></i>
                        الإشعارات
                    </h4>
                    <div class="notification-actions">
                        <button class="btn-icon" id="markAllReadBtn" title="تعليم الكل كمقروء">
                            <i class="fas fa-check-double"></i>
                        </button>
                        <button class="btn-icon" id="clearAllBtn" title="حذف الكل">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button class="btn-icon" id="notificationSettingsBtn" title="الإعدادات">
                            <i class="fas fa-cog"></i>
                        </button>
                        <button class="btn-icon" id="closeNotificationsBtn" title="إغلاق">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- فلاتر الإشعارات -->
                <div class="notification-filters">
                    <button class="filter-btn active" data-filter="all">
                        الكل (<span id="countAll">0</span>)
                    </button>
                    <button class="filter-btn" data-filter="products">
                        المنتجات (<span id="countProducts">0</span>)
                    </button>
                    <button class="filter-btn" data-filter="debts">
                        الديون (<span id="countDebts">0</span>)
                    </button>
                    <button class="filter-btn" data-filter="system">
                        النظام (<span id="countSystem">0</span>)
                    </button>
                </div>

                <!-- قائمة الإشعارات -->
                <div class="notification-list" id="notificationList">
                    <div class="notification-empty">
                        <i class="fas fa-inbox"></i>
                        <p>لا توجد إشعارات</p>
                    </div>
                </div>

                <!-- تحديث آخر فحص -->
                <div class="notification-footer">
                    <small id="lastCheckTime">آخر فحص: لم يتم بعد</small>
                    <button class="btn-refresh" id="refreshNotificationsBtn">
                        <i class="fas fa-sync-alt"></i>
                        تحديث
                    </button>
                </div>
            </div>

            <!-- نافذة إعدادات الإشعارات -->
            <div class="modal fade" id="notificationSettingsModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-cog"></i>
                                إعدادات الإشعارات
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- الإعدادات العامة -->
                            <div class="settings-section">
                                <h6>الإعدادات العامة</h6>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="autoCheckSetting" checked>
                                    <label class="form-check-label" for="autoCheckSetting">
                                        الفحص التلقائي للإشعارات
                                    </label>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="showBadgeSetting" checked>
                                    <label class="form-check-label" for="showBadgeSetting">
                                        عرض عدد الإشعارات
                                    </label>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="playSoundSetting" checked>
                                    <label class="form-check-label" for="playSoundSetting">
                                        تشغيل الصوت للإشعارات الجديدة
                                    </label>
                                </div>
                                
                                <div class="mb-3 mt-3">
                                    <label class="form-label">فترة التحقق (بالدقائق)</label>
                                    <input type="number" class="form-control" id="checkIntervalSetting" 
                                           value="5" min="1" max="60">
                                </div>
                            </div>

                            <!-- إعدادات المنتجات -->
                            <div class="settings-section">
                                <h6>إعدادات إشعارات المنتجات</h6>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="productsCheckSetting" checked>
                                    <label class="form-check-label" for="productsCheckSetting">
                                        تفعيل إشعارات المنتجات
                                    </label>
                                </div>
                                <div class="alert alert-info mt-2 mb-0">
                                    <small>
                                        <strong>كيفية عمل التنبيهات:</strong><br>
                                        • ينبّه عندما يصل المخزون للحد الأدنى أو أقل<br>
                                        • مثال: مخزون = 10، حد أدنى = 5 → <strong>لا ينبّه</strong><br>
                                        • مثال: مخزون = 5، حد أدنى = 5 → <strong>ينبّه</strong><br>
                                        • مثال: مخزون = 3، حد أدنى = 5 → <strong>ينبّه</strong>
                                    </small>
                                </div>
                            </div>

                            <!-- إعدادات الديون -->
                            <div class="settings-section">
                                <h6>إعدادات إشعارات الديون</h6>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="debtsCheckSetting" checked>
                                    <label class="form-check-label" for="debtsCheckSetting">
                                        تفعيل إشعارات الديون
                                    </label>
                                </div>
                                <div class="mb-3 mt-2">
                                    <label class="form-label">التنبيه قبل موعد الاستحقاق بـ (يوم)</label>
                                    <input type="number" class="form-control" id="debtsWarningDaysSetting" 
                                           value="7" min="1" max="30">
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="debtsOverdueSetting" checked>
                                    <label class="form-check-label" for="debtsOverdueSetting">
                                        أولوية للديون المتأخرة
                                    </label>
                                </div>
                            </div>

                            <!-- إعدادات متقدمة -->
                            <div class="settings-section">
                                <h6>إعدادات متقدمة</h6>
                                <button class="btn btn-sm btn-warning w-100" id="clearReadNotificationsBtn">
                                    <i class="fas fa-broom"></i>
                                    مسح سجل الإشعارات المقروءة
                                </button>
                                <small class="text-muted d-block mt-2">
                                    سيؤدي هذا إلى إظهار جميع الإشعارات القديمة مرة أخرى
                                </small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                إلغاء
                            </button>
                            <button type="button" class="btn btn-primary" id="saveNotificationSettingsBtn">
                                <i class="fas fa-save"></i>
                                حفظ الإعدادات
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.injectStyles();
    }

    /**
     * إضافة الأنماط CSS
     */
    injectStyles() {
        const styleId = 'notificationSystemStyles';
        
        if (document.getElementById(styleId)) {
            return;
        }

        const styles = document.createElement('style');
        styles.id = styleId;
        styles.textContent = `
            /* نظام الإشعارات - الأنماط الأساسية */
            .notification-bell {
                position: relative;
                cursor: pointer;
                padding: 10px;
                border-radius: 50%;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            .notification-bell:hover {
                background: rgba(99, 102, 241, 0.1);
                transform: scale(1.1);
            }

            .notification-bell i {
                font-size: 20px;
                color: var(--text-color);
            }

            .notification-badge {
                position: absolute;
                top: 5px;
                right: 5px;
                background: #ef4444;
                color: white;
                font-size: 10px;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
                animation: pulse 2s infinite;
            }

            .notification-badge.hidden {
                display: none !important;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            /* القائمة المنسدلة */
            .notification-dropdown {
                position: fixed;
                top: 60px;
                right: 20px;
                width: 420px;
                max-height: 600px;
                background: var(--card-bg);
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                animation: slideDown 0.3s ease-out;
            }

            .notification-dropdown.hidden {
                display: none !important;
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* رأس الإشعارات */
            .notification-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid var(--border-color);
                background: var(--primary-gradient);
                color: white;
            }

            .notification-header h4 {
                margin: 0;
                font-size: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .notification-actions {
                display: flex;
                gap: 5px;
            }

            .btn-icon {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .btn-icon:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }

            /* الفلاتر */
            .notification-filters {
                display: flex;
                gap: 8px;
                padding: 12px 20px;
                border-bottom: 1px solid var(--border-color);
                overflow-x: auto;
            }

            .filter-btn {
                background: transparent;
                border: 1px solid var(--border-color);
                color: var(--text-color);
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s;
            }

            .filter-btn:hover {
                background: rgba(99, 102, 241, 0.1);
                border-color: var(--primary-color);
            }

            .filter-btn.active {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }

            /* قائمة الإشعارات */
            .notification-list {
                flex: 1;
                overflow-y: auto;
                padding: 10px;
                max-height: 400px;
            }

            .notification-empty {
                text-align: center;
                padding: 40px 20px;
                color: var(--text-secondary);
            }

            .notification-empty i {
                font-size: 48px;
                margin-bottom: 10px;
                opacity: 0.3;
            }

            .notification-item {
                background: var(--bg-secondary);
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s;
                border-right: 4px solid transparent;
                position: relative;
            }

            .notification-item:hover {
                background: var(--bg-hover);
                transform: translateX(-5px);
            }

            .notification-item.unread {
                background: rgba(99, 102, 241, 0.05);
                border-right-color: var(--primary-color);
            }

            .notification-item.unread::before {
                content: '';
                position: absolute;
                top: 12px;
                right: 12px;
                width: 8px;
                height: 8px;
                background: var(--primary-color);
                border-radius: 50%;
            }

            .notification-item.critical {
                border-right-color: #ef4444;
            }

            .notification-item.high {
                border-right-color: #f59e0b;
            }

            .notification-item.medium {
                border-right-color: #3b82f6;
            }

            .notification-item-header {
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin-bottom: 8px;
            }

            .notification-title {
                font-weight: 600;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .notification-time {
                font-size: 11px;
                color: var(--text-secondary);
            }

            .notification-message {
                font-size: 13px;
                color: var(--text-secondary);
                margin-bottom: 8px;
                line-height: 1.4;
            }

            .notification-action {
                color: var(--primary-color);
                font-weight: 500;
                margin-top: 8px;
                font-size: 12px;
            }

            .notification-action i {
                margin-left: 4px;
            }

            /* تأثير تمييز المنتج */
            .product-highlight {
                animation: highlightPulse 2s ease-in-out 3;
                background: rgba(99, 102, 241, 0.2) !important;
                border: 2px solid var(--primary-color) !important;
                box-shadow: 0 0 20px rgba(99, 102, 241, 0.4) !important;
            }

            @keyframes highlightPulse {
                0%, 100% {
                    transform: scale(1);
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
                }
                50% {
                    transform: scale(1.02);
                    box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
                }
            }

            /* التذييل */
            .notification-footer {
                padding: 12px 20px;
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--bg-secondary);
            }

            .notification-footer small {
                color: var(--text-secondary);
                font-size: 11px;
            }

            .btn-refresh {
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }

            .btn-refresh:hover {
                background: var(--primary-hover);
                transform: translateY(-2px);
            }

            .btn-refresh:active i {
                animation: spin 0.5s ease;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* نافذة الإعدادات */
            .settings-section {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid var(--border-color);
            }

            .settings-section:last-child {
                border-bottom: none;
            }

            .settings-section h6 {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 15px;
                color: var(--primary-color);
            }

            /* الوضع المتجاوب */
            @media (max-width: 768px) {
                .notification-dropdown {
                    right: 10px;
                    left: 10px;
                    width: auto;
                    top: 50px;
                }

                .notification-filters {
                    flex-wrap: wrap;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * ربط أحداث الواجهة
     */
    attachEventListeners() {
        const bellBtn = document.getElementById('notificationBell');
        const dropdown = document.getElementById('notificationDropdown');
        const closeBtn = document.getElementById('closeNotificationsBtn');

        if (bellBtn) {
            bellBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = dropdown.classList.contains('hidden');
                dropdown.classList.toggle('hidden');
                
                // عند فتح القائمة، نعلم جميع الإشعارات كمقروءة ونخفي العداد
                if (isHidden) {
                    this.markAllAsReadSilently();
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                dropdown.classList.add('hidden');
            });
        }

        // إغلاق عند النقر خارج القائمة
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // تعليم الكل كمقروء
        const markAllReadBtn = document.getElementById('markAllReadBtn');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }

        // حذف جميع الإشعارات
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                if (confirm('هل تريد حذف جميع الإشعارات؟')) {
                    this.clearAllNotifications();
                }
            });
        }

        // تحديث الإشعارات
        const refreshBtn = document.getElementById('refreshNotificationsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.disabled = true;
                const icon = refreshBtn.querySelector('i');
                icon.classList.add('fa-spin');
                
                await this.checkAll();
                
                setTimeout(() => {
                    refreshBtn.disabled = false;
                    icon.classList.remove('fa-spin');
                }, 1000);
            });
        }

        // فتح إعدادات الإشعارات
        const settingsBtn = document.getElementById('notificationSettingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }

        // حفظ الإعدادات
        const saveSettingsBtn = document.getElementById('saveNotificationSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // مسح سجل الإشعارات المقروءة
        const clearReadBtn = document.getElementById('clearReadNotificationsBtn');
        if (clearReadBtn) {
            clearReadBtn.addEventListener('click', () => {
                if (confirm('سيؤدي هذا إلى إظهار جميع الإشعارات القديمة مرة أخرى. هل تريد المتابعة؟')) {
                    this.clearReadNotificationsHistory();
                }
            });
        }

        // الفلاتر
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                this.filterNotifications(filter);
            });
        });
    }

    /**
     * فحص شامل لجميع الإشعارات
     */
    async checkAll() {
        try {
            console.log('🔍 بدء فحص الإشعارات...');
            
            // حفظ الإشعارات القديمة للمقارنة
            const oldNotificationsCount = this.notifications.filter(n => !this.readNotifications.has(n.id)).length;
            
            this.notifications = [];

            // فحص المنتجات
            if (this.settings.productsCheckEnabled) {
                await this.checkLowStockProducts();
            }

            // فحص الديون
            if (this.settings.debtsCheckEnabled) {
                await this.checkDebts();
            }

            // تصفية الإشعارات المقروءة
            this.notifications = this.notifications.filter(n => !this.readNotifications.has(n.id));

            // ترتيب الإشعارات حسب الأولوية
            this.sortNotificationsByPriority();

            // تحديث الواجهة
            this.updateUI();

            // تحديث وقت آخر فحص
            this.updateLastCheckTime();

            // تشغيل الصوت إذا كانت هناك إشعارات جديدة
            const newNotificationsCount = this.notifications.length;
            if (newNotificationsCount > oldNotificationsCount && this.settings.playSound) {
                this.playNotificationSound();
            }

            console.log(`✅ تم الفحص - إشعارات جديدة: ${this.notifications.length}`);

            return this.notifications;
        } catch (error) {
            console.error('❌ خطأ في فحص الإشعارات:', error);
            return [];
        }
    }

    /**
     * فحص المنتجات ذات المخزون المنخفض
     * ملاحظة مهمة: ينبه فقط عندما stock <= min_stock
     */
    async checkLowStockProducts() {
        try {
            // الاستعلام المُحسّن: يُرجع المنتجات التي stock <= min_stock فقط
            const query = `
                SELECT 
                    id, 
                    name, 
                    barcode,
                    stock, 
                    min_stock,
                    category,
                    price
                FROM products 
                WHERE active = 1 
                AND min_stock > 0
                AND stock <= min_stock
                ORDER BY (stock - min_stock) ASC, stock ASC
            `;

            const result = await window.electronAPI.dbQuery({ sql: query });
            
            if (!result.success) {
                throw new Error(result.error);
            }

            const products = result.data || [];

            console.log(`📦 تم العثور على ${products.length} منتج يحتاج تنبيه`);

            products.forEach(product => {
                const notificationId = `product_${product.id}`;
                
                // تجاهل إذا كان مقروءاً مسبقاً
                if (this.readNotifications.has(notificationId)) {
                    return;
                }

                const percentageLeft = product.min_stock > 0 
                    ? Math.round((product.stock / product.min_stock) * 100)
                    : 0;

                let priority = this.priorityLevels.MEDIUM;
                let type = this.notificationTypes.LOW_STOCK;
                let message = '';
                let title = '';

                if (product.stock === 0) {
                    // نفذ تماماً - أولوية قصوى
                    priority = this.priorityLevels.CRITICAL;
                    type = this.notificationTypes.OUT_OF_STOCK;
                    title = '⚠️ نفذ من المخزون!';
                    message = `المنتج "${product.name}" نفذ من المخزون تماماً! (الحد الأدنى: ${product.min_stock})`;
                } else if (product.stock < product.min_stock) {
                    // أقل من الحد الأدنى - أولوية عالية
                    priority = this.priorityLevels.HIGH;
                    title = '⚠️ مخزون منخفض';
                    message = `المنتج "${product.name}" أقل من الحد الأدنى! المتوفر: ${product.stock}، الحد الأدنى: ${product.min_stock}`;
                } else {
                    // يساوي الحد الأدنى - أولوية متوسطة
                    priority = this.priorityLevels.MEDIUM;
                    title = '⚠️ وصل للحد الأدنى';
                    message = `المنتج "${product.name}" وصل للحد الأدنى. المتوفر: ${product.stock}`;
                }

                this.notifications.push({
                    id: notificationId,
                    type: type,
                    category: 'products',
                    priority: priority,
                    title: title,
                    message: message,
                    icon: product.stock === 0 ? 'fa-times-circle' : 'fa-exclamation-triangle',
                    timestamp: new Date(),
                    read: false,
                    data: {
                        productId: product.id,
                        productName: product.name,
                        barcode: product.barcode,
                        currentStock: product.stock,
                        minStock: product.min_stock,
                        category: product.category,
                        price: product.price,
                        percentageLeft: percentageLeft
                    },
                    action: {
                        label: 'عرض المنتج',
                        handler: () => this.navigateToProduct(product.id)
                    }
                });
            });

        } catch (error) {
            console.error('❌ خطأ في فحص المنتجات:', error);
        }
    }

    /**
     * فحص الديون المستحقة
     */
    async checkDebts() {
        try {
            const warningDate = new Date();
            warningDate.setDate(warningDate.getDate() + this.settings.debtsWarningDays);

            const query = `
                SELECT 
                    ip.id,
                    ip.installment_id,
                    ip.payment_number,
                    ip.due_date,
                    ip.amount,
                    ip.paid_amount,
                    ip.status,
                    i.id as invoice_id,
                    inv.customer_name,
                    inv.customer_phone,
                    inv.invoice_number,
                    (ip.amount - IFNULL(ip.paid_amount, 0)) as remaining
                FROM installment_payments ip
                JOIN installments i ON ip.installment_id = i.id
                JOIN invoices inv ON i.invoice_id = inv.id
                WHERE ip.status != 'paid'
                AND (
                    DATE(ip.due_date) <= DATE('${warningDate.toISOString().split('T')[0]}')
                    OR DATE(ip.due_date) < DATE('now')
                )
                ORDER BY ip.due_date ASC
            `;

            const result = await window.electronAPI.dbQuery({ sql: query });
            
            if (!result.success) {
                throw new Error(result.error);
            }

            const debts = result.data || [];

            debts.forEach(debt => {
                const notificationId = `debt_${debt.id}`;
                
                // تجاهل إذا كان مقروءاً مسبقاً
                if (this.readNotifications.has(notificationId)) {
                    return;
                }

                const dueDate = new Date(debt.due_date);
                const today = new Date();
                const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                let priority = this.priorityLevels.MEDIUM;
                let type = this.notificationTypes.DEBT_DUE_SOON;
                let message = '';
                let title = '';

                if (daysUntilDue < 0) {
                    priority = this.priorityLevels.CRITICAL;
                    type = this.notificationTypes.DEBT_OVERDUE;
                    title = `💰 دين متأخر منذ ${Math.abs(daysUntilDue)} يوم`;
                    message = `العميل "${debt.customer_name}" - القسط #${debt.payment_number} متأخر ${Math.abs(daysUntilDue)} يوم. المبلغ: ${debt.remaining.toLocaleString('ar-IQ')} د.ع`;
                } else if (daysUntilDue === 0) {
                    priority = this.priorityLevels.HIGH;
                    title = '💰 دين يستحق اليوم';
                    message = `العميل "${debt.customer_name}" - القسط #${debt.payment_number} يستحق اليوم. المبلغ: ${debt.remaining.toLocaleString('ar-IQ')} د.ع`;
                } else if (daysUntilDue <= 3) {
                    priority = this.priorityLevels.HIGH;
                    title = `💰 دين يستحق خلال ${daysUntilDue} يوم`;
                    message = `العميل "${debt.customer_name}" - القسط #${debt.payment_number}. المبلغ: ${debt.remaining.toLocaleString('ar-IQ')} د.ع`;
                } else {
                    priority = this.priorityLevels.MEDIUM;
                    title = `💰 دين يستحق خلال ${daysUntilDue} يوم`;
                    message = `العميل "${debt.customer_name}" - القسط #${debt.payment_number}. المبلغ: ${debt.remaining.toLocaleString('ar-IQ')} د.ع`;
                }

                this.notifications.push({
                    id: notificationId,
                    type: type,
                    category: 'debts',
                    priority: priority,
                    title: title,
                    message: message,
                    icon: daysUntilDue < 0 ? 'fa-exclamation-circle' : 'fa-calendar-exclamation',
                    timestamp: new Date(),
                    read: false,
                    data: {
                        paymentId: debt.id,
                        installmentId: debt.installment_id,
                        invoiceId: debt.invoice_id,
                        invoiceNumber: debt.invoice_number,
                        customerName: debt.customer_name,
                        customerPhone: debt.customer_phone,
                        paymentNumber: debt.payment_number,
                        dueDate: debt.due_date,
                        amount: debt.amount,
                        remaining: debt.remaining,
                        daysUntilDue: daysUntilDue,
                        isOverdue: daysUntilDue < 0
                    },
                    action: {
                        label: 'عرض التفاصيل',
                        handler: () => this.navigateToDebt(debt.invoice_id, debt.installment_id)
                    }
                });
            });

            console.log(`💰 تم فحص الديون: ${debts.length} دين يحتاج تنبيه`);
        } catch (error) {
            console.error('❌ خطأ في فحص الديون:', error);
        }
    }

    /**
     * ترتيب الإشعارات حسب الأولوية
     */
    sortNotificationsByPriority() {
        const priorityOrder = {
            [this.priorityLevels.CRITICAL]: 0,
            [this.priorityLevels.HIGH]: 1,
            [this.priorityLevels.MEDIUM]: 2,
            [this.priorityLevels.LOW]: 3
        };

        this.notifications.sort((a, b) => {
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return b.timestamp - a.timestamp;
        });
    }

    /**
     * تحديث واجهة المستخدم
     */
    updateUI() {
        this.updateBadge();
        this.updateNotificationList();
        this.updateCounts();
    }

    /**
     * تحديث شارة العدد
     */
    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        const unreadCount = this.notifications.filter(n => !this.readNotifications.has(n.id)).length;

        if (badge) {
            if (unreadCount > 0 && this.settings.showBadge) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    /**
     * تحديث قائمة الإشعارات
     */
    updateNotificationList(filter = 'all') {
        const listContainer = document.getElementById('notificationList');
        if (!listContainer) return;

        let filteredNotifications = this.notifications;
        if (filter !== 'all') {
            filteredNotifications = this.notifications.filter(n => n.category === filter);
        }

        if (filteredNotifications.length === 0) {
            listContainer.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-inbox"></i>
                    <p>لا توجد إشعارات ${filter !== 'all' ? 'في هذا القسم' : ''}</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = filteredNotifications.map(notification => this.renderNotification(notification)).join('');

        listContainer.querySelectorAll('.notification-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const notification = filteredNotifications[index];
                this.handleNotificationClick(notification);
            });
        });
    }

    /**
     * رسم إشعار واحد
     */
    renderNotification(notification) {
        const timeAgo = this.getTimeAgo(notification.timestamp);
        const isRead = this.readNotifications.has(notification.id);
        
        return `
            <div class="notification-item ${isRead ? '' : 'unread'} ${notification.priority}" 
                 data-id="${notification.id}">
                <div class="notification-item-header">
                    <div class="notification-title">
                        <i class="fas ${notification.icon}"></i>
                        ${notification.title}
                    </div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
                <div class="notification-message">
                    ${notification.message}
                </div>
                ${notification.action ? `
                    <div class="notification-action">
                        <i class="fas fa-arrow-left"></i>
                        ${notification.action.label}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * حساب الوقت المنقضي
     */
    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = Math.floor((now - timestamp) / 1000);

        if (diff < 60) return 'الآن';
        if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
        if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
        return `منذ ${Math.floor(diff / 86400)} يوم`;
    }

    /**
     * تحديث العدادات
     */
    updateCounts() {
        const counts = {
            all: this.notifications.length,
            products: this.notifications.filter(n => n.category === 'products').length,
            debts: this.notifications.filter(n => n.category === 'debts').length,
            system: this.notifications.filter(n => n.category === 'system').length
        };

        Object.keys(counts).forEach(key => {
            const element = document.getElementById(`count${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (element) {
                element.textContent = counts[key];
            }
        });
    }

    /**
     * معالجة النقر على إشعار
     */
    handleNotificationClick(notification) {
        // تعليم كمقروء
        this.readNotifications.add(notification.id);
        this.saveReadNotifications();
        this.updateUI();

        // تنفيذ الإجراء
        if (notification.action && typeof notification.action.handler === 'function') {
            notification.action.handler();
        }

        // إغلاق القائمة
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }

    /**
     * الانتقال إلى صفحة المنتج مع تأثيرات حديثة
     */
    navigateToProduct(productId) {
        console.log('📍 التوجه إلى المنتج:', productId);
        
        // الانتقال إلى تبويب المنتجات
        const productsTab = document.querySelector('[data-tab="products"]');
        if (productsTab) {
            productsTab.click();
        }

        // الانتظار قليلاً ثم البحث عن المنتج وتمييزه
        setTimeout(() => {
            this.highlightProductModern(productId);
        }, 300);
    }

    /**
     * تمييز المنتج في الجدول بطريقة حديثة
     */
    highlightProductModern(productId) {
        // البحث عن صف المنتج في الجدول
        const productRow = document.querySelector(`tr[data-product-id="${productId}"]`);
        
        if (productRow) {
            // إزالة أي تمييز سابق
            document.querySelectorAll('.product-highlight').forEach(el => {
                el.classList.remove('product-highlight');
            });

            // إضافة تأثير التمييز
            productRow.classList.add('product-highlight');
            
            // التمرير إلى الصف بسلاسة
            productRow.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });

            // إزالة التمييز بعد 6 ثواني
            setTimeout(() => {
                productRow.classList.remove('product-highlight');
            }, 6000);

            // إظهار رسالة نجاح
            if (typeof window.showToast === 'function') {
                window.showToast('تم العثور على المنتج ✓', 'success');
            }

            console.log('✅ تم تمييز المنتج بنجاح');
        } else {
            // إذا لم يتم العثور على المنتج في الجدول، فتح نافذة التعديل
            console.log('ℹ️ المنتج غير موجود في الجدول، فتح نافذة التعديل...');
            
            if (typeof window.openEditProduct === 'function') {
                window.openEditProduct(productId);
            } else {
                console.warn('⚠️ دالة openEditProduct غير موجودة');
                if (typeof window.showToast === 'function') {
                    window.showToast('لم يتم العثور على المنتج', 'warning');
                }
            }
        }
    }

    /**
     * الانتقال إلى تفاصيل الدين
     */
    navigateToDebt(invoiceId, installmentId) {
        console.log('📍 التوجه إلى الدين:', invoiceId, installmentId);
        
        // الانتقال إلى تبويب الأقساط
        const installmentsTab = document.querySelector('[data-tab="installments"]');
        if (installmentsTab) {
            installmentsTab.click();
        }

        // الانتظار قليلاً ثم فتح تفاصيل القسط
        setTimeout(() => {
            this.showInstallmentDetails(invoiceId, installmentId);
        }, 300);
    }

    /**
     * عرض تفاصيل القسط
     */
    async showInstallmentDetails(invoiceId, installmentId) {
        if (typeof window.showInstallmentPayments === 'function') {
            await window.showInstallmentPayments(installmentId);
            
            if (typeof window.showToast === 'function') {
                window.showToast('تم فتح تفاصيل القسط', 'info');
            }
        } else {
            // البحث عن الفاتورة في الجدول
            const invoiceRow = document.querySelector(`tr[data-invoice-id="${invoiceId}"]`);
            
            if (invoiceRow) {
                invoiceRow.classList.add('product-highlight');
                invoiceRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                setTimeout(() => {
                    invoiceRow.classList.remove('product-highlight');
                }, 6000);
            }
        }
    }

    /**
     * تعليم جميع الإشعارات كمقروءة (بصمت - بدون إظهار رسالة)
     */
    markAllAsReadSilently() {
        this.notifications.forEach(n => {
            this.readNotifications.add(n.id);
        });
        
        this.saveReadNotifications();
        this.updateUI();
    }

    /**
     * تعليم جميع الإشعارات كمقروءة (مع رسالة)
     */
    markAllAsRead() {
        this.markAllAsReadSilently();
        
        if (typeof window.showToast === 'function') {
            window.showToast('تم تعليم جميع الإشعارات كمقروءة', 'success');
        }
    }

    /**
     * حذف جميع الإشعارات
     */
    clearAllNotifications() {
        this.notifications = [];
        this.updateUI();
        
        if (typeof window.showToast === 'function') {
            window.showToast('تم حذف جميع الإشعارات', 'success');
        }
    }

    /**
     * مسح سجل الإشعارات المقروءة
     */
    clearReadNotificationsHistory() {
        this.readNotifications.clear();
        localStorage.removeItem('notificationReadList');
        
        // إعادة فحص الإشعارات
        this.checkAll();
        
        if (typeof window.showToast === 'function') {
            window.showToast('تم مسح سجل الإشعارات المقروءة', 'success');
        }
    }

    /**
     * تصفية الإشعارات
     */
    filterNotifications(filter) {
        this.updateNotificationList(filter);
    }

    /**
     * فتح نافذة الإعدادات
     */
    openSettings() {
        const modal = document.getElementById('notificationSettingsModal');
        if (modal && typeof bootstrap !== 'undefined') {
            // تحميل القيم الحالية
            document.getElementById('autoCheckSetting').checked = this.settings.autoCheck;
            document.getElementById('showBadgeSetting').checked = this.settings.showBadge;
            document.getElementById('playSoundSetting').checked = this.settings.playSound;
            document.getElementById('checkIntervalSetting').value = this.settings.checkInterval / 60000;
            document.getElementById('productsCheckSetting').checked = this.settings.productsCheckEnabled;
            document.getElementById('debtsCheckSetting').checked = this.settings.debtsCheckEnabled;
            document.getElementById('debtsWarningDaysSetting').value = this.settings.debtsWarningDays;
            document.getElementById('debtsOverdueSetting').checked = this.settings.debtsOverduePriority;

            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    /**
     * حفظ الإعدادات
     */
    async saveSettings() {
        try {
            this.settings.autoCheck = document.getElementById('autoCheckSetting').checked;
            this.settings.showBadge = document.getElementById('showBadgeSetting').checked;
            this.settings.playSound = document.getElementById('playSoundSetting').checked;
            this.settings.checkInterval = parseInt(document.getElementById('checkIntervalSetting').value) * 60000;
            this.settings.productsCheckEnabled = document.getElementById('productsCheckSetting').checked;
            this.settings.debtsCheckEnabled = document.getElementById('debtsCheckSetting').checked;
            this.settings.debtsWarningDays = parseInt(document.getElementById('debtsWarningDaysSetting').value);
            this.settings.debtsOverduePriority = document.getElementById('debtsOverdueSetting').checked;

            localStorage.setItem('notificationSettings', JSON.stringify(this.settings));

            this.stopPeriodicCheck();
            if (this.settings.autoCheck) {
                this.startPeriodicCheck();
            }

            const modal = document.getElementById('notificationSettingsModal');
            if (modal && typeof bootstrap !== 'undefined') {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            }

            if (typeof window.showToast === 'function') {
                window.showToast('تم حفظ الإعدادات بنجاح', 'success');
            }

            await this.checkAll();

        } catch (error) {
            console.error('❌ خطأ في حفظ الإعدادات:', error);
            
            if (typeof window.showToast === 'function') {
                window.showToast('فشل حفظ الإعدادات', 'error');
            }
        }
    }

    /**
     * تحميل الإعدادات المحفوظة
     */
    async loadSettings() {
        try {
            const saved = localStorage.getItem('notificationSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.settings = { ...this.settings, ...settings };
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل الإعدادات:', error);
        }
    }

    /**
     * تحميل قائمة الإشعارات المقروءة
     */
    async loadReadNotifications() {
        try {
            const saved = localStorage.getItem('notificationReadList');
            if (saved) {
                this.readNotifications = new Set(JSON.parse(saved));
                console.log(`📖 تم تحميل ${this.readNotifications.size} إشعار مقروء`);
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل الإشعارات المقروءة:', error);
        }
    }

    /**
     * حفظ قائمة الإشعارات المقروءة
     */
    saveReadNotifications() {
        try {
            localStorage.setItem(
                'notificationReadList', 
                JSON.stringify([...this.readNotifications])
            );
        } catch (error) {
            console.error('❌ خطأ في حفظ الإشعارات المقروءة:', error);
        }
    }

    /**
     * بدء الفحص الدوري
     */
    startPeriodicCheck() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        console.log(`⏰ بدء الفحص الدوري كل ${this.settings.checkInterval / 60000} دقيقة`);
        
        this.updateInterval = setInterval(() => {
            this.checkAll();
        }, this.settings.checkInterval);
    }

    /**
     * إيقاف الفحص الدوري
     */
    stopPeriodicCheck() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏹️ تم إيقاف الفحص الدوري');
        }
    }

    /**
     * تحديث وقت آخر فحص
     */
    updateLastCheckTime() {
        const timeElement = document.getElementById('lastCheckTime');
        if (timeElement) {
            const now = new Date();
            const formattedTime = now.toLocaleString('ar-IQ', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            timeElement.textContent = `آخر فحص: ${formattedTime}`;
        }
    }

    /**
     * إضافة إشعار يدوي
     */
    addNotification(notification) {
        const id = `manual_${Date.now()}`;
        
        this.notifications.unshift({
            id: id,
            timestamp: new Date(),
            read: false,
            ...notification
        });

        this.updateUI();

        if (this.settings.playSound) {
            this.playNotificationSound();
        }
    }

    /**
     * تشغيل صوت الإشعار
     */
    playNotificationSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSp+zPLaizsIGGS57OihUhELTKXh8bllHAU2kdH00YAyBSB1xe7fmUMLD1mu5O+wXhoINZXY88p2KwYteM3y2o4+CRxqvOzjnE4OCVOq5O+zYBsIOJPY88p3LAUse8/y24w/CRxtvOvjnlIOC1Sp5PC1ZBwGOpXX88p3LAUueMzy2Ys+CRxrvOvjn04PClWq5PC1ZBsGOJPY88p3LAUsc87y2Ys+CRxrvOvjnlIOC1Sp5PC1ZBwGOpXX88p3LAUueMzy2Ys+CRxrvOvjn04PClWq5PC1ZBsGOJPY88p3LAUsc87y2Ys+CRxrvOvjnlIOC1Sp5PC1ZBwGOpXX88p3LAUueMzy2Ys+CRxrvOvjn04PClWq5PC1ZBsGOJPY88p3LAUsc87y2Ys+CRxrvOvjnlIOC1Sp5PC1ZBwGOpXX88p3LAUueMzy2Ys+CRxrvOvjn04PClWq5PC1ZBsGOJPY88p3LAUsc87y2Ys+CRxrvOvjnlIOC1Sp5PC1ZBwGOpXX88p3LAUueMzy2Ys+CRxrvOvjn04PClWq5PC1ZBsGOJPY88p3LAUsc87y2Ys+CRxrvOvjnlIOC1Sp5PC1ZBwGOpXX88p3LAUueMzy2Ys+CRxrvOvjn04PClWq5PC1ZBsGOJPY88p3LAUsc87y2Ys+CRxrvOvjnlIOC1Sp5PC1ZBwGOpXX88p3LAUueMzy2Ys+CRxrvOvjn04PClWq5PC1ZBsGOJPY88p3LAUsc87y2Ys+');
            audio.volume = 0.3;
            audio.play().catch(() => {});
        } catch (error) {
            console.warn('⚠️ فشل تشغيل صوت الإشعار');
        }
    }

    /**
     * تدمير نظام الإشعارات
     */
    destroy() {
        this.stopPeriodicCheck();
        this.notifications = [];
        this.readNotifications.clear();
        this.isInitialized = false;
        
        const container = document.getElementById('notificationSystem');
        if (container) {
            container.remove();
        }

        const styles = document.getElementById('notificationSystemStyles');
        if (styles) {
            styles.remove();
        }

        console.log('🗑️ تم تدمير نظام الإشعارات');
    }
}

// ========================================
// التهيئة التلقائية
// ========================================

window.notificationSystem = new EnhancedNotificationSystem();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.notificationSystem.initialize();
        }, 1000);
    });
} else {
    setTimeout(() => {
        window.notificationSystem.initialize();
    }, 1000);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedNotificationSystem;
}

console.log('✅ تم تحميل نظام الإشعارات المُحدّث v3.1 بنجاح');
