const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const Store = require('electron-store');

let mainWindow;
let splashWindow;
let db;
let printQueue = [];
let isPrinting = false;

// إعدادات التطبيق
const store = new Store({
    defaults: {
        printerSettings: {
            defaultPrinter: null,
            thermalPrinter: null,
            a4Printer: null,
            autoSelectThermal: true,
            paperWidth: 80,
            silentPrint: true, // الطباعة الصامتة افتراضياً
            autoPrint: true    // طباعة تلقائية عند الدفع
        },
        appSettings: {
            theme: 'dark',
            language: 'ar',
            autoBackup: true,
            backupInterval: 24,
            showPrintPreview: false // عدم إظهار معاينة الطباعة
        }
    }
});
        devMode: false // وضع التطوير

// تهيئة قاعدة البيانات
function initDatabase() {
    const dbPath = path.join(app.getPath('userData'), 'pos_database.db');
    
    try {
        db = new Database(dbPath);
        db.pragma('journal_mode = WAL');
        db.pragma('synchronous = NORMAL');
        db.pragma('cache_size = -64000');
        db.pragma('temp_store = MEMORY');
        
        createTables();

        // إضافة أدمن افتراضي إضافي إذا لم يوجد أي أدمن بكلمة مرور نصية (admin2/admin2)
        try {
            const adminCount = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'").get().cnt;
            if (adminCount === 0) {
                db.prepare("INSERT INTO users (username, password, full_name, role, is_active) VALUES (?, ?, ?, ?, ?)").run('admin2', 'admin2', 'مدير إضافي', 'admin', 1);
                console.log('✅ تم إضافة أدمن افتراضي باسم admin2 وكلمة مرور admin2');
            }
        } catch (e) {
            console.error('❌ خطأ في إضافة الأدمن الافتراضي:', e);
        }

        console.log('✅ تم تهيئة قاعدة البيانات بنجاح');
        return true;
    } catch (error) {
        console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
        return false;
    }
}

