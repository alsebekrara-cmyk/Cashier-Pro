/**
 * ملف الإضافات والتوسعات
 * extensions.js
 * 
 * يحتوي على:
 * - نظام التقارير الكامل
 * - صفحة آخر الاستقطاعات
 * - تحويل الأرقام إلى كتابة عربية
 * - نظام الطباعة المحسّن
 * - مراقبة Firebase للإشعارات
 */

console.log('📦 تحميل ملف التوسعات...');

// ===========================================
// تحويل الأرقام إلى كتابة عربية
// ===========================================

/**
 * تحويل رقم إلى كتابة عربية
 */
function numberToArabicWords(num) {
    if (num === 0) return 'صفر دينار عراقي';
    if (num < 0) return 'سالب ' + numberToArabicWords(Math.abs(num));
    
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 
                   'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    
    function convertBelowThousand(n) {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) {
            const ten = Math.floor(n / 10);
            const one = n % 10;
            return ones[one] ? ones[one] + ' و' + tens[ten] : tens[ten];
        }
        // 100-999
        const hundred = Math.floor(n / 100);
        const remainder = n % 100;
        let result = hundreds[hundred];
        if (remainder > 0) {
            result += ' و' + convertBelowThousand(remainder);
        }
        return result;
    }
    
    function convertThousands(n) {
        if (n < 1000) return convertBelowThousand(n);
        
        const thousand = Math.floor(n / 1000);
        const remainder = n % 1000;
        
        let result = '';
        if (thousand === 1) {
            result = 'ألف';
        } else if (thousand === 2) {
            result = 'ألفان';
        } else if (thousand < 10) {
            result = convertBelowThousand(thousand) + ' آلاف';
        } else {
            result = convertBelowThousand(thousand) + ' ألف';
        }
        
        if (remainder > 0) {
            result += ' و' + convertBelowThousand(remainder);
        }
        return result;
    }
    
    // معالجة الملايين
    if (num >= 1000000) {
        const millions = Math.floor(num / 1000000);
        const remainder = num % 1000000;
        
        let result = '';
        if (millions === 1) {
            result = 'مليون';
        } else if (millions === 2) {
            result = 'مليونان';
        } else if (millions < 10) {
            result = convertBelowThousand(millions) + ' ملايين';
        } else {
            result = convertBelowThousand(millions) + ' مليون';
        }
        
        if (remainder > 0) {
            if (remainder >= 1000) {
                result += ' و' + convertThousands(remainder);
            } else {
                result += ' و' + convertBelowThousand(remainder);
            }
        }
        return result + ' دينار عراقي';
    }
    
    return convertThousands(num) + ' دينار عراقي';
}

// ===========================================
// نظام التقارير
// ===========================================

/**
 * عرض صفحة التقارير
 */
function showReportsPage() {
    const mainContent = document.querySelector('#reports-page #main-content');
    if (!mainContent) {
        console.error('عنصر main-content غير موجود');
        return;
    }
    
    mainContent.innerHTML = `
        <div class="content-header">
            <div>
                <h2>📊 التقارير والتحليلات</h2>
                <p style="color: #64748b; margin-top: 5px;">تقارير شاملة ومفصلة عن جميع العمليات</p>
            </div>
            <button class="btn btn-secondary" onclick="navigateTo('dashboard')">
                <i class="fas fa-arrow-right"></i> عودة
            </button>
        </div>

        <!-- الملخص السريع -->
        <div class="card" style="margin-bottom: 20px;">
            <div class="card-header">
                <h3 class="card-title">📈 الملخص السريع</h3>
            </div>
            <div id="quick-summary" class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; padding: 20px;">
                <!-- سيتم ملء الإحصائيات هنا -->
            </div>
        </div>

        <!-- فلاتر التقارير -->
        <div class="card" style="margin-bottom: 20px;">
            <div class="card-header">
                <h3 class="card-title">🔍 فلاتر التقرير</h3>
            </div>
            <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); padding: 20px;">
                <div class="form-group">
                    <label>نوع التقرير</label>
                    <select id="reportType" class="form-control" onchange="updateReportFilters()">
                        <option value="comprehensive">تقرير شامل</option>
                        <option value="cases">تقرير الدعاوى</option>
                        <option value="deductions">تقرير الاستقطاعات</option>
                        <option value="lawyers">تقرير المحامين</option>
                        <option value="defendants">تقرير المدعى عليهم</option>
                        <option value="financial">تقرير مالي</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>من تاريخ</label>
                    <input type="date" id="reportFromDate" class="form-control">
                </div>
                <div class="form-group">
                    <label>إلى تاريخ</label>
                    <input type="date" id="reportToDate" class="form-control">
                </div>
                <div class="form-group" id="caseStatusFilter" style="display: none;">
                    <label>حالة الدعوى</label>
                    <select id="reportCaseStatus" class="form-control">
                        <option value="">الكل</option>
                        <option value="مفتوحة">مفتوحة</option>
                        <option value="قيد التنفيذ">قيد التنفيذ</option>
                        <option value="مغلقة">مغلقة</option>
                        <option value="معلقة">معلقة</option>
                    </select>
                </div>
            </div>
            <div style="padding: 0 20px 20px; display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="generateReport()" style="flex: 1;">
                    <i class="fas fa-chart-bar"></i> إنشاء التقرير
                </button>
                <button class="btn btn-success" onclick="printReport()" style="flex: 1;">
                    <i class="fas fa-print"></i> طباعة التقرير
                </button>
                <button class="btn btn-info" onclick="exportReportToExcel()">
                    <i class="fas fa-file-excel"></i> Excel
                </button>
                <button class="btn btn-warning" onclick="exportReportToPDF()">
                    <i class="fas fa-file-pdf"></i> PDF
                </button>
            </div>
        </div>

        <!-- نتائج التقرير -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">📄 نتائج التقرير</h3>
            </div>
            <div id="report-results" style="padding: 20px;">
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <p>اختر نوع التقرير والفترة الزمنية ثم اضغط "إنشاء التقرير"</p>
                </div>
            </div>
        </div>
    `;
    
    // تعيين التاريخ الافتراضي (آخر 30 يوم)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    
    document.getElementById('reportToDate').valueAsDate = today;
    document.getElementById('reportFromDate').valueAsDate = lastMonth;
    
    // تحميل الملخص السريع
    loadQuickSummary();
}

