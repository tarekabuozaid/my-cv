// يتم تنفيذ هذا الكود فوراً للكشف عن فشل تحميل Font Awesome
(function detectFontAwesomeFailure() {
  // إضافة فحص الأيقونات عند تحميل الصفحة
  window.addEventListener('DOMContentLoaded', function() {
    // نحدد أول فحص فوري
    checkFontAwesome();
    
    // وفحص آخر بعد تأخير للتأكد من اكتمال تحميل الصفحة
    setTimeout(checkFontAwesome, 500);
    setTimeout(checkFontAwesome, 1500);
    
    // ثم بعد التحميل الكامل للصفحة
    window.addEventListener('load', function() {
      setTimeout(checkFontAwesome, 100);
    });
  });
  
  function checkFontAwesome() {
    // محاولة العثور على أيقونات Font Awesome
    const testIcons = document.querySelectorAll('.fas, .fab, .far');
    let failed = true;
    
    // اختبار وجود الأيقونات وصحة عرضها
    if (testIcons.length > 0) {
      for (let i = 0; i < Math.min(testIcons.length, 5); i++) {
        const style = window.getComputedStyle(testIcons[i]);
        const fontFamily = style.fontFamily;
        // التحقق من وجود Font Awesome في اسم العائلة
        if (fontFamily && 
            (fontFamily.indexOf('Font Awesome') > -1 ||
             fontFamily.indexOf('FontAwesome') > -1)) {
          failed = false;
          break;
        }
      }
    }
    
    // إذا فشل تحميل الأيقونات، استخدم البديل
    if (failed) {
      document.documentElement.classList.add('fontawesome-i-fail');
      console.log('Font Awesome failed to load correctly - using fallback icons');
      // محاولة إعادة تحميل مكتبة Font Awesome
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://kit-free.fontawesome.com/releases/latest/css/free.min.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }
})();