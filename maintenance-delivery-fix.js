/**
 * ═══════════════════════════════════════════════════════════════════
 * 🔧 إصلاح نظام تسليم أجهزة الصيانة - FIX
 * شركة الإبداع الرقمي - كرار السعبري
 * ═══════════════════════════════════════════════════════════════════
 * 
 * المشكلة: زر "تسليم الجهاز" لا يعمل
 * السبب: دالة completeDelivery غير مصدرة إلى window scope
 * الحل: تصدير جميع دوال الصيانة المطلوبة
 */

console.log('🔧 بدء إصلاح نظام تسليم أجهزة الصيانة...');

// ═══════════════════════════════════════════════════════════════════
// التأكد من وجود البيانات الأساسية
// ═══════════════════════════════════════════════════════════════════

if (!window.maintenanceData) {
    window.maintenanceData = JSON.parse(localStorage.getItem('maintenanceData')) || [];
}

if (!window.deliveredDevicesData) {
    window.deliveredDevicesData = JSON.parse(localStorage.getItem('deliveredDevicesData')) || [];
}

// ═══════════════════════════════════════════════════════════════════
// دالة إكمال عملية التسليم - FIXED
// ═══════════════════════════════════════════════════════════════════

window.completeDelivery = function(event, maintenanceId) {
    console.log('📦 بدء عملية تسليم الجهاز...', maintenanceId);
    
    if (event) {
        event.preventDefault();
    }
    
    // البحث عن الجهاز
    const maintenanceIndex = window.maintenanceData.findIndex(m => m.id === maintenanceId);
    if (maintenanceIndex === -1) {
        console.error('❌ لم يتم العثور على الجهاز');
        if (typeof showNotification === 'function') {
            showNotification('خطأ: لم يتم العثور على الجهاز', 'error');
        } else {
            alert('خطأ: لم يتم العثور على الجهاز');
        }
        return;
    }
    
    const maintenanceItem = window.maintenanceData[maintenanceIndex];
    
    // التحقق من الحقول المطلوبة
    const actualDeliveryDateEl = document.getElementById('actualDeliveryDate');
    const receivedAmountEl = document.getElementById('receivedAmount');
    const paymentMethodEl = document.getElementById('paymentMethod');
    
    if (!actualDeliveryDateEl || !receivedAmountEl || !paymentMethodEl) {
        console.error('❌ لم يتم العثور على حقول النموذج');
        if (typeof showNotification === 'function') {
            showNotification('خطأ: حقول النموذج غير موجودة', 'error');
        } else {
            alert('خطأ: حقول النموذج غير موجودة');
        }
        return;
    }
    
    const actualDeliveryDate = actualDeliveryDateEl.value;
    const receivedAmount = parseFloat(receivedAmountEl.value);
    const paymentMethod = paymentMethodEl.value;
    
    // التحقق من القيم
    if (!actualDeliveryDate) {
        if (typeof showNotification === 'function') {
            showNotification('يرجى تحديد تاريخ التسليم', 'error');
        } else {
            alert('يرجى تحديد تاريخ التسليم');
        }
        actualDeliveryDateEl.focus();
        return;
    }
    
    if (!receivedAmount || receivedAmount < 0) {
        if (typeof showNotification === 'function') {
            showNotification('يرجى إدخال المبلغ المستلم', 'error');
        } else {
            alert('يرجى إدخال المبلغ المستلم');
        }
        receivedAmountEl.focus();
        return;
    }
    
    if (!paymentMethod) {
        if (typeof showNotification === 'function') {
            showNotification('يرجى اختيار طريقة الدفع', 'error');
        } else {
            alert('يرجى اختيار طريقة الدفع');
        }
        paymentMethodEl.focus();
        return;
    }
    
    // الحقول الاختيارية
    const receiverNameEl = document.getElementById('receiverName');
    const deliveryNotesEl = document.getElementById('deliveryNotes');
    
    const receiverName = receiverNameEl ? receiverNameEl.value : '';
    const deliveryNotes = deliveryNotesEl ? deliveryNotesEl.value : '';
    
    // إنشاء سجل جهاز مستلم
    const deliveredDevice = {
        id: Date.now(),
        maintenanceId: maintenanceId,
        productName: maintenanceItem.productName,
        companyName: maintenanceItem.companyName,
        fault: maintenanceItem.fault,
        maintenancePrice: maintenanceItem.price,
        usedParts: maintenanceItem.usedParts || [],
        partsTotal: maintenanceItem.partsTotal || 0,
        totalCost: maintenanceItem.price + (maintenanceItem.partsTotal || 0),
        receiveDate: maintenanceItem.receiveDate,
        expectedDeliveryDate: maintenanceItem.deliveryDate,
        actualDeliveryDate: actualDeliveryDate,
        receivedAmount: receivedAmount,
        paymentMethod: paymentMethod,
        receiverName: receiverName,
        deliveryNotes: deliveryNotes,
        causeInfo: maintenanceItem.causeInfo || '',
        notes: maintenanceItem.notes || '',
        deliveredBy: window.currentUser || 'Admin',
        deliveredDate: new Date().toISOString()
    };
    
    try {
        // إضافة إلى قائمة الأجهزة المستلمة
        window.deliveredDevicesData.push(deliveredDevice);
        localStorage.setItem('deliveredDevicesData', JSON.stringify(window.deliveredDevicesData));
        
        // حذف من قائمة الصيانة
        window.maintenanceData.splice(maintenanceIndex, 1);
        localStorage.setItem('maintenanceData', JSON.stringify(window.maintenanceData));
        
        console.log('✅ تم تسليم الجهاز بنجاح');
        
        // إغلاق النافذة
        if (typeof closeMaintenanceModal === 'function') {
            closeMaintenanceModal();
        } else if (typeof window.closeMaintenanceModal === 'function') {
            window.closeMaintenanceModal();
        } else {
            // إغلاق يدوي
            const modal = document.getElementById('deliveryModal');
            if (modal) modal.remove();
        }
        
        // تحديث العرض
        if (typeof displayMaintenanceData === 'function') {
            displayMaintenanceData();
        } else if (typeof window.displayMaintenanceData === 'function') {
            window.displayMaintenanceData();
        }
        
        // تحديث الإحصائيات
        if (typeof updateMaintenanceStats === 'function') {
            updateMaintenanceStats();
        } else if (typeof window.updateMaintenanceStats === 'function') {
            window.updateMaintenanceStats();
        }
        
        // عرض رسالة نجاح
        if (typeof showNotification === 'function') {
            showNotification('✅ تم تسليم الجهاز واستلام المبلغ بنجاح', 'success');
        } else if (typeof window.showNotification === 'function') {
            window.showNotification('✅ تم تسليم الجهاز واستلام المبلغ بنجاح', 'success');
        } else if (typeof window.showToast === 'function') {
            window.showToast('✅ تم تسليم الجهاز واستلام المبلغ بنجاح', 'success');
        } else {
            alert('✅ تم تسليم الجهاز واستلام المبلغ بنجاح');
        }
        
    } catch (error) {
        console.error('❌ خطأ في حفظ بيانات التسليم:', error);
        if (typeof showNotification === 'function') {
            showNotification('حدث خطأ أثناء حفظ بيانات التسليم', 'error');
        } else {
            alert('حدث خطأ أثناء حفظ بيانات التسليم: ' + error.message);
        }
    }
};

