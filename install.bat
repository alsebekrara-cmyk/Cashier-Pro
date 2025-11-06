@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   نظام نقاط البيع - تثبيت المكتبات
echo   شركة الإبداع الرقمي
echo ========================================
echo.

echo [1/3] التحقق من Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js غير مثبت!
    echo.
    echo يرجى تحميل وتثبيت Node.js من:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

node --version
echo ✅ Node.js مثبت بنجاح
echo.

echo [2/3] التحقق من npm...
npm --version
echo ✅ npm جاهز
echo.

echo [3/3] تثبيت المكتبات...
echo هذا قد يستغرق 5-10 دقائق...
echo.

call npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ فشل تثبيت المكتبات!
    echo.
    echo حاول:
    echo 1. تحقق من اتصال الإنترنت
    echo 2. شغّل الأمر كمسؤول
    echo 3. احذف مجلد node_modules وأعد المحاولة
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ تم تثبيت جميع المكتبات بنجاح!
echo ========================================
echo.
echo يمكنك الآن:
echo 1. تشغيل التطبيق: npm start
echo 2. بناء التطبيق: npm run build-win
echo.
pause
