/**
 * Preload script for Electron - نظام نقاط البيع المتقدم
 * يتم تحميله قبل تحميل صفحة التطبيق الرئيسية
 * يوفر واجهات برمجية آمنة للصفحة الرئيسية
 */

const { contextBridge, ipcRenderer } = require('electron');

// تعريض واجهات برمجية آمنة للصفحة الرئيسية
contextBridge.exposeInMainWorld('electronAPI', {
    
    // ==================== واجهات الطباعة ====================
    
    /**
     * طباعة صامتة (مباشرة بدون حوار)
     * @param {Object} options - خيارات الطباعة
     * @returns {void}
     */
    printSilent: (options) => {
        ipcRenderer.send('print-silent', options);
    },

    /**
     * طباعة مع معاينة
     * @returns {void}
     */
    printPreview: () => {
        ipcRenderer.send('print-preview');
    },

    /**
     * طباعة إلى PDF
     * @param {Object} options - خيارات PDF
     * @returns {void}
     */
    printToPDF: (options) => {
        ipcRenderer.send('print-to-pdf', options);
    },

    /**
     * الحصول على قائمة الطابعات المتاحة
     * @returns {void}
     */
    getPrinters: () => {
        ipcRenderer.send('get-printers');
    },

    /**
     * طباعة على طابعة محددة
     * @param {string} printerName - اسم الطابعة
     * @param {Object} options - خيارات الطباعة
     * @returns {void}
     */
    printToPrinter: (printerName, options = {}) => {
        ipcRenderer.send('print-to-printer', { printerName, options });
    },

    /**
     * طباعة HTML مخصص (فاتورة)
     * @param {string} html - محتوى HTML
     * @param {Object} options - خيارات الطباعة (silent: true للطباعة الصامتة)
     * @returns {void}
     */
    printInvoiceHtml: (html, options = {}) => {
        ipcRenderer.send('print-invoice-html', { html, ...options });
    },

    /**
     * الحصول على إعدادات الطابعة الافتراضية
     * @returns {void}
     */
    getDefaultPrinter: () => {
        ipcRenderer.send('get-default-printer');
    },

    /**
     * حفظ إعدادات الطابعة
     * @param {Object} settings - إعدادات الطابعة
     * @returns {void}
     */
    savePrinterSettings: (settings) => {
        ipcRenderer.send('save-printer-settings', settings);
    },

    /**
     * تبديل وضع الطباعة الصامتة
     * @param {boolean} enabled - تفعيل/تعطيل
     * @returns {void}
     */
    toggleSilentPrint: (enabled) => {
        ipcRenderer.send('toggle-silent-print', enabled);
    },

    // ==================== معالجات الاستماع للطباعة ====================
    
    /**
     * الاستماع لنتيجة الطباعة
     * @param {Function} callback - دالة الاستدعاء
     * @returns {Function} - دالة إلغاء الاشتراك
     */
    onPrintResult: (callback) => {
        const listener = (event, result) => callback(result);
        ipcRenderer.on('print-result', listener);
        return () => ipcRenderer.removeListener('print-result', listener);
    },

    /**
     * الاستماع لنتيجة PDF
     * @param {Function} callback - دالة الاستدعاء
     * @returns {Function} - دالة إلغاء الاشتراك
     */
    onPDFResult: (callback) => {
        const listener = (event, result) => callback(result);
        ipcRenderer.on('pdf-result', listener);
        return () => ipcRenderer.removeListener('pdf-result', listener);
    },

    /**
     * الاستماع لقائمة الطابعات
     * @param {Function} callback - دالة الاستدعاء
     * @returns {Function} - دالة إلغاء الاشتراك
     */
    onPrintersList: (callback) => {
        const listener = (event, printers) => callback(printers);
        ipcRenderer.on('printers-list', listener);
        return () => ipcRenderer.removeListener('printers-list', listener);
    },

    /**
     * الاستماع للطابعة الافتراضية
     * @param {Function} callback - دالة الاستدعاء
     * @returns {Function} - دالة إلغاء الاشتراك
     */
    onDefaultPrinter: (callback) => {
        const listener = (event, settings) => callback(settings);
        ipcRenderer.on('default-printer', listener);
        return () => ipcRenderer.removeListener('default-printer', listener);
    },

    /**
     * الاستماع لحفظ إعدادات الطابعة
     * @param {Function} callback - دالة الاستدعاء
     * @returns {Function} - دالة إلغاء الاشتراك
     */
    onPrinterSettingsSaved: (callback) => {
        const listener = (event, result) => callback(result);
        ipcRenderer.on('printer-settings-saved', listener);
        return () => ipcRenderer.removeListener('printer-settings-saved', listener);
    },

    /**
     * الاستماع لتبديل الطباعة الصامتة
     * @param {Function} callback - دالة الاستدعاء
     * @returns {Function} - دالة إلغاء الاشتراك
     */
    onSilentPrintToggled: (callback) => {
        const listener = (event, result) => callback(result);
        ipcRenderer.on('silent-print-toggled', listener);
        return () => ipcRenderer.removeListener('silent-print-toggled', listener);
    },

    // ==================== واجهات قاعدة البيانات ====================
    
    /**
     * تنفيذ استعلام SELECT
     * @param {string} sql - استعلام SQL
     * @param {Array} params - معاملات الاستعلام
     * @returns {Promise<Object>} - نتيجة الاستعلام
     */
    dbQuery: async (sql, params = []) => {
        return await ipcRenderer.invoke('db-query', { sql, params });
    },

    /**
     * تنفيذ استعلام INSERT/UPDATE/DELETE
     * @param {string} sql - استعلام SQL
     * @param {Array} params - معاملات الاستعلام
     * @returns {Promise<Object>} - نتيجة التنفيذ
     */
    dbRun: async (sql, params = []) => {
        return await ipcRenderer.invoke('db-run', { sql, params });
    },

    /**
     * تنفيذ معاملة (Transaction)
     * @param {Array} queries - مصفوفة الاستعلامات [{sql, params}, ...]
     * @returns {Promise<Object>} - نتيجة المعاملة
     */
    dbTransaction: async (queries) => {
        return await ipcRenderer.invoke('db-transaction', queries);
    },

    /**
     * نسخ احتياطي لقاعدة البيانات
     * @returns {Promise<Object>} - مسار النسخة الاحتياطية
     */
    dbBackup: async () => {
        return await ipcRenderer.invoke('db-backup');
    },

    /**
     * استعادة نسخة احتياطية
     * @param {string} backupPath - مسار ملف النسخة الاحتياطية
     * @returns {Promise<Object>} - نتيجة الاستعادة
     */
    dbRestore: async (backupPath) => {
        return await ipcRenderer.invoke('db-restore', backupPath);
    },

    /**
     * الحصول على إحصائيات قاعدة البيانات
     * @returns {Promise<Object>} - الإحصائيات
     */
    dbStats: async () => {
        return await ipcRenderer.invoke('db-stats');
    },

    // ==================== واجهات التحكم في النافذة ====================
    
    /**
     * تصغير النافذة
     * @returns {void}
     */
    windowMinimize: () => {
        ipcRenderer.send('window-minimize');
    },

    /**
     * تكبير/استعادة النافذة
     * @returns {void}
     */
    windowMaximize: () => {
        ipcRenderer.send('window-maximize');
    },

    /**
     * إغلاق النافذة
     * @returns {void}
     */
    windowClose: () => {
        ipcRenderer.send('window-close');
    },

    // ==================== معلومات النظام ====================
    
    /**
     * معلومات النظام
     */
    system: {
        platform: process.platform,
        electronVersion: process.versions.electron,
        chromeVersion: process.versions.chrome,
        nodeVersion: process.versions.node,
        v8Version: process.versions.v8
    }
});

