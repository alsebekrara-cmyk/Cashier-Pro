/**
 * نظام التحكم بالصلاحيات والعناصر
 * Digital Creativity Company - كرار الشعبري
 * 
 * يتحكم في:
 * - إظهار/إخفاء عناصر الواجهة
 * - تفعيل/تعطيل الأزرار
 * - التحقق من الصلاحيات قبل تنفيذ العمليات
 */

class PermissionsController {
    constructor(authSystem) {
        this.authSystem = authSystem;
        this.permissions = null;
        this.init();
    }

    // تهيئة النظام
    init() {
        this.loadPermissions();
        this.applyPermissions();
        
        // تحديث الصلاحيات عند تغيير المستخدم
        window.addEventListener('user-changed', () => {
            this.loadPermissions();
            this.applyPermissions();
        });
    }

    // تحميل صلاحيات المستخدم الحالي
    loadPermissions() {
        this.permissions = this.authSystem.getCurrentUserPermissions();
    }

    // تطبيق الصلاحيات على الواجهة
    applyPermissions() {
        if (!this.permissions) return;

        const user = this.authSystem.getCurrentUser();
        const isAdmin = this.authSystem.isAdmin();

        // تطبيق صلاحيات لوحة المعلومات
        this.applyDashboardPermissions();

        // تطبيق صلاحيات القوائم الجانبية
        this.applySidebarPermissions();

        // تطبيق صلاحيات الصفحات
        this.applyPagePermissions();

        // إخفاء نظام الحماية عن المستخدمين العاديين
        if (!isAdmin) {
            this.hideElement('[data-page="security"]');
            this.hideElement('#securitySection');
        }
    }

    // تطبيق صلاحيات لوحة المعلومات
    applyDashboardPermissions() {
        const dashboard = this.permissions?.dashboard;
        if (!dashboard) return;

        // العدادات الرئيسية
        this.toggleElement('.products-count-card', dashboard.showProductsCount);
        this.toggleElement('.inventory-value-card', dashboard.showInventoryValue);
        this.toggleElement('.debts-count-card', dashboard.showDebtsCount);
        this.toggleElement('.debts-value-card', dashboard.showDebtsValue);
        this.toggleElement('.revenue-card', dashboard.showRevenue);
        this.toggleElement('.profit-card', dashboard.showProfit);

        // يمكن استخدام селекторы أكثر دقة
        this.toggleElement('[data-stat="products-count"]', dashboard.showProductsCount);
        this.toggleElement('[data-stat="inventory-value"]', dashboard.showInventoryValue);
        this.toggleElement('[data-stat="debts-count"]', dashboard.showDebtsCount);
        this.toggleElement('[data-stat="debts-value"]', dashboard.showDebtsValue);
    }

    // تطبيق صلاحيات القوائم الجانبية
    applySidebarPermissions() {
        const sidebar = this.permissions?.sidebar;
        if (!sidebar) return;

        // عناصر القائمة الجانبية
        this.toggleElement('[data-page="products"]', sidebar.products);
        this.toggleElement('[data-page="inventory"]', sidebar.inventory);
        this.toggleElement('[data-page="pos"]', sidebar.pos);
        this.toggleElement('[data-page="debts"]', sidebar.debts);
        this.toggleElement('[data-page="reports"]', sidebar.reports);
        this.toggleElement('[data-page="printer"]', sidebar.printer);
        this.toggleElement('[data-page="settings"]', sidebar.settings);
        this.toggleElement('[data-page="security"]', sidebar.security);

        // روابط القائمة
        this.toggleElement('a[href="#products"]', sidebar.products);
        this.toggleElement('a[href="#inventory"]', sidebar.inventory);
        this.toggleElement('a[href="#pos"]', sidebar.pos);
        this.toggleElement('a[href="#debts"]', sidebar.debts);
        this.toggleElement('a[href="#reports"]', sidebar.reports);
        this.toggleElement('a[href="#printer"]', sidebar.printer);
        this.toggleElement('a[href="#settings"]', sidebar.settings);
    }