/**
 * تحديث فلاتر التقرير
 */
function updateReportFilters() {
    const reportType = document.getElementById('reportType').value;
    const caseStatusFilter = document.getElementById('caseStatusFilter');
    
    // عرض فلتر حالة الدعوى فقط لتقرير الدعاوى
    if (reportType === 'cases' || reportType === 'comprehensive') {
        caseStatusFilter.style.display = 'block';
    } else {
        caseStatusFilter.style.display = 'none';
    }
}

/**
 * تحميل الملخص السريع
 */
function loadQuickSummary() {
    const summaryDiv = document.getElementById('quick-summary');
    if (!summaryDiv) return;
    
    const totalCases = data.cases.length;
    const totalDeductions = data.deductions ? data.deductions.reduce((sum, d) => sum + (d.amount || 0), 0) : 0;
    const totalLawyers = data.lawyers.length;
    const totalDefendants = data.defendants.length;
    const openCases = data.cases.filter(c => c.status === 'مفتوحة').length;
    const closedCases = data.cases.filter(c => c.status === 'مغلقة').length;
    
    summaryDiv.innerHTML = `
        <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">إجمالي الدعاوى</div>
            <div style="font-size: 32px; font-weight: bold;">${totalCases}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">مجموع الاستقطاعات</div>
            <div style="font-size: 24px; font-weight: bold;">${totalDeductions.toLocaleString()} د.ع</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 10px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">عدد المحامين</div>
            <div style="font-size: 32px; font-weight: bold;">${totalLawyers}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 20px; border-radius: 10px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">المدعى عليهم</div>
            <div style="font-size: 32px; font-weight: bold;">${totalDefendants}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 20px; border-radius: 10px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">دعاوى مفتوحة</div>
            <div style="font-size: 32px; font-weight: bold;">${openCases}</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); color: white; padding: 20px; border-radius: 10px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">دعاوى مغلقة</div>
            <div style="font-size: 32px; font-weight: bold;">${closedCases}</div>
        </div>
    `;
}

/**
 * إنشاء التقرير
 */
function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const fromDate = document.getElementById('reportFromDate').value;
    const toDate = document.getElementById('reportToDate').value;
    const caseStatus = document.getElementById('reportCaseStatus').value;
    
    console.log('إنشاء تقرير:', reportType, fromDate, toDate);
    
    switch(reportType) {
        case 'comprehensive':
            generateComprehensiveReport(fromDate, toDate, caseStatus);
            break;
        case 'cases':
            generateCasesReport(fromDate, toDate, caseStatus);
            break;
        case 'deductions':
            generateDeductionsReport(fromDate, toDate);
            break;
        case 'lawyers':
            generateLawyersReport();
            break;
        case 'defendants':
            generateDefendantsReport();
            break;
        case 'financial':
            generateFinancialReport(fromDate, toDate);
            break;
    }
}

/**
 * تقرير شامل
 */