// ==================== واجهات مساعدة للطباعة ====================

/**
 * واجهة مساعدة لطباعة الفواتير الحرارية
 */
contextBridge.exposeInMainWorld('thermalPrinter', {
    /**
     * طباعة فاتورة حرارية 80mm (صامتة)
     * @param {string} html - محتوى HTML
     * @param {Object} options - خيارات إضافية
     * @returns {void}
     */
    print: (html, options = {}) => {
        const thermalOptions = {
            silent: true, // طباعة صامتة افتراضياً
            printBackground: true,
            color: false,
            margins: 'none',
            pageSize: { width: 80000, height: 200000 },
            ...options
        };
        ipcRenderer.send('print-invoice-html', { html, ...thermalOptions });
    },

    /**
     * طباعة فاتورة حرارية 58mm (صامتة)
     * @param {string} html - محتوى HTML
     * @param {Object} options - خيارات إضافية
     * @returns {void}
     */
    print58mm: (html, options = {}) => {
        const thermalOptions = {
            silent: true, // طباعة صامتة افتراضياً
            printBackground: true,
            color: false,
            margins: 'none',
            pageSize: { width: 58000, height: 200000 },
            ...options
        };
        ipcRenderer.send('print-invoice-html', { html, ...thermalOptions });
    }
});

