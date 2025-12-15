/**
 * ================================================
 * إصلاح الشريط الجانبي للجوال
 * Mobile Sidebar Fix
 * شركة الإبداع الرقمي - كرار الشعبري
 * ================================================
 */

(function() {
    'use strict';
    
    console.log('📱 تحميل إصلاحات الشريط الجانبي للجوال...');
    
    /**
     * تهيئة الشريط الجانبي للجوال
     */
    function initMobileSidebar() {
        // الحصول على العناصر
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const body = document.body;
        
        if (!sidebar) {
            console.error('❌ لم يتم العثور على الشريط الجانبي');
            return;
        }
        
        // إنشاء زر التبديل إذا لم يكن موجوداً
        if (!sidebarToggle) {
            console.log('⚡ إنشاء زر القائمة...');
            const toggle = document.createElement('button');
            toggle.id = 'sidebarToggle';
            toggle.className = 'sidebar-toggle';
            toggle.innerHTML = '<i class="fas fa-bars"></i>';
            toggle.style.display = 'none'; // مخفي على الديسكتوب
            body.appendChild(toggle);
        }
        
        // إنشاء الـ overlay
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            console.log('⚡ إنشاء overlay...');
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            body.appendChild(overlay);
        }
        
        // الحصول على العناصر المحدثة
        const finalToggle = document.getElementById('sidebarToggle');
        
        // وظيفة فتح القائمة
        function openSidebar() {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            body.classList.add('sidebar-open');
            console.log('✅ تم فتح القائمة');
        }
        
        // وظيفة إغلاق القائمة
        function closeSidebar() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            body.classList.remove('sidebar-open');
            console.log('✅ تم إغلاق القائمة');
        }
        
        // وظيفة التبديل
        function toggleSidebar() {
            if (sidebar.classList.contains('active')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        }
        
        // إضافة مستمع للزر
        if (finalToggle) {
            finalToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleSidebar();
            });
        }
        
        // إضافة مستمع للـ overlay
        if (overlay) {
            overlay.addEventListener('click', function() {
                closeSidebar();
            });
        }
        
        // إغلاق القائمة عند اختيار صفحة (فقط على الجوال)
        document.querySelectorAll('.nav-item').forEach(function(item) {
            item.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    setTimeout(closeSidebar, 300);
                }
            });
        });
        
        // إغلاق القائمة عند تغيير حجم الشاشة
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768) {
                    closeSidebar();
                    body.classList.remove('sidebar-open');
                }
            }, 250);
        });
        
        // منع التمرير في الخلفية عند فتح القائمة
        overlay.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });
        
        console.log('✅ تم تهيئة الشريط الجانبي للجوال');
    }
    
    /**
     * إصلاح مشكلة التمرير
     */
    function fixScrolling() {
        const mainContent = document.querySelector('.main-content');
        const body = document.body;
        
        if (mainContent) {
            // التأكد من إمكانية التمرير
            mainContent.style.overflowY = 'auto';
            mainContent.style.overflowX = 'hidden';
            mainContent.style.webkitOverflowScrolling = 'touch';
        }
        
        // التأكد من إمكانية التمرير في الـ body
        body.style.overflowX = 'hidden';
        body.style.overflowY = 'auto';
        
        console.log('✅ تم إصلاح التمرير');
    }
    
    /**
     * إصلاح ارتفاع الشاشة على iOS
     */
    function fixIOSHeight() {
        // إصلاح مشكلة 100vh على iOS
        function setVH() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);
        
        console.log('✅ تم إصلاح ارتفاع الشاشة لـ iOS');
    }
    
    /**
     * تحسين الأداء على الجوال
     */
    function optimizePerformance() {
        // إضافة will-change للعناصر المتحركة
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            sidebar.style.willChange = 'transform';
        }
        
        if (overlay) {
            overlay.style.willChange = 'opacity';
        }
        
        // تفعيل تسريع الأجهزة
        const style = document.createElement('style');
        style.textContent = `
            .sidebar,
            .sidebar-overlay {
                transform: translateZ(0);
                -webkit-transform: translateZ(0);
            }
        `;
        document.head.appendChild(style);
        
        console.log('✅ تم تحسين الأداء');
    }
    
    /**
     * التهيئة الرئيسية
     */
    function init() {
        console.log('🚀 بدء تهيئة إصلاحات الجوال...');
        
        // الانتظار حتى يتم تحميل DOM بالكامل
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initMobileSidebar();
                fixScrolling();
                fixIOSHeight();
                optimizePerformance();
            });
        } else {
            initMobileSidebar();
            fixScrolling();
            fixIOSHeight();
            optimizePerformance();
        }
    }
    
    // تشغيل التهيئة
    init();
    
    console.log('✅ تم تحميل إصلاحات الشريط الجانبي للجوال');
    
})();