// إنشاء جداول قاعدة البيانات
function createTables() {
    const tables = [
        // جدول المنتجات
        `CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            category TEXT,
            price REAL NOT NULL,
            cost REAL DEFAULT 0,
            stock INTEGER DEFAULT 0,
            min_stock INTEGER DEFAULT 0,
            unit TEXT DEFAULT 'قطعة',
            tax_rate REAL DEFAULT 0,
            discount REAL DEFAULT 0,
            image TEXT,
            active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        // جدول الفواتير
        `CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_number TEXT UNIQUE NOT NULL,
            invoice_type TEXT DEFAULT 'sale',
            payment_type TEXT DEFAULT 'cash',
            customer_name TEXT,
            customer_phone TEXT,
            customer_address TEXT,
            total_amount REAL NOT NULL,
            discount REAL DEFAULT 0,
            tax REAL DEFAULT 0,
            net_amount REAL NOT NULL,
            paid_amount REAL DEFAULT 0,
            remaining_amount REAL DEFAULT 0,
            payment_method TEXT DEFAULT 'cash',
            status TEXT DEFAULT 'completed',
            notes TEXT,
            cashier_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        // جدول الأقساط
        `CREATE TABLE IF NOT EXISTS installments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL,
            months_count INTEGER NOT NULL,
            down_payment REAL DEFAULT 0,
            additional_payment REAL DEFAULT 0,
            monthly_amount REAL NOT NULL,
            total_paid REAL DEFAULT 0,
            remaining_amount REAL NOT NULL,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
        )`,
        // جدول دفعات الأقساط
        `CREATE TABLE IF NOT EXISTS installment_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            installment_id INTEGER NOT NULL,
            payment_number INTEGER NOT NULL,
            due_date DATE NOT NULL,
            amount REAL NOT NULL,
            paid_amount REAL DEFAULT 0,
            paid_date DATE,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (installment_id) REFERENCES installments(id) ON DELETE CASCADE
        )`,
        // جدول تفاصيل الفواتير
        `CREATE TABLE IF NOT EXISTS invoice_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            quantity REAL NOT NULL,
            unit_price REAL NOT NULL,
            discount REAL DEFAULT 0,
            tax REAL DEFAULT 0,
            total REAL NOT NULL,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )`,
        // جدول الموظفين/الكاشيرات
        `CREATE TABLE IF NOT EXISTS cashiers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT DEFAULT 'cashier',
            phone TEXT,
            active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        // جدول سجل الطباعة
        `CREATE TABLE IF NOT EXISTS print_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER,
            print_type TEXT,
            printer_name TEXT,
            status TEXT,
            error_message TEXT,
            printed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id)
        )`,
        // جدول النسخ الاحتياطي
        `CREATE TABLE IF NOT EXISTS backups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            backup_name TEXT NOT NULL,
            backup_path TEXT NOT NULL,
            backup_size INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        // جداول نظام الأمان والصلاحيات
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            role TEXT NOT NULL DEFAULT 'employee',
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            created_by INTEGER,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )`,
        `CREATE TABLE IF NOT EXISTS permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            display_name_ar TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS user_permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            permission_id INTEGER NOT NULL,
            granted_by INTEGER,
            granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
            FOREIGN KEY (granted_by) REFERENCES users(id),
            UNIQUE(user_id, permission_id)
        )`,
        `CREATE TABLE IF NOT EXISTS login_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            logout_time DATETIME,
            ip_address TEXT,
            device_info TEXT,
            status TEXT DEFAULT 'success',
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`,
        `CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            action_type TEXT NOT NULL,
            action_target TEXT NOT NULL,
            action_details TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`,
        // جدول الموردين
        `CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            supplier_name TEXT NOT NULL,
            company_name TEXT,
            phone TEXT NOT NULL,
            address TEXT,
            notes TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        // جدول منتجات الموردين
        `CREATE TABLE IF NOT EXISTS supplier_products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            supplier_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 0,
            purchase_price_single REAL NOT NULL DEFAULT 0,
            purchase_price_wholesale REAL NOT NULL DEFAULT 0,
            selling_price_single REAL NOT NULL DEFAULT 0,
            selling_price_wholesale REAL NOT NULL DEFAULT 0,
            currency TEXT DEFAULT 'IQD',
            purchase_date DATE DEFAULT CURRENT_DATE,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
        )`
    ];

    const transaction = db.transaction(() => {
        for (const table of tables) {
            db.exec(table);
        }

        // إدراج الصلاحيات الافتراضية
        db.exec(`
        INSERT OR IGNORE INTO permissions (name, display_name_ar, category, description) VALUES
        ('sales.view', 'عرض المبيعات', 'sales', 'عرض فواتير المبيعات'),
        ('sales.create', 'إنشاء فواتير البيع', 'sales', 'إنشاء فواتير بيع جديدة'),
        ('sales.edit', 'تعديل الفواتير', 'sales', 'تعديل الفواتير الموجودة'),
        ('sales.delete', 'حذف الفواتير', 'sales', 'حذف الفواتير'),
        ('sales.print', 'طباعة الفواتير', 'sales', 'طباعة الفواتير'),
        ('sales.discount', 'منح خصومات', 'sales', 'منح خصومات على الفواتير'),
        ('installments.view', 'عرض الأقساط', 'installments', 'عرض فواتير الأقساط'),
        ('installments.create', 'إنشاء فواتير أقساط', 'installments', 'إنشاء فواتير أقساط جديدة'),
        ('installments.payment', 'تسجيل دفعات الأقساط', 'installments', 'تسجيل دفعات الأقساط'),
        ('installments.edit', 'تعديل الأقساط', 'installments', 'تعديل معلومات الأقساط'),
        ('inventory.view', 'عرض المخزون', 'inventory', 'عرض المنتجات والمخزون'),
        ('inventory.add', 'إضافة منتجات', 'inventory', 'إضافة منتجات جديدة'),
        ('inventory.edit', 'تعديل المنتجات', 'inventory', 'تعديل معلومات المنتجات'),
        ('inventory.delete', 'حذف المنتجات', 'inventory', 'حذف المنتجات'),
        ('inventory.adjust', 'تعديل الكميات', 'inventory', 'تعديل كميات المخزون'),
        ('customers.view', 'عرض العملاء', 'customers', 'عرض قائمة العملاء'),
        ('customers.add', 'إضافة عملاء', 'customers', 'إضافة عملاء جدد'),
        ('customers.edit', 'تعديل العملاء', 'customers', 'تعديل معلومات العملاء'),
        ('customers.delete', 'حذف العملاء', 'customers', 'حذف العملاء'),
        ('debts.view', 'عرض الديون', 'debts', 'عرض قائمة الديون'),
        ('debts.payment', 'تسجيل التسديدات', 'debts', 'تسجيل تسديد الديون'),
        ('debts.edit', 'تعديل الديون', 'debts', 'تعديل معلومات الديون'),
        ('reports.view', 'عرض التقارير', 'reports', 'عرض جميع التقارير'),
        ('reports.sales', 'تقارير المبيعات', 'reports', 'عرض تقارير المبيعات'),
        ('reports.inventory', 'تقارير المخزون', 'reports', 'عرض تقارير المخزون'),
        ('reports.financial', 'التقارير المالية', 'reports', 'عرض التقارير المالية'),
        ('reports.export', 'تصدير التقارير', 'reports', 'تصدير التقارير إلى PDF/Excel'),
        ('settings.view', 'عرض الإعدادات', 'settings', 'عرض إعدادات النظام'),
        ('settings.edit', 'تعديل الإعدادات', 'settings', 'تعديل إعدادات النظام'),
        ('settings.printer', 'إعدادات الطابعة', 'settings', 'إدارة إعدادات الطابعة'),
        ('settings.backup', 'النسخ الاحتياطي', 'settings', 'عمل نسخ احتياطية'),
        ('users.view', 'عرض المستخدمين', 'admin', 'عرض قائمة المستخدمين'),
        ('users.add', 'إضافة مستخدمين', 'admin', 'إضافة مستخدمين جدد'),
        ('users.edit', 'تعديل المستخدمين', 'admin', 'تعديل معلومات المستخدمين'),
        ('users.delete', 'حذف المستخدمين', 'admin', 'حذف المستخدمين'),
        ('users.permissions', 'إدارة الصلاحيات', 'admin', 'منح وسحب الصلاحيات')
        `);

        // إنشاء مستخدم أدمن افتراضي (اسم المستخدم: admin، كلمة المرور: admin123)
        db.exec(`
        INSERT OR IGNORE INTO users (id, username, password, full_name, role, is_active)
        VALUES (1, 'admin', '$2a$10$YourHashedPasswordHere', 'المدير العام', 'admin', 1)
        `);

        // منح جميع الصلاحيات للأدمن
        db.exec(`
        INSERT OR IGNORE INTO user_permissions (user_id, permission_id, granted_by)
        SELECT 1, id, 1 FROM permissions
        `);
    });

    transaction();
    createIndexes();
}