function generateComprehensiveReport(fromDate, toDate, caseStatus) {
    const resultsDiv = document.getElementById('report-results');
    
    // تصفية البيانات
    let filteredCases = data.cases;
    if (fromDate && toDate) {
        filteredCases = filteredCases.filter(c => {
            const caseDate = new Date(c.caseDate);
            return caseDate >= new Date(fromDate) && caseDate <= new Date(toDate);
        });
    }
    if (caseStatus) {
        filteredCases = filteredCases.filter(c => c.status === caseStatus);
    }
    
    const totalAmount = filteredCases.reduce((sum, c) => sum + (parseFloat(c.claimAmount) || 0), 0);
    const deductionsInPeriod = data.deductions ? data.deductions.filter(d => {
        if (!fromDate || !toDate) return true;
        const deductionDate = new Date(d.date);
        return deductionDate >= new Date(fromDate) && deductionDate <= new Date(toDate);
    }) : [];
    const totalDeductions = deductionsInPeriod.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    resultsDiv.innerHTML = `
        <h3 style="margin-bottom: 20px;">التقرير الشامل</h3>
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); margin-bottom: 30px;">
            <div class="stat-card">
                <div class="stat-label">عدد الدعاوى</div>
                <div class="stat-value">${filteredCases.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">مجموع المبالغ المطالب بها</div>
                <div class="stat-value">${totalAmount.toLocaleString()} د.ع</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">عدد الاستقطاعات</div>
                <div class="stat-value">${deductionsInPeriod.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">مجموع الاستقطاعات</div>
                <div class="stat-value">${totalDeductions.toLocaleString()} د.ع</div>
            </div>
        </div>
        
        <h4>تفاصيل الدعاوى:</h4>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>رقم الدعوى</th>
                        <th>المدعي</th>
                        <th>المدعى عليه</th>
                        <th>المبلغ</th>
                        <th>الحالة</th>
                        <th>التاريخ</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredCases.map(c => {
                        const defendant = data.defendants.find(d => d.id === c.defendantId);
                        return `
                            <tr>
                                <td>${c.caseNumber}</td>
                                <td>${c.plaintiff}</td>
                                <td>${defendant ? defendant.name : 'غير محدد'}</td>
                                <td>${(parseFloat(c.claimAmount) || 0).toLocaleString()} د.ع</td>
                                <td><span class="badge badge-${c.status === 'مفتوحة' ? 'success' : c.status === 'مغلقة' ? 'danger' : 'warning'}">${c.status}</span></td>
                                <td>${new Date(c.caseDate).toLocaleDateString('ar-IQ')}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * تقرير الدعاوى
 */
function generateCasesReport(fromDate, toDate, caseStatus) {
    generateComprehensiveReport(fromDate, toDate, caseStatus);
}

/**
 * تقرير الاستقطاعات
 */
function generateDeductionsReport(fromDate, toDate) {
    const resultsDiv = document.getElementById('report-results');
    
    let deductions = data.deductions || [];
    if (fromDate && toDate) {
        deductions = deductions.filter(d => {
            const deductionDate = new Date(d.date);
            return deductionDate >= new Date(fromDate) && deductionDate <= new Date(toDate);
        });
    }
    
    const totalAmount = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
    const fromApp = deductions.filter(d => d.source === 'app').length;
    const fromLawyer = deductions.filter(d => d.source === 'lawyer').length;
    
    resultsDiv.innerHTML = `
        <h3 style="margin-bottom: 20px;">تقرير الاستقطاعات</h3>
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 30px;">
            <div class="stat-card">
                <div class="stat-label">إجمالي الاستقطاعات</div>
                <div class="stat-value">${deductions.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">المجموع الكلي</div>
                <div class="stat-value">${totalAmount.toLocaleString()} د.ع</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">من التطبيق</div>
                <div class="stat-value">${fromApp}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">من المحامي</div>
                <div class="stat-value">${fromLawyer}</div>
            </div>
        </div>
        
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>رقم الدعوى</th>
                        <th>المبلغ (رقماً)</th>
                        <th>المبلغ (كتابة)</th>
                        <th>التاريخ</th>
                        <th>المصدر</th>
                        <th>الملاحظات</th>
                    </tr>
                </thead>
                <tbody>
                    ${deductions.map((d, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${d.caseNumber}</td>
                            <td style="font-weight: bold; color: #10b981;">${(d.amount || 0).toLocaleString()} د.ع</td>
                            <td style="font-size: 12px; color: #64748b;">${numberToArabicWords(d.amount || 0)}</td>
                            <td>${new Date(d.date).toLocaleDateString('ar-IQ')}</td>
                            <td><span class="badge badge-${d.source === 'app' ? 'primary' : 'warning'}">${d.source === 'app' ? 'التطبيق' : 'المحامي'}</span></td>
                            <td>${d.notes || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * تقرير المحامين
 */
function generateLawyersReport() {
    const resultsDiv = document.getElementById('report-results');
    
    const lawyersWithCases = data.lawyers.map(lawyer => {
        const cases = data.cases.filter(c => c.lawyerId === lawyer.id);
        const totalAmount = cases.reduce((sum, c) => sum + (parseFloat(c.claimAmount) || 0), 0);
        return {
            ...lawyer,
            casesCount: cases.length,
            totalAmount: totalAmount
        };
    });
    
    resultsDiv.innerHTML = `
        <h3 style="margin-bottom: 20px;">تقرير المحامين</h3>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>رقم الهاتف</th>
                        <th>عدد الدعاوى</th>
                        <th>مجموع المبالغ</th>
                    </tr>
                </thead>
                <tbody>
                    ${lawyersWithCases.map(l => `
                        <tr>
                            <td>${l.name}</td>
                            <td>${l.phone}</td>
                            <td>${l.casesCount}</td>
                            <td>${l.totalAmount.toLocaleString()} د.ع</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * تقرير المدعى عليهم
 */
function generateDefendantsReport() {
    const resultsDiv = document.getElementById('report-results');
    
    const defendantsWithCases = data.defendants.map(defendant => {
        const cases = data.cases.filter(c => c.defendantId === defendant.id);
        const totalAmount = cases.reduce((sum, c) => sum + (parseFloat(c.claimAmount) || 0), 0);
        return {
            ...defendant,
            casesCount: cases.length,
            totalAmount: totalAmount
        };
    });
    
    resultsDiv.innerHTML = `
        <h3 style="margin-bottom: 20px;">تقرير المدعى عليهم</h3>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>رقم الهاتف</th>
                        <th>العنوان</th>
                        <th>عدد الدعاوى</th>
                        <th>مجموع المبالغ</th>
                    </tr>
                </thead>
                <tbody>
                    ${defendantsWithCases.map(d => `
                        <tr>
                            <td>${d.name}</td>
                            <td>${d.phone}</td>
                            <td>${d.address || '-'}</td>
                            <td>${d.casesCount}</td>
                            <td>${d.totalAmount.toLocaleString()} د.ع</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * تقرير مالي
 */
function generateFinancialReport(fromDate, toDate) {
    const resultsDiv = document.getElementById('report-results');
    
    let cases = data.cases;
    let deductions = data.deductions || [];
    
    if (fromDate && toDate) {
        cases = cases.filter(c => {
            const caseDate = new Date(c.caseDate);
            return caseDate >= new Date(fromDate) && caseDate <= new Date(toDate);
        });
        deductions = deductions.filter(d => {
            const deductionDate = new Date(d.date);
            return deductionDate >= new Date(fromDate) && deductionDate <= new Date(toDate);
        });
    }
    
    const totalClaims = cases.reduce((sum, c) => sum + (parseFloat(c.claimAmount) || 0), 0);
    const totalDeductions = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
    const remaining = totalClaims - totalDeductions;
    
    resultsDiv.innerHTML = `
        <h3 style="margin-bottom: 20px;">التقرير المالي</h3>
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); margin-bottom: 30px;">
            <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">إجمالي المطالبات</div>
                <div style="font-size: 28px; font-weight: bold;">${totalClaims.toLocaleString()} د.ع</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 10px;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">إجمالي الاستقطاعات</div>
                <div style="font-size: 28px; font-weight: bold;">${totalDeductions.toLocaleString()} د.ع</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; border-radius: 10px;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">المتبقي</div>
                <div style="font-size: 28px; font-weight: bold;">${remaining.toLocaleString()} د.ع</div>
            </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h4>نسبة الاستقطاع:</h4>
            <div style="background: #f1f5f9; border-radius: 8px; height: 40px; overflow: hidden; margin-top: 10px;">
                <div style="background: linear-gradient(90deg, #10b981, #059669); height: 100%; width: ${(totalDeductions / totalClaims * 100).toFixed(1)}%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; transition: width 0.3s;">
                    ${(totalDeductions / totalClaims * 100).toFixed(1)}%
                </div>
            </div>
        </div>
    `;
}

/**
 * طباعة التقرير
 */
function printReport() {
    const reportResults = document.getElementById('report-results');
    if (!reportResults || !reportResults.innerHTML.trim()) {
        showNotification('خطأ', 'لا يوجد تقرير لطباعته. قم بإنشاء تقرير أولاً.', 'error');
        return;
    }
    
    const reportType = document.getElementById('reportType').value;
    const reportTypeNames = {
        'comprehensive': 'التقرير الشامل',
        'cases': 'تقرير الدعاوى',
        'deductions': 'تقرير الاستقطاعات',
        'lawyers': 'تقرير المحامين',
        'defendants': 'تقرير المدعى عليهم',
        'financial': 'التقرير المالي'
    };
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>${reportTypeNames[reportType] || 'تقرير'}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    direction: rtl; 
                    padding: 40px;
                    background: white;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #667eea;
                }
                .print-header h1 {
                    color: #1e293b;
                    font-size: 32px;
                    margin-bottom: 10px;
                }
                .print-header .date {
                    color: #64748b;
                    font-size: 16px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 30px 0;
                }
                .stat-card {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 8px;
                    border: 2px solid #e2e8f0;
                }
                .stat-label {
                    font-size: 14px;
                    color: #64748b;
                    margin-bottom: 8px;
                }
                .stat-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #1e293b;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    padding: 12px;
                    text-align: right;
                    border: 1px solid #e2e8f0;
                }
                th {
                    background: #f1f5f9;
                    font-weight: bold;
                    color: #1e293b;
                }
                tr:nth-child(even) {
                    background: #f8fafc;
                }
                .badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .badge-success { background: #dcfce7; color: #166534; }
                .badge-danger { background: #fee2e2; color: #991b1b; }
                .badge-warning { background: #fef3c7; color: #92400e; }
                .badge-primary { background: #dbeafe; color: #1e40af; }
                h3, h4 {
                    color: #1e293b;
                    margin: 20px 0 15px;
                }
                @media print {
                    body { padding: 20px; }
                    .stats-grid { page-break-inside: avoid; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>${reportTypeNames[reportType] || 'تقرير'}</h1>
                <div class="date">تاريخ الطباعة: ${new Date().toLocaleString('ar-IQ')}</div>
            </div>
            ${reportResults.innerHTML}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 100);
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

/**
 * تصدير إلى Excel
 */
function exportReportToExcel() {
    showNotification('قريباً', 'ميزة التصدير إلى Excel قيد التطوير', 'info');
}

/**
 * تصدير إلى PDF
 */
function exportReportToPDF() {
    showNotification('قريباً', 'ميزة التصدير إلى PDF قيد التطوير', 'info');
}

// ===========================================
// صفحة آخر الاستقطاعات
// ===========================================

/**
 * عرض صفحة آخر الاستقطاعات
 */
function showLatestDeductionsPage() {
    const mainContent = document.querySelector('#latest-deductions-page #main-content');
    if (!mainContent) {
        console.error('عنصر main-content غير موجود');
        return;
    }
    
    // الحصول على آخر 50 استقطاع
    const allDeductions = data.deductions || [];
    const latestDeductions = allDeductions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 50);
    
    const totalAmount = latestDeductions.reduce((sum, d) => sum + (d.amount || 0), 0);
    const fromLawyer = latestDeductions.filter(d => d.source === 'lawyer').length;
    
    mainContent.innerHTML = `
        <div class="content-header">
            <div>
                <h2>🔄 آخر الاستقطاعات</h2>
                <p style="color: #64748b; margin-top: 5px;">آخر 50 استقطاع من النظام</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-success" onclick="printLatestDeductions()">
                    <i class="fas fa-print"></i> طباعة القائمة
                </button>
                <button class="btn btn-secondary" onclick="navigateTo('dashboard')">
                    <i class="fas fa-arrow-right"></i> عودة
                </button>
            </div>
        </div>

        <!-- الإحصائيات -->
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); margin-bottom: 20px;">
            <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">عدد الاستقطاعات</div>
                <div style="font-size: 32px; font-weight: bold;">${latestDeductions.length}</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">إجمالي المبالغ</div>
                <div style="font-size: 24px; font-weight: bold;">${totalAmount.toLocaleString()} د.ع</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 10px;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">من تطبيق المحامي</div>
                <div style="font-size: 32px; font-weight: bold;">${fromLawyer}</div>
            </div>
        </div>

        <!-- جدول الاستقطاعات -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">📋 قائمة الاستقطاعات</h3>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th>رقم الدعوى</th>
                            <th>المبلغ (رقماً)</th>
                            <th>المبلغ (كتابة)</th>
                            <th>التاريخ</th>
                            <th>المصدر</th>
                            <th>الملاحظات</th>
                            <th style="width: 100px;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${latestDeductions.map((d, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${d.caseNumber}</strong></td>
                                <td style="font-weight: bold; color: #10b981; font-size: 16px;">${(d.amount || 0).toLocaleString()} د.ع</td>
                                <td style="font-size: 13px; color: #64748b;">${numberToArabicWords(d.amount || 0)}</td>
                                <td>${new Date(d.date).toLocaleString('ar-IQ')}</td>
                                <td><span class="badge badge-${d.source === 'app' ? 'primary' : 'warning'}">${d.source === 'app' ? 'التطبيق' : 'المحامي'}</span></td>
                                <td>${d.notes || '-'}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary" onclick='viewDeductionDetails(${JSON.stringify(d).replace(/'/g, "&apos;")})' title="عرض التفاصيل">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-success" onclick='printDeductionReceipt(${JSON.stringify(d).replace(/'/g, "&apos;")})' title="طباعة">
                                        <i class="fas fa-print"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * عرض تفاصيل استقطاع
 */
function viewDeductionDetails(deduction) {
    const caseInfo = data.cases.find(c => c.caseNumber === deduction.caseNumber);
    
    modalManager.show('case-details-modal', `
        <h3>تفاصيل الاستقطاع</h3>
        <div style="margin-top: 20px;">
            <div class="info-box" style="margin-bottom: 20px;">
                <strong>رقم الدعوى:</strong> ${deduction.caseNumber}<br>
                <strong>المبلغ:</strong> <span style="font-size: 24px; color: #10b981; font-weight: bold;">${(deduction.amount || 0).toLocaleString()} د.ع</span><br>
                <strong>المبلغ كتابة:</strong> ${numberToArabicWords(deduction.amount || 0)}<br>
                <strong>التاريخ:</strong> ${new Date(deduction.date).toLocaleString('ar-IQ')}<br>
                <strong>المصدر:</strong> ${deduction.source === 'app' ? 'التطبيق الرئيسي' : 'تطبيق المحامي'}<br>
                <strong>الملاحظات:</strong> ${deduction.notes || 'لا توجد ملاحظات'}
            </div>
            
            ${caseInfo ? `
                <h4 style="margin-top: 20px;">معلومات الدعوى:</h4>
                <div class="info-box">
                    <strong>المدعي:</strong> ${caseInfo.plaintiff}<br>
                    <strong>المدعى عليه:</strong> ${data.defendants.find(d => d.id === caseInfo.defendantId)?.name || 'غير محدد'}<br>
                    <strong>الحالة:</strong> ${caseInfo.status}<br>
                    <strong>المبلغ المطالب به:</strong> ${(parseFloat(caseInfo.claimAmount) || 0).toLocaleString()} د.ع
                </div>
            ` : '<p style="color: #64748b;">لم يتم العثور على معلومات الدعوى</p>'}
        </div>
    `, `
        <button class="btn btn-success" onclick="printDeductionReceipt(${JSON.stringify(deduction).replace(/'/g, '&apos;')})">
            <i class="fas fa-print"></i> طباعة
        </button>
        <button class="btn btn-secondary" onclick="modalManager.close('case-details-modal')">إغلاق</button>
    `);
}

/**
 * طباعة إيصال استقطاع
 */
function printDeductionReceipt(deduction) {
    const caseInfo = data.cases.find(c => c.caseNumber === deduction.caseNumber);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>إيصال استقطاع - ${deduction.caseNumber}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    direction: rtl; 
                    padding: 40px;
                    background: white;
                }
                .receipt-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #10b981;
                }
                .receipt-header h1 {
                    color: #1e293b;
                    font-size: 32px;
                    margin-bottom: 10px;
                }
                .receipt-header .subtitle {
                    color: #64748b;
                    font-size: 18px;
                }
                .amount-section {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    padding: 30px;
                    border-radius: 12px;
                    text-align: center;
                    margin: 30px 0;
                }
                .amount-number {
                    font-size: 48px;
                    font-weight: bold;
                    margin-bottom: 15px;
                }
                .amount-words {
                    font-size: 22px;
                    opacity: 0.95;
                }
                .info-section {
                    background: #f8fafc;
                    padding: 25px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .info-row {
                    display: flex;
                    padding: 12px 0;
                    border-bottom: 1px solid #e2e8f0;
                }
                .info-row:last-child {
                    border-bottom: none;
                }
                .info-label {
                    flex: 0 0 200px;
                    font-weight: bold;
                    color: #475569;
                }
                .info-value {
                    flex: 1;
                    color: #1e293b;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #e2e8f0;
                    text-align: center;
                    color: #64748b;
                }
            </style>
        </head>
        <body>
            <div class="receipt-header">
                <h1>إيصال استقطاع</h1>
                <div class="subtitle">نظام الإدارة القانونية</div>
            </div>

            <div class="amount-section">
                <div class="amount-number">${(deduction.amount || 0).toLocaleString()} د.ع</div>
                <div class="amount-words">${numberToArabicWords(deduction.amount || 0)}</div>
            </div>

            <div class="info-section">
                <div class="info-row">
                    <div class="info-label">رقم الدعوى:</div>
                    <div class="info-value">${deduction.caseNumber}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">تاريخ الاستقطاع:</div>
                    <div class="info-value">${new Date(deduction.date).toLocaleString('ar-IQ')}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">المصدر:</div>
                    <div class="info-value">${deduction.source === 'app' ? 'التطبيق الرئيسي' : 'تطبيق المحامي'}</div>
                </div>
                ${deduction.notes ? `
                    <div class="info-row">
                        <div class="info-label">الملاحظات:</div>
                        <div class="info-value">${deduction.notes}</div>
                    </div>
                ` : ''}
            </div>

            ${caseInfo ? `
                <h3 style="margin: 30px 0 15px; color: #1e293b;">معلومات الدعوى:</h3>
                <div class="info-section">
                    <div class="info-row">
                        <div class="info-label">المدعي:</div>
                        <div class="info-value">${caseInfo.plaintiff}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">المدعى عليه:</div>
                        <div class="info-value">${data.defendants.find(d => d.id === caseInfo.defendantId)?.name || 'غير محدد'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">الحالة:</div>
                        <div class="info-value">${caseInfo.status}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">المبلغ المطالب به:</div>
                        <div class="info-value">${(parseFloat(caseInfo.claimAmount) || 0).toLocaleString()} د.ع</div>
                    </div>
                </div>
            ` : ''}

            <div class="footer">
                تم الطباعة في: ${new Date().toLocaleString('ar-IQ')}<br>
                نظام الإدارة القانونية - الإبداع الرقمي © 2025
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 100);
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

