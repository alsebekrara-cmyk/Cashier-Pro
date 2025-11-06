@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   نظام نقاط البيع - تشغيل التطبيق
echo   شركة الإبداع الرقمي
echo ========================================
echo.

echo [1/1] تشغيل التطبيق...
echo.

if not exist "node_modules\" (
    echo ❌ المكتبات غير مثبتة!
    echo.
    echo يرجى تشغيل: install.bat
    echo.
    pause
    exit /b 1
)

call npm start

if %errorlevel% neq 0 (
    echo.
    echo ❌ فشل تشغيل التطبيق!
    echo.
    pause
    exit /b 1
)
