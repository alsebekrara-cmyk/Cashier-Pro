/**
 * قوالب الطباعة المحسنة - معرض يعقوب للأجهزة الكهربائية
 * نسخة محدثة بتصميم مضغوط واحترافي
 */

(function() {
    'use strict';
    
    /**
     * دالة مساعدة لتحويل الأرقام العربية إلى إنجليزية
     */
    function toEnglishDigits(str) {
        if (!str) return str;
        const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        
        let result = String(str);
        for (let i = 0; i < 10; i++) {
            result = result.replace(new RegExp(arabicDigits[i], 'g'), englishDigits[i]);
        }
        return result;
    }
    
    /**
     * قالب الطباعة للدفع النقدي - تصميم محسن
     */
    window.generateYaqoubCashReceipt = function(sale, settings) {
        // بيانات المتجر بالعربية
        const storeName = settings?.store_name || 'معرض يعقوب للأجهزة الكهربائية';
        const storeAddress = settings?.store_address || 'باب الهاشمية قرب مدرسة الكرار';
        const storePhone = settings?.store_phone || localStorage.getItem('storePhone') || '07803092185';
        let logoSrc = settings?.store_logo || settings?.logo || 'yaqoub_logo.png';
        if (!logoSrc.startsWith('data:') && !logoSrc.startsWith('http') && !logoSrc.startsWith('./') && !logoSrc.startsWith('/')) {
            logoSrc = './' + logoSrc;
        }

        // قالب A4 دائمًا
        let receiptWidth = '210mm';

        // إصلاح التاريخ والوقت
        let saleDate = sale.date ? new Date(sale.date) : (sale.timestamp ? new Date(sale.timestamp) : new Date());
        if (typeof saleDate === 'string') saleDate = new Date(saleDate);
        const dateStr = saleDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = saleDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        let html = `
        <div style="
            width: ${receiptWidth};
            margin: 0 auto;
            padding: 32px 32px;
            font-family: 'Cairo', sans-serif;
            background: #fff;
            color: #222;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            line-height: 1.7;
            font-size: 18px;
            direction: rtl;
            text-align: right;
        ">
        `;

        // رأس الفاتورة
        html += `
        <div style="text-align: center; margin-bottom: 24px; direction: rtl;">
            <h1 style="margin: 0 0 8px 0; font-size: 2.5rem; font-weight: bold; color: #2d3748; letter-spacing: 2px;">${storeName}</h1>
            <div style="font-size: 1.2rem; color: #374151; margin-bottom: 4px;">${storeAddress}</div>
            <div style="font-size: 1.1rem; color: #6366f1;">📞 ${storePhone}</div>
            <div style="width:100%;text-align:center;margin:12px 0 0 0;">
            <img src="${logoSrc}" alt="Logo" style="max-width:120px;max-height:120px;display:inline-block;vertical-align:middle;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);margin-bottom:8px;" />
            </div>
        </div>
        <div style="border-top: 2px solid #6366f1; margin: 24px 0 16px 0;"></div>
        `;

        // معلومات الفاتورة
        html += `
        <div style="display: flex; justify-content: flex-start; gap: 48px; margin-bottom: 18px; font-size: 1.1rem; direction: ltr;">
            <div><b>Invoice No.:</b> ${toEnglishDigits(sale.invoice_id)}</div>
            <div><b>Date:</b> ${toEnglishDigits(dateStr)}</div>
            <div><b>Time:</b> ${toEnglishDigits(timeStr)}</div>
        </div>
        <div style="border-top: 1px dashed #bbb; margin: 18px 0 18px 0;"></div>
        `;

        // جدول المنتجات
        let items = sale.items;
        if (typeof items === 'string') {
            try {
                items = JSON.parse(items);
            } catch {
                items = [];
            }
        }
        if (items && items.length > 0) {
            html += `
            <table style="width: 100%; border-collapse: collapse; font-size: 1.1rem; margin: 18px 0; background: #f9fafb; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.03); direction: ltr;">
            <thead>
                <tr style="background: #6366f1; color: #fff;">
                <th style="padding: 12px 0;">#</th>
                <th style="padding: 12px 0;">Product Name</th>
                <th style="padding: 12px 0;">Qty</th>
                <th style="padding: 12px 0;">Unit Price</th>
                <th style="padding: 12px 0;">Total</th>
                </tr>
            </thead>
            <tbody>
        `;
            items.forEach((item, index) => {
                const name = item.product_name || item.name || '—';
                const price = item.product_price || item.price || 0;
                html += `
            <tr style="background: ${index % 2 === 0 ? '#fff' : '#f3f4f6'}; text-align: center; direction: ltr;">
                <td style="padding: 10px 0;">${toEnglishDigits(index + 1)}</td>
                <td style="padding: 10px 0; text-align: left;">${name}</td>
                <td style="padding: 10px 0;">${toEnglishDigits(item.quantity)}</td>
                <td style="padding: 10px 0;">${toEnglishDigits(price.toLocaleString('en'))}</td>
                <td style="padding: 10px 0; font-weight: bold; color: #10b981;">${toEnglishDigits((price * item.quantity).toLocaleString('en'))}</td>
            </tr>
            `;
            });
            html += `</tbody></table>`;
        }

        html += `<div style="border-top: 2px solid #6366f1; margin: 24px 0 16px 0;"></div>`;

        // الإجمالي بالعربية مع الخصم الإضافي
        const additionalDiscount = sale.additional_discount || 0;
        const totalDiscount = (sale.discount || 0) + additionalDiscount;
        
        html += `
        <div style="font-size: 1.3rem; font-weight: bold; margin: 32px 0 12px 0; text-align: right; direction: rtl;">
            <div style="display: flex; justify-content: flex-start; gap: 48px; margin-bottom: 10px;">
            <div><span style="color:#374151;">المجموع الجزئي:</span> <span>${toEnglishDigits((sale.total_amount || 0).toLocaleString('en'))}</span></div>
            ${sale.discount ? `<div><span style="color:#374151;">الخصم:</span> <span style="color: #10b981;">- ${toEnglishDigits(sale.discount.toLocaleString('en'))}</span></div>` : ''}
            ${additionalDiscount > 0 ? `<div><span style="color:#374151;">خصم إضافي:</span> <span style="color: #10b981;">- ${toEnglishDigits(additionalDiscount.toLocaleString('en'))}</span></div>` : ''}
            </div>
            ${totalDiscount > 0 ? `<div style="display: flex; justify-content: flex-start; gap: 48px; margin-bottom: 10px; padding: 8px; background: #f0fdf4; border-radius: 6px;">
                <div><span style="color:#15803d;">إجمالي الخصم:</span> <span style="color: #15803d; font-weight: bold;">- ${toEnglishDigits(totalDiscount.toLocaleString('en'))}</span></div>
            </div>` : ''}
            <div style="display: flex; justify-content: flex-start; gap: 48px; border-top: 2px solid #6366f1; padding-top: 12px; margin-top: 8px;">
            <div><span style="color:#2d3748;">الإجمالي النهائي:</span> <span style="color:#e11d48; font-size:1.5rem;">${toEnglishDigits((sale.final_total || sale.total_amount || 0).toLocaleString('en'))}</span></div>
            </div>
        </div>
        `;

        // الملاحظات
        const notes = [
            'المبلغ الموجود في الإجمالي النهائي<br>هو وصل أمانة عليكم.',
            'السعر محمي لمدة 24 ساعة من وقت الشراء.',
            'المباع لا يرجع ولا يبدل.',
            'الخطأ والسهو مرجوع للطرفين.',
            'الشركة المصنعة هي المسؤولة عن الضمان وليس شركتنا.',
            'كسر الشاشة أو كسر المنتج غير داخل بالضمان.',
            'مسؤول صيانة وتنصيب السبالت: حمزه أبو حوراء - هاتف: <span dir="ltr" style="unicode-bidi: embed;">+964 785 570 6118</span> <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Flag_of_Iraq.svg" alt="Iraq Flag" style="height: 1em; vertical-align: middle; margin-right: 4px;" />'
        ];
        html += `
        <div style="margin-top:28px; padding:16px 12px; background:#fffbe7; border-radius:8px; border:1px solid #ffe082;">
            <div style="font-size:1.05rem; font-weight:bold; color:#c62828; margin-bottom:6px; text-align:right; direction:rtl;">ملاحظات هامة:</div>
            <ol style="font-size:1rem; padding-right:22px; margin:0; text-align:right; direction:rtl;">
            ${notes.map(n => `<li>${toEnglishDigits(n)}</li>`).join('')}
            </ol>
        </div>
        `;

        // التذييل بالعربية
        html += `<div style="text-align: center; margin-top: 40px; font-size: 1.1rem; color: #666; direction: rtl;">
        <p style="margin: 4px 0;">شكراً لتعاملكم مع معرض يعقوب للأجهزة الكهربائية</p>
        <p style="margin: 4px 0;">نتطلع لخدمتكم مرة أخرى</p>
        <p style="margin-top: 18px; color: #6366f1; font-size: 1.2rem;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        </div>`;
        html += `</div>`;
        return html;
    };
    
    /**
     * قالب الطباعة للتقسيط - تصميم مضغوط محسن
     */
    window.generateYaqoubInstallmentReceipt = function(sale, settings) {
                let logoSrc = settings?.store_logo || settings?.logo || 'yaqoub_logo.png';
                if (!logoSrc.startsWith('data:') && !logoSrc.startsWith('http') && !logoSrc.startsWith('./') && !logoSrc.startsWith('/')) {
                    logoSrc = './' + logoSrc;
                }
        // استخراج التاريخ والساعة
        const saleDate = new Date(sale.timestamp || sale.created_at || Date.now());
        const dateStr = saleDate.toLocaleDateString('ar-IQ', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        });
        const timeStr = saleDate.toLocaleTimeString('ar-IQ', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
        
        // استخراج تفاصيل الأقساط من installment_details أو من مستوى الفاتورة
        const installmentDetails = sale.installment_details || {};
        const originalSubtotal = installmentDetails.original_subtotal || sale.subtotal || 0;
        const additionalAmount = installmentDetails.additional_amount || sale.additional_amount || 0;
        const downPayment = installmentDetails.down_payment || sale.down_payment || 0;
        const totalBeforeDiscount = originalSubtotal + additionalAmount;
        
        // حساب المبلغ الإجمالي النهائي
        let finalTotal = originalSubtotal; // البداية من المبلغ الأصلي
        if (additionalAmount > 0) finalTotal += additionalAmount; // إضافة المبلغ الإضافي
        if (downPayment > 0) finalTotal -= downPayment; // خصم الدفعة المقدمة
        
        const remainingAmount = installmentDetails.remaining_amount || sale.remaining_amount || (totalBeforeDiscount - downPayment);
        const monthlyAmount = installmentDetails.monthly_amount || sale.monthly_amount || 0;
        const installmentMonths = installmentDetails.installment_months || sale.installment_months || 0;
        const startDate = installmentDetails.start_date || sale.start_date || null;
        const advancedControlUsed = installmentDetails.advanced_control_used || installmentDetails.custom_values_used || false;
        
        let html = `<div style="width:210mm;min-height:297mm;margin:0 auto;padding:12mm 10mm;font-family:'Cairo',sans-serif;background:#fff;color:#222;line-height:1.4;font-size:11px;box-sizing:border-box;">

                <!-- الهيدر المحسّن -->
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #6366f1;">
                    <!-- اليسار: اسم المحل والشعار -->
                    <div style="flex:0 0 35%;text-align:center;">
                        <img src="${logoSrc}" alt="Logo" style="max-width:90px;max-height:90px;display:block;margin:0 auto 8px auto;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);" />
                        <h1 style="margin:0;font-size:1.3rem;font-weight:bold;color:#2d3748;">${settings?.store_name || 'يعقوب للاجهزه الكهربائيه'}</h1>
                    </div>
                    <!-- اليمين: العنوان والهاتف -->
                    <div style="flex:0 0 60%;text-align:left;">
                        <div style="font-size:0.95rem;color:#374151;font-weight:600;margin-bottom:2px;">${settings?.store_address || 'باب الهاشميه قرب مدرسه الكرار'}</div>
                        <div style="font-size:0.9rem;color:#6366f1;font-weight:600;">📞 ${settings?.store_phone || '07803092185'}</div>
                    </div>
                </div>
        
        <!-- عنوان الفاتورة ومعلوماتها -->
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:6px;padding:6px 10px;margin-bottom:8px;color:#fff;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="font-size:1.05rem;font-weight:bold;">📋 فاتورة تقسيط</div>
                    <div style="font-size:0.85rem;opacity:0.95;">رقم: ${sale.invoice_id || ''}</div>
                </div>
                <div style="text-align:left;font-size:0.85rem;">
                    <div>📅 ${dateStr}</div>
                    <div>🕐 ${timeStr}</div>
                </div>
            </div>
        </div>
        
        <!-- معلومات العميل - صف واحد -->
        <div style="background:#f8fafc;border-radius:6px;padding:6px 8px;margin-bottom:8px;border:1px solid #e2e8f0;">
            <div style="font-weight:bold;color:#1e293b;margin-bottom:4px;font-size:0.95rem;">👤 معلومات العميل</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:0.9rem;">
                <div><strong>الاسم:</strong> ${sale.customer_name || ''}</div>
                <div><strong>الهاتف:</strong> ${sale.customer_phone || ''}</div>
                <div><strong>العنوان:</strong> ${sale.customer_address || ''}</div>
            </div>
        </div>
        
        <!-- تفاصيل الأقساط - مضغوط -->
        <div style="background:#f0f9ff;border-radius:6px;padding:6px 8px;margin-bottom:8px;border:1px solid #bae6fd;">
            <div style="font-weight:bold;color:#0c4a6e;margin-bottom:4px;font-size:0.95rem;">💳 تفاصيل الأقساط</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;font-size:0.85rem;">
                <div style="background:#dbeafe;padding:4px;border-radius:4px;text-align:center;">
                    <div style="font-weight:600;color:#1e40af;font-size:0.8rem;">المبلغ الأصلي</div>
                    <div style="font-weight:bold;color:#1e3a8a;">${originalSubtotal.toLocaleString()}</div>
                </div>
                ${additionalAmount > 0 ? `<div style="background:#fce7f3;padding:4px;border-radius:4px;text-align:center;">
                    <div style="font-weight:600;color:#9f1239;font-size:0.8rem;">مبلغ إضافي</div>
                    <div style="font-weight:bold;color:#be123c;">${additionalAmount.toLocaleString()}</div>
                </div>` : ''}
                ${downPayment > 0 ? `<div style="background:#d1fae5;padding:4px;border-radius:4px;text-align:center;">
                    <div style="font-weight:600;color:#065f46;font-size:0.8rem;">دفعة مقدمة</div>
                    <div style="font-weight:bold;color:#047857;">${downPayment.toLocaleString()}</div>
                </div>` : ''}
                <div style="background:#fee2e2;padding:4px;border-radius:4px;text-align:center;">
                    <div style="font-weight:600;color:#7f1d1d;font-size:0.8rem;">المتبقي</div>
                    <div style="font-weight:bold;color:#991b1b;">${remainingAmount.toLocaleString()}</div>
                </div>
                <div style="background:#fef3c7;padding:4px;border-radius:4px;text-align:center;">
                    <div style="font-weight:600;color:#78350f;font-size:0.8rem;">عدد الأشهر</div>
                    <div style="font-weight:bold;color:#92400e;">${installmentMonths}</div>
                </div>
                <div style="background:#ffedd5;padding:4px;border-radius:4px;text-align:center;">
                    <div style="font-weight:600;color:#7c2d12;font-size:0.8rem;">القسط الشهري</div>
                    <div style="font-weight:bold;color:#9a3412;">${monthlyAmount.toLocaleString()}</div>
                </div>
                ${startDate ? `<div style="background:#e0e7ff;padding:4px;border-radius:4px;text-align:center;">
                    <div style="font-weight:600;color:#3730a3;font-size:0.8rem;">تاريخ البداية</div>
                    <div style="font-weight:bold;color:#4338ca;font-size:0.8rem;">${new Date(startDate).toLocaleDateString('ar-IQ')}</div>
                </div>` : ''}
                ${advancedControlUsed ? `<div style="background:#ede9fe;padding:4px;border-radius:4px;text-align:center;grid-column:1/-1;">
                    <div style="font-weight:600;color:#5b21b6;font-size:0.8rem;">⚙️ تحكم متقدم</div>
                </div>` : ''}
            </div>
        </div>
        
        <!-- جدول المنتجات - مضغوط -->
        <div style="margin-bottom:8px;">
            <table style="width:100%;border-collapse:collapse;font-size:0.9rem;border:1px solid #e5e7eb;">
            <thead>
                <tr style="background:#6366f1;color:#fff;">
                    <th style="padding:4px 6px;width:6%;text-align:center;border:1px solid rgba(255,255,255,0.2);">#</th>
                    <th style="padding:4px 6px;width:44%;text-align:right;border:1px solid rgba(255,255,255,0.2);">المنتج</th>
                    <th style="padding:4px 6px;width:12%;text-align:center;border:1px solid rgba(255,255,255,0.2);">الكمية</th>
                    <th style="padding:4px 6px;width:18%;text-align:center;border:1px solid rgba(255,255,255,0.2);">السعر</th>
                    <th style="padding:4px 6px;width:20%;text-align:center;border:1px solid rgba(255,255,255,0.2);">الإجمالي</th>
                </tr>
            </thead>
            <tbody>`;
        
        let items = sale.items;
        if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch { items = []; }
        }
        
        items.forEach((item, index) => {
            const name = item.product_name || item.name || '—';
            const price = item.product_price || item.price || 0;
            const qty = item.quantity || 1;
            const total = price * qty;
            html += `<tr style="background:${index%2===0?'#fff':'#f9fafb'};">
                <td style="padding:4px 6px;text-align:center;border:1px solid #e5e7eb;font-weight:600;">${index+1}</td>
                <td style="padding:4px 6px;text-align:right;border:1px solid #e5e7eb;">${name}</td>
                <td style="padding:4px 6px;text-align:center;border:1px solid #e5e7eb;font-weight:600;">${qty}</td>
                <td style="padding:4px 6px;text-align:center;border:1px solid #e5e7eb;font-weight:600;">${price.toLocaleString()}</td>
                <td style="padding:4px 6px;text-align:center;border:1px solid #e5e7eb;font-weight:bold;color:#10b981;">${total.toLocaleString()}</td>
            </tr>`;
        });
        
        html += `</tbody></table></div>
        
        <!-- ملخص المبالغ - مضغوط -->
        <div style="background:#fef3c7;border-radius:6px;padding:6px 8px;margin-bottom:8px;border:1px solid #fde68a;">
            <div style="font-weight:bold;color:#78350f;margin-bottom:4px;font-size:0.95rem;">💰 ملخص المبالغ</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:0.9rem;">
                <div style="display:flex;justify-content:space-between;padding:3px 6px;background:#e0f2fe;border-radius:4px;">
                    <span>المجموع الجزئي:</span>
                    <strong>${originalSubtotal.toLocaleString()}</strong>
                </div>
                ${additionalAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:3px 6px;background:#fce7f3;border-radius:4px;">
                    <span>مبلغ إضافي:</span>
                    <strong style="color:#be123c;">+${additionalAmount.toLocaleString()}</strong>
                </div>` : ''}
                ${downPayment > 0 ? `<div style="display:flex;justify-content:space-between;padding:3px 6px;background:#d1fae5;border-radius:4px;">
                    <span>دفعة مقدمة:</span>
                    <strong style="color:#047857;">-${downPayment.toLocaleString()}</strong>
                </div>` : ''}
                <div style="grid-column:1/-1;display:flex;justify-content:space-between;padding:6px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:4px;color:#fff;">
                    <span style="font-size:1rem;font-weight:bold;">💵 الإجمالي النهائي:</span>
                    <strong style="font-size:1.1rem;">${finalTotal.toLocaleString()} دينار</strong>
                </div>
            </div>
        </div>
        
        <!-- ملاحظات مضغوطة -->
        <div style="background:#fffbeb;border-radius:6px;padding:6px 8px;margin-bottom:8px;border:1px solid #fbbf24;">
            <div style="font-weight:bold;color:#b91c1c;margin-bottom:4px;font-size:0.9rem;">⚠️ ملاحظات هامة</div>
            <ol style="font-size:0.8rem;padding-right:18px;margin:0;line-height:1.5;">
                <li>المبلغ الموجود هو وصل أمانة</li>
                <li>السعر محمي 24 ساعة</li>
                <li>المباع لا يرجع ولا يبدل</li>
                <li>الخطأ والسهو مرجوع للطرفين</li>
                <li>الشركة المصنعة مسؤولة عن الضمان</li>
                <li>كسر الشاشة غير داخل بالضمان</li>
                <li style="margin-top:4px;">
                    <div style="background:#e0f2fe;padding:4px 6px;border-radius:4px;border:1px solid #bae6fd;">
                        <strong style="color:#0c4a6e;">👨‍🔧 الصيانة:</strong> حمزه ابو حوراء - صيانة السبالت
                        <div style="direction:ltr;text-align:left;font-weight:bold;color:#0c4a6e;margin-top:2px;">
                            📱 <span style="letter-spacing:1px;">+964 785 570 6118</span>
                        </div>
                    </div>
                </li>
            </ol>
        </div>
        
        <!-- التوقيعات -->
        <div style="display:flex;justify-content:space-between;gap:30px;margin-top:10px;">
            <div style="flex:1;text-align:center;">
                <div style="font-size:0.9rem;font-weight:bold;margin-bottom:15px;">✍️ توقيع البائع</div>
                <div style="border-bottom:1px dashed #9ca3af;"></div>
            </div>
            <div style="flex:1;text-align:center;">
                <div style="font-size:0.9rem;font-weight:bold;margin-bottom:15px;">✍️ توقيع العميل</div>
                <div style="border-bottom:1px dashed #9ca3af;"></div>
            </div>
        </div>
        
        <!-- الختام -->
        <div style="text-align:center;margin-top:10px;padding-top:6px;border-top:2px solid #e5e7eb;">
            <p style="margin:2px 0;font-size:0.95rem;font-weight:bold;color:#6366f1;">🌟 شكراً لتعاملكم معنا 🌟</p>
            <p style="margin:2px 0;font-size:0.85rem;color:#6b7280;">نتطلع لخدمتكم مرة أخرى</p>
        </div>
        </div>`;
        return html;
    };
    
    console.log('✅ تم تحميل قوالب الطباعة المحدثة - معرض يعقوب');
})();