// إنشاء فهارس لتحسين الأداء
function createIndexes() {
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)',
        'CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)',
        'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
        'CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number)',
        'CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(created_at)',
        'CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_phone)',
        'CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id)',
        'CREATE INDEX IF NOT EXISTS idx_invoice_items_product ON invoice_items(product_id)',
        'CREATE INDEX IF NOT EXISTS idx_installments_invoice ON installments(invoice_id)',
        'CREATE INDEX IF NOT EXISTS idx_installment_payments_installment ON installment_payments(installment_id)',
        'CREATE INDEX IF NOT EXISTS idx_installment_payments_status ON installment_payments(status)'
    ];
    
    indexes.forEach(index => db.exec(index));
}

// إنشاء نافذة التطبيق الرئيسية
function createMainWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const devMode = false; // دائماً وضع الإنتاج
    mainWindow = new BrowserWindow({
        width: Math.floor(width * 0.9),
        height: Math.floor(height * 0.9),
        minWidth: 1024,
        minHeight: 768,
        center: true,
        show: false,
        backgroundColor: '#0f172a',
            icon: path.join(__dirname, 'build', 'Gemini_Generated_Image_w319kww319kww319.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true,
            allowRunningInsecureContent: false,
            devTools: false
        },
        frame: false,
        titleBarStyle: 'hidden',
        autoHideMenuBar: true,
        resizable: true,
        maximizable: true,
        fullscreenable: true
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.close();
        }
        mainWindow.show();
        mainWindow.focus();
        // لا تفتح DevTools تلقائياً في الإنتاج
    });

    // إضافة اختصار Ctrl+Shift+D لفتح DevTools في أي وقت
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown' && input.control && input.shift && input.key.toLowerCase() === 'd') {
            mainWindow.webContents.openDevTools({ mode: 'detach' });
        }
    });

    mainWindow.on('closed', () => {
        if (db) {
            db.close();
        }
        mainWindow = null;
    });

    setupPrintHandlers();
    setupWindowControls();
    setupDatabaseHandlers();
}

