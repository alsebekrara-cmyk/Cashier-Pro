/**
 * Preload script for Electron
 * يتم تحميله قبل تحميل صفحة التطبيق الرئيسية
 */

const { contextBridge, ipcRenderer } = require('electron');

// تعريض واجهات برمجية آمنة للصفحة الرئيسية
contextBridge.exposeInMainWorld('electronAPI', {
    // الطباعة
    printSilent: (options) => ipcRenderer.send('print-silent', options),
    printPreview: () => ipcRenderer.send('print-preview'),
    printToPDF: (options) => ipcRenderer.send('print-to-pdf', options),
    getPrinters: () => ipcRenderer.send('get-printers'),
    printToPrinter: (printerName, options) => ipcRenderer.send('print-to-printer', { printerName, options }),
    
    // الاستماع للردود
    onPrintResult: (callback) => ipcRenderer.on('print-result', (event, result) => callback(result)),
    onPDFResult: (callback) => ipcRenderer.on('pdf-result', (event, result) => callback(result)),
    onPrintersList: (callback) => ipcRenderer.on('printers-list', (event, printers) => callback(printers)),
    
    // معلومات النظام
    platform: process.platform,
    version: process.versions.electron
});