/**
 * طباعة قائمة آخر الاستقطاعات
 */
function printLatestDeductions() {
    const allDeductions = data.deductions || [];
    const latestDeductions = allDeductions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 50);
    
    const totalAmount = latestDeductions.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>آخر الاستقطاعات</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    direction: rtl; 
                    padding: 40px;
                    background: white;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #667eea;
                }
                .print-header h1 {
                    color: #1e293b;
                    font-size: 32px;
                    margin-bottom: 10px;
                }
                .summary {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                    text-align: center;
                }
                .summary-item {
                    display: inline-block;
                    margin: 0 20px;
                }
                .summary-label {
                    font-size: 14px;
                    color: #64748b;
                }
                .summary-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #1e293b;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    padding: 12px;
                    text-align: right;
                    border: 1px solid #e2e8f0;
                    font-size: 14px;
                }
                th {
                    background: #f1f5f9;
                    font-weight: bold;
                    color: #1e293b;
                }
                tr:nth-child(even) {
                    background: #f8fafc;
                }
                @media print {
                    body { padding: 20px; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>آخر الاستقطاعات</h1>
                <div style="color: #64748b; font-size: 16px;">آخر 50 استقطاع في النظام</div>
            </div>

            <div class="summary">
                <div class="summary-item">
                    <div class="summary-label">عدد الاستقطاعات</div>
                    <div class="summary-value">${latestDeductions.length}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">إجمالي المبالغ</div>
                    <div class="summary-value">${totalAmount.toLocaleString()} د.ع</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>رقم الدعوى</th>
                        <th>المبلغ</th>
                        <th>التاريخ</th>
                        <th>المصدر</th>
                        <th>الملاحظات</th>
                    </tr>
                </thead>
                <tbody>
                    ${latestDeductions.map((d, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td><strong>${d.caseNumber}</strong></td>
                            <td style="font-weight: bold; color: #10b981;">${(d.amount || 0).toLocaleString()} د.ع</td>
                            <td>${new Date(d.date).toLocaleDateString('ar-IQ')}</td>
                            <td>${d.source === 'app' ? 'التطبيق' : 'المحامي'}</td>
                            <td>${d.notes || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b;">
                تم الطباعة في: ${new Date().toLocaleString('ar-IQ')}
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 100);
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// ===========================================
// طباعة تفاصيل الدعوى
// ===========================================

/**
 * طباعة تفاصيل دعوى
 */
function printCaseDetails(caseId) {
    const caseData = data.cases.find(c => c.id === caseId);
    if (!caseData) {
        showNotification('خطأ', 'لم يتم العثور على الدعوى', 'error');
        return;
    }
    
    const defendant = data.defendants.find(d => d.id === caseData.defendantId);
    const lawyer = data.lawyers.find(l => l.id === caseData.lawyerId);
    const caseDeductions = data.deductions ? data.deductions.filter(d => d.caseNumber === caseData.caseNumber) : [];
    const totalDeductions = caseDeductions.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>تفاصيل الدعوى - ${caseData.caseNumber}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    direction: rtl; 
                    padding: 40px;
                    background: white;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #667eea;
                }
                .print-header h1 {
                    color: #1e293b;
                    font-size: 32px;
                    margin-bottom: 10px;
                }
                .section {
                    background: #f8fafc;
                    padding: 25px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .section-title {
                    font-size: 20px;
                    font-weight: bold;
                    color: #1e293b;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #e2e8f0;
                }
                .info-row {
                    display: flex;
                    padding: 12px 0;
                    border-bottom: 1px solid #e2e8f0;
                }
                .info-row:last-child {
                    border-bottom: none;
                }
                .info-label {
                    flex: 0 0 200px;
                    font-weight: bold;
                    color: #475569;
                }
                .info-value {
                    flex: 1;
                    color: #1e293b;
                }
                .amount-highlight {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    padding: 30px;
                    border-radius: 12px;
                    text-align: center;
                    margin: 30px 0;
                }
                .amount-number {
                    font-size: 48px;
                    font-weight: bold;
                    margin-bottom: 15px;
                }
                .amount-words {
                    font-size: 22px;
                    opacity: 0.95;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
                th, td {
                    padding: 12px;
                    text-align: right;
                    border: 1px solid #e2e8f0;
                }
                th {
                    background: #f1f5f9;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background: #f8fafc;
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>تفاصيل الدعوى</h1>
                <div style="color: #64748b; font-size: 18px;">${caseData.caseNumber}</div>
            </div>

            <div class="amount-highlight">
                <div class="amount-number">${(parseFloat(caseData.claimAmount) || 0).toLocaleString()} د.ع</div>
                <div class="amount-words">${numberToArabicWords(parseFloat(caseData.claimAmount) || 0)}</div>
            </div>

            <div class="section">
                <div class="section-title">المعلومات الأساسية</div>
                <div class="info-row">
                    <div class="info-label">رقم الدعوى:</div>
                    <div class="info-value">${caseData.caseNumber}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">المدعي:</div>
                    <div class="info-value">${caseData.plaintiff}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">المدعى عليه:</div>
                    <div class="info-value">${defendant ? defendant.name : 'غير محدد'}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">المحامي:</div>
                    <div class="info-value">${lawyer ? lawyer.name : 'غير محدد'}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">تاريخ الدعوى:</div>
                    <div class="info-value">${new Date(caseData.caseDate).toLocaleDateString('ar-IQ')}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">الحالة:</div>
                    <div class="info-value">${caseData.status}</div>
                </div>
            </div>

            ${caseData.caseDetails ? `
                <div class="section">
                    <div class="section-title">تفاصيل الدعوى</div>
                    <div style="line-height: 1.8; color: #1e293b;">${caseData.caseDetails}</div>
                </div>
            ` : ''}

            ${caseDeductions.length > 0 ? `
                <div class="section">
                    <div class="section-title">الاستقطاعات</div>
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <strong>مجموع الاستقطاعات:</strong> ${totalDeductions.toLocaleString()} د.ع
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>المبلغ</th>
                                <th>المصدر</th>
                                <th>الملاحظات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${caseDeductions.map(d => `
                                <tr>
                                    <td>${new Date(d.date).toLocaleString('ar-IQ')}</td>
                                    <td style="font-weight: bold; color: #10b981;">${(d.amount || 0).toLocaleString()} د.ع</td>
                                    <td>${d.source === 'app' ? 'التطبيق' : 'المحامي'}</td>
                                    <td>${d.notes || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}

            <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b;">
                تم الطباعة في: ${new Date().toLocaleString('ar-IQ')}<br>
                نظام الإدارة القانونية - الإبداع الرقمي © 2025
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 100);
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// ===========================================
// طباعة الجداول
// ===========================================

/**
 * طباعة جدول الدعاوى
 */
function printCasesTable() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>جدول الدعاوى</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    direction: rtl; 
                    padding: 40px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #667eea;
                }
                h1 { color: #1e293b; font-size: 32px; margin-bottom: 10px; }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 12px;
                    text-align: right;
                    border: 1px solid #e2e8f0;
                }
                th {
                    background: #f1f5f9;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background: #f8fafc;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>جدول الدعاوى</h1>
                <div style="color: #64748b;">إجمالي: ${data.cases.length} دعوى</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>رقم الدعوى</th>
                        <th>المدعي</th>
                        <th>المدعى عليه</th>
                        <th>المبلغ</th>
                        <th>الحالة</th>
                        <th>التاريخ</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.cases.map(c => {
                        const defendant = data.defendants.find(d => d.id === c.defendantId);
                        return `
                            <tr>
                                <td>${c.caseNumber}</td>
                                <td>${c.plaintiff}</td>
                                <td>${defendant ? defendant.name : 'غير محدد'}</td>
                                <td>${(parseFloat(c.claimAmount) || 0).toLocaleString()} د.ع</td>
                                <td>${c.status}</td>
                                <td>${new Date(c.caseDate).toLocaleDateString('ar-IQ')}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            <div style="margin-top: 30px; text-align: center; color: #64748b;">
                تم الطباعة في: ${new Date().toLocaleString('ar-IQ')}
            </div>
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 100);
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

/**
 * طباعة جدول المدعى عليهم
 */
function printDefendantsTable() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>جدول المدعى عليهم</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    direction: rtl; 
                    padding: 40px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #667eea;
                }
                h1 { color: #1e293b; font-size: 32px; margin-bottom: 10px; }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 12px;
                    text-align: right;
                    border: 1px solid #e2e8f0;
                }
                th {
                    background: #f1f5f9;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background: #f8fafc;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>جدول المدعى عليهم</h1>
                <div style="color: #64748b;">إجمالي: ${data.defendants.length} مدعى عليه</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>رقم الهاتف</th>
                        <th>العنوان</th>
                        <th>عدد الدعاوى</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.defendants.map(d => {
                        const casesCount = data.cases.filter(c => c.defendantId === d.id).length;
                        return `
                            <tr>
                                <td>${d.name}</td>
                                <td>${d.phone}</td>
                                <td>${d.address || '-'}</td>
                                <td>${casesCount}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            <div style="margin-top: 30px; text-align: center; color: #64748b;">
                تم الطباعة في: ${new Date().toLocaleString('ar-IQ')}
            </div>
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 100);
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

/**
 * طباعة جدول المحامين
 */
function printLawyersTable() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>جدول المحامين</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    direction: rtl; 
                    padding: 40px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #667eea;
                }
                h1 { color: #1e293b; font-size: 32px; margin-bottom: 10px; }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 12px;
                    text-align: right;
                    border: 1px solid #e2e8f0;
                }
                th {
                    background: #f1f5f9;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background: #f8fafc;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>جدول المحامين</h1>
                <div style="color: #64748b;">إجمالي: ${data.lawyers.length} محامي</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>رقم الهاتف</th>
                        <th>عدد الدعاوى</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.lawyers.map(l => {
                        const casesCount = data.cases.filter(c => c.lawyerId === l.id).length;
                        return `
                            <tr>
                                <td>${l.name}</td>
                                <td>${l.phone}</td>
                                <td>${casesCount}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            <div style="margin-top: 30px; text-align: center; color: #64748b;">
                تم الطباعة في: ${new Date().toLocaleString('ar-IQ')}
            </div>
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 100);
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// ===========================================
// نظام الإشعارات لتحديثات حالة الدعوى
// ===========================================

/**
 * مراقبة تحديثات Firebase
 */
if (typeof db !== 'undefined' && db) {
    console.log('🔔 تفعيل مراقبة تحديثات حالة الدعوى...');
    
    // مراقبة تغييرات الدعاوى
    db.ref(DB_PATHS.CASES).on('child_changed', (snapshot) => {
        const updatedCase = snapshot.val();
        if (updatedCase && updatedCase.status) {
            // إنشاء إشعار
            const notification = {
                id: utils.generateId(),
                type: 'case_status_update',
                title: 'تحديث حالة الدعوى',
                message: `تم تحديث حالة الدعوى ${updatedCase.caseNumber} إلى: ${updatedCase.status}`,
                timestamp: Date.now(),
                caseId: updatedCase.id,
                caseNumber: updatedCase.caseNumber,
                read: false
            };
            
            // حفظ الإشعار
            if (data.notifications) {
                data.notifications.push(notification);
            } else {
                data.notifications = [notification];
            }
            
            // حفظ في Firebase
            db.ref(DB_PATHS.NOTIFICATIONS).push(notification);
            
            // عرض الإشعار
            showNotification(notification.title, notification.message, 'info');
            
            // تحديث عداد الإشعارات
            updateNotificationBell();
        }
    });
    
    // مراقبة الاستقطاعات الجديدة
    db.ref(DB_PATHS.DEDUCTIONS).on('child_added', (snapshot) => {
        const deduction = snapshot.val();
        if (deduction && deduction.source === 'lawyer') {
            // إنشاء إشعار للاستقطاع من المحامي
            const notification = {
                id: utils.generateId(),
                type: 'new_deduction',
                title: 'استقطاع جديد',
                message: `تم إضافة استقطاع جديد للدعوى ${deduction.caseNumber} بمبلغ ${(deduction.amount || 0).toLocaleString()} د.ع`,
                timestamp: Date.now(),
                caseNumber: deduction.caseNumber,
                amount: deduction.amount,
                read: false
            };
            
            // حفظ الإشعار
            if (data.notifications) {
                data.notifications.push(notification);
            } else {
                data.notifications = [notification];
            }
            
            // حفظ في Firebase
            db.ref(DB_PATHS.NOTIFICATIONS).push(notification);
            
            // عرض الإشعار
            showNotification(notification.title, notification.message, 'success');
            
            // تحديث عداد الإشعارات
            updateNotificationBell();
        }
    });
}

console.log('✅ تم تحميل ملف التوسعات بنجاح!');