// معالجات أزرار التحكم في النافذة
function setupWindowControls() {
    ipcMain.on('window-minimize', () => {
        if (mainWindow) {
            mainWindow.minimize();
        }
    });

    // قناة جديدة لتبديل حالة التكبير فقط
    ipcMain.on('window-toggle-maximize', () => {
        if (mainWindow) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
        }
    });

    ipcMain.on('window-close', () => {
        if (mainWindow) {
            mainWindow.close();
        }
    });
}

// إنشاء شاشة الترحيب
function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 1100,
        height: 650,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        center: true,
        resizable: false,
        movable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    splashWindow.loadFile('splash.html');

    const dbInitialized = initDatabase();
    
    setTimeout(() => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.close();
        }
        createMainWindow();
    }, 3000);
}

// نظام طوابير الطباعة
function addToPrintQueue(printJob) {
    printQueue.push(printJob);
    processPrintQueue();
}

async function processPrintQueue() {
    if (isPrinting || printQueue.length === 0) return;
    
    isPrinting = true;
    const job = printQueue.shift();
    
    try {
        await executePrintJob(job);
    } catch (error) {
        console.error('خطأ في تنفيذ مهمة الطباعة:', error);
        logPrintError(job, error.message);
    } finally {
        isPrinting = false;
        if (printQueue.length > 0) {
            setTimeout(processPrintQueue, 500);
        }
    }
}

async function executePrintJob(job) {
    return new Promise((resolve, reject) => {
        const { type, data, options, event } = job;
        
        switch (type) {
            case 'invoice-html':
                printInvoiceHtml(data.html, options, event)
                    .then(resolve)
                    .catch(reject);
                break;
            case 'silent':
                printSilent(options, event)
                    .then(resolve)
                    .catch(reject);
                break;
            case 'to-printer':
                printToPrinter(data.printerName, options, event)
                    .then(resolve)
                    .catch(reject);
                break;
            default:
                reject(new Error('نوع طباعة غير معروف'));
        }
    });
}

