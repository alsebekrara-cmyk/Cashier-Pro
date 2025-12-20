/**
 * ═══════════════════════════════════════════════════════════════════
 * نظام إدارة التقارير المتكامل - شركة الإبداع الرقمي
 * ═══════════════════════════════════════════════════════════════════
 * 
 * الميزات:
 * ✅ تقارير الديون والديون المتأخرة
 * ✅ تقارير المديونين
 * ✅ تقارير المنتجات والمخزن
 * ✅ تقارير المبيعات والفواتير
 * ✅ تقارير المنتجات الأكثر مبيعاً
 * ✅ تقارير المنتجات المنخفضة في المخزن
 * ✅ طباعة وتصدير التقارير (PDF, Excel, CSV)
 * ✅ تصميم متوافق مع شكل التطبيق
 * 
 * @author كرار السعبري - شركة الإبداع الرقمي
 * @version 2.0.0
 * @date 2025
 */

(function() {
        // دالة مساعدة لتحويل الأرقام العربية إلى إنجليزية (تعمل على كل النصوص)
        function toEnglishDigits(str) {
            if (typeof str !== 'string') str = String(str);
            return str.replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
        }
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // التكوين العام
    // ═══════════════════════════════════════════════════════════════
    
    const REPORTS_CONFIG = {
        dateRangeOptions: [
            { value: 'today', label: 'اليوم' },
            { value: 'yesterday', label: 'أمس' },
            { value: 'thisWeek', label: 'هذا الأسبوع' },
            { value: 'lastWeek', label: 'الأسبوع الماضي' },
            { value: 'thisMonth', label: 'هذا الشهر' },
            { value: 'lastMonth', label: 'الشهر الماضي' },
            { value: 'last3Months', label: 'آخر 3 أشهر' },
            { value: 'thisYear', label: 'هذا العام' },
            { value: 'custom', label: 'تخصيص' }
        ],
        exportFormats: ['pdf', 'excel', 'csv'],
        pageSize: 50
    };

    // ═══════════════════════════════════════════════════════════════
    // مدير التقارير الرئيسي
    // ═══════════════════════════════════════════════════════════════
    
    class ReportsManager {
        constructor() {
            this.currentReport = null;
            this.currentData = [];
            this.filters = {
                dateRange: 'thisMonth',
                startDate: null,
                endDate: null,
                category: 'all',
                status: 'all',
                sortBy: 'date',
                sortOrder: 'desc'
            };
            this.initializeReportsSystem();
        }

        // ═══════════════════════════════════════════════════════════
        // تهيئة النظام
        // ═══════════════════════════════════════════════════════════
        
        initializeReportsSystem() {
            console.log('🚀 بدء تهيئة نظام التقارير...');
            this.injectStyles();
            this.addReportsButton();
            console.log('✅ تم تهيئة نظام التقارير بنجاح');
        }

        // ═══════════════════════════════════════════════════════════
        // إضافة الأنماط
        // ═══════════════════════════════════════════════════════════
        
        injectStyles() {
            const styleId = 'reports-manager-styles';
            if (document.getElementById(styleId)) return;

            const styles = `
                /* ═══════════════════════════════════════════════════════════ */
                /* نظام التقارير - الأنماط الأساسية */
                /* ═══════════════════════════════════════════════════════════ */
                
                .reports-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease;
                    padding: 20px;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .reports-container {
                    background: var(--bg-card, #1a1a1a);
                    border: 1px solid var(--border-color, #2a2a2a);
                    border-radius: var(--border-radius, 16px);
                    width: 100%;
                    max-width: 1400px;
                    max-height: 90vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                /* ═══════════════════════════════════════════════════════════ */
                /* رأس التقارير */
                /* ═══════════════════════════════════════════════════════════ */
                
                .reports-header {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    padding: 24px 30px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .reports-header-title {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .reports-header-title i {
                    font-size: 28px;
                    color: white;
                }

                .reports-header-title h2 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                    color: white;
                }

                .reports-close-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    transition: all 0.3s ease;
                }

                .reports-close-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.05);
                }

                /* ═══════════════════════════════════════════════════════════ */
                /* محتوى التقارير */
                /* ═══════════════════════════════════════════════════════════ */
                
                .reports-body {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                .reports-sidebar {
                    width: 280px;
                    background: var(--bg-secondary, #141414);
                    border-left: 1px solid var(--border-color, #2a2a2a);
                    padding: 20px;
                    overflow-y: auto;
                }

                .reports-sidebar::-webkit-scrollbar {
                    width: 6px;
                }

                .reports-sidebar::-webkit-scrollbar-track {
                    background: var(--bg-primary, #0a0a0a);
                    border-radius: 3px;
                }

                .reports-sidebar::-webkit-scrollbar-thumb {
                    background: var(--primary-color, #6366f1);
                    border-radius: 3px;
                }

                .report-category {
                    margin-bottom: 25px;
                }

                .report-category-title {
                    color: var(--text-secondary, #b8b8b8);
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                    padding: 0 10px;
                }

                .report-menu-item {
                    padding: 12px 15px;
                    margin-bottom: 5px;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--text-primary, #e8e8e8);
                    font-size: 14px;
                    transition: all 0.2s ease;
                    border: 1px solid transparent;
                }

                .report-menu-item:hover {
                    background: var(--bg-hover, #252525);
                    border-color: var(--primary-color, #6366f1);
                }

                .report-menu-item.active {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                }

                .report-menu-item i {
                    font-size: 16px;
                    width: 20px;
                    text-align: center;
                }

                .reports-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                /* ═══════════════════════════════════════════════════════════ */
                /* شريط الأدوات */
                /* ═══════════════════════════════════════════════════════════ */
                
                .reports-toolbar {
                    padding: 20px 30px;
                    background: var(--bg-secondary, #141414);
                    border-bottom: 1px solid var(--border-color, #2a2a2a);
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    flex-wrap: wrap;
                }

                .reports-toolbar-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .reports-toolbar-group label {
                    color: var(--text-secondary, #b8b8b8);
                    font-size: 14px;
                    font-weight: 500;
                }

                .reports-toolbar select,
                .reports-toolbar input {
                    padding: 10px 15px;
                    border: 1px solid var(--border-color, #2a2a2a);
                    border-radius: 8px;
                    background: var(--bg-card, #1a1a1a);
                    color: var(--text-primary, #e8e8e8);
                    font-size: 14px;
                    min-width: 150px;
                    transition: all 0.2s ease;
                }

                .reports-toolbar select:focus,
                .reports-toolbar input:focus {
                    outline: none;
                    border-color: var(--primary-color, #6366f1);
                }

                .reports-toolbar-actions {
                    margin-right: auto;
                    display: flex;
                    gap: 10px;
                }

                .report-action-btn {
                    padding: 10px 20px;
                    border: 1px solid var(--border-color, #2a2a2a);
                    border-radius: 8px;
                    background: var(--bg-card, #1a1a1a);
                    color: var(--text-primary, #e8e8e8);
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                }

                .report-action-btn:hover {
                    background: var(--bg-hover, #252525);
                    border-color: var(--primary-color, #6366f1);
                    transform: translateY(-2px);
                }

                .report-action-btn i {
                    font-size: 16px;
                }

                .report-action-btn.primary {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    border-color: transparent;
                    color: white;
                }

                .report-action-btn.success {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border-color: transparent;
                    color: white;
                }

                .report-action-btn.danger {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    border-color: transparent;
                    color: white;
                }

                /* ═══════════════════════════════════════════════════════════ */
                /* منطقة عرض التقرير */
                /* ═══════════════════════════════════════════════════════════ */
                
                .reports-display {
                    flex: 1;
                    padding: 30px;
                    overflow-y: auto;
                }

                .reports-display::-webkit-scrollbar {
                    width: 8px;
                }

                .reports-display::-webkit-scrollbar-track {
                    background: var(--bg-primary, #0a0a0a);
                    border-radius: 4px;
                }

                .reports-display::-webkit-scrollbar-thumb {
                    background: var(--primary-color, #6366f1);
                    border-radius: 4px;
                }

                .report-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--text-primary, #e8e8e8);
                    margin-bottom: 10px;
                }

                .report-subtitle {
                    color: var(--text-secondary, #b8b8b8);
                    font-size: 14px;
                    margin-bottom: 30px;
                }

                /* ═══════════════════════════════════════════════════════════ */
                /* بطاقات الإحصائيات */
                /* ═══════════════════════════════════════════════════════════ */
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .stat-card {
                    background: var(--bg-card, #1a1a1a);
                    border: 1px solid var(--border-color, #2a2a2a);
                    border-radius: 12px;
                    padding: 20px;
                    transition: all 0.3s ease;
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                }

                .stat-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 15px;
                }

                .stat-card-title {
                    color: var(--text-secondary, #b8b8b8);
                    font-size: 13px;
                    font-weight: 500;
                }

                .stat-card-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                }

                .stat-card-icon.primary {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: white;
                }

                .stat-card-icon.success {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                }

                .stat-card-icon.warning {
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                }

                .stat-card-icon.danger {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                }

                .stat-card-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--text-primary, #e8e8e8);
                    margin-bottom: 5px;
                }

                .stat-card-change {
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .stat-card-change.positive {
                    color: var(--success-color, #10b981);
                }

                .stat-card-change.negative {
                    color: var(--danger-color, #ef4444);
                }

                /* ═══════════════════════════════════════════════════════════ */
                /* جداول التقارير */
                /* ═══════════════════════════════════════════════════════════ */
                
                .report-table-container {
                    background: var(--bg-card, #1a1a1a);
                    border: 1px solid var(--border-color, #2a2a2a);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .report-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .report-table thead {
                    background: var(--bg-secondary, #141414);
                }

                .report-table th {
                    padding: 15px;
                    text-align: right;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary, #b8b8b8);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid var(--border-color, #2a2a2a);
                }

                .report-table td {
                    padding: 15px;
                    text-align: right;
                    font-size: 14px;
                    color: var(--text-primary, #e8e8e8);
                    border-bottom: 1px solid var(--border-color, #2a2a2a);
                }

                .report-table tbody tr {
                    transition: background 0.2s ease;
                }

                .report-table tbody tr:hover {
                    background: var(--bg-hover, #252525);
                }

                .report-table tbody tr:last-child td {
                    border-bottom: none;
                }

                .status-badge {
                    display: inline-block;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .status-badge.success {
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                }

                .status-badge.warning {
                    background: rgba(245, 158, 11, 0.2);
                    color: #f59e0b;
                }

                .status-badge.danger {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .status-badge.info {
                    background: rgba(59, 130, 246, 0.2);
                    color: #3b82f6;
                }

                /* ═══════════════════════════════════════════════════════════ */
                /* رسالة فارغة */
                /* ═══════════════════════════════════════════════════════════ */
                
                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                }

                .empty-state i {
                    font-size: 64px;
                    color: var(--text-tertiary, #8a8a8a);
                    margin-bottom: 20px;
                }

                .empty-state h3 {
                    font-size: 20px;
                    color: var(--text-primary, #e8e8e8);
                    margin-bottom: 10px;
                }

                .empty-state p {
                    font-size: 14px;
                    color: var(--text-secondary, #b8b8b8);
                }

                /* ═══════════════════════════════════════════════════════════ */
                /* تحميل */
                /* ═══════════════════════════════════════════════════════════ */
                
                .loading-state {
                    text-align: center;
                    padding: 60px 20px;
                }

                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid var(--border-color, #2a2a2a);
                    border-top-color: var(--primary-color, #6366f1);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .loading-text {
                    font-size: 14px;
                    color: var(--text-secondary, #b8b8b8);
                }

                /* ═══════════════════════════════════════════════════════════ */
                /* استجابة الشاشات الصغيرة */
                /* ═══════════════════════════════════════════════════════════ */
                
                @media (max-width: 1024px) {
                    .reports-sidebar {
                        width: 240px;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    }
                }

                @media (max-width: 768px) {
                    .reports-modal {
                        padding: 0;
                    }

                    .reports-container {
                        max-height: 100vh;
                        border-radius: 0;
                    }

                    .reports-body {
                        flex-direction: column;
                    }

                    .reports-sidebar {
                        width: 100%;
                        border-left: none;
                        border-bottom: 1px solid var(--border-color, #2a2a2a);
                        max-height: 200px;
                    }

                    .reports-toolbar {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .reports-toolbar-actions {
                        margin-right: 0;
                        width: 100%;
                    }

                    .report-action-btn {
                        flex: 1;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .report-table-container {
                        overflow-x: auto;
                    }
                }
            `;

            const styleElement = document.createElement('style');
            styleElement.id = styleId;
            styleElement.textContent = styles;
            document.head.appendChild(styleElement);
        }

        // ═══════════════════════════════════════════════════════════
        // إضافة زر التقارير في الشريط الجانبي
        // ═══════════════════════════════════════════════════════════
        
        addReportsButton() {
            const sidebar = document.querySelector('.sidebar-menu');
            if (!sidebar) {
                console.warn('⚠️ لم يتم العثور على الشريط الجانبي');
                return;
            }

            // التحقق من عدم وجود الزر مسبقاً
            if (document.getElementById('reportsMenuButton')) {
                console.log('ℹ️ زر التقارير موجود مسبقاً');
                return;
            }

            const reportsButton = document.createElement('button');
            reportsButton.id = 'reportsMenuButton';
            reportsButton.className = 'sidebar-btn';
            reportsButton.innerHTML = `
                <i class="fas fa-chart-bar"></i>
                <span>التقارير</span>
            `;

            reportsButton.addEventListener('click', () => {
                this.openReportsModal();
            });

            // إضافة الزر في المكان المناسب
            const settingsButton = Array.from(sidebar.querySelectorAll('.sidebar-btn'))
                .find(btn => btn.textContent.includes('الإعدادات'));
            
            if (settingsButton) {
                settingsButton.parentNode.insertBefore(reportsButton, settingsButton);
            } else {
                sidebar.appendChild(reportsButton);
            }

            console.log('✅ تم إضافة زر التقارير في الشريط الجانبي');
        }

        // ═══════════════════════════════════════════════════════════
        // فتح نافذة التقارير
        // ═══════════════════════════════════════════════════════════
        
        openReportsModal() {
            const modal = document.createElement('div');
            modal.className = 'reports-modal';
            modal.innerHTML = `
                <div class="reports-container">
                    ${this.renderHeader()}
                    <div class="reports-body">
                        ${this.renderSidebar()}
                        ${this.renderContent()}
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // إغلاق عند النقر خارج النافذة
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeReportsModal();
                }
            });

            // إغلاق عند الضغط على ESC
            document.addEventListener('keydown', this.handleEscKey.bind(this));

            // تحميل التقرير الافتراضي
            this.loadReport('sales-summary');
        }

        // ═══════════════════════════════════════════════════════════
        // إغلاق نافذة التقارير
        // ═══════════════════════════════════════════════════════════
        
        closeReportsModal() {
            const modal = document.querySelector('.reports-modal');
            if (modal) {
                modal.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
            document.removeEventListener('keydown', this.handleEscKey.bind(this));
        }

        handleEscKey(e) {
            if (e.key === 'Escape') {
                this.closeReportsModal();
            }
        }

        // ═══════════════════════════════════════════════════════════
        // رسم رأس النافذة
        // ═══════════════════════════════════════════════════════════
        
        renderHeader() {
            return `
                <div class="reports-header">
                    <div class="reports-header-title">
                        <i class="fas fa-chart-line"></i>
                        <h2>نظام إدارة التقارير</h2>
                    </div>
                    <button class="reports-close-btn" onclick="reportsManager.closeReportsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم الشريط الجانبي
        // ═══════════════════════════════════════════════════════════
        
        renderSidebar() {
            const reportCategories = [
                {
                    title: 'المبيعات والفواتير',
                    reports: [
                        { id: 'sales-summary', icon: 'fa-chart-line', label: 'ملخص المبيعات' },
                        { id: 'invoices-report', icon: 'fa-file-invoice', label: 'تقرير الفواتير' },
                        { id: 'payment-methods', icon: 'fa-credit-card', label: 'طرق الدفع' },
                        { id: 'daily-sales', icon: 'fa-calendar-day', label: 'المبيعات اليومية' }
                    ]
                },
                {
                    title: 'المنتجات والمخزون',
                    reports: [
                        { id: 'products-report', icon: 'fa-box', label: 'تقرير المنتجات' },
                        { id: 'inventory-report', icon: 'fa-warehouse', label: 'تقرير المخزون' },
                        { id: 'top-selling', icon: 'fa-star', label: 'الأكثر مبيعاً' },
                        { id: 'low-stock', icon: 'fa-exclamation-triangle', label: 'المنخفضة في المخزن' },
                        { id: 'stock-movement', icon: 'fa-exchange-alt', label: 'حركة المخزون' }
                    ]
                },
                {
                    title: 'الديون والمديونين',
                    reports: [
                        { id: 'debts-summary', icon: 'fa-money-bill-wave', label: 'ملخص الديون' },
                        { id: 'overdue-debts', icon: 'fa-clock', label: 'الديون المتأخرة' },
                        { id: 'debtors-list', icon: 'fa-users', label: 'قائمة المديونين' },
                        { id: 'installments', icon: 'fa-calendar-check', label: 'الأقساط الشهرية' }
                    ]
                },
                {
                    title: 'تقارير تحليلية',
                    reports: [
                        { id: 'profit-analysis', icon: 'fa-chart-pie', label: 'تحليل الأرباح' },
                        { id: 'category-analysis', icon: 'fa-layer-group', label: 'تحليل التصنيفات' },
                        { id: 'customer-analysis', icon: 'fa-user-chart', label: 'تحليل العملاء' },
                        { id: 'trends-report', icon: 'fa-chart-area', label: 'الاتجاهات والنمو' }
                    ]
                }
            ];

            let sidebarHtml = '<div class="reports-sidebar">';
            
            reportCategories.forEach(category => {
                sidebarHtml += `
                    <div class="report-category">
                        <div class="report-category-title">${category.title}</div>
                `;
                
                category.reports.forEach(report => {
                    sidebarHtml += `
                        <div class="report-menu-item" onclick="reportsManager.loadReport('${report.id}')">
                            <i class="fas ${report.icon}"></i>
                            <span>${report.label}</span>
                        </div>
                    `;
                });
                
                sidebarHtml += '</div>';
            });
            
            sidebarHtml += '</div>';
            return sidebarHtml;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم منطقة المحتوى
        // ═══════════════════════════════════════════════════════════
        
        renderContent() {
            return `
                <div class="reports-content">
                    <div class="reports-toolbar" id="reportsToolbar">
                        ${this.renderToolbar()}
                    </div>
                    <div class="reports-display" id="reportsDisplay">
                        <div class="loading-state">
                            <div class="loading-spinner"></div>
                            <div class="loading-text">جاري التحميل...</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم شريط الأدوات
        // ═══════════════════════════════════════════════════════════
        
        renderToolbar() {
            return `
                <div class="reports-toolbar-group">
                    <label>الفترة الزمنية:</label>
                    <select id="dateRangeSelect" onchange="reportsManager.handleDateRangeChange()">
                        ${REPORTS_CONFIG.dateRangeOptions.map(opt => 
                            `<option value="${opt.value}" ${opt.value === this.filters.dateRange ? 'selected' : ''}>${opt.label}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="reports-toolbar-group" id="customDateRange" style="display: none;">
                    <input type="date" id="startDate" onchange="reportsManager.handleCustomDateChange()">
                    <span style="color: var(--text-secondary);">إلى</span>
                    <input type="date" id="endDate" onchange="reportsManager.handleCustomDateChange()">
                </div>

                <div class="reports-toolbar-actions">
                    <button class="report-action-btn primary" onclick="reportsManager.refreshReport()">
                        <i class="fas fa-sync"></i>
                        <span>تحديث</span>
                    </button>
                    <button class="report-action-btn" onclick="reportsManager.printReport()">
                        <i class="fas fa-print"></i>
                        <span>طباعة</span>
                    </button>
                    <button class="report-action-btn success" onclick="reportsManager.showExportOptions()">
                        <i class="fas fa-download"></i>
                        <span>تصدير</span>
                    </button>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // تحميل التقرير
        // ═══════════════════════════════════════════════════════════
        
        async loadReport(reportId) {
            this.currentReport = reportId;
            
            // تحديث حالة العناصر النشطة
            document.querySelectorAll('.report-menu-item').forEach(item => {
                item.classList.remove('active');
            });
            event?.target?.closest('.report-menu-item')?.classList.add('active');

            const display = document.getElementById('reportsDisplay');
            if (!display) return;

            // عرض حالة التحميل
            display.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">جاري تحميل التقرير...</div>
                </div>
            `;

            try {
                // الحصول على البيانات حسب نوع التقرير
                const data = await this.fetchReportData(reportId);
                this.currentData = data;

                // رسم التقرير
                const reportHtml = this.renderReport(reportId, data);
                display.innerHTML = reportHtml;
            } catch (error) {
                console.error('خطأ في تحميل التقرير:', error);
                display.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>خطأ في تحميل التقرير</h3>
                        <p>${error.message || 'حدث خطأ غير متوقع'}</p>
                    </div>
                `;
            }
        }

        // ═══════════════════════════════════════════════════════════
        // جلب بيانات التقرير
        // ═══════════════════════════════════════════════════════════
        
        async fetchReportData(reportId) {
            const { startDate, endDate } = this.getDateRange();

            switch(reportId) {
                case 'sales-summary':
                    return await this.getSalesSummary(startDate, endDate);
                
                case 'invoices-report':
                    return await this.getInvoicesReport(startDate, endDate);
                
                case 'products-report':
                    return await this.getProductsReport();
                
                case 'inventory-report':
                    return await this.getInventoryReport();
                
                case 'top-selling':
                    return await this.getTopSellingProducts(startDate, endDate);
                
                case 'low-stock':
                    return await this.getLowStockProducts();
                
                case 'debts-summary':
                    return await this.getDebtsSummary();
                
                case 'overdue-debts':
                    return await this.getOverdueDebts();
                
                case 'debtors-list':
                    return await this.getDebtorsList();
                
                case 'installments':
                    return await this.getInstallmentsReport();
                
                case 'payment-methods':
                    return await this.getPaymentMethodsReport(startDate, endDate);
                
                case 'daily-sales':
                    return await this.getDailySalesReport(startDate, endDate);
                
                case 'profit-analysis':
                    return await this.getProfitAnalysis(startDate, endDate);
                
                case 'category-analysis':
                    return await this.getCategoryAnalysis(startDate, endDate);
                
                case 'customer-analysis':
                    return await this.getCustomerAnalysis(startDate, endDate);
                
                case 'stock-movement':
                    return await this.getStockMovement(startDate, endDate);
                
                case 'trends-report':
                    return await this.getTrendsReport(startDate, endDate);
                
                default:
                    throw new Error('نوع التقرير غير مدعوم');
            }
        }

        // ═══════════════════════════════════════════════════════════
        // الحصول على نطاق التاريخ
        // ═══════════════════════════════════════════════════════════
        
        getDateRange() {
            const now = new Date();
            let startDate, endDate;

            switch(this.filters.dateRange) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                    break;
                
                case 'yesterday':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
                    break;
                
                case 'thisWeek':
                    const dayOfWeek = now.getDay();
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - dayOfWeek), 23, 59, 59);
                    break;
                
                case 'lastWeek':
                    const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
                    startDate = lastWeekStart;
                    endDate = new Date(lastWeekStart.getFullYear(), lastWeekStart.getMonth(), lastWeekStart.getDate() + 6, 23, 59, 59);
                    break;
                
                case 'thisMonth':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                    break;
                
                case 'lastMonth':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
                    break;
                
                case 'last3Months':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                    break;
                
                case 'thisYear':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
                    break;
                
                case 'custom':
                    startDate = this.filters.startDate ? new Date(this.filters.startDate) : new Date(now.getFullYear(), 0, 1);
                    endDate = this.filters.endDate ? new Date(this.filters.endDate + 'T23:59:59') : new Date();
                    break;
                
                default:
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            }

            return { startDate, endDate };
        }

        // ═══════════════════════════════════════════════════════════
        // معالجات الأحداث
        // ═══════════════════════════════════════════════════════════
        
        handleDateRangeChange() {
            const select = document.getElementById('dateRangeSelect');
            if (!select) return;

            this.filters.dateRange = select.value;
            
            const customDateRange = document.getElementById('customDateRange');
            if (customDateRange) {
                customDateRange.style.display = select.value === 'custom' ? 'flex' : 'none';
            }

            if (select.value !== 'custom') {
                this.refreshReport();
            }
        }

        handleCustomDateChange() {
            const startDateInput = document.getElementById('startDate');
            const endDateInput = document.getElementById('endDate');
            
            if (startDateInput && endDateInput) {
                this.filters.startDate = startDateInput.value;
                this.filters.endDate = endDateInput.value;
                
                if (this.filters.startDate && this.filters.endDate) {
                    this.refreshReport();
                }
            }
        }

        refreshReport() {
            if (this.currentReport) {
                this.loadReport(this.currentReport);
            }
        }

        // ═══════════════════════════════════════════════════════════
        // دوال جلب البيانات من قاعدة البيانات
        // ═══════════════════════════════════════════════════════════
        
        async getSalesSummary(startDate, endDate) {
            try {
                const sales = await window.dataSdk.list({ type: 'sale' });
                
                // تصفية المبيعات حسب النطاق الزمني
                const filteredSales = sales.filter(sale => {
                    const saleDate = new Date(sale.timestamp);
                    return saleDate >= startDate && saleDate <= endDate;
                });

                // حساب الإحصائيات
                const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.final_total || 0), 0);
                const totalInvoices = filteredSales.length;
                const averageInvoice = totalInvoices > 0 ? totalSales / totalInvoices : 0;

                // حساب إحصائيات إضافية
                const cashSales = filteredSales.filter(s => s.payment_method === 'نقدي').reduce((sum, s) => sum + s.final_total, 0);
                const creditSales = filteredSales.filter(s => s.payment_method === 'آجل').reduce((sum, s) => sum + s.final_total, 0);
                const installmentSales = filteredSales.filter(s => s.payment_method === 'تقسيط').reduce((sum, s) => sum + s.final_total, 0);

                return {
                    stats: {
                        totalSales,
                        totalInvoices,
                        averageInvoice,
                        cashSales,
                        creditSales,
                        installmentSales
                    },
                    sales: filteredSales
                };
            } catch (error) {
                console.error('خطأ في جلب ملخص المبيعات:', error);
                return { stats: {}, sales: [] };
            }
        }

        async getInvoicesReport(startDate, endDate) {
            try {
                const sales = await window.dataSdk.list({ type: 'sale' });
                
                const filteredSales = sales.filter(sale => {
                    const saleDate = new Date(sale.timestamp);
                    return saleDate >= startDate && saleDate <= endDate;
                });

                return filteredSales;
            } catch (error) {
                console.error('خطأ في جلب تقرير الفواتير:', error);
                return [];
            }
        }

        async getProductsReport() {
            try {
                const products = await window.dataSdk.list({ type: 'product' });
                return products || [];
            } catch (error) {
                console.error('خطأ في جلب تقرير المنتجات:', error);
                return [];
            }
        }

        async getInventoryReport() {
            try {
                const products = await window.dataSdk.list({ type: 'product' });
                
                const totalProducts = products.length;
                const totalStockValue = products.reduce((sum, p) => sum + (p.stock_quantity * p.product_price_retail), 0);
                const totalCostValue = products.reduce((sum, p) => sum + (p.stock_quantity * p.product_cost_retail), 0);
                const expectedProfit = totalStockValue - totalCostValue;

                return {
                    stats: {
                        totalProducts,
                        totalStockValue,
                        totalCostValue,
                        expectedProfit
                    },
                    products
                };
            } catch (error) {
                console.error('خطأ في جلب تقرير المخزون:', error);
                return { stats: {}, products: [] };
            }
        }

        async getTopSellingProducts(startDate, endDate) {
            try {
                const sales = await window.dataSdk.list({ type: 'sale' });
                
                // تصفية المبيعات حسب النطاق الزمني
                const filteredSales = sales.filter(sale => {
                    const saleDate = new Date(sale.timestamp);
                    return saleDate >= startDate && saleDate <= endDate;
                });

                // جلب جميع المنتجات لربط الاسم الحقيقي
                const productsList = await window.dataSdk.list({ type: 'product' });
                const productSales = {};

                filteredSales.forEach(sale => {
                    try {
                        const items = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;
                        if (Array.isArray(items)) {
                            items.forEach(item => {
                                const productId = item.product_id || item.barcode || item.name;
                                // البحث عن اسم المنتج الحقيقي
                                let realName = item.name;
                                const found = productsList.find(p => p.product_id === productId || p.product_barcode === productId || p.product_name === item.name);
                                if (found) {
                                    realName = found.product_name;
                                }
                                if (!productSales[productId]) {
                                    productSales[productId] = {
                                        name: realName,
                                        quantity: 0,
                                        total: 0,
                                        count: 0
                                    };
                                }
                                productSales[productId].quantity += item.quantity || 0;
                                productSales[productId].total += (item.quantity * item.price) || 0;
                                productSales[productId].count += 1;
                            });
                        }
                    } catch (e) {
                        console.error('خطأ في معالجة عناصر الفاتورة:', e);
                    }
                });

                // تحويل إلى مصفوفة وترتيب
                const topProducts = Object.entries(productSales)
                    .map(([id, data]) => ({ id, ...data }))
                    .sort((a, b) => b.quantity - a.quantity)
                    .slice(0, 20); // أعلى 20 منتج

                return topProducts;
            } catch (error) {
                console.error('خطأ في جلب المنتجات الأكثر مبيعاً:', error);
                return [];
            }
        }

        async getLowStockProducts() {
            try {
                const products = await window.dataSdk.list({ type: 'product' });
                
                const lowStockProducts = products.filter(p => 
                    p.stock_quantity <= (p.min_stock || 5)
                ).sort((a, b) => a.stock_quantity - b.stock_quantity);

                return lowStockProducts;
            } catch (error) {
                console.error('خطأ في جلب المنتجات المنخفضة:', error);
                return [];
            }
        }

        async getDebtsSummary() {
            try {
                const debts = await window.dataSdk.list({ type: 'debt' });
                
                const totalDebts = debts.reduce((sum, d) => sum + (d.remaining_amount || 0), 0);
                const totalDebtors = debts.length;
                const paidDebts = debts.filter(d => d.remaining_amount === 0).length;
                const activeDebts = debts.filter(d => d.remaining_amount > 0).length;

                return {
                    stats: {
                        totalDebts,
                        totalDebtors,
                        paidDebts,
                        activeDebts
                    },
                    debts
                };
            } catch (error) {
                console.error('خطأ في جلب ملخص الديون:', error);
                return { stats: {}, debts: [] };
            }
        }

        async getOverdueDebts() {
            try {
                const debts = await window.dataSdk.list({ type: 'debt' });
                const now = new Date();
                
                const overdueDebts = debts.filter(d => {
                    if (!d.due_date || d.remaining_amount === 0) return false;
                    const dueDate = new Date(d.due_date);
                    return dueDate < now && d.remaining_amount > 0;
                }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

                return overdueDebts;
            } catch (error) {
                console.error('خطأ في جلب الديون المتأخرة:', error);
                return [];
            }
        }

        async getDebtorsList() {
            try {
                const debts = await window.dataSdk.list({ type: 'debt' });
                
                const debtors = debts.filter(d => d.remaining_amount > 0)
                    .sort((a, b) => b.remaining_amount - a.remaining_amount);

                return debtors;
            } catch (error) {
                console.error('خطأ في جلب قائمة المديونين:', error);
                return [];
            }
        }

        async getInstallmentsReport() {
            try {
                const debts = await window.dataSdk.list({ type: 'debt' });
                
                const installments = debts.filter(d => d.monthly_amount && d.remaining_amount > 0);

                const totalMonthlyAmount = installments.reduce((sum, d) => sum + (d.monthly_amount || 0), 0);

                return {
                    stats: { totalMonthlyAmount },
                    installments
                };
            } catch (error) {
                console.error('خطأ في جلب تقرير الأقساط:', error);
                return { stats: {}, installments: [] };
            }
        }

        async getPaymentMethodsReport(startDate, endDate) {
            try {
                const sales = await window.dataSdk.list({ type: 'sale' });
                
                const filteredSales = sales.filter(sale => {
                    const saleDate = new Date(sale.timestamp);
                    return saleDate >= startDate && saleDate <= endDate;
                });

                const methods = {};
                filteredSales.forEach(sale => {
                    const method = sale.payment_method || 'نقدي';
                    if (!methods[method]) {
                        methods[method] = { count: 0, total: 0 };
                    }
                    methods[method].count++;
                    methods[method].total += sale.final_total || 0;
                });

                return Object.entries(methods).map(([method, data]) => ({
                    method,
                    ...data
                }));
            } catch (error) {
                console.error('خطأ في جلب تقرير طرق الدفع:', error);
                return [];
            }
        }

        async getDailySalesReport(startDate, endDate) {
            try {
                const sales = await window.dataSdk.list({ type: 'sale' });
                
                const filteredSales = sales.filter(sale => {
                    const saleDate = new Date(sale.timestamp);
                    return saleDate >= startDate && saleDate <= endDate;
                });

                // تجميع المبيعات حسب اليوم
                const dailySales = {};
                filteredSales.forEach(sale => {
                    const date = new Date(sale.timestamp).toLocaleDateString('ar-IQ');
                    if (!dailySales[date]) {
                        dailySales[date] = { count: 0, total: 0 };
                    }
                    dailySales[date].count++;
                    dailySales[date].total += sale.final_total || 0;
                });

                return Object.entries(dailySales).map(([date, data]) => ({
                    date,
                    ...data
                })).sort((a, b) => new Date(b.date) - new Date(a.date));
            } catch (error) {
                console.error('خطأ في جلب المبيعات اليومية:', error);
                return [];
            }
        }

        async getProfitAnalysis(startDate, endDate) {
            try {
                const sales = await window.dataSdk.list({ type: 'sale' });
                
                const filteredSales = sales.filter(sale => {
                    const saleDate = new Date(sale.timestamp);
                    return saleDate >= startDate && saleDate <= endDate;
                });

                let totalRevenue = 0;
                let totalCost = 0;

                filteredSales.forEach(sale => {
                    try {
                        const items = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;
                        if (Array.isArray(items)) {
                            items.forEach(item => {
                                totalRevenue += (item.quantity * item.price) || 0;
                                totalCost += (item.quantity * (item.cost || 0)) || 0;
                            });
                        }
                    } catch (e) {
                        console.error('خطأ في معالجة عناصر الفاتورة:', e);
                    }
                });

                const profit = totalRevenue - totalCost;
                const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

                return {
                    totalRevenue,
                    totalCost,
                    profit,
                    profitMargin,
                    sales: filteredSales
                };
            } catch (error) {
                console.error('خطأ في جلب تحليل الأرباح:', error);
                return { totalRevenue: 0, totalCost: 0, profit: 0, profitMargin: 0, sales: [] };
            }
        }

        async getCategoryAnalysis(startDate, endDate) {
            try {
                const sales = await window.dataSdk.list({ type: 'sale' });
                const products = await window.dataSdk.list({ type: 'product' });
                
                const filteredSales = sales.filter(sale => {
                    const saleDate = new Date(sale.timestamp);
                    return saleDate >= startDate && saleDate <= endDate;
                });

                // تجميع حسب التصنيف
                const categoryData = {};

                filteredSales.forEach(sale => {
                    try {
                        const items = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;
                        if (Array.isArray(items)) {
                            items.forEach(item => {
                                const product = products.find(p => p.product_id === item.product_id || p.product_barcode === item.barcode);
                                const category = product?.product_category || 'غير مصنف';
                                
                                if (!categoryData[category]) {
                                    categoryData[category] = { count: 0, total: 0, quantity: 0 };
                                }
                                categoryData[category].count++;
                                categoryData[category].total += (item.quantity * item.price) || 0;
                                categoryData[category].quantity += item.quantity || 0;
                            });
                        }
                    } catch (e) {
                        console.error('خطأ في معالجة عناصر الفاتورة:', e);
                    }
                });

                return Object.entries(categoryData).map(([category, data]) => ({
                    category,
                    ...data
                })).sort((a, b) => b.total - a.total);
            } catch (error) {
                console.error('خطأ في جلب تحليل التصنيفات:', error);
                return [];
            }
        }

        async getCustomerAnalysis(startDate, endDate) {
            try {
                const sales = await window.dataSdk.list({ type: 'sale' });
                
                const filteredSales = sales.filter(sale => {
                    const saleDate = new Date(sale.timestamp);
                    return saleDate >= startDate && saleDate <= endDate;
                });

                // تجميع حسب العميل
                const customerData = {};

                filteredSales.forEach(sale => {
                    const customer = sale.customer_name || 'عميل نقدي';
                    if (!customerData[customer]) {
                        customerData[customer] = { count: 0, total: 0 };
                    }
                    customerData[customer].count++;
                    customerData[customer].total += sale.final_total || 0;
                });

                return Object.entries(customerData).map(([customer, data]) => ({
                    customer,
                    ...data,
                    average: data.total / data.count
                })).sort((a, b) => b.total - a.total);
            } catch (error) {
                console.error('خطأ في جلب تحليل العملاء:', error);
                return [];
            }
        }

        async getStockMovement(startDate, endDate) {
            try {
                const sales = await window.dataSdk.list({ type: 'sale' });
                
                const filteredSales = sales.filter(sale => {
                    const saleDate = new Date(sale.timestamp);
                    return saleDate >= startDate && saleDate <= endDate;
                });

                // جلب جميع المنتجات لربط الاسم الحقيقي
                const productsList = await window.dataSdk.list({ type: 'product' });
                const movements = [];

                filteredSales.forEach(sale => {
                    try {
                        const items = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;
                        if (Array.isArray(items)) {
                            items.forEach(item => {
                                // البحث عن اسم المنتج الحقيقي
                                let realName = item.name;
                                const productId = item.product_id || item.barcode || item.name;
                                const found = productsList.find(p => p.product_id === productId || p.product_barcode === productId || p.product_name === item.name);
                                if (found) {
                                    realName = found.product_name;
                                }
                                movements.push({
                                    date: sale.timestamp,
                                    product: realName,
                                    type: 'مبيعات',
                                    quantity: -(item.quantity || 0),
                                    invoice: sale.invoice_id
                                });
                            });
                        }
                    } catch (e) {
                        console.error('خطأ في معالجة عناصر الفاتورة:', e);
                    }
                });

                return movements.sort((a, b) => new Date(b.date) - new Date(a.date));
            } catch (error) {
                console.error('خطأ في جلب حركة المخزون:', error);
                return [];
            }
        }

        async getTrendsReport(startDate, endDate) {
            try {
                const sales = await window.dataSdk.list({ type: 'sale' });
                
                const filteredSales = sales.filter(sale => {
                    const saleDate = new Date(sale.timestamp);
                    return saleDate >= startDate && saleDate <= endDate;
                });

                // تجميع حسب الشهر
                const monthlyData = {};

                filteredSales.forEach(sale => {
                    const date = new Date(sale.timestamp);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    
                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = { count: 0, total: 0 };
                    }
                    monthlyData[monthKey].count++;
                    monthlyData[monthKey].total += sale.final_total || 0;
                });

                const trends = Object.entries(monthlyData).map(([month, data]) => ({
                    month,
                    ...data
                })).sort((a, b) => a.month.localeCompare(b.month));

                // حساب معدل النمو
                if (trends.length > 1) {
                    for (let i = 1; i < trends.length; i++) {
                        const previousTotal = trends[i - 1].total;
                        const currentTotal = trends[i].total;
                        trends[i].growth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
                    }
                }

                return trends;
            } catch (error) {
                console.error('خطأ في جلب تقرير الاتجاهات:', error);
                return [];
            }
        }

        // ═══════════════════════════════════════════════════════════
        // رسم التقارير
        // ═══════════════════════════════════════════════════════════
        
        renderReport(reportId, data) {
            switch(reportId) {
                case 'sales-summary':
                    return this.renderSalesSummary(data);
                
                case 'invoices-report':
                    return this.renderInvoicesReport(data);
                
                case 'products-report':
                    return this.renderProductsReport(data);
                
                case 'inventory-report':
                    return this.renderInventoryReport(data);
                
                case 'top-selling':
                    return this.renderTopSellingReport(data);
                
                case 'low-stock':
                    return this.renderLowStockReport(data);
                
                case 'debts-summary':
                    return this.renderDebtsSummary(data);
                
                case 'overdue-debts':
                    return this.renderOverdueDebts(data);
                
                case 'debtors-list':
                    return this.renderDebtorsList(data);
                
                case 'installments':
                    return this.renderInstallmentsReport(data);
                
                case 'payment-methods':
                    return this.renderPaymentMethodsReport(data);
                
                case 'daily-sales':
                    return this.renderDailySalesReport(data);
                
                case 'profit-analysis':
                    return this.renderProfitAnalysis(data);
                
                case 'category-analysis':
                    return this.renderCategoryAnalysis(data);
                
                case 'customer-analysis':
                    return this.renderCustomerAnalysis(data);
                
                case 'stock-movement':
                    return this.renderStockMovement(data);
                
                case 'trends-report':
                    return this.renderTrendsReport(data);
                
                default:
                    return '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><h3>تقرير غير مدعوم</h3></div>';
            }
        }

        // ═══════════════════════════════════════════════════════════
        // رسم ملخص المبيعات
        // ═══════════════════════════════════════════════════════════
        
        renderSalesSummary(data) {
            const { stats, sales } = data;

            return `
                <div class="report-title">ملخص المبيعات</div>
                <div class="report-subtitle">عرض شامل لإحصائيات المبيعات والفواتير</div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">إجمالي المبيعات</div>
                            <div class="stat-card-icon primary">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${this.formatCurrency(stats.totalSales)}</div>
                        <div class="stat-card-change positive">
                            <i class="fas fa-arrow-up"></i>
                            <span>من ${stats.totalInvoices} فاتورة</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">متوسط الفاتورة</div>
                            <div class="stat-card-icon success">
                                <i class="fas fa-receipt"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${this.formatCurrency(stats.averageInvoice)}</div>
                        <div class="stat-card-change">
                            <i class="fas fa-info-circle"></i>
                            <span>للفاتورة الواحدة</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">المبيعات النقدية</div>
                            <div class="stat-card-icon warning">
                                <i class="fas fa-money-bill"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${this.formatCurrency(stats.cashSales)}</div>
                        <div class="stat-card-change">
                            <span>${((stats.cashSales / stats.totalSales) * 100).toFixed(1)}% من الإجمالي</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">المبيعات الآجلة</div>
                            <div class="stat-card-icon danger">
                                <i class="fas fa-clock"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${this.formatCurrency(stats.creditSales)}</div>
                        <div class="stat-card-change">
                            <span>${((stats.creditSales / stats.totalSales) * 100).toFixed(1)}% من الإجمالي</span>
                        </div>
                    </div>
                </div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>رقم الفاتورة</th>
                                <th>التاريخ</th>
                                <th>العميل</th>
                                <th>طريقة الدفع</th>
                                <th>المبلغ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sales.length > 0 ? sales.map(sale => `
                                <tr>
                                    <td>${sale.invoice_id || '-'}</td>
                                    <td>${this.formatDate(sale.timestamp)}</td>
                                    <td>${sale.customer_name || 'عميل نقدي'}</td>
                                    <td><span class="status-badge info">${sale.payment_method || 'نقدي'}</span></td>
                                    <td><strong>${this.formatCurrency(sale.final_total)}</strong></td>
                                </tr>
                            `).join('') : '<tr><td colspan="5" style="text-align: center;">لا توجد بيانات</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم تقرير الفواتير
        // ═══════════════════════════════════════════════════════════
        
        renderInvoicesReport(data) {
            return `
                <div class="report-title">تقرير الفواتير</div>
                <div class="report-subtitle">قائمة تفصيلية بجميع الفواتير المسجلة</div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>رقم الفاتورة</th>
                                <th>التاريخ</th>
                                <th>العميل</th>
                                <th>رقم الهاتف</th>
                                <th>طريقة الدفع</th>
                                <th>الخصم</th>
                                <th>المبلغ الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length > 0 ? data.map(invoice => `
                                <tr>
                                    <td><strong>${invoice.invoice_id || '-'}</strong></td>
                                    <td>${this.formatDate(invoice.timestamp)}</td>
                                    <td>${invoice.customer_name || 'عميل نقدي'}</td>
                                    <td>${invoice.customer_phone || '-'}</td>
                                    <td><span class="status-badge ${this.getPaymentMethodClass(invoice.payment_method)}">${invoice.payment_method || 'نقدي'}</span></td>
                                    <td>${this.formatCurrency(invoice.discount || 0)}</td>
                                    <td><strong>${this.formatCurrency(invoice.final_total)}</strong></td>
                                </tr>
                            `).join('') : '<tr><td colspan="7" style="text-align: center;">لا توجد فواتير</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم تقرير المنتجات
        // ═══════════════════════════════════════════════════════════
        
        renderProductsReport(data) {
            return `
                <div class="report-title">تقرير المنتجات</div>
                <div class="report-subtitle">قائمة شاملة بجميع المنتجات المسجلة</div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">إجمالي المنتجات</div>
                            <div class="stat-card-icon primary">
                                <i class="fas fa-box"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${data.length}</div>
                        <div class="stat-card-change">
                            <span>منتج مسجل</span>
                        </div>
                    </div>
                </div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>الباركود</th>
                                <th>اسم المنتج</th>
                                <th>سعر البيع</th>
                                <th>سعر الشراء</th>
                                <th>الكمية</th>
                                <th>الحد الأدنى</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length > 0 ? data.map(product => `
                                <tr>
                                    <td>${product.product_barcode || '-'}</td>
                                    <td><strong>${product.product_name}</strong></td>
                                    <td>${this.formatCurrency(product.product_price_retail)}</td>
                                    <td>${this.formatCurrency(product.product_cost_retail)}</td>
                                    <td>${product.stock_quantity || 0}</td>
                                    <td>${product.min_stock || 5}</td>
                                    <td><span class="status-badge ${product.stock_quantity > product.min_stock ? 'success' : 'warning'}">${product.stock_quantity > product.min_stock ? 'متوفر' : 'منخفض'}</span></td>
                                </tr>
                            `).join('') : '<tr><td colspan="7" style="text-align: center;">لا توجد منتجات</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم تقرير المخزون
        // ═══════════════════════════════════════════════════════════
        
        renderInventoryReport(data) {
            const { stats, products } = data;

            return `
                <div class="report-title">تقرير المخزون</div>
                <div class="report-subtitle">تحليل شامل لقيمة المخزون والأرباح المتوقعة</div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">قيمة المخزون (البيع)</div>
                            <div class="stat-card-icon primary">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${this.formatCurrency(stats.totalStockValue)}</div>
                        <div class="stat-card-change positive">
                            <span>قيمة البيع المتوقعة</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">قيمة التكلفة</div>
                            <div class="stat-card-icon warning">
                                <i class="fas fa-coins"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${this.formatCurrency(stats.totalCostValue)}</div>
                        <div class="stat-card-change">
                            <span>تكلفة المخزون</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">الربح المتوقع</div>
                            <div class="stat-card-icon success">
                                <i class="fas fa-chart-line"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${this.formatCurrency(stats.expectedProfit)}</div>
                        <div class="stat-card-change positive">
                            <i class="fas fa-arrow-up"></i>
                            <span>${((stats.expectedProfit / stats.totalCostValue) * 100).toFixed(1)}% هامش ربح</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">عدد المنتجات</div>
                            <div class="stat-card-icon info">
                                <i class="fas fa-boxes"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${stats.totalProducts}</div>
                        <div class="stat-card-change">
                            <span>منتج في المخزن</span>
                        </div>
                    </div>
                </div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>الكمية</th>
                                <th>سعر الوحدة</th>
                                <th>التكلفة</th>
                                <th>قيمة المخزون</th>
                                <th>الربح المتوقع</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.length > 0 ? products.map(product => {
                                const stockValue = product.stock_quantity * product.product_price_retail;
                                const costValue = product.stock_quantity * product.product_cost_retail;
                                const profit = stockValue - costValue;
                                
                                return `
                                    <tr>
                                        <td><strong>${product.product_name}</strong></td>
                                        <td>${product.stock_quantity}</td>
                                        <td>${this.formatCurrency(product.product_price_retail)}</td>
                                        <td>${this.formatCurrency(product.product_cost_retail)}</td>
                                        <td><strong>${this.formatCurrency(stockValue)}</strong></td>
                                        <td class="${profit > 0 ? 'positive' : 'negative'}">${this.formatCurrency(profit)}</td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="6" style="text-align: center;">لا توجد منتجات</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم تقرير الأكثر مبيعاً
        // ═══════════════════════════════════════════════════════════
        
        renderTopSellingReport(data) {
            return `
                <div class="report-title">المنتجات الأكثر مبيعاً</div>
                <div class="report-subtitle">أفضل 20 منتج من حيث الكمية المباعة</div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>الترتيب</th>
                                <th>اسم المنتج</th>
                                <th>الكمية المباعة</th>
                                <th>عدد المبيعات</th>
                                <th>إجمالي المبيعات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length > 0 ? data.map((product, index) => `
                                <tr>
                                    <td><strong>#${index + 1}</strong></td>
                                    <td>${product.name}</td>
                                    <td><strong>${product.quantity}</strong></td>
                                    <td>${product.count}</td>
                                    <td><strong>${this.formatCurrency(product.total)}</strong></td>
                                </tr>
                            `).join('') : '<tr><td colspan="5" style="text-align: center;">لا توجد بيانات مبيعات</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم تقرير المنتجات المنخفضة
        // ═══════════════════════════════════════════════════════════
        
        renderLowStockReport(data) {
            return `
                <div class="report-title">المنتجات المنخفضة في المخزن</div>
                <div class="report-subtitle">المنتجات التي وصلت إلى الحد الأدنى أو أقل</div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>اسم المنتج</th>
                                <th>الباركود</th>
                                <th>الكمية الحالية</th>
                                <th>الحد الأدنى</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length > 0 ? data.map(product => {
                                const status = product.stock_quantity === 0 ? 'نفذت الكمية' : 'منخفض';
                                const statusClass = product.stock_quantity === 0 ? 'danger' : 'warning';
                                
                                return `
                                    <tr>
                                        <td><strong>${product.product_name}</strong></td>
                                        <td>${product.product_barcode || '-'}</td>
                                        <td><strong>${product.stock_quantity}</strong></td>
                                        <td>${product.min_stock || 5}</td>
                                        <td><span class="status-badge ${statusClass}">${status}</span></td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="5" style="text-align: center;">جميع المنتجات متوفرة بكميات كافية</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم ملخص الديون
        // ═══════════════════════════════════════════════════════════
        
        renderDebtsSummary(data) {
            const { stats, debts } = data;

            return `
                <div class="report-title">ملخص الديون</div>
                <div class="report-subtitle">نظرة شاملة على حالة الديون والمديونين</div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">إجمالي الديون</div>
                            <div class="stat-card-icon danger">
                                <i class="fas fa-money-bill-wave"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${this.formatCurrency(stats.totalDebts)}</div>
                        <div class="stat-card-change">
                            <span>المبلغ الإجمالي المستحق</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">عدد المديونين</div>
                            <div class="stat-card-icon warning">
                                <i class="fas fa-users"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${stats.totalDebtors}</div>
                        <div class="stat-card-change">
                            <span>إجمالي العملاء</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">الديون النشطة</div>
                            <div class="stat-card-icon info">
                                <i class="fas fa-hourglass-half"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${stats.activeDebts}</div>
                        <div class="stat-card-change">
                            <span>ديون لم تسدد</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">الديون المسددة</div>
                            <div class="stat-card-icon success">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${stats.paidDebts}</div>
                        <div class="stat-card-change positive">
                            <span>تم التسديد بالكامل</span>
                        </div>
                    </div>
                </div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>اسم العميل</th>
                                <th>رقم الهاتف</th>
                                <th>المبلغ الإجمالي</th>
                                <th>المبلغ المتبقي</th>
                                <th>القسط الشهري</th>
                                <th>تاريخ الاستحقاق</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${debts.length > 0 ? debts.map(debt => `
                                <tr>
                                    <td><strong>${debt.customer_name}</strong></td>
                                    <td>${debt.customer_phone || '-'}</td>
                                    <td>${this.formatCurrency(debt.total_amount)}</td>
                                    <td><strong>${this.formatCurrency(debt.remaining_amount)}</strong></td>
                                    <td>${this.formatCurrency(debt.monthly_amount || 0)}</td>
                                    <td>${debt.due_date ? this.formatDate(debt.due_date) : '-'}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="6" style="text-align: center;">لا توجد ديون مسجلة</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم الديون المتأخرة
        // ═══════════════════════════════════════════════════════════
        
        renderOverdueDebts(data) {
            return `
                <div class="report-title">الديون المتأخرة</div>
                <div class="report-subtitle">الديون التي تجاوزت تاريخ الاستحقاق</div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>اسم العميل</th>
                                <th>رقم الهاتف</th>
                                <th>المبلغ المتبقي</th>
                                <th>تاريخ الاستحقاق</th>
                                <th>عدد الأيام المتأخرة</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length > 0 ? data.map(debt => {
                                const daysOverdue = this.getDaysOverdue(debt.due_date);
                                const severity = daysOverdue > 30 ? 'danger' : 'warning';
                                
                                return `
                                    <tr>
                                        <td><strong>${debt.customer_name}</strong></td>
                                        <td>${debt.customer_phone || '-'}</td>
                                        <td><strong>${this.formatCurrency(debt.remaining_amount)}</strong></td>
                                        <td>${this.formatDate(debt.due_date)}</td>
                                        <td>${daysOverdue} يوم</td>
                                        <td><span class="status-badge ${severity}">متأخر</span></td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="6" style="text-align: center;">لا توجد ديون متأخرة</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم قائمة المديونين
        // ═══════════════════════════════════════════════════════════
        
        renderDebtorsList(data) {
            return `
                <div class="report-title">قائمة المديونين</div>
                <div class="report-subtitle">جميع العملاء الذين لديهم ديون نشطة</div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>اسم العميل</th>
                                <th>رقم الهاتف</th>
                                <th>العنوان</th>
                                <th>المبلغ الإجمالي</th>
                                <th>المبلغ المتبقي</th>
                                <th>القسط الشهري</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length > 0 ? data.map(debtor => `
                                <tr>
                                    <td><strong>${debtor.customer_name}</strong></td>
                                    <td>${debtor.customer_phone || '-'}</td>
                                    <td>${debtor.customer_address || '-'}</td>
                                    <td>${this.formatCurrency(debtor.total_amount)}</td>
                                    <td><strong>${this.formatCurrency(debtor.remaining_amount)}</strong></td>
                                    <td>${this.formatCurrency(debtor.monthly_amount || 0)}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="6" style="text-align: center;">لا يوجد مديونون حالياً</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم تقرير الأقساط
        // ═══════════════════════════════════════════════════════════
        
        renderInstallmentsReport(data) {
            const { stats, installments } = data;

            return `
                <div class="report-title">تقرير الأقساط الشهرية</div>
                <div class="report-subtitle">جدول الأقساط المستحقة والمتوقعة</div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">إجمالي الأقساط الشهرية</div>
                            <div class="stat-card-icon primary">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${this.formatCurrency(stats.totalMonthlyAmount)}</div>
                        <div class="stat-card-change">
                            <span>المبلغ المتوقع شهرياً</span>
                        </div>
                    </div>
                </div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>اسم العميل</th>
                                <th>رقم الهاتف</th>
                                <th>القسط الشهري</th>
                                <th>المبلغ المتبقي</th>
                                <th>عدد الأقساط</th>
                                <th>تاريخ الاستحقاق</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${installments.length > 0 ? installments.map(inst => {
                                const remainingMonths = Math.ceil(inst.remaining_amount / inst.monthly_amount);
                                
                                return `
                                    <tr>
                                        <td><strong>${inst.customer_name}</strong></td>
                                        <td>${inst.customer_phone || '-'}</td>
                                        <td><strong>${this.formatCurrency(inst.monthly_amount)}</strong></td>
                                        <td>${this.formatCurrency(inst.remaining_amount)}</td>
                                        <td>${remainingMonths} شهر</td>
                                        <td>${inst.due_date ? this.formatDate(inst.due_date) : '-'}</td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="6" style="text-align: center;">لا توجد أقساط مسجلة</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم تقرير طرق الدفع
        // ═══════════════════════════════════════════════════════════
        
        renderPaymentMethodsReport(data) {
            const totalAmount = data.reduce((sum, method) => sum + method.total, 0);

            return `
                <div class="report-title">تقرير طرق الدفع</div>
                <div class="report-subtitle">توزيع المبيعات حسب طريقة الدفع</div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>طريقة الدفع</th>
                                <th>عدد الفواتير</th>
                                <th>المبلغ الإجمالي</th>
                                <th>النسبة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length > 0 ? data.map(method => {
                                const percentage = totalAmount > 0 ? (method.total / totalAmount) * 100 : 0;
                                
                                return `
                                    <tr>
                                        <td><strong>${method.method}</strong></td>
                                        <td>${method.count}</td>
                                        <td><strong>${this.formatCurrency(method.total)}</strong></td>
                                        <td>${percentage.toFixed(1)}%</td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="4" style="text-align: center;">لا توجد بيانات</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم المبيعات اليومية
        // ═══════════════════════════════════════════════════════════
        
        renderDailySalesReport(data) {
            return `
                <div class="report-title">تقرير المبيعات اليومية</div>
                <div class="report-subtitle">المبيعات موزعة حسب الأيام</div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>عدد الفواتير</th>
                                <th>إجمالي المبيعات</th>
                                <th>متوسط الفاتورة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length > 0 ? data.map(day => {
                                const average = day.total / day.count;
                                
                                return `
                                    <tr>
                                        <td><strong>${day.date}</strong></td>
                                        <td>${day.count}</td>
                                        <td><strong>${this.formatCurrency(day.total)}</strong></td>
                                        <td>${this.formatCurrency(average)}</td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="4" style="text-align: center;">لا توجد بيانات</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم تحليل الأرباح
        // ═══════════════════════════════════════════════════════════
        
        renderProfitAnalysis(data) {
            return `
                <div class="report-title">تحليل الأرباح</div>
                <div class="report-subtitle">تحليل شامل للإيرادات والتكاليف والأرباح</div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">إجمالي الإيرادات</div>
                            <div class="stat-card-icon primary">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${this.formatCurrency(data.totalRevenue)}</div>
                        <div class="stat-card-change">
                            <span>من ${data.sales.length} فاتورة</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">إجمالي التكاليف</div>
                            <div class="stat-card-icon warning">
                                <i class="fas fa-coins"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${this.formatCurrency(data.totalCost)}</div>
                        <div class="stat-card-change">
                            <span>تكلفة البضائع المباعة</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">صافي الربح</div>
                            <div class="stat-card-icon success">
                                <i class="fas fa-chart-line"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${this.formatCurrency(data.profit)}</div>
                        <div class="stat-card-change positive">
                            <i class="fas fa-arrow-up"></i>
                            <span>الأرباح المحققة</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-header">
                            <div class="stat-card-title">هامش الربح</div>
                            <div class="stat-card-icon info">
                                <i class="fas fa-percentage"></i>
                            </div>
                        </div>
                        <div class="stat-card-value">${data.profitMargin.toFixed(1)}%</div>
                        <div class="stat-card-change">
                            <span>نسبة الربح</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم تحليل التصنيفات
        // ═══════════════════════════════════════════════════════════
        
        renderCategoryAnalysis(data) {
            return `
                <div class="report-title">تحليل التصنيفات</div>
                <div class="report-subtitle">أداء المبيعات موزع حسب التصنيفات</div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>التصنيف</th>
                                <th>عدد المبيعات</th>
                                <th>الكمية المباعة</th>
                                <th>إجمالي المبيعات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length > 0 ? data.map(category => `
                                <tr>
                                    <td><strong>${category.category}</strong></td>
                                    <td>${category.count}</td>
                                    <td>${category.quantity}</td>
                                    <td><strong>${this.formatCurrency(category.total)}</strong></td>
                                </tr>
                            `).join('') : '<tr><td colspan="4" style="text-align: center;">لا توجد بيانات</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم تحليل العملاء
        // ═══════════════════════════════════════════════════════════
        
        renderCustomerAnalysis(data) {
            return `
                <div class="report-title">تحليل العملاء</div>
                <div class="report-subtitle">أداء المبيعات موزع حسب العملاء</div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>اسم العميل</th>
                                <th>عدد الفواتير</th>
                                <th>إجمالي المشتريات</th>
                                <th>متوسط الفاتورة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length > 0 ? data.map(customer => `
                                <tr>
                                    <td><strong>${customer.customer}</strong></td>
                                    <td>${customer.count}</td>
                                    <td><strong>${this.formatCurrency(customer.total)}</strong></td>
                                    <td>${this.formatCurrency(customer.average)}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="4" style="text-align: center;">لا توجد بيانات</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم حركة المخزون
        // ═══════════════════════════════════════════════════════════
        
        renderStockMovement(data) {
            return `
                <div class="report-title">تقرير حركة المخزون</div>
                <div class="report-subtitle">سجل حركة المنتجات في المخزن</div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>المنتج</th>
                                <th>نوع الحركة</th>
                                <th>الكمية</th>
                                <th>رقم الفاتورة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length > 0 ? data.map(movement => `
                                <tr>
                                    <td>${this.formatDate(movement.date)}</td>
                                    <td>${movement.product}</td>
                                    <td><span class="status-badge ${movement.type === 'مبيعات' ? 'danger' : 'success'}">${movement.type}</span></td>
                                    <td class="${movement.quantity < 0 ? 'negative' : 'positive'}">${movement.quantity}</td>
                                    <td>${movement.invoice || '-'}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="5" style="text-align: center;">لا توجد حركات</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // رسم تقرير الاتجاهات
        // ═══════════════════════════════════════════════════════════
        
        renderTrendsReport(data) {
            return `
                <div class="report-title">تقرير الاتجاهات والنمو</div>
                <div class="report-subtitle">تحليل اتجاهات المبيعات عبر الزمن</div>

                <div class="report-table-container">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>الشهر</th>
                                <th>عدد الفواتير</th>
                                <th>إجمالي المبيعات</th>
                                <th>معدل النمو</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.length > 0 ? data.map(trend => `
                                <tr>
                                    <td><strong>${this.formatMonth(trend.month)}</strong></td>
                                    <td>${trend.count}</td>
                                    <td><strong>${this.formatCurrency(trend.total)}</strong></td>
                                    <td>
                                        ${trend.growth !== undefined ? `
                                            <span class="stat-card-change ${trend.growth >= 0 ? 'positive' : 'negative'}">
                                                <i class="fas fa-arrow-${trend.growth >= 0 ? 'up' : 'down'}"></i>
                                                ${Math.abs(trend.growth).toFixed(1)}%
                                            </span>
                                        ` : '-'}
                                    </td>
                                </tr>
                            `).join('') : '<tr><td colspan="4" style="text-align: center;">لا توجد بيانات</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // ═══════════════════════════════════════════════════════════
        // وظائف الطباعة والتصدير
        // ═══════════════════════════════════════════════════════════
        
        printReport() {
            const displayContent = document.getElementById('reportsDisplay');
            if (!displayContent) {
                this.showToast('لا يوجد تقرير لطباعته', 'error');
                return;
            }

            const { startDate, endDate } = this.getDateRange();
            const dateRange = `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;

            const printContent = `
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <title>طباعة التقرير</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
                        
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Cairo', Arial, sans-serif;
                            padding: 20px;
                            background: white;
                            color: #1e293b;
                        }
                        
                        .print-header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 3px solid #6366f1;
                            padding-bottom: 20px;
                        }
                        
                        .print-header h1 {
                            color: #6366f1;
                            font-size: 28px;
                            margin-bottom: 10px;
                        }
                        
                        .print-header .company-name {
                            font-size: 18px;
                            color: #64748b;
                            margin-bottom: 5px;
                        }
                        
                        .print-header .date-range {
                            font-size: 14px;
                            color: #94a3b8;
                        }
                        
                        .report-table-container {
                            margin: 20px 0;
                        }
                        
                        .report-table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        
                        .report-table th {
                            background: #f1f5f9;
                            padding: 12px;
                            text-align: right;
                            font-weight: 600;
                            color: #475569;
                            border: 1px solid #e2e8f0;
                        }
                        
                        .report-table td {
                            padding: 10px;
                            text-align: right;
                            border: 1px solid #e2e8f0;
                        }
                        
                        .report-table tbody tr:nth-child(even) {
                            background: #f8fafc;
                        }
                        
                        .stat-card {
                            display: inline-block;
                            border: 2px solid #e2e8f0;
                            border-radius: 8px;
                            padding: 15px;
                            margin: 10px;
                            min-width: 200px;
                        }
                        
                        .stat-card-title {
                            font-size: 12px;
                            color: #64748b;
                            margin-bottom: 8px;
                        }
                        
                        .stat-card-value {
                            font-size: 24px;
                            font-weight: 700;
                            color: #1e293b;
                        }
                        
                        .status-badge {
                            display: inline-block;
                            padding: 4px 10px;
                            border-radius: 12px;
                            font-size: 12px;
                            font-weight: 500;
                        }
                        
                        .status-badge.success { background: #dcfce7; color: #16a34a; }
                        .status-badge.warning { background: #fef3c7; color: #ca8a04; }
                        .status-badge.danger { background: #fee2e2; color: #dc2626; }
                        .status-badge.info { background: #dbeafe; color: #2563eb; }
                        
                        .print-footer {
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 2px solid #e2e8f0;
                            text-align: center;
                            font-size: 12px;
                            color: #94a3b8;
                        }
                        
                        @media print {
                            body {
                                padding: 0;
                            }
                            
                            .print-footer {
                                position: fixed;
                                bottom: 0;
                                width: 100%;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-header">
                        <h1>تقرير مفصل</h1>
                        <div class="company-name">شركة الإبداع الرقمي - نظام نقاط البيع</div>
                        <div class="date-range">الفترة: ${dateRange}</div>
                    </div>
                    
                    ${displayContent.innerHTML}
                    
                    <div class="print-footer">
                        <p>تم الطباعة في: ${new Date().toLocaleString('ar-IQ')}</p>
                        <p>© ${new Date().getFullYear()} شركة الإبداع الرقمي - جميع الحقوق محفوظة</p>
                    </div>
                </body>
                </html>
            `;

            // فتح نافذة الطباعة
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(printContent);
                printWindow.document.close();
                printWindow.focus();
                
                // انتظار تحميل المحتوى ثم الطباعة
                setTimeout(() => {
                    printWindow.print();
                    // printWindow.close(); // اختياري: إغلاق النافذة بعد الطباعة
                }, 500);
            } else {
                this.showToast('فشل فتح نافذة الطباعة', 'error');
            }
        }

        showExportOptions() {
            const modal = document.createElement('div');
            modal.className = 'reports-modal';
            modal.style.zIndex = '10001';
            modal.innerHTML = `
                <div class="reports-container" style="max-width: 500px;">
                    <div class="reports-header">
                        <div class="reports-header-title">
                            <i class="fas fa-download"></i>
                            <h2>تصدير التقرير</h2>
                        </div>
                        <button class="reports-close-btn" onclick="this.closest('.reports-modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="padding: 30px;">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 10px; color: var(--text-primary); font-weight: 500;">اختر صيغة التصدير:</label>
                        </div>
                        <div style="display: grid; gap: 15px;">
                            <button class="report-action-btn danger" onclick="reportsManager.exportToPDF(); this.closest('.reports-modal').remove();" style="width: 100%; justify-content: center; font-size: 16px; padding: 15px;">
                                <i class="fas fa-file-pdf"></i>
                                <span>تصدير PDF</span>
                            </button>
                            <button class="report-action-btn success" onclick="reportsManager.exportToExcel(); this.closest('.reports-modal').remove();" style="width: 100%; justify-content: center; font-size: 16px; padding: 15px;">
                                <i class="fas fa-file-excel"></i>
                                <span>تصدير Excel</span>
                            </button>
                            <button class="report-action-btn primary" onclick="reportsManager.exportToCSV(); this.closest('.reports-modal').remove();" style="width: 100%; justify-content: center; font-size: 16px; padding: 15px;">
                                <i class="fas fa-file-csv"></i>
                                <span>تصدير CSV</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        }

        exportToPDF() {
            if (!this.currentData || this.currentData.length === 0) {
                this.showToast('لا توجد بيانات للتصدير', 'error');
                return;
            }

            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');

                // إضافة خط عربي (يجب إضافة مكتبة خطوط عربية)
                doc.setLanguage('ar');

                // عنوان التقرير
                doc.setFontSize(18);
                doc.text('تقرير ' + this.getReportTitle(), 105, 20, { align: 'center' });
                
                doc.setFontSize(12);
                const { startDate, endDate } = this.getDateRange();
                doc.text(`الفترة: ${this.formatDate(startDate)} - ${this.formatDate(endDate)}`, 105, 30, { align: 'center' });

                // إضافة الجدول
                if (doc.autoTable) {
                    const tableData = this.prepareTableDataForExport();
                    
                    doc.autoTable({
                        startY: 40,
                        head: [tableData.headers],
                        body: tableData.rows,
                        styles: {
                            font: 'helvetica',
                            fontStyle: 'normal'
                        },
                        headStyles: {
                            fillColor: [99, 102, 241],
                            textColor: 255,
                            fontSize: 10
                        },
                        bodyStyles: {
                            fontSize: 9
                        }
                    });
                }

                // حفظ الملف
                const filename = `تقرير_${this.currentReport}_${Date.now()}.pdf`;
                doc.save(filename);
                
                this.showToast('تم تصدير التقرير بنجاح', 'success');
            } catch (error) {
                console.error('خطأ في التصدير إلى PDF:', error);
                this.showToast('فشل التصدير إلى PDF', 'error');
            }
        }

        exportToExcel() {
            if (!this.currentData || this.currentData.length === 0) {
                this.showToast('لا توجد بيانات للتصدير', 'error');
                return;
            }

            try {
                const XLSX = window.XLSX;
                const tableData = this.prepareTableDataForExport();
                
                // إنشاء ورقة عمل
                const ws = XLSX.utils.aoa_to_sheet([tableData.headers, ...tableData.rows]);
                
                // إنشاء دفتر عمل
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'التقرير');
                
                // حفظ الملف
                const filename = `تقرير_${this.currentReport}_${Date.now()}.xlsx`;
                XLSX.writeFile(wb, filename);
                
                this.showToast('تم تصدير التقرير بنجاح', 'success');
            } catch (error) {
                console.error('خطأ في التصدير إلى Excel:', error);
                this.showToast('فشل التصدير إلى Excel', 'error');
            }
        }

        exportToCSV() {
            if (!this.currentData || this.currentData.length === 0) {
                this.showToast('لا توجد بيانات للتصدير', 'error');
                return;
            }

            try {
                const tableData = this.prepareTableDataForExport();
                
                // تحويل إلى CSV
                let csvContent = '\uFEFF'; // BOM for UTF-8
                csvContent += tableData.headers.join(',') + '\n';
                tableData.rows.forEach(row => {
                    csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
                });
                
                // إنشاء رابط التنزيل
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                
                link.setAttribute('href', url);
                link.setAttribute('download', `تقرير_${this.currentReport}_${Date.now()}.csv`);
                link.style.visibility = 'hidden';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.showToast('تم تصدير التقرير بنجاح', 'success');
            } catch (error) {
                console.error('خطأ في التصدير إلى CSV:', error);
                this.showToast('فشل التصدير إلى CSV', 'error');
            }
        }

        prepareTableDataForExport() {
            let headers = [];
            let rows = [];

            // تحديد البيانات حسب نوع التقرير
            const reportType = this.currentReport;

            if (reportType === 'sales-summary' || reportType === 'invoices-report') {
                const data = Array.isArray(this.currentData) ? this.currentData : (this.currentData.sales || []);
                headers = ['رقم الفاتورة', 'التاريخ', 'العميل', 'طريقة الدفع', 'المبلغ'];
                rows = data.map(item => [
                    item.invoice_id || '-',
                    this.formatDate(item.timestamp),
                    item.customer_name || 'عميل نقدي',
                    item.payment_method || 'نقدي',
                    item.final_total || 0
                ]);
            } else if (reportType === 'products-report') {
                headers = ['الباركود', 'اسم المنتج', 'سعر البيع', 'سعر الشراء', 'الكمية', 'الحد الأدنى'];
                rows = this.currentData.map(item => [
                    item.product_barcode || '-',
                    item.product_name,
                    item.product_price_retail || 0,
                    item.product_cost_retail || 0,
                    item.stock_quantity || 0,
                    item.min_stock || 5
                ]);
            } else if (reportType === 'inventory-report') {
                const data = this.currentData.products || [];
                headers = ['المنتج', 'الكمية', 'سعر الوحدة', 'التكلفة', 'قيمة المخزون', 'الربح المتوقع'];
                rows = data.map(item => {
                    const stockValue = item.stock_quantity * item.product_price_retail;
                    const costValue = item.stock_quantity * item.product_cost_retail;
                    const profit = stockValue - costValue;
                    return [
                        item.product_name,
                        item.stock_quantity || 0,
                        item.product_price_retail || 0,
                        item.product_cost_retail || 0,
                        stockValue,
                        profit
                    ];
                });
            } else if (reportType === 'top-selling') {
                headers = ['الترتيب', 'اسم المنتج', 'الكمية المباعة', 'عدد المبيعات', 'إجمالي المبيعات'];
                rows = this.currentData.map((item, index) => [
                    index + 1,
                    item.name,
                    item.quantity || 0,
                    item.count || 0,
                    item.total || 0
                ]);
            } else if (reportType === 'low-stock') {
                headers = ['اسم المنتج', 'الباركود', 'الكمية الحالية', 'الحد الأدنى', 'الحالة'];
                rows = this.currentData.map(item => [
                    item.product_name,
                    item.product_barcode || '-',
                    item.stock_quantity || 0,
                    item.min_stock || 5,
                    item.stock_quantity === 0 ? 'نفذت الكمية' : 'منخفض'
                ]);
            } else if (reportType === 'debts-summary') {
                const data = this.currentData.debts || [];
                headers = ['اسم العميل', 'رقم الهاتف', 'المبلغ الإجمالي', 'المبلغ المتبقي', 'القسط الشهري', 'تاريخ الاستحقاق'];
                rows = data.map(item => [
                    item.customer_name,
                    item.customer_phone || '-',
                    item.total_amount || 0,
                    item.remaining_amount || 0,
                    item.monthly_amount || 0,
                    item.due_date ? this.formatDate(item.due_date) : '-'
                ]);
            } else if (reportType === 'overdue-debts') {
                headers = ['اسم العميل', 'رقم الهاتف', 'المبلغ المتبقي', 'تاريخ الاستحقاق', 'عدد الأيام المتأخرة'];
                rows = this.currentData.map(item => [
                    item.customer_name,
                    item.customer_phone || '-',
                    item.remaining_amount || 0,
                    this.formatDate(item.due_date),
                    this.getDaysOverdue(item.due_date)
                ]);
            } else if (reportType === 'debtors-list') {
                headers = ['اسم العميل', 'رقم الهاتف', 'العنوان', 'المبلغ الإجمالي', 'المبلغ المتبقي', 'القسط الشهري'];
                rows = this.currentData.map(item => [
                    item.customer_name,
                    item.customer_phone || '-',
                    item.customer_address || '-',
                    item.total_amount || 0,
                    item.remaining_amount || 0,
                    item.monthly_amount || 0
                ]);
            } else if (reportType === 'installments') {
                const data = this.currentData.installments || [];
                headers = ['اسم العميل', 'رقم الهاتف', 'القسط الشهري', 'المبلغ المتبقي', 'عدد الأقساط', 'تاريخ الاستحقاق'];
                rows = data.map(item => {
                    const remainingMonths = Math.ceil(item.remaining_amount / item.monthly_amount);
                    return [
                        item.customer_name,
                        item.customer_phone || '-',
                        item.monthly_amount || 0,
                        item.remaining_amount || 0,
                        remainingMonths,
                        item.due_date ? this.formatDate(item.due_date) : '-'
                    ];
                });
            }

            return { headers, rows };
        }

        // ═══════════════════════════════════════════════════════════
        // دوال مساعدة
        // ═══════════════════════════════════════════════════════════
        
        formatCurrency(amount) {
            // Always show numbers in English
            const num = parseFloat(amount) || 0;
            return toEnglishDigits(new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(num)) + ' دينار';
        }

        formatDate(date) {
            if (!date) return '-';
            const d = new Date(date);
            // Always show numbers in English
            return toEnglishDigits(d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }));
        }

        formatMonth(monthString) {
            // Always show numbers in English
            const [year, month] = monthString.split('-');
            const monthNames = [
                'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
            ];
            return `${monthNames[parseInt(month) - 1]} ${toEnglishDigits(year)}`;
        }

        getDaysOverdue(dueDate) {
            if (!dueDate) return '-';
            const due = new Date(dueDate);
            const now = new Date();
            const diffTime = now - due;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return toEnglishDigits(diffDays > 0 ? diffDays : 0);
        }

        getPaymentMethodClass(method) {
            switch(method) {
                case 'نقدي':
                    return 'success';
                case 'آجل':
                    return 'warning';
                case 'تقسيط':
                    return 'info';
                default:
                    return 'info';
            }
        }

        getReportTitle() {
            const titles = {
                'sales-summary': 'ملخص المبيعات',
                'invoices-report': 'الفواتير',
                'products-report': 'المنتجات',
                'inventory-report': 'المخزون',
                'top-selling': 'الأكثر مبيعاً',
                'low-stock': 'المنخفضة في المخزن',
                'debts-summary': 'ملخص الديون',
                'overdue-debts': 'الديون المتأخرة',
                'debtors-list': 'قائمة المديونين',
                'installments': 'الأقساط',
                'payment-methods': 'طرق الدفع',
                'daily-sales': 'المبيعات اليومية',
                'profit-analysis': 'تحليل الأرباح',
                'category-analysis': 'تحليل التصنيفات',
                'customer-analysis': 'تحليل العملاء',
                'stock-movement': 'حركة المخزون',
                'trends-report': 'الاتجاهات'
            };
            return titles[this.currentReport] || 'تقرير';
        }

        showToast(message, type = 'info') {
            // استخدام نظام الإشعارات الموجود في التطبيق
            if (typeof showToast === 'function') {
                showToast(message, type);
            } else {
                console.log(`${type.toUpperCase()}: ${message}`);
                alert(message);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // تهيئة نظام التقارير
    // ═══════════════════════════════════════════════════════════════
    
    // إنشاء مثيل عام من المدير
    window.reportsManager = new ReportsManager();

    console.log(`
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║      📊 نظام إدارة التقارير المتكامل v2.0.0              ║
    ║      شركة الإبداع الرقمي - كرار السعبري                  ║
    ║                                                            ║
    ║      ✅ تم التحميل بنجاح                                  ║
    ║      🎯 جاهز للاستخدام                                    ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
    `);

})();