    // تطبيق صلاحيات الصفحات
    applyPagePermissions() {
        this.applyProductsPermissions();
        this.applyInventoryPermissions();
        this.applyPOSPermissions();
        this.applyDebtsPermissions();
        this.applyReportsPermissions();
        this.applyPrinterPermissions();
        this.applySettingsPermissions();
    }

    // صلاحيات صفحة المنتجات
    applyProductsPermissions() {
        const perms = this.permissions?.products;
        if (!perms) return;

        // الأزرار الرئيسية
        this.toggleElement('[data-action="add-product"]', perms.add);
        this.toggleElement('[data-action="add-category"]', perms.addCategory);
        this.toggleElement('.btn-add-product', perms.add);
        this.toggleElement('.btn-add-category', perms.addCategory);
        this.toggleElement('#addProductBtn', perms.add);
        this.toggleElement('#addCategoryBtn', perms.addCategory);

        // أزرار التصدير
        this.toggleElement('[data-action="export-json"]', perms.exportJSON);
        this.toggleElement('[data-action="export-excel"]', perms.exportExcel);
        this.toggleElement('[data-action="export-pdf"]', perms.exportPDF);
        this.toggleElement('.btn-export-json', perms.exportJSON);
        this.toggleElement('.btn-export-excel', perms.exportExcel);
        this.toggleElement('.btn-export-pdf', perms.exportPDF);

        // استيراد المنتجات
        this.toggleElement('[data-action="import-products"]', perms.importProducts);
        this.toggleElement('.btn-import-products', perms.importProducts);

        // أزرار الإجراءات في الجدول
        if (!perms.edit) {
            this.hideElements('.btn-edit-product');
            this.hideElements('[data-action="edit-product"]');
        }
        if (!perms.delete) {
            this.hideElements('.btn-delete-product');
            this.hideElements('[data-action="delete-product"]');
        }
        if (!perms.viewDetails) {
            this.hideElements('.btn-view-product');
            this.hideElements('[data-action="view-product"]');
        }
    }

    // صلاحيات صفحة المخزون
    applyInventoryPermissions() {
        const perms = this.permissions?.inventory;
        if (!perms) return;

        this.toggleElement('[data-action="add-inventory"]', perms.add);
        this.toggleElement('[data-action="adjust-stock"]', perms.adjustStock);
        this.toggleElement('[data-action="view-history"]', perms.viewHistory);
        this.toggleElement('[data-action="export-inventory"]', perms.exportData);

        if (!perms.edit) {
            this.hideElements('.btn-edit-inventory');
        }
        if (!perms.delete) {
            this.hideElements('.btn-delete-inventory');
        }
    }

    // صلاحيات صفحة نقطة البيع
    applyPOSPermissions() {
        const perms = this.permissions?.pos;
        if (!perms) return;

        this.toggleElement('[data-action="sell"]', perms.sell);
        this.toggleElement('[data-action="add-to-cart"]', perms.addToCart);
        this.toggleElement('[data-action="sell-installment"]', perms.sellInstallment);
        this.toggleElement('[data-action="apply-discount"]', perms.applyDiscount);
        
        this.toggleElement('.btn-complete-sale', perms.sell);
        this.toggleElement('.btn-add-to-cart', perms.addToCart);
        this.toggleElement('.btn-installment-sale', perms.sellInstallment);
        this.toggleElement('#completeSaleBtn', perms.sell);
        this.toggleElement('#installmentSaleBtn', perms.sellInstallment);

        if (!perms.printInvoice) {
            this.hideElements('.btn-print-invoice');
        }
        if (!perms.cancelSale) {
            this.hideElements('.btn-cancel-sale');
        }
    }