// طباعة HTML مخصص (فاتورة) - محسنة مع طباعة صامتة
function printInvoiceHtml(html, options = {}, event) {
    return new Promise((resolve, reject) => {
        let printWin = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        });

        printWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));

        printWin.webContents.once('did-finish-load', () => {
            setTimeout(() => {
                // الحصول على إعدادات الطباعة الصامتة
                const printerSettings = store.get('printerSettings');
                // إزالة silent من options ثم إضافة silent: true في النهاية
                const { silent: _, ...restOptions } = options;
                const printOptions = {
                    printBackground: true,
                    color: options.color !== undefined ? options.color : false,
                    margins: {
                        marginType: options.margins || 'none'
                    },
                    pageSize: options.pageSize || 'A4',
                    landscape: options.landscape || false,
                    deviceName: options.printerName || printerSettings.thermalPrinter || printerSettings.defaultPrinter,
                    ...restOptions,
                    silent: true // طباعة صامتة دائمًا في النهاية
                };

                printWin.webContents.print(printOptions, (success, failureReason) => {
                    if (options.invoiceId) {
                        logPrint(options.invoiceId, 'invoice-html', printOptions.deviceName, success, failureReason);
                    }
                    
                    if (!success) {
                        console.error('فشل طباعة الفاتورة:', failureReason);
                        event.reply('print-result', { success: false, error: failureReason });
                        reject(new Error(failureReason));
                    } else {
                        event.reply('print-result', { success: true });
                        resolve();
                    }

                    if (printWin) {
                        printWin.close();
                        printWin = null;
                    }
                });
            }, 500);
        });

        printWin.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            console.error('فشل تحميل HTML:', errorDescription);
            if (printWin) {
                printWin.close();
                printWin = null;
            }
            reject(new Error(errorDescription));
        });
    });
}

// الطباعة الصامتة - محسنة
function printSilent(options = {}, event) {
    return new Promise((resolve, reject) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        
        if (!win) {
            reject(new Error('لم يتم العثور على النافذة'));
            return;
        }

        const printOptions = {
            silent: true,
            printBackground: true,
            color: false,
            margins: {
                marginType: 'none'
            },
            landscape: false,
            pagesPerSheet: 1,
            collate: false,
            copies: options.copies || 1,
            pageSize: options.pageSize || { width: 80000, height: 200000 },
            ...options
        };

        win.webContents.print(printOptions, (success, failureReason) => {
            if (!success) {
                console.error('فشل الطباعة:', failureReason);
                event.reply('print-result', { success: false, error: failureReason });
                reject(new Error(failureReason));
            } else {
                event.reply('print-result', { success: true });
                resolve();
            }
        });
    });
}

// الطباعة على طابعة محددة - محسنة
function printToPrinter(printerName, options = {}, event) {
    return new Promise((resolve, reject) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        
        if (!win) {
            reject(new Error('لم يتم العثور على النافذة'));
            return;
        }

        const printers = win.webContents.getPrinters();
        const printer = printers.find(p => p.name === printerName);
        
        if (!printer) {
            reject(new Error(`الطابعة ${printerName} غير متصلة`));
            event.reply('print-result', { 
                success: false, 
                error: `الطابعة ${printerName} غير متصلة` 
            });
            return;
        }

        const printOptions = {
            silent: true,
            printBackground: true,
            deviceName: printerName,
            color: options.color || false,
            margins: {
                marginType: options.margins || 'none'
            },
            copies: options.copies || 1,
            ...options
        };

        win.webContents.print(printOptions, (success, failureReason) => {
            if (options.invoiceId) {
                logPrint(options.invoiceId, 'to-printer', printerName, success, failureReason);
            }
            
            if (!success) {
                console.error('فشل الطباعة على', printerName, ':', failureReason);
                event.reply('print-result', { success: false, error: failureReason });
                reject(new Error(failureReason));
            } else {
                event.reply('print-result', { success: true });
                resolve();
            }
        });
    });
}

