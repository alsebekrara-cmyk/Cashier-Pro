# سكريبت تنزيل مكتبات Firebase محلياً
# Download Firebase Libraries Script
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  تنزيل مكتبات Firebase المحلية" -ForegroundColor Yellow
Write-Host "  Firebase Local Download Script" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# إنشاء مجلد firebase
Write-Host "1️⃣ إنشاء مجلد firebase..." -ForegroundColor Green
$firebaseDir = "firebase"
if (-not (Test-Path $firebaseDir)) {
    New-Item -ItemType Directory -Force -Path $firebaseDir | Out-Null
    Write-Host "   ✅ تم إنشاء المجلد: $firebaseDir" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  المجلد موجود مسبقاً: $firebaseDir" -ForegroundColor Yellow
}
Write-Host ""

# قائمة الملفات المطلوبة
$files = @(
    @{
        Name = "firebase-app.js"
        Url = "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"
        Description = "Firebase Core"
    },
    @{
        Name = "firebase-database.js"
        Url = "https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"
        Description = "Firebase Realtime Database"
    },
    @{
        Name = "firebase-firestore.js"
        Url = "https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js"
        Description = "Firebase Firestore"
    }
)

$downloadedCount = 0
$failedCount = 0

# تنزيل كل ملف
foreach ($file in $files) {
    Write-Host "2️⃣ تنزيل: $($file.Description)..." -ForegroundColor Green
    Write-Host "   📥 من: $($file.Url)" -ForegroundColor Gray
    
    $outputPath = Join-Path $firebaseDir $file.Name
    
    try {
        # محاولة التنزيل
        Invoke-WebRequest -Uri $file.Url -OutFile $outputPath -UseBasicParsing
        
        # التحقق من حجم الملف
        $fileSize = (Get-Item $outputPath).Length
        $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
        
        if ($fileSize -gt 1000) {
            Write-Host "   ✅ تم التنزيل بنجاح: $outputPath ($fileSizeKB KB)" -ForegroundColor Green
            $downloadedCount++
        } else {
            Write-Host "   ⚠️  الملف صغير جداً، قد يكون هناك خطأ" -ForegroundColor Red
            $failedCount++
        }
    } catch {
        Write-Host "   ❌ فشل التنزيل: $($_.Exception.Message)" -ForegroundColor Red
        $failedCount++
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "النتيجة النهائية:" -ForegroundColor Yellow
Write-Host "  ✅ ملفات ناجحة: $downloadedCount" -ForegroundColor Green
Write-Host "  ❌ ملفات فاشلة: $failedCount" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($downloadedCount -eq 3) {
    Write-Host "🎉 رائع! تم تنزيل جميع الملفات بنجاح!" -ForegroundColor Green
    Write-Host ""
    Write-Host "الخطوات التالية:" -ForegroundColor Yellow
    Write-Host "1️⃣  افتح index.html" -ForegroundColor White
    Write-Host "2️⃣  ابحث عن:" -ForegroundColor White
    Write-Host '    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>' -ForegroundColor Gray
    Write-Host "3️⃣  استبدل بـ:" -ForegroundColor White
    Write-Host '    <script src="./firebase/firebase-app.js"></script>' -ForegroundColor Gray
    Write-Host "4️⃣  كرر نفس الشيء للملفات الأخرى" -ForegroundColor White
    Write-Host "5️⃣  شغل: npm run build-win" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 راجع ملف FIREBASE_FIX_GUIDE.md للتفاصيل الكاملة" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  بعض الملفات فشلت في التنزيل" -ForegroundColor Red
    Write-Host ""
    Write-Host "الحلول البديلة:" -ForegroundColor Yellow
    Write-Host "1️⃣  تحقق من اتصال الإنترنت" -ForegroundColor White
    Write-Host "2️⃣  جرب تنزيل الملفات يدوياً من المتصفح" -ForegroundColor White
    Write-Host "3️⃣  احفظ الملفات مباشرة من الروابط" -ForegroundColor White
    Write-Host ""
    Write-Host "الروابط المباشرة:" -ForegroundColor Cyan
    foreach ($file in $files) {
        Write-Host "  • $($file.Url)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "اضغط أي مفتاح للخروج..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