/**
 * واجهة مساعدة لطباعة A4
 */
contextBridge.exposeInMainWorld('a4Printer', {
    /**
     * طباعة فاتورة A4 (مع معاينة)
     * @param {string} html - محتوى HTML
     * @param {Object} options - خيارات إضافية
     * @returns {void}
     */
    print: (html, options = {}) => {
        const a4Options = {
            silent: false, // مع معاينة
            printBackground: true,
            color: true,
            pageSize: 'A4',
            margins: 'default',
            ...options
        };
        ipcRenderer.send('print-invoice-html', { html, ...a4Options });
    },

    /**
     * طباعة فاتورة A4 صامتة (بدون معاينة)
     * @param {string} html - محتوى HTML
     * @param {Object} options - خيارات إضافية
     * @returns {void}
     */
    printSilent: (html, options = {}) => {
        const a4Options = {
            silent: true, // طباعة صامتة
            printBackground: true,
            color: true,
            pageSize: 'A4',
            margins: 'default',
            ...options
        };
        ipcRenderer.send('print-invoice-html', { html, ...a4Options });
    }
});

// ==================== واجهات مساعدة لقاعدة البيانات ====================

/**
 * واجهة مساعدة للمنتجات
 */
contextBridge.exposeInMainWorld('productsDB', {
    /**
     * الحصول على جميع المنتجات
     * @returns {Promise<Array>} - قائمة المنتجات
     */
    getAll: async () => {
        const result = await ipcRenderer.invoke('db-query', {
            sql: 'SELECT * FROM products WHERE active = 1 ORDER BY name',
            params: []
        });
        return result.success ? result.data : [];
    },

    /**
     * البحث عن منتج بالباركود
     * @param {string} barcode - الباركود
     * @returns {Promise<Object|null>} - بيانات المنتج
     */
    findByBarcode: async (barcode) => {
        const result = await ipcRenderer.invoke('db-query', {
            sql: 'SELECT * FROM products WHERE barcode = ? AND active = 1',
            params: [barcode]
        });
        return result.success && result.data.length > 0 ? result.data[0] : null;
    },

    /**
     * إضافة منتج جديد
     * @param {Object} product - بيانات المنتج
     * @returns {Promise<Object>} - نتيجة الإضافة
     */
    add: async (product) => {
        return await ipcRenderer.invoke('db-run', {
            sql: `INSERT INTO products (barcode, name, category, price, cost, stock, min_stock, unit, tax_rate, discount, image)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params: [
                product.barcode,
                product.name,
                product.category || '',
                product.price,
                product.cost || 0,
                product.stock || 0,
                product.min_stock || 0,
                product.unit || 'قطعة',
                product.tax_rate || 0,
                product.discount || 0,
                product.image || null
            ]
        });
    },

    /**
     * تحديث منتج
     * @param {number} id - معرف المنتج
     * @param {Object} product - بيانات المنتج المحدثة
     * @returns {Promise<Object>} - نتيجة التحديث
     */
    update: async (id, product) => {
        return await ipcRenderer.invoke('db-run', {
            sql: `UPDATE products 
                  SET barcode = ?, name = ?, category = ?, price = ?, cost = ?, 
                      stock = ?, min_stock = ?, unit = ?, tax_rate = ?, discount = ?, 
                      image = ?, updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?`,
            params: [
                product.barcode,
                product.name,
                product.category,
                product.price,
                product.cost,
                product.stock,
                product.min_stock,
                product.unit,
                product.tax_rate,
                product.discount,
                product.image,
                id
            ]
        });
    },

    /**
     * حذف منتج (حذف منطقي)
     * @param {number} id - معرف المنتج
     * @returns {Promise<Object>} - نتيجة الحذف
     */
    delete: async (id) => {
        return await ipcRenderer.invoke('db-run', {
            sql: 'UPDATE products SET active = 0 WHERE id = ?',
            params: [id]
        });
    }
});

/**
 * واجهة مساعدة للفواتير
 */
contextBridge.exposeInMainWorld('invoicesDB', {
    /**
     * إنشاء فاتورة جديدة مع تفاصيلها
     * @param {Object} invoice - بيانات الفاتورة
     * @param {Array} items - عناصر الفاتورة
     * @param {Object} installment - بيانات الأقساط (اختياري)
     * @returns {Promise<Object>} - نتيجة الإنشاء
     */
    create: async (invoice, items, installment = null) => {
        const queries = [
            // إدراج الفاتورة
            {
                sql: `INSERT INTO invoices (invoice_number, invoice_type, payment_type, customer_name, customer_phone, customer_address,
                      total_amount, discount, tax, net_amount, paid_amount, remaining_amount, payment_method, status, notes, cashier_id)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                params: [
                    invoice.invoice_number,
                    invoice.invoice_type || 'sale',
                    invoice.payment_type || 'cash',
                    invoice.customer_name || null,
                    invoice.customer_phone || null,
                    invoice.customer_address || null,
                    invoice.total_amount,
                    invoice.discount || 0,
                    invoice.tax || 0,
                    invoice.net_amount,
                    invoice.paid_amount || 0,
                    invoice.remaining_amount || 0,
                    invoice.payment_method || 'cash',
                    invoice.status || 'completed',
                    invoice.notes || null,
                    invoice.cashier_id || null
                ]
            },
            // إدراج عناصر الفاتورة
            ...items.map(item => ({
                sql: `INSERT INTO invoice_items (invoice_id, product_id, product_name, quantity, unit_price, discount, tax, total)
                      VALUES (last_insert_rowid(), ?, ?, ?, ?, ?, ?, ?)`,
                params: [
                    item.product_id,
                    item.product_name,
                    item.quantity,
                    item.unit_price,
                    item.discount || 0,
                    item.tax || 0,
                    item.total
                ]
            })),
            // تحديث المخزون
            ...items.map(item => ({
                sql: `UPDATE products SET stock = stock - ? WHERE id = ?`,
                params: [item.quantity, item.product_id]
            }))
        ];

        // إضافة بيانات الأقساط إن وجدت
        if (installment) {
            queries.push({
                sql: `INSERT INTO installments (invoice_id, months_count, down_payment, additional_payment, monthly_amount, total_paid, remaining_amount, status)
                      VALUES (last_insert_rowid(), ?, ?, ?, ?, ?, ?, ?)`,
                params: [
                    installment.months_count,
                    installment.down_payment || 0,
                    installment.additional_payment || 0,
                    installment.monthly_amount,
                    installment.total_paid || 0,
                    installment.remaining_amount,
                    'active'
                ]
            });
        }

        return await ipcRenderer.invoke('db-transaction', queries);
    },

    /**
     * الحصول على فاتورة بالتفاصيل
     * @param {number} id - معرف الفاتورة
     * @returns {Promise<Object|null>} - بيانات الفاتورة
     */
    getById: async (id) => {
        const invoiceResult = await ipcRenderer.invoke('db-query', {
            sql: 'SELECT * FROM invoices WHERE id = ?',
            params: [id]
        });

        if (!invoiceResult.success || invoiceResult.data.length === 0) {
            return null;
        }

        const invoice = invoiceResult.data[0];

        const itemsResult = await ipcRenderer.invoke('db-query', {
            sql: 'SELECT * FROM invoice_items WHERE invoice_id = ?',
            params: [id]
        });

        invoice.items = itemsResult.success ? itemsResult.data : [];

        // إذا كانت فاتورة أقساط، جلب بيانات الأقساط
        if (invoice.payment_type === 'installment') {
            const installmentResult = await ipcRenderer.invoke('db-query', {
                sql: 'SELECT * FROM installments WHERE invoice_id = ?',
                params: [id]
            });
            invoice.installment = installmentResult.success && installmentResult.data.length > 0 
                ? installmentResult.data[0] 
                : null;
        }

        return invoice;
    },

    /**
     * الحصول على فواتير اليوم
     * @returns {Promise<Array>} - قائمة الفواتير
     */
    getToday: async () => {
        const result = await ipcRenderer.invoke('db-query', {
            sql: `SELECT * FROM invoices 
                  WHERE DATE(created_at) = DATE('now') 
                  ORDER BY created_at DESC`,
            params: []
        });
        return result.success ? result.data : [];
    },

    /**
     * البحث عن فواتير
     * @param {Object} filters - معايير البحث
     * @returns {Promise<Array>} - قائمة الفواتير
     */
    search: async (filters) => {
        let sql = 'SELECT * FROM invoices WHERE 1=1';
        const params = [];

        if (filters.dateFrom) {
            sql += ' AND DATE(created_at) >= ?';
            params.push(filters.dateFrom);
        }
        if (filters.dateTo) {
            sql += ' AND DATE(created_at) <= ?';
            params.push(filters.dateTo);
        }
        if (filters.invoiceNumber) {
            sql += ' AND invoice_number LIKE ?';
            params.push(`%${filters.invoiceNumber}%`);
        }
        if (filters.customerPhone) {
            sql += ' AND customer_phone LIKE ?';
            params.push(`%${filters.customerPhone}%`);
        }
        if (filters.paymentType) {
            sql += ' AND payment_type = ?';
            params.push(filters.paymentType);
        }

        sql += ' ORDER BY created_at DESC';

        const result = await ipcRenderer.invoke('db-query', { sql, params });
        return result.success ? result.data : [];
    }
});