// إعداد معالجات الطباعة
function setupPrintHandlers() {
    // طباعة HTML مخصص (فاتورة) مع نظام الطوابير
    ipcMain.on('print-invoice-html', (event, { html, ...options }) => {
        addToPrintQueue({
            type: 'invoice-html',
            data: { html },
            options,
            event
        });
    });

    // الطباعة الصامتة
    ipcMain.on('print-silent', (event, options) => {
        addToPrintQueue({
            type: 'silent',
            options,
            event
        });
    });

    // الطباعة مع معاينة
    // ipcMain.on('print-preview', () => {}); // تم تعطيله نهائيًا

    // طباعة إلى PDF
    ipcMain.on('print-to-pdf', async (event, options) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        
        try {
            const data = await win.webContents.printToPDF({
                printBackground: true,
                landscape: false,
                pageSize: 'A4',
                ...options
            });
            
            event.reply('pdf-result', { success: true, data: data.toString('base64') });
        } catch (error) {
            console.error('فشل إنشاء PDF:', error);
            event.reply('pdf-result', { success: false, error: error.message });
        }
    });

    // الحصول على قائمة الطابعات المتاحة
    ipcMain.on('get-printers', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        const printers = win.webContents.getPrinters();
        event.reply('printers-list', printers);
    });

    // طباعة على طابعة محددة
    ipcMain.on('print-to-printer', (event, { printerName, options }) => {
        addToPrintQueue({
            type: 'to-printer',
            data: { printerName },
            options,
            event
        });
    });

    // الحصول على الطابعة الافتراضية
    ipcMain.on('get-default-printer', (event) => {
        const printerSettings = store.get('printerSettings');
        event.reply('default-printer', printerSettings);
    });

    // حفظ إعدادات الطابعة
    ipcMain.on('save-printer-settings', (event, settings) => {
        store.set('printerSettings', settings);
        event.reply('printer-settings-saved', { success: true });
    });

    // تبديل وضع الطباعة الصامتة
    ipcMain.on('toggle-silent-print', (event, enabled) => {
        const currentSettings = store.get('printerSettings');
        currentSettings.silentPrint = enabled;
        store.set('printerSettings', currentSettings);
        event.reply('silent-print-toggled', { success: true, enabled });
    });
}

