/**
 * Preload script for Electron - نظام نقاط البيع المتقدم
 * يتم تحميله قبل تحميل صفحة التطبيق الرئيسية
 * يوفر واجهات برمجية آمنة للصفحة الرئيسية
 */

const { contextBridge, ipcRenderer } = require('electron');

// تعريض واجهات برمجية آمنة للصفحة الرئيسية
contextBridge.exposeInMainWorld('electronAPI', {
    
    // ==================== واجهات الطباعة - محدث ====================
    
    /**
     * الحصول على قائمة الطابعات المتاحة
     * @returns {Promise<Array>} - قائمة الطابعات
     */
    getPrinters: async () => {
        try {
            const result = await ipcRenderer.invoke('get-printers');
            if (result.success) {
                return result.printers || [];
            }
            return [];
        } catch (error) {
            console.error('خطأ في الحصول على الطابعات:', error);
            return [];
        }
    },

    /**
     * طباعة صامتة
     * @param {string} html - محتوى HTML
     * @param {string} printerName - اسم الطابعة (اختياري)
     * @param {Object} options - خيارات إضافية
     * @returns {Promise<Object>} - نتيجة الطباعة
     */
    printSilent: async (html, printerName = '', options = {}) => {
        try {
            return await ipcRenderer.invoke('print-silent', { html, printerName, options });
        } catch (error) {
            console.error('خطأ في الطباعة الصامتة:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * طباعة مع معاينة
     */
    printPreview: () => {
        ipcRenderer.send('print-preview');
    },

    /**
     * طباعة إلى PDF
     */
    printToPDF: (options) => {
        ipcRenderer.send('print-to-pdf', options);
    },

    /**
     * طباعة HTML مخصص (فاتورة)
     */
    printInvoiceHtml: (html, options = {}) => {
        ipcRenderer.send('print-invoice-html', { html, ...options });
    },

    /**
     * الحصول على إعدادات الطابعة الافتراضية
     */
    getDefaultPrinter: () => {
        ipcRenderer.send('get-default-printer');
    },

    /**
     * حفظ إعدادات الطابعة
     */
    savePrinterSettings: (settings) => {
        ipcRenderer.send('save-printer-settings', settings);
    },

    /**
     * تبديل وضع الطباعة الصامتة
     */
    toggleSilentPrint: (enabled) => {
        ipcRenderer.send('toggle-silent-print', enabled);
    },

    // ==================== معالجات الاستماع للطباعة ====================
    
    /**
     * الاستماع لنتيجة الطباعة
     */
    onPrintResult: (callback) => {
        const handler = (event, result) => callback(result);
        ipcRenderer.on('print-result', handler);
        return () => ipcRenderer.removeListener('print-result', handler);
    },

    /**
     * الاستماع لقائمة الطابعات
     */
    onPrintersList: (callback) => {
        const handler = (event, printers) => callback(printers);
        ipcRenderer.on('printers-list', handler);
        return () => ipcRenderer.removeListener('printers-list', handler);
    },

    /**
     * الاستماع للطابعة الافتراضية
     */
    onDefaultPrinter: (callback) => {
        const handler = (event, printer) => callback(printer);
        ipcRenderer.on('default-printer', handler);
        return () => ipcRenderer.removeListener('default-printer', handler);
    },

    // ==================== واجهات قاعدة البيانات ====================
    
    /**
     * تنفيذ استعلام SQL (SELECT)
     */
    dbQuery: async (sql, params = []) => {
        return await ipcRenderer.invoke('db-query', { sql, params });
    },

    /**
     * تنفيذ أمر SQL (INSERT/UPDATE/DELETE)
     */
    dbRun: async (sql, params = []) => {
        return await ipcRenderer.invoke('db-run', { sql, params });
    },

    /**
     * تنفيذ معاملة (Transaction)
     */
    dbTransaction: async (queries) => {
        return await ipcRenderer.invoke('db-transaction', queries);
    },

    /**
     * نسخ احتياطي لقاعدة البيانات
     */
    dbBackup: async () => {
        return await ipcRenderer.invoke('db-backup');
    },

    /**
     * استعادة نسخة احتياطية
     */
    dbRestore: async (backupPath) => {
        return await ipcRenderer.invoke('db-restore', backupPath);
    },

    /**
     * إحصائيات قاعدة البيانات
     */
    dbStats: async () => {
        return await ipcRenderer.invoke('db-stats');
    },

    // ==================== واجهات النظام ====================
    
    /**
     * الحصول على مسار البيانات
     */
    getAppPath: () => {
        return ipcRenderer.sendSync('get-app-path');
    },

    /**
     * فتح مجلد
     */
    openFolder: (folderPath) => {
        ipcRenderer.send('open-folder', folderPath);
    },

    /**
     * فتح ملف
     */
    openFile: (filePath) => {
        ipcRenderer.send('open-file', filePath);
    },

    /**
     * حفظ ملف
     */
    saveFile: async (content, defaultPath, filters = []) => {
        return await ipcRenderer.invoke('save-file', { content, defaultPath, filters });
    },

    /**
     * اختيار ملف
     */
    selectFile: async (filters = []) => {
        return await ipcRenderer.invoke('select-file', { filters });
    },

    /**
     * إعادة تشغيل التطبيق
     */
    restartApp: () => {
        ipcRenderer.send('restart-app');
    },

    /**
     * إغلاق التطبيق
     */
    closeApp: () => {
        ipcRenderer.send('close-app');
    },

    /**
     * تصغير النافذة
     */
    minimizeWindow: () => {
        ipcRenderer.send('minimize-window');
    },

    /**
     * تكبير/استعادة النافذة
     */
    toggleMaximize: () => {
        ipcRenderer.send('toggle-maximize');
    },

    // ==================== الإشعارات ====================
    
    /**
     * إظهار إشعار
     */
    showNotification: (title, body, options = {}) => {
        ipcRenderer.send('show-notification', { title, body, ...options });
    },

    /**
     * الاستماع للإشعارات
     */
    onNotification: (callback) => {
        const handler = (event, notification) => callback(notification);
        ipcRenderer.on('notification', handler);
        return () => ipcRenderer.removeListener('notification', handler);
    }
});

console.log('✅ Preload script loaded successfully');
