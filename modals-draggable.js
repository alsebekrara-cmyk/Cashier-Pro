/**
 * نظام النوافذ المنبثقة المحدث - نقاط البيع
 * شركة الإبداع الرقمي - كرار الشعبري
 * الميزات: قابلة للسحب + جدول منتجات في الديون
 */

(function() {
    'use strict';

    // ===== متغيرات عامة =====
    let debtProducts = [];
    let draggedModal = null;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    // ===== تهيئة النظام =====
    function initModalsSystem() {
        console.log('🚀 تهيئة نظام النوافذ المنبثقة المحدث...');
        
        // انتظار تحميل DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

    function init() {
        initDraggableModals();
        enhanceDebtModal();
        console.log('✅ تم تهيئة نظام النوافذ بنجاح');
    }

    // ===== جعل النوافذ قابلة للسحب =====
    function initDraggableModals() {
        // مراقبة إضافة نوافذ جديدة
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // فحص إذا كانت نافذة منبثقة
                        if (isModal(node)) {
                            makeDraggable(node);
                            centerModal(node);
                        }
                        
                        // فحص الأطفال
                        const modals = node.querySelectorAll('.modal, .debt-modal, .expense-modal, .purchase-modal');
                        modals.forEach(modal => {
                            makeDraggable(modal);
                            centerModal(modal);
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // معالجة النوافذ الموجودة
        const existingModals = document.querySelectorAll('.modal, .debt-modal, .expense-modal, .purchase-modal');
        existingModals.forEach(modal => {
            makeDraggable(modal);
            centerModal(modal);
        });
    }

    function isModal(element) {
        return element.classList && (
            element.classList.contains('modal') ||
            element.classList.contains('debt-modal') ||
            element.classList.contains('expense-modal') ||
            element.classList.contains('purchase-modal')
        );
    }

    function makeDraggable(modal) {
        const header = modal.querySelector('.modal-header, .debt-modal-header, .expense-modal-header, .purchase-modal-header');
        
        if (!header) {
            console.warn('⚠️ لم يتم العثور على رأس النافذة:', modal);
            return;
        }

        // إزالة المستمعين القدامى
        const oldMouseDown = header._mouseDownHandler;
        if (oldMouseDown) {
            header.removeEventListener('mousedown', oldMouseDown);
            header.removeEventListener('touchstart', oldMouseDown);
        }

        // إضافة مستمعين جدد
        const mouseDownHandler = function(e) {
            draggedModal = modal;
            isDragging = true;
            
            const rect = modal.getBoundingClientRect();
            const touch = e.touches ? e.touches[0] : e;
            
            dragOffset.x = touch.clientX - rect.left;
            dragOffset.y = touch.clientY - rect.top;
            
            modal.classList.add('dragging');
            modal.style.transform = 'none';
            
            e.preventDefault();
        };

        header._mouseDownHandler = mouseDownHandler;
        header.addEventListener('mousedown', mouseDownHandler);
        header.addEventListener('touchstart', mouseDownHandler, { passive: false });

        // تغيير المؤشر
        header.style.cursor = 'move';
    }

    // معالج الحركة العام
    document.addEventListener('mousemove', function(e) {
        if (!isDragging || !draggedModal) return;
        
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        updateModalPosition(newX, newY);
    });

    document.addEventListener('touchmove', function(e) {
        if (!isDragging || !draggedModal) return;
        
        const touch = e.touches[0];
        const newX = touch.clientX - dragOffset.x;
        const newY = touch.clientY - dragOffset.y;
        
        updateModalPosition(newX, newY);
        e.preventDefault();
    }, { passive: false });

    // معالج الإفلات العام
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchend', stopDragging);

    function updateModalPosition(x, y) {
        if (!draggedModal) return;
        
        // حدود الشاشة
        const maxX = window.innerWidth - draggedModal.offsetWidth;
        const maxY = window.innerHeight - draggedModal.offsetHeight;
        
        const finalX = Math.max(0, Math.min(x, maxX));
        const finalY = Math.max(0, Math.min(y, maxY));
        
        draggedModal.style.left = finalX + 'px';
        draggedModal.style.top = finalY + 'px';
    }

    function stopDragging() {
        if (draggedModal) {
            draggedModal.classList.remove('dragging');
            draggedModal = null;
        }
        isDragging = false;
    }

    function centerModal(modal) {
        if (!modal) return;
        
        // إضافة أنيميشن
        modal.classList.add('modal-animate-in');
        
        // تطبيق التنسيق المركزي
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.right = 'auto';
        modal.style.margin = '0';
    }

    // ===== تحسين نافذة الديون =====
    function enhanceDebtModal() {
        // مراقبة فتح نافذة الديون
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // فحص نافذة الديون
                        if (node.classList && node.classList.contains('debt-modal')) {
                            addProductsSectionToDebt(node);
                        }
                        
                        // فحص الأطفال
                        const debtModals = node.querySelectorAll('.debt-modal');
                        debtModals.forEach(modal => addProductsSectionToDebt(modal));
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // معالجة النوافذ الموجودة
        const existingDebtModals = document.querySelectorAll('.debt-modal');
        existingDebtModals.forEach(modal => addProductsSectionToDebt(modal));
    }

    function addProductsSectionToDebt(modal) {
        const modalBody = modal.querySelector('.debt-modal-body, .modal-body');
        
        if (!modalBody) {
            console.warn('⚠️ لم يتم العثور على محتوى نافذة الدين');
            return;
        }

        // فحص إذا كان القسم موجود بالفعل
        if (modalBody.querySelector('.debt-products-section')) {
            console.log('ℹ️ قسم المنتجات موجود بالفعل');
            return;
        }

        // إنشاء قسم المنتجات
        const productsSection = createProductsSection();
        
        // إدراج القسم قبل حقل المبلغ
        const amountField = modalBody.querySelector('input[name="amount"], #debtAmount');
        if (amountField) {
            const amountContainer = amountField.closest('.form-group, .input-group');
            if (amountContainer) {
                amountContainer.parentNode.insertBefore(productsSection, amountContainer);
            } else {
                modalBody.appendChild(productsSection);
            }
        } else {
            modalBody.appendChild(productsSection);
        }

        // ربط الأحداث
        bindProductsEvents(modalBody);
        
        console.log('✅ تم إضافة قسم المنتجات لنافذة الدين');
    }

    function createProductsSection() {
        const section = document.createElement('div');
        section.className = 'debt-products-section';
        section.innerHTML = `
            <h4>منتجات الدين</h4>
            <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">
                أضف المنتجات التي تم أخذها بالدين (اختياري)
            </p>
            
            <div class="debt-products-table-container">
                <table class="debt-products-table">
                    <thead>
                        <tr>
                            <th style="width: 35%;">المنتج</th>
                            <th style="width: 20%;">الكمية</th>
                            <th style="width: 25%;">السعر</th>
                            <th style="width: 15%;">الإجمالي</th>
                            <th style="width: 5%;">حذف</th>
                        </tr>
                    </thead>
                    <tbody id="debtProductsTableBody">
                        <!-- سيتم إضافة المنتجات هنا -->
                    </tbody>
                </table>
            </div>
            
            <button type="button" class="debt-add-product-btn">
                إضافة منتج
            </button>
            
            <div class="debt-total-section" style="display: none;">
                <h4>إجمالي قيمة المنتجات</h4>
                <span class="debt-total-amount">0 IQD</span>
            </div>
        `;
        
        return section;
    }

    function bindProductsEvents(modalBody) {
        // زر إضافة منتج
        const addBtn = modalBody.querySelector('.debt-add-product-btn');
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                addDebtProductRow(modalBody);
            });
        }

        // إضافة صف أول افتراضياً
        addDebtProductRow(modalBody);
    }

    function addDebtProductRow(modalBody) {
        const tbody = modalBody.querySelector('#debtProductsTableBody');
        if (!tbody) return;

        const rowId = Date.now() + Math.random();
        const row = document.createElement('tr');
        row.dataset.rowId = rowId;
        
        row.innerHTML = `
            <td>
                <input type="text" 
                       class="debt-product-name" 
                       placeholder="اسم المنتج"
                       data-row-id="${rowId}">
            </td>
            <td>
                <input type="number" 
                       class="debt-product-quantity" 
                       placeholder="1" 
                       value="1" 
                       min="1"
                       data-row-id="${rowId}">
            </td>
            <td>
                <input type="number" 
                       class="debt-product-price" 
                       placeholder="السعر" 
                       value="0" 
                       min="0"
                       data-row-id="${rowId}">
            </td>
            <td>
                <span class="debt-product-total" data-row-id="${rowId}">0 IQD</span>
            </td>
            <td>
                <button type="button" 
                        class="debt-product-remove-btn" 
                        data-row-id="${rowId}">
                    ✕
                </button>
            </td>
        `;
        
        tbody.appendChild(row);

        // ربط أحداث الصف
        const quantityInput = row.querySelector('.debt-product-quantity');
        const priceInput = row.querySelector('.debt-product-price');
        const removeBtn = row.querySelector('.debt-product-remove-btn');

        quantityInput.addEventListener('input', () => updateDebtRowTotal(modalBody, rowId));
        priceInput.addEventListener('input', () => updateDebtRowTotal(modalBody, rowId));
        removeBtn.addEventListener('click', () => removeDebtProductRow(modalBody, rowId));

        console.log('✅ تم إضافة صف منتج جديد');
    }

    function updateDebtRowTotal(modalBody, rowId) {
        const row = modalBody.querySelector(`tr[data-row-id="${rowId}"]`);
        if (!row) return;

        const quantity = parseFloat(row.querySelector('.debt-product-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.debt-product-price').value) || 0;
        const total = quantity * price;

        const totalSpan = row.querySelector('.debt-product-total');
        totalSpan.textContent = formatCurrency(total);

        updateDebtGrandTotal(modalBody);
    }

    function updateDebtGrandTotal(modalBody) {
        const rows = modalBody.querySelectorAll('#debtProductsTableBody tr');
        let grandTotal = 0;

        rows.forEach(row => {
            const quantity = parseFloat(row.querySelector('.debt-product-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.debt-product-price').value) || 0;
            grandTotal += (quantity * price);
        });

        // تحديث عرض الإجمالي
        const totalSection = modalBody.querySelector('.debt-total-section');
        const totalAmount = modalBody.querySelector('.debt-total-amount');
        
        if (grandTotal > 0) {
            totalSection.style.display = 'flex';
            totalAmount.textContent = formatCurrency(grandTotal);
        } else {
            totalSection.style.display = 'none';
        }

        // تحديث حقل المبلغ تلقائياً
        const amountInput = modalBody.querySelector('input[name="amount"], #debtAmount');
        if (amountInput && grandTotal > 0) {
            amountInput.value = grandTotal;
            amountInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function removeDebtProductRow(modalBody, rowId) {
        const row = modalBody.querySelector(`tr[data-row-id="${rowId}"]`);
        if (row) {
            row.remove();
            updateDebtGrandTotal(modalBody);
            console.log('✅ تم حذف صف المنتج');
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // ===== الحصول على بيانات منتجات الدين =====
    window.getDebtProducts = function() {
        const activeModal = document.querySelector('.debt-modal:not(.hidden)');
        if (!activeModal) return [];

        const tbody = activeModal.querySelector('#debtProductsTableBody');
        if (!tbody) return [];

        const rows = tbody.querySelectorAll('tr');
        const products = [];

        rows.forEach(row => {
            const name = row.querySelector('.debt-product-name').value.trim();
            const quantity = parseFloat(row.querySelector('.debt-product-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.debt-product-price').value) || 0;

            if (name && quantity > 0 && price > 0) {
                products.push({
                    name: name,
                    quantity: quantity,
                    price: price,
                    total: quantity * price
                });
            }
        });

        return products;
    };

    // ===== تصدير الدوال للاستخدام الخارجي =====
    window.ModalsSystem = {
        centerModal: centerModal,
        makeDraggable: makeDraggable,
        getDebtProducts: window.getDebtProducts
    };

    // ===== بدء التهيئة =====
    initModalsSystem();

    console.log('🎉 نظام النوافذ المنبثقة جاهز!');
})();