// ═══════════════════════════════════════════════════════════════════
// دالة فتح نافذة التسليم - FIXED
// ═══════════════════════════════════════════════════════════════════

window.showDeliveryModal = function(maintenanceItem) {
    console.log('📋 فتح نافذة تسليم الجهاز...', maintenanceItem.id);
    
    const totalCost = maintenanceItem.price + (maintenanceItem.partsTotal || 0);
    
    // دالة مساعدة لتنسيق العملة
    function formatCurrency(amount) {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' دينار';
    }
    
    // دالة مساعدة لتنسيق التاريخ
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-IQ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    const modalHTML = `
        <div class="modal active" id="deliveryModal" style="display: flex;">
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header" style="background: linear-gradient(135deg, #10b981, #059669); color: white;">
                    <h2><i class="fas fa-check-circle"></i> تسليم الجهاز واستلام المبلغ</h2>
                    <button class="close-btn" onclick="window.closeMaintenanceModal ? closeMaintenanceModal() : document.getElementById('deliveryModal').remove()" style="color: white;">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- معلومات الجهاز -->
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                        <h3 style="margin: 0 0 0.5rem 0; color: var(--primary-color);">${maintenanceItem.productName}</h3>
                        <div style="display: grid; gap: 0.5rem; font-size: 0.95rem;">
                            <div><i class="fas fa-building"></i> الشركة: <strong>${maintenanceItem.companyName}</strong></div>
                            <div><i class="fas fa-exclamation-triangle"></i> الخلل: <strong>${maintenanceItem.fault}</strong></div>
                            <div><i class="fas fa-calendar"></i> تاريخ الاستلام: <strong>${formatDate(maintenanceItem.receiveDate)}</strong></div>
                        </div>
                    </div>
                    
                    <!-- ملخص التكلفة -->
                    <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                        <div style="display: grid; gap: 0.75rem;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>سعر الصيانة:</span>
                                <strong style="font-size: 1.1rem;">${formatCurrency(maintenanceItem.price)}</strong>
                            </div>
                            ${maintenanceItem.usedParts && maintenanceItem.usedParts.length > 0 ? `
                            <div style="display: flex; justify-content: space-between;">
                                <span>قطع الغيار (${maintenanceItem.usedParts.length} قطعة):</span>
                                <strong style="font-size: 1.1rem;">${formatCurrency(maintenanceItem.partsTotal || 0)}</strong>
                            </div>` : ''}
                            <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 0.75rem; margin-top: 0.5rem;">
                                <div style="display: flex; justify-content: space-between; font-size: 1.3rem;">
                                    <span><i class="fas fa-money-bill-wave"></i> المبلغ الإجمالي:</span>
                                    <strong>${formatCurrency(totalCost)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <form id="deliveryForm">
                        <div class="form-group">
                            <label><i class="fas fa-calendar-check"></i> تاريخ التسليم الفعلي *</label>
                            <input type="date" id="actualDeliveryDate" class="form-control" required value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-group">
                            <label><i class="fas fa-money-bill"></i> المبلغ المستلم (دينار) *</label>
                            <input type="number" id="receivedAmount" class="form-control" required min="0" step="1000" value="${totalCost}" placeholder="${totalCost}">
                        </div>
                        
                        <div class="form-group">
                            <label><i class="fas fa-credit-card"></i> طريقة الدفع *</label>
                            <select id="paymentMethod" class="form-control" required>
                                <option value="cash">نقداً</option>
                                <option value="card">بطاقة</option>
                                <option value="transfer">تحويل بنكي</option>
                                <option value="mixed">مختلط</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label><i class="fas fa-user"></i> اسم المستلم</label>
                            <input type="text" id="receiverName" class="form-control" placeholder="اسم الشخص المستلم للجهاز">
                        </div>
                        
                        <div class="form-group">
                            <label><i class="fas fa-sticky-note"></i> ملاحظات التسليم</label>
                            <textarea id="deliveryNotes" class="form-control" rows="2" placeholder="أي ملاحظات عند التسليم..."></textarea>
                        </div>
                        
                        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                            <button type="button" class="btn btn-success" onclick="window.completeDelivery(event, ${maintenanceItem.id})" style="flex: 1;">
                                <i class="fas fa-check-circle"></i> تأكيد التسليم
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="window.closeMaintenanceModal ? closeMaintenanceModal() : document.getElementById('deliveryModal').remove()" style="flex: 1;">
                                <i class="fas fa-times"></i> إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // إزالة أي نافذة موجودة مسبقاً
    const existingModal = document.getElementById('deliveryModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('✅ تم فتح نافذة التسليم بنجاح');
};

// ═══════════════════════════════════════════════════════════════════
// دالة إتمام الصيانة وفتح نافذة التسليم - FIXED
// ═══════════════════════════════════════════════════════════════════

window.completeMaintenance = function(id) {
    console.log('🔄 إتمام الصيانة وفتح نافذة التسليم...', id);
    
    const item = window.maintenanceData.find(m => m.id === id);
    if (!item) {
        console.error('❌ لم يتم العثور على الجهاز');
        if (typeof showNotification === 'function') {
            showNotification('خطأ: لم يتم العثور على الجهاز', 'error');
        } else {
            alert('خطأ: لم يتم العثور على الجهاز');
        }
        return;
    }
    
    window.showDeliveryModal(item);
};

// ═══════════════════════════════════════════════════════════════════
// التأكد من تصدير الدوال الأخرى المطلوبة
// ═══════════════════════════════════════════════════════════════════

// تصدير closeMaintenanceModal إذا لم تكن موجودة
if (!window.closeMaintenanceModal) {
    window.closeMaintenanceModal = function() {
        const modal = document.getElementById('addMaintenanceModal') || 
                      document.getElementById('editMaintenanceModal') ||
                      document.getElementById('deliveryModal');
        if (modal) {
            modal.remove();
        }
        if (window.maintenanceUsedParts) {
            window.maintenanceUsedParts = [];
        }
    };
}

// ═══════════════════════════════════════════════════════════════════
// التحقق النهائي
// ═══════════════════════════════════════════════════════════════════

console.log('✅ تم إصلاح نظام تسليم أجهزة الصيانة بنجاح!');
console.log('📋 الدوال المصدرة:');
console.log('  - window.completeDelivery');
console.log('  - window.showDeliveryModal');
console.log('  - window.completeMaintenance');
console.log('  - window.closeMaintenanceModal');

// اختبار سريع
if (typeof window.completeDelivery === 'function' &&
    typeof window.showDeliveryModal === 'function' &&
    typeof window.completeMaintenance === 'function') {
    console.log('🎉 جميع الدوال جاهزة للاستخدام!');
} else {
    console.error('⚠️ تحذير: بعض الدوال غير متاحة');
}
