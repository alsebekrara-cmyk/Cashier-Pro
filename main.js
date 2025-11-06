const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;
let splashWindow;

// إنشاء نافذة التطبيق الرئيسية
function createMainWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    mainWindow = new BrowserWindow({
        width: Math.floor(width * 0.9),
        height: Math.floor(height * 0.9),
        minWidth: 1024,
        minHeight: 768,
        center: true,
        show: false, // لا تظهر حتى تصبح جاهزة
        backgroundColor: '#0f172a',
        icon: path.join(__dirname, 'build/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            devTools: true
        },
        frame: false,
        titleBarStyle: 'hidden',
        autoHideMenuBar: true,
        resizable: true,
        maximizable: true,
        fullscreenable: true
    });

    // تحميل ملف التطبيق الرئيسي
    mainWindow.loadFile('index.html');

    // إظهار النافذة عند الجاهزية
    mainWindow.once('ready-to-show', () => {
        // إغلاق شاشة الترحيب
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.close();
        }
        
        // إظهار النافذة الرئيسية
        mainWindow.show();
        mainWindow.focus();
        
        // فتح أدوات المطور في وضع التطوير
        if (process.env.NODE_ENV === 'development') {
            mainWindow.webContents.openDevTools();
        }
    });

    // عند إغلاق النافذة
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // التعامل مع الطباعة
    setupPrintHandlers();
    
    // إضافة معالجات أزرار التحكم
    setupWindowControls(mainWindow);
}

// معالجات أزرار التحكم في النافذة
function setupWindowControls(window) {
    const { ipcMain } = require('electron');
    
    ipcMain.on('window-minimize', () => {
        if (window) window.minimize();
    });
    
    ipcMain.on('window-maximize', () => {
        if (window) {
            if (window.isMaximized()) {
                window.unmaximize();
            } else {
                window.maximize();
            }
        }
    });
    
    ipcMain.on('window-close', () => {
        if (window) window.close();
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

    // إغلاق شاشة الترحيب بعد 4 ثواني أو عند اكتمال التحميل
    setTimeout(() => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            createMainWindow();
        }
    }, 4000);
}

// إعداد معالجات الطباعة
function setupPrintHandlers() {
    // الطباعة الصامتة (مباشرة)
    ipcMain.on('print-silent', (event, options) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        
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
            copies: 1,
            pageSize: options.pageSize || { width: 80000, height: 200000 }, // ميكرون
            ...options
        };

        win.webContents.print(printOptions, (success, failureReason) => {
            if (!success) {
                console.error('فشل الطباعة:', failureReason);
                event.reply('print-result', { success: false, error: failureReason });
            } else {
                event.reply('print-result', { success: true });
            }
        });
    });

    // الطباعة مع معاينة
    ipcMain.on('print-preview', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        win.webContents.print({ silent: false, printBackground: true });
    });

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
        const win = BrowserWindow.fromWebContents(event.sender);
        
        const printOptions = {
            silent: true,
            printBackground: true,
            deviceName: printerName,
            color: false,
            margins: {
                marginType: 'none'
            },
            ...options
        };

        win.webContents.print(printOptions, (success, failureReason) => {
            if (!success) {
                console.error('فشل الطباعة على', printerName, ':', failureReason);
                event.reply('print-result', { success: false, error: failureReason });
            } else {
                event.reply('print-result', { success: true });
            }
        });
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
    if (process.platform !== 'darwin') {
        app.quit();
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
    console.error('خطأ غير متوقع:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Promise غير معالج:', error);
});