    // صلاحيات صفحة الديون
    applyDebtsPermissions() {
        const perms = this.permissions?.debts;
        if (!perms) return;

        this.toggleElement('[data-action="view-debt-details"]', perms.viewDetails);
        this.toggleElement('[data-action="pay-debt"]', perms.pay);
        this.toggleElement('[data-action="delete-debt"]', perms.delete);
        this.toggleElement('[data-action="export-debts"]', perms.exportData);

        if (!perms.viewDetails) {
            this.hideElements('.btn-view-debt');
        }
        if (!perms.pay) {
            this.hideElements('.btn-pay-debt');
            this.hideElements('.btn-pay-installment');
        }
        if (!perms.delete) {
            this.hideElements('.btn-delete-debt');
        }
    }

    // صلاحيات صفحة التقارير
    applyReportsPermissions() {
        const perms = this.permissions?.reports;
        if (!perms) return;

        this.toggleElement('[data-report="sales"]', perms.salesReports);
        this.toggleElement('[data-report="inventory"]', perms.inventoryReports);
        this.toggleElement('[data-report="debts"]', perms.debtReports);
        this.toggleElement('[data-report="profit"]', perms.profitReports);
        this.toggleElement('[data-action="export-reports"]', perms.exportReports);
    }

    // صلاحيات صفحة الطابعة
    applyPrinterPermissions() {
        const perms = this.permissions?.printer;
        if (!perms) return;

        this.toggleElement('[data-action="configure-printer"]', perms.configure);
        this.toggleElement('[data-action="test-printer"]', perms.test);
    }

    // صلاحيات صفحة الإعدادات
    applySettingsPermissions() {
        const perms = this.permissions?.settings;
        if (!perms) return;

        this.toggleElement('[data-action="edit-settings"]', perms.editGeneral);
        this.toggleElement('[data-action="backup-data"]', perms.backup);
        this.toggleElement('[data-action="restore-data"]', perms.restore);
    }

    // دوال مساعدة للتحكم بالعناصر
    toggleElement(selector, show) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (show) {
                el.style.display = '';
                el.style.visibility = 'visible';
                el.disabled = false;
            } else {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.disabled = true;
            }
        });
    }

    hideElement(selector) {
        this.toggleElement(selector, false);
    }

    showElement(selector) {
        this.toggleElement(selector, true);
    }

    hideElements(selector) {
        this.hideElement(selector);
    }

    // التحقق من صلاحية معينة
    hasPermission(section, action) {
        if (this.authSystem.isAdmin()) return true;
        
        if (!this.permissions || !this.permissions[section]) {
            return false;
        }

        return this.permissions[section][action] === true;
    }

    // التحقق قبل تنفيذ عملية
    checkPermission(section, action, errorMessage = 'ليس لديك صلاحية لتنفيذ هذا الإجراء') {
        if (!this.hasPermission(section, action)) {
            this.showPermissionError(errorMessage);
            return false;
        }
        return true;
    }

    // عرض رسالة خطأ الصلاحية
    showPermissionError(message) {
        // استخدام نظام الإشعارات في التطبيق
        if (window.showNotification) {
            window.showNotification(message, 'error');
        } else if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'غير مصرح',
                text: message,
                confirmButtonText: 'حسناً'
            });
        } else {
            alert(message);
        }
    }

    // تحديث الصلاحيات
    updatePermissions() {
        this.loadPermissions();
        this.applyPermissions();
    }
}

// وظائف مساعدة عامة
window.checkPermission = function(section, action, errorMessage) {
    if (!window.permissionsController) return true;
    return window.permissionsController.checkPermission(section, action, errorMessage);
};

window.hasPermission = function(section, action) {
    if (!window.permissionsController) return true;
    return window.permissionsController.hasPermission(section, action);
};

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    if (window.authSystem) {
        window.permissionsController = new PermissionsController(window.authSystem);
        console.log('✅ نظام الصلاحيات جاهز');
    }
});

console.log('🔒 نظام التحكم بالصلاحيات محمل - Digital Creativity');