/**
 * واجهة مساعدة للأقساط
 */
contextBridge.exposeInMainWorld('installmentsDB', {
    /**
     * الحصول على جميع الأقساط النشطة
     * @returns {Promise<Array>} - قائمة الأقساط
     */
    getActive: async () => {
        const result = await ipcRenderer.invoke('db-query', {
            sql: `SELECT i.*, inv.invoice_number, inv.customer_name, inv.customer_phone
                  FROM installments i
                  JOIN invoices inv ON i.invoice_id = inv.id
                  WHERE i.status = 'active'
                  ORDER BY i.created_at DESC`,
            params: []
        });
        return result.success ? result.data : [];
    },

    /**
     * الحصول على تفاصيل قسط
     * @param {number} id - معرف القسط
     * @returns {Promise<Object|null>} - بيانات القسط
     */
    getById: async (id) => {
        const result = await ipcRenderer.invoke('db-query', {
            sql: `SELECT i.*, inv.invoice_number, inv.customer_name, inv.customer_phone, inv.customer_address
                  FROM installments i
                  JOIN invoices inv ON i.invoice_id = inv.id
                  WHERE i.id = ?`,
            params: [id]
        });
        return result.success && result.data.length > 0 ? result.data[0] : null;
    },

    /**
     * الحصول على دفعات القسط
     * @param {number} installmentId - معرف القسط
     * @returns {Promise<Array>} - قائمة الدفعات
     */
    getPayments: async (installmentId) => {
        const result = await ipcRenderer.invoke('db-query', {
            sql: 'SELECT * FROM installment_payments WHERE installment_id = ? ORDER BY payment_number',
            params: [installmentId]
        });
        return result.success ? result.data : [];
    }
});

// تسجيل رسالة في Console للتأكد من تحميل preload.js
console.log('✅ Preload script loaded successfully - نظام نقاط البيع المتقدم v2.0');