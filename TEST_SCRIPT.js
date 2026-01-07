/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧪 سكريبت اختبار نظام إدارة المصاريف
 * استخدم هذا السكريبت للتحقق من عمل جميع الوظائف
 * ═══════════════════════════════════════════════════════════════════
 * 
 * كيفية الاستخدام:
 * 1. افتح Console في المتصفح (اضغط F12)
 * 2. انسخ هذا الكود بالكامل
 * 3. الصقه في Console واضغط Enter
 * 4. شاهد النتائج
 */

(function() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🧪 بدء اختبار نظام إدارة المصاريف');
    console.log('═══════════════════════════════════════════════════════════════');
    
    let passedTests = 0;
    let failedTests = 0;
    
    function test(name, condition) {
        if (condition) {
            console.log(`✅ PASS: ${name}`);
            passedTests++;
        } else {
            console.error(`❌ FAIL: ${name}`);
            failedTests++;
        }
    }
    
    // اختبار وجود الوظائف الأساسية
    console.log('\n📋 اختبار الوظائف الأساسية:');
    console.log('─────────────────────────────────────────────────────────────');
    
    test('showAddExpenseModal موجودة', typeof window.showAddExpenseModal === 'function');
    test('closeAddExpenseModal موجودة', typeof window.closeAddExpenseModal === 'function');
    test('showAddPurchaseModal موجودة', typeof window.showAddPurchaseModal === 'function');
    test('closeAddPurchaseModal موجودة', typeof window.closeAddPurchaseModal === 'function');
    test('switchExpenseTab موجودة', typeof window.switchExpenseTab === 'function');
    
    // اختبار وظائف الحفظ والتحميل
    console.log('\n💾 اختبار وظائف الحفظ والتحميل:');
    console.log('─────────────────────────────────────────────────────────────');
    
    test('saveExpense موجودة', typeof window.saveExpense === 'function');
    test('deleteExpense موجودة', typeof window.deleteExpense === 'function');
    test('loadExpenses موجودة', typeof window.loadExpenses === 'function');
    test('savePurchase موجودة', typeof window.savePurchase === 'function');
    test('loadPurchases موجودة', typeof window.loadPurchases === 'function');
    
    // اختبار وظائف الدفع الجزئي
    console.log('\n💰 اختبار وظائف الدفع الجزئي:');
    console.log('─────────────────────────────────────────────────────────────');
    
    test('updateExpensePaidRemaining موجودة', typeof window.updateExpensePaidRemaining === 'function');
    
    // اختبار وظائف المشتريات
    console.log('\n🛒 اختبار وظائف المشتريات:');
    console.log('─────────────────────────────────────────────────────────────');
    
    test('addPurchaseItem موجودة', typeof window.addPurchaseItem === 'function');
    test('removePurchaseItem موجودة', typeof window.removePurchaseItem === 'function');
    test('updatePurchaseTotal موجودة', typeof window.updatePurchaseTotal === 'function');
    
    // اختبار وظائف الإحصائيات
    console.log('\n📊 اختبار وظائف الإحصائيات:');
    console.log('─────────────────────────────────────────────────────────────');
    
    test('updateExpensesStats موجودة', typeof window.updateExpensesStats === 'function');
    test('updateExpensesReports موجودة', typeof window.updateExpensesReports === 'function');
    
    // اختبار وظائف العرض والتعديل
    console.log('\n👁️ اختبار وظائف العرض والتعديل:');
    console.log('─────────────────────────────────────────────────────────────');
    
    test('viewExpenseDetails موجودة', typeof window.viewExpenseDetails === 'function');
    test('editExpense موجودة', typeof window.editExpense === 'function');
    test('viewPurchaseDetails موجودة', typeof window.viewPurchaseDetails === 'function');
    
    // اختبار وجود العناصر في DOM
    console.log('\n🎨 اختبار عناصر الواجهة:');
    console.log('─────────────────────────────────────────────────────────────');
    
    test('نافذة addExpenseModal موجودة', !!document.getElementById('addExpenseModal'));
    test('نافذة addPurchaseModal موجودة', !!document.getElementById('addPurchaseModal'));
    test('جدول generalExpensesTableBody موجود', !!document.getElementById('generalExpensesTableBody'));
    test('جدول purchasesTableBody موجود', !!document.getElementById('purchasesTableBody'));
    
    // اختبار حقول الدفع الجزئي
    console.log('\n💵 اختبار حقول الدفع الجزئي:');
    console.log('─────────────────────────────────────────────────────────────');
    
    test('حقل expenseAmount موجود', !!document.getElementById('expenseAmount'));
    test('حقل expensePaid موجود', !!document.getElementById('expensePaid'));
    test('حقل expenseRemaining موجود', !!document.getElementById('expenseRemaining'));
    
    // اختبار بطاقات الإحصائيات
    console.log('\n📈 اختبار بطاقات الإحصائيات:');
    console.log('─────────────────────────────────────────────────────────────');
    
    test('بطاقة totalExpensesAmount موجودة', !!document.getElementById('totalExpensesAmount'));
    test('بطاقة totalPaidAmount موجودة', !!document.getElementById('totalPaidAmount'));
    test('بطاقة totalRemainingAmount موجودة', !!document.getElementById('totalRemainingAmount'));
    test('بطاقة totalPurchasesAmount موجودة', !!document.getElementById('totalPurchasesAmount'));
    
    // النتائج النهائية
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📊 ملخص النتائج:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`✅ الاختبارات الناجحة: ${passedTests}`);
    console.log(`❌ الاختبارات الفاشلة: ${failedTests}`);
    console.log(`📊 المجموع: ${passedTests + failedTests}`);
    console.log(`📈 نسبة النجاح: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(2)}%`);
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (failedTests === 0) {
        console.log('🎉 تهانينا! جميع الاختبارات نجحت!');
        console.log('✅ النظام جاهز للاستخدام');
    } else {
        console.warn('⚠️ بعض الاختبارات فشلت!');
        console.warn('📝 راجع الأخطاء أعلاه وتأكد من:');
        console.warn('   1. استبدال ملف expenses-system.js');
        console.warn('   2. إعادة تحميل الصفحة (Ctrl+Shift+R)');
        console.warn('   3. مسح الـ cache');
    }
    
    console.log('\n💡 للاختبار اليدوي:');
    console.log('   1. جرب فتح نافذة إضافة مصروف');
    console.log('   2. جرب فتح نافذة إضافة فاتورة مشتريات');
    console.log('   3. جرب التبديل بين التبويبات');
    console.log('   4. جرب إضافة مصروف بدفع جزئي');
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('شركة الإبداع الرقمي - Digital Creativity Company');
    console.log('© 2025 جميع الحقوق محفوظة');
    console.log('═══════════════════════════════════════════════════════════════');
    
    // إرجاع النتائج
    return {
        passed: passedTests,
        failed: failedTests,
        total: passedTests + failedTests,
        success: failedTests === 0,
        percentage: ((passedTests / (passedTests + failedTests)) * 100).toFixed(2)
    };
})();