// تسجيل عمليات الطباعة
function logPrint(invoiceId, printType, printerName, success, errorMessage = null) {
    try {
        const stmt = db.prepare(`
            INSERT INTO print_log (invoice_id, print_type, printer_name, status, error_message)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            invoiceId,
            printType,
            printerName || 'default',
            success ? 'success' : 'failed',
            errorMessage
        );
    } catch (error) {
        console.error('خطأ في تسجيل عملية الطباعة:', error);
    }
}

// تسجيل أخطاء الطباعة
function logPrintError(job, errorMessage) {
    if (job.options && job.options.invoiceId) {
        logPrint(job.options.invoiceId, job.type, job.data?.printerName, false, errorMessage);
    }
}

// معالجات قاعدة البيانات
function setupDatabaseHandlers() {
    // تنفيذ استعلام SQL
    ipcMain.handle('db-query', async (event, { sql, params = [] }) => {
        try {
            const stmt = db.prepare(sql);
            const result = stmt.all(...params);
            return { success: true, data: result };
        } catch (error) {
            console.error('خطأ في الاستعلام:', error);
            return { success: false, error: error.message };
        }
    });

    // تنفيذ استعلام INSERT/UPDATE/DELETE
    ipcMain.handle('db-run', async (event, { sql, params = [] }) => {
        try {
            const stmt = db.prepare(sql);
            const result = stmt.run(...params);
            return { 
                success: true, 
                lastID: result.lastInsertRowid,
                changes: result.changes 
            };
        } catch (error) {
            console.error('خطأ في التنفيذ:', error);
            return { success: false, error: error.message };
        }
    });

    // تنفيذ معاملة (Transaction)
    ipcMain.handle('db-transaction', async (event, queries) => {
        const transaction = db.transaction((queries) => {
            const results = [];
            for (const { sql, params = [] } of queries) {
                const stmt = db.prepare(sql);
                const result = stmt.run(...params);
                results.push({
                    lastID: result.lastInsertRowid,
                    changes: result.changes
                });
            }
            return results;
        });

        try {
            const results = transaction(queries);
            return { success: true, results };
        } catch (error) {
            console.error('خطأ في المعاملة:', error);
            return { success: false, error: error.message };
        }
    });

    // نسخ احتياطي لقاعدة البيانات
    ipcMain.handle('db-backup', async (event) => {
        try {
            const backupDir = path.join(app.getPath('userData'), 'backups');
            
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(backupDir, `backup_${timestamp}.db`);
            
            await db.backup(backupPath);
            
            const stats = fs.statSync(backupPath);
            
            const stmt = db.prepare(`
                INSERT INTO backups (backup_name, backup_path, backup_size)
                VALUES (?, ?, ?)
            `);
            stmt.run(`backup_${timestamp}.db`, backupPath, stats.size);
            
            return { 
                success: true, 
                path: backupPath,
                size: stats.size
            };
        } catch (error) {
            console.error('خطأ في النسخ الاحتياطي:', error);
            return { success: false, error: error.message };
        }
    });

    // استعادة نسخة احتياطية
    ipcMain.handle('db-restore', async (event, backupPath) => {
        try {
            if (!fs.existsSync(backupPath)) {
                return { success: false, error: 'ملف النسخة الاحتياطية غير موجود' };
            }

            db.close();

            const dbPath = path.join(app.getPath('userData'), 'pos_database.db');
            fs.copyFileSync(backupPath, dbPath);

            db = new Database(dbPath);
            db.pragma('journal_mode = WAL');

            return { success: true };
        } catch (error) {
            console.error('خطأ في الاستعادة:', error);
            initDatabase();
            return { success: false, error: error.message };
        }
    });

    // إحصائيات قاعدة البيانات
    ipcMain.handle('db-stats', async (event) => {
        try {
            const stats = {
                products: db.prepare('SELECT COUNT(*) as count FROM products').get().count,
                invoices: db.prepare('SELECT COUNT(*) as count FROM invoices').get().count,
                installments: db.prepare('SELECT COUNT(*) as count FROM installments WHERE status = "active"').get().count,
                todaySales: db.prepare(`
                    SELECT COUNT(*) as count, IFNULL(SUM(net_amount), 0) as total
                    FROM invoices 
                    WHERE DATE(created_at) = DATE('now')
                `).get(),
                dbSize: fs.statSync(db.name).size
            };
            
            return { success: true, stats };
        } catch (error) {
            console.error('خطأ في الإحصائيات:', error);
            return { success: false, error: error.message };
        }
    });
}

// عند جاهزية التطبيق
app.whenReady().then(() => {
    createSplashWindow();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createSplashWindow();
        }
    });
});

// عند إغلاق جميع النوافذ
app.on('window-all-closed', () => {
    if (db) {
        db.close();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// قبل الإغلاق - نسخ احتياطي تلقائي
app.on('before-quit', async (e) => {
    if (store.get('appSettings.autoBackup')) {
        e.preventDefault();
        
        try {
            const backupDir = path.join(app.getPath('userData'), 'backups');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(backupDir, `auto_backup_${timestamp}.db`);
            
            if (db) {
                await db.backup(backupPath);
                console.log('✅ تم إنشاء نسخة احتياطية تلقائية');
            }
        } catch (error) {
            console.error('❌ خطأ في النسخ الاحتياطي التلقائي:', error);
        } finally {
            if (db) db.close();
            app.exit();
        }
    } else {
        if (db) db.close();
    }
});

// منع فتح نوافذ متعددة
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// التعامل مع الأخطاء
process.on('uncaughtException', (error) => {
    console.error('❌ خطأ غير متوقع:', error);
    const logPath = path.join(app.getPath('userData'), 'error.log');
    const errorLog = `[${new Date().toISOString()}] ${error.stack}\n\n`;
    fs.appendFileSync(logPath, errorLog);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Promise غير معالج:', error);
    const logPath = path.join(app.getPath('userData'), 'error.log');
    const errorLog = `[${new Date().toISOString()}] Unhandled Rejection: ${error}\n\n`;
    fs.appendFileSync(logPath, errorLog);
});