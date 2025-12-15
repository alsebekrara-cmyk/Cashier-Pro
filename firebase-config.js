// firebase-config.js
// ضع هذا الملف في نفس مجلد index.html و admin.html
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// تجنب التعريف المكرر
if (typeof window.firebaseInitialized === 'undefined') {
    const firebaseConfig = {
      apiKey: "AIzaSyAR2O4-gyRWrGaiwXGc--Ynk0I3KLe21sw",
      authDomain: "cashier-pro-bed2b.firebaseapp.com",
      databaseURL: "https://cashier-pro-bed2b-default-rtdb.firebaseio.com",
      projectId: "cashier-pro-bed2b",
      storageBucket: "cashier-pro-bed2b.firebasestorage.app",
      messagingSenderId: "289864279537",
      appId: "1:289864279537:web:46d5aed72ff2369d32d050",
      measurementId: "G-5D0YEB59EY"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    } else {
      firebase.app(); // إذا كان مهيأ مسبقاً
    }
    
    window.database = firebase.database();
    window.firestore = firebase.firestore();
    window.firebaseInitialized = true;
    console.log('✅ Firebase initialized successfully');
} else {
    console.log('ℹ️ Firebase already initialized, skipping...');
}
