// firebase-config.js - Enhanced Production-Ready Version
// ====================================
// نسخة محسّنة جاهزة للإنتاج - تعمل في جميع البيئات
// Production-ready version - Works in all environments

(function() {
    'use strict';
    
    // ========================================
    // المتغيرات العامة
    // ========================================
    
    const MAX_INIT_ATTEMPTS = 10;
    const CHECK_INTERVAL = 500; // ms
    const CONNECTION_TIMEOUT = 15000; // 15 seconds
    
    let initAttempts = 0;
    let initializationInProgress = false;
    let initializationComplete = false;
    
    // ========================================
    // دالة التهيئة الرئيسية
    // ========================================
    
    function initializeFirebase() {
        // تجنب التهيئة المكررة
        if (initializationInProgress || initializationComplete) {
            console.log('ℹ️ Firebase initialization already in progress or complete');
            return;
        }
        
        initializationInProgress = true;
        console.log('🔄 Starting Firebase initialization...');
        
        // التحقق من تحميل Firebase SDK
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK not loaded!');
            handleFirebaseLoadError();
            return;
        }
        
        // إعدادات Firebase - يجب تحديثها بإعداداتك
        const firebaseConfig = {
            apiKey: "AIzaSyAR2O4-gyRWrGaiwXGc--Ynk0I3KLe21sw",
            authDomain: "cashier-pro-bed2b.firebaseapp.com",
            databaseURL: "https://cashier-pro-bed2b-default-rtdb.firebaseio.com",
            projectId: "cashier-pro-bed2b",
            storageBucket: "cashier-pro-bed2b.appspot.com",
            messagingSenderId: "289864279537",
            appId: "1:289864279537:web:46d5aed72ff2369d32d050",
            measurementId: "G-5D0YEB59EY"
        };
        
        try {
            // تهيئة Firebase App
            if (!firebase.apps || firebase.apps.length === 0) {
                firebase.initializeApp(firebaseConfig);
                console.log('✅ Firebase app initialized');
            } else {
                console.log('✅ Firebase app already exists');
            }
            
            // تهيئة Database
            if (typeof firebase.database === 'function') {
                window.database = firebase.database();
                console.log('✅ Firebase Realtime Database initialized');
            } else {
                throw new Error('Firebase Database SDK not available');
            }
            
            // تهيئة Firestore
            if (typeof firebase.firestore === 'function') {
                window.firestore = firebase.firestore();
                console.log('✅ Firebase Firestore initialized');
            } else {
                console.warn('⚠️ Firebase Firestore SDK not available');
            }
            
            // وضع علامة التهيئة الناجحة
            window.firebaseInitialized = true;
            initializationComplete = true;
            initializationInProgress = false;
            
            // اختبار الاتصال
            testFirebaseConnection();
            
            // إطلاق حدث التهيئة الناجحة
            window.dispatchEvent(new CustomEvent('firebase-initialized', {
                detail: { success: true }
            }));
            
            console.log('✅ Firebase initialization completed successfully');
            
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            initializationInProgress = false;
            handleFirebaseInitError(error);
        }
    }
    
    // ========================================
    // معالجة أخطاء التحميل
    // ========================================
    
    function handleFirebaseLoadError() {
        initializationInProgress = false;
        
        const errorMessage = 
            '⚠️ فشل تحميل Firebase SDK\n\n' +
            'الأسباب المحتملة:\n' +
            '1. ضعف اتصال الإنترنت\n' +
            '2. حظر الوصول إلى خدمات Firebase\n' +
            '3. خطأ في تحميل السكريبتات\n\n' +
            'الحلول:\n' +
            '• تحقق من اتصال الإنترنت\n' +
            '• أعد تشغيل التطبيق\n' +
            '• تواصل مع الدعم الفني';
        
        console.error(errorMessage);
        
        // عرض رسالة للمستخدم بعد تحميل الصفحة
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => showErrorAlert(errorMessage), 1000);
            });
        } else {
            setTimeout(() => showErrorAlert(errorMessage), 1000);
        }
    }
    
    function handleFirebaseInitError(error) {
        const errorMessage = 
            '⚠️ فشل في تهيئة قاعدة البيانات\n\n' +
            `الخطأ: ${error.message}\n\n` +
            'الحلول:\n' +
            '• تحقق من صحة إعدادات Firebase\n' +
            '• تأكد من اتصال الإنترنت\n' +
            '• أعد تشغيل التطبيق';
        
        console.error(errorMessage);
        
        // عرض رسالة للمستخدم
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => showErrorAlert(errorMessage), 1000);
            });
        } else {
            setTimeout(() => showErrorAlert(errorMessage), 1000);
        }
        
        // إطلاق حدث الفشل
        window.dispatchEvent(new CustomEvent('firebase-init-failed', {
            detail: { error: error.message }
        }));
    }
    
    function showErrorAlert(message) {
        // محاولة استخدام نظام Toast إذا كان متوفراً
        if (typeof window.showToast === 'function') {
            window.showToast('فشل الاتصال بقاعدة البيانات', 'error');
        }
        // وإلا عرض Alert
        alert(message);
    }
    
    // ========================================
    // اختبار الاتصال
    // ========================================
    
    function testFirebaseConnection() {
        if (!window.database) {
            console.warn('⚠️ Database not initialized, skipping connection test');
            return;
        }
        
        const testRef = window.database.ref('.info/connected');
        const connectionTimeout = setTimeout(() => {
            console.warn('⚠️ Firebase connection test timed out');
        }, CONNECTION_TIMEOUT);
        
        testRef.on('value', (snapshot) => {
            clearTimeout(connectionTimeout);
            
            if (snapshot.val() === true) {
                console.log('✅ Firebase connected to server');
                window.firebaseConnected = true;
                
                // إطلاق حدث الاتصال الناجح
                window.dispatchEvent(new CustomEvent('firebase-connected', {
                    detail: { connected: true }
                }));
            } else {
                console.warn('⚠️ Firebase offline - working in offline mode');
                window.firebaseConnected = false;
            }
        });
    }
    
    // ========================================
    // دوال المساعدة
    // ========================================
    
    /**
     * التحقق من جاهزية Firebase
     */
    window.isFirebaseReady = function() {
        return (
            typeof firebase !== 'undefined' &&
            firebase.apps &&
            firebase.apps.length > 0 &&
            typeof window.database !== 'undefined' &&
            window.firebaseInitialized === true
        );
    };
    
    /**
     * الانتظار حتى يصبح Firebase جاهزاً
     */
    window.waitForFirebase = function(callback, maxAttempts = 30) {
        if (!callback || typeof callback !== 'function') {
            console.error('❌ waitForFirebase requires a callback function');
            return;
        }
        
        let attempts = 0;
        
        const checkInterval = setInterval(() => {
            attempts++;
            
            if (window.isFirebaseReady()) {
                clearInterval(checkInterval);
                console.log(`✅ Firebase ready after ${attempts} attempts`);
                callback(true);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error(`❌ Firebase not ready after ${maxAttempts} attempts`);
                callback(false);
            }
        }, CHECK_INTERVAL);
    };
    
    /**
     * إعادة محاولة التهيئة
     */
    window.retryFirebaseInit = function() {
        if (initAttempts >= MAX_INIT_ATTEMPTS) {
            console.error('❌ Maximum initialization attempts reached');
            return false;
        }
        
        initAttempts++;
        console.log(`🔄 Retry attempt ${initAttempts}/${MAX_INIT_ATTEMPTS}`);
        
        initializationInProgress = false;
        initializationComplete = false;
        window.firebaseInitialized = false;
        
        setTimeout(initializeFirebase, 2000);
        return true;
    };
    
    /**
     * الحصول على حالة Firebase
     */
    window.getFirebaseStatus = function() {
        return {
            sdkLoaded: typeof firebase !== 'undefined',
            initialized: window.firebaseInitialized === true,
            databaseReady: typeof window.database !== 'undefined',
            firestoreReady: typeof window.firestore !== 'undefined',
            connected: window.firebaseConnected === true,
            appsCount: firebase?.apps?.length || 0
        };
    };
    
    // ========================================
    // بدء التهيئة
    // ========================================
    
    // التهيئة الفورية إذا كان Firebase محملاً
    if (typeof firebase !== 'undefined') {
        initializeFirebase();
    } else {
        // الانتظار لتحميل Firebase
        console.log('⏳ Waiting for Firebase SDK to load...');
        
        let waitAttempts = 0;
        const waitInterval = setInterval(() => {
            waitAttempts++;
            
            if (typeof firebase !== 'undefined') {
                clearInterval(waitInterval);
                console.log(`✅ Firebase SDK loaded after ${waitAttempts} checks`);
                initializeFirebase();
            } else if (waitAttempts >= 20) {
                clearInterval(waitInterval);
                console.error('❌ Firebase SDK failed to load after 20 attempts');
                handleFirebaseLoadError();
            }
        }, 500);
    }
    
    // ========================================
    // معلومات التصحيح (Development Mode)
    // ========================================
    
    if (typeof window !== 'undefined') {
        // عرض معلومات التصحيح بعد 3 ثواني
        setTimeout(() => {
            const status = window.getFirebaseStatus();
            console.group('🔍 Firebase Debug Info');
            console.log('SDK Loaded:', status.sdkLoaded);
            console.log('Initialized:', status.initialized);
            console.log('Database Ready:', status.databaseReady);
            console.log('Firestore Ready:', status.firestoreReady);
            console.log('Connected:', status.connected);
            console.log('Apps Count:', status.appsCount);
            console.log('Ready:', window.isFirebaseReady());
            console.groupEnd();
        }, 3000);
    }
    
    console.log('📦 Firebase config module loaded successfully');
    
})();