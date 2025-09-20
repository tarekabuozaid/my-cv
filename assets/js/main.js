// ===== دوال المساعدة الموحدة (مرة واحدة فقط) =====
const $ = (sel, ctx=document) => ctx.querySelector(sel); // تحديد عنصر واحد
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel)); // تحديد عدة عناصر
const isMobile = () => {
  // كشف الموبايل بناءً على عرض الشاشة وخصائص الجهاز
  return window.innerWidth <= 768 || 
         (navigator.userAgent.match(/Android/i) || 
          navigator.userAgent.match(/webOS/i) || 
          navigator.userAgent.match(/iPhone/i) || 
          navigator.userAgent.match(/iPad/i) || 
          navigator.userAgent.match(/iPod/i) || 
          navigator.userAgent.match(/BlackBerry/i) || 
          navigator.userAgent.match(/Windows Phone/i));
};
// تعريف متغير عام للتفضيلات
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('prefers-reduced', prefersReduced);

(function(){
  "use strict";
  // صيانة: هذا السكربت يتعامل مع تفضيلات الحركة المقللة - لا تغير الوظائف الأساسية
  // تم نقل تعريف prefersReduced إلى الأعلى كمتغير عام

  // ===== تمييز عنصر القائمة النشط عبر IntersectionObserver =====
  // صيانة: هذا الكود مسؤول عن تحديد القسم النشط في القائمة أثناء التمرير
  // إذا أضفت أقساماً جديدة، تأكد من تحديث الروابط في القائمة بنفس معرفات الأقسام
  const menuLinks = $$('#menu a[href^="#"]');
  const sections = menuLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        const id = '#' + e.target.id;
        const link = $(`#menu a[href="${id}"]`);
        if (link && e.isIntersecting){
          menuLinks.forEach(l=>l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0.01 });
    sections.forEach(s=>io.observe(s));
  }

  // ===== تأثير الكتابة المتتابعة لسطح المكتب والموبايل =====
  const typeTargets = ['#typewriter', '#typewriterMobile']
    .map(sel => $(sel))
    .filter(Boolean);
  const typeText = 'CAFM ADMIN | Help Desk & Facilities Technology Specialist';
  if (typeTargets.length){
    let i = 0;
    const speed = 16; // ~60fps
    (function tick(){
      if (i < typeText.length){
        const ch = typeText.charAt(i++);
        typeTargets.forEach(el => el.textContent += ch);
        setTimeout(tick, speed);
      }
    })();
  }

  // ===== إظهار الأقسام تدريجياً عند التمرير =====
  const revealEls = $$('section');
  if ('IntersectionObserver' in window && revealEls.length){
    const ro = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if (entry.isIntersecting) entry.target.classList.add('reveal');
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el=>ro.observe(el));
  }

  // Hologram is the sole navigation focus.

  // ===== دالة إضافة تأثير التموج (Ripple) على الأزرار =====
  const addRippleEffect = (event) => {
    const btn = event.target.closest('.btn');
    if (!btn || prefersReduced) return;
    
    const r = btn.getBoundingClientRect();
    const d = Math.max(r.width, r.height);
    const x = event.clientX - r.left, y = event.clientY - r.top;
    
    const rip = document.createElement('span');
    rip.className = 'ripple';
    rip.style.left = x+'px'; 
    rip.style.top = y+'px';
    btn.appendChild(rip);
    
    rip.animate(
      [{ width:0, height:0, opacity:.35 }, { width:d*2+'px', height:d*2+'px', opacity:0 }],
      { duration: 600, easing: 'ease-out' }
    ).onfinish = () => rip.remove();
  };

  // ===== أثر المؤشر الديناميكي (مع تعطيل لخيارات تقليل الحركة) =====
  const trailEnabled = !prefersReduced && !isMobile();
  let trailEls = [];
  let trailAnimationId;
  
  // دالة إنشاء أثر المؤشر
  const createCursorTrail = () => {
    if (!trailEnabled) return;
    
    const maxTrail = 14;
    for (let i=0; i<maxTrail; i++){
      const dot = document.createElement('div');
      dot.className = 'cursor-trail';
      document.body.appendChild(dot);
      trailEls.push(dot);
    }
    
    let mouseX = 0, mouseY = 0;
    window.addEventListener('pointermove', e => { 
      mouseX = e.clientX; 
      mouseY = e.clientY; 
    }, { passive: true });

    // حلقة تحريك النقاط
    const animateTrail = () => {
      trailEls.forEach((el, idx) => {
        const t = (idx+1)/trailEls.length;
        // simple easing
        const x = mouseX - 3 + Math.sin(performance.now()/200 + idx)*0.5;
        const y = mouseY - 3 + Math.cos(performance.now()/200 + idx)*0.5;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        el.style.opacity = (1 - t).toFixed(2);
      });
      trailAnimationId = requestAnimationFrame(animateTrail);
    };
    
    trailAnimationId = requestAnimationFrame(animateTrail);
  };
  
  // دالة تنظيف أثر المؤشر
  const cleanupCursorTrail = () => {
    if (trailAnimationId) {
      cancelAnimationFrame(trailAnimationId);
      trailAnimationId = null;
    }
    trailEls.forEach(el => el.remove());
    trailEls = [];
    $$('.cursor-trail').forEach(el => el.remove());
  };
  
  // إنشاء أثر المؤشر إذا كانت الحركة ممكنة وليس موبايل
  if (trailEnabled) {
    createCursorTrail();
    
    // تنظيف عند التحول للموبايل
    window.addEventListener('resize', () => {
      if (isMobile()) {
        cleanupCursorTrail();
      }
    }, { passive: true });
  } else {
    cleanupCursorTrail();
  }

  // تسجيل معالج حدث النقر لتأثير الـ Ripple
  document.addEventListener('click', addRippleEffect, true);

  // ===== تأثير نص الماتريكس الخلفي المحسن =====
  (function matrix(){
    const bg = $('#matrix-bg');
    if (!bg) return;
    if (prefersReduced || isMobile()) { bg.style.display = 'none'; return; }

    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const colWidth = 20;
    const cols = Math.floor(window.innerWidth / colWidth);
    const waves = Math.min(cols, 40); // reasonable ceiling
    bg.innerHTML = ''; // clean

    for (let i=0;i<waves;i++){
      const col = document.createElement('div');
      col.className = 'matrix-column';
      col.style.left = (i * colWidth) + 'px';
      col.style.animation = `matrix-fall ${2 + Math.random()*3}s linear ${Math.random()*2}s infinite`;
      // Create content once
      let html = '';
      const len = Math.floor(Math.random()*18) + 12;
      for (let j=0;j<len;j++){
        html += CHARS.charAt(Math.floor(Math.random()*CHARS.length)) + '<br>';
      }
      col.innerHTML = html;
      bg.appendChild(col);
    }
  })();

  // ===== إدارة عرض الأقسام على الموبايل (تاريخ + تركيز) =====
  const mobileState = { 
    current: null, 
    lastFocus: null, 
    isScrolling: false, 
    isClosing: false,
    focusableElements: null,
    keydownHandler: null
  };
  
  // تحسينات إمكانية الوصول لإدارة التركيز والتنقل بلوحة المفاتيح
  function setupFocusTrap(dialogElement) {
    // تحديد جميع العناصر القابلة للتركيز داخل مربع الحوار
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(dialogElement.querySelectorAll(focusableSelectors));
    
    // تخزين العناصر القابلة للتركيز في حالة التطبيق
    mobileState.focusableElements = focusableElements;
    
    // إنشاء معالج الضغط على المفاتيح للتعامل مع التنقل بلوحة المفاتيح
    const handleKeydown = (event) => {
      // معالجة مفتاح الهروب (Escape) لإغلاق مربع الحوار
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSectionMobile();
        return;
      }
      
      // إدارة التنقل بمفتاح Tab
      if (event.key === 'Tab' && focusableElements.length > 0) {
        // احصل على الموقع الحالي
        const currentIndex = focusableElements.indexOf(document.activeElement);
        
        // التنقل للخلف (Shift+Tab)
        if (event.shiftKey) {
          if (currentIndex <= 0) {
            // إذا كنا في أول عنصر، انتقل إلى آخر عنصر
            focusableElements[focusableElements.length - 1].focus();
            event.preventDefault();
          }
        } 
        // التنقل للأمام (Tab)
        else {
          if (currentIndex === focusableElements.length - 1 || currentIndex === -1) {
            // إذا كنا في آخر عنصر أو خارج القائمة، انتقل إلى أول عنصر
            focusableElements[0].focus();
            event.preventDefault();
          }
        }
      }
    };
    
    // تخزين المعالج في حالة التطبيق لإزالته لاحقًا
    mobileState.keydownHandler = handleKeydown;
    
    // إضافة مستمع أحداث للتعامل مع ضغطات المفاتيح
    document.addEventListener('keydown', handleKeydown);
  }
  
  function removeFocusTrap() {
    // إزالة مستمع أحداث الضغط على المفاتيح إذا كان موجودًا
    if (mobileState.keydownHandler) {
      document.removeEventListener('keydown', mobileState.keydownHandler);
      mobileState.keydownHandler = null;
    }
    
    // إعادة تعيين قائمة العناصر القابلة للتركيز
    mobileState.focusableElements = null;
  }
  
  // منع الإغلاق العرضي للأقسام
  function preventAccidentalClose(e) {
    if (mobileState.current && isMobile() && (mobileState.isScrolling || mobileState.isClosing)) {
      // منع انتشار الحدث الذي قد يتسبب في إغلاق القسم
      e.stopPropagation();
    }
  }

  function openSectionMobile(name){
    // مهم: تأكد من أننا على الموبايل قبل فتح أقسام الموبايل
    if (!isMobile()) return false;
    
    const view = $(`#${name}-view`);
    if (!view) return false;

    mobileState.lastFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    mobileState.current = name;
    view.classList.add('active');
    view.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    
    // تحديث حالة aria-expanded للزر المرتبط بهذا القسم
    const relatedButton = document.querySelector(`.holo-chip[data-section="${name}"]`);
    if (relatedButton) {
      relatedButton.setAttribute('aria-expanded', 'true');
    }

    // الاستماع لحدث انتهاء الانتقال لتمكين التمرير بشكل آمن
    const onTransitionEnd = () => {
      // تمكين التمرير الآمن بعد اكتمال الانتقال
      mobileState.isScrolling = false;
      view.removeEventListener('transitionend', onTransitionEnd);
    };
    
    // تتبع مستمعي أحداث transitionend للتنظيف اللاحق
    if (!view._transitionListeners) {
      view._transitionListeners = [];
    }
    view._transitionListeners.push(onTransitionEnd);
    view.addEventListener('transitionend', onTransitionEnd, { once: true });

    // منع التمرير من إغلاق القسم عن طريق تثبيت المحتوى
    const sectionContent = view.querySelector('.section-content');
    if (sectionContent) {
      // إضافة مستمعي أحداث للتعامل مع التمرير
      const handleTouchStart = () => { mobileState.isScrolling = true; };
      const handleTouchMove = () => { mobileState.isScrolling = true; };
      const handleTouchEnd = () => { 
        // ضمان عدم إغلاق القسم مباشرة بعد التمرير
        setTimeout(() => { mobileState.isScrolling = false; }, 300); 
      };

      sectionContent.addEventListener('touchstart', handleTouchStart, { passive: true });
      sectionContent.addEventListener('touchmove', handleTouchMove, { passive: true });
      sectionContent.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      // تخزين المستمعين في كائن الحالة لإزالتهم لاحقًا
      mobileState.eventHandlers = {
        touchstart: handleTouchStart,
        touchmove: handleTouchMove,
        touchend: handleTouchEnd,
        element: sectionContent
      };
    }

    const header = view.querySelector('.section-header h2');
    if (header){
      header.setAttribute('tabindex','-1');
      header.focus({ preventScroll:true });
    }
    
    // إعداد مصيدة التركيز لتحسين إمكانية الوصول
    setupFocusTrap(view);

    // تحديث التاريخ بمعلومات إضافية
    history.pushState({ 
      section: name,
      timestamp: Date.now(),
      isModal: true 
    }, '', `#${name}`);
    return true;
  }

  function closeSectionMobile(){
    // منع الإغلاق أثناء التمرير النشط
    if (mobileState.isScrolling) return false;
    
    if (!mobileState.current) return false;
    const view = $(`#${mobileState.current}-view`);
    if (view){
      // قبل إغلاق القسم، نضع علامة أنه قيد الإغلاق لمنع التفاعلات
      mobileState.isClosing = true;
      
      // إزالة مستمعي أحداث التمرير إذا كانوا موجودين
      if (mobileState.eventHandlers && mobileState.eventHandlers.element) {
        const eh = mobileState.eventHandlers;
        eh.element.removeEventListener('touchstart', eh.touchstart);
        eh.element.removeEventListener('touchmove', eh.touchmove);
        eh.element.removeEventListener('touchend', eh.touchend);
        mobileState.eventHandlers = null;
      }

      // تحديث الحالة قبل إزالة الفئة النشطة
      view.classList.remove('active');
      view.setAttribute('aria-hidden','true');
      
      // استمع لحدث انتهاء الانتقال لإعادة تعيين الحالة
      const onCloseTransitionEnd = () => {
        mobileState.isClosing = false;
        view.removeEventListener('transitionend', onCloseTransitionEnd);
      };
      view.addEventListener('transitionend', onCloseTransitionEnd, { once: true });
      
      // تأكد من إزالة أي مستمعي أحداث transitionend متبقية
      // هذا للتأكد من عدم تسرب الذاكرة في حالة إغلاق متعدد أو فشل الانتقال
      const allTransitionListeners = view._transitionListeners || [];
      allTransitionListeners.forEach(listener => {
        if (listener !== onCloseTransitionEnd) {
          view.removeEventListener('transitionend', listener);
        }
      });
      
      // تحديث حالة aria-expanded للزر المرتبط بهذا القسم
      const relatedButton = document.querySelector(`.holo-chip[data-section="${mobileState.current}"]`);
      if (relatedButton) {
        relatedButton.setAttribute('aria-expanded', 'false');
      }
      
      // إزالة مصيدة التركيز عند إغلاق مربع الحوار
      removeFocusTrap();
    }

    document.body.style.overflow = 'auto';
    
    // تحديث التاريخ مع منع التسجيل في سجل التاريخ عند الإغلاق
    // استخدام replaceState بدلاً من pushState يمنع إضافة إدخال جديد إلى تاريخ التصفح
    history.replaceState(
      { closeModal: true, timestamp: Date.now() }, 
      '', 
      location.pathname
    );

    if (mobileState.lastFocus && typeof mobileState.lastFocus.focus === 'function'){
      mobileState.lastFocus.focus({ preventScroll:true });
    }

    // تنظيف شامل للذاكرة
    // تنظيف كائن _transitionListeners إذا كان موجودًا
    if (view && view._transitionListeners) {
      view._transitionListeners = null;
    }

    mobileState.current = null;
    mobileState.lastFocus = null;
    return true;
  }

  window.openSection = openSectionMobile;
  window.closeSection = closeSectionMobile;
  window.backToGrid = closeSectionMobile;

  // إضافة مستمعي أحداث لمنع الإغلاق العرضي للقسم عند التمرير
  document.addEventListener('scroll', preventAccidentalClose, { passive: true });
  document.addEventListener('touchmove', preventAccidentalClose, { passive: true });
  document.addEventListener('wheel', preventAccidentalClose, { passive: true });
  
  // معالج عام لمفتاح Escape على مستوى المستند
  document.addEventListener('keydown', (event) => {
    // إذا كان المفتاح المضغوط هو Escape وهناك قسم مفتوح حالياً
    if (event.key === 'Escape' && isMobile() && mobileState.current) {
      // تأكد من أن الحدث لم يتم معالجته بواسطة focus-trap
      if (event.defaultPrevented) {
        return;
      }
      
      // إغلاق القسم المفتوح
      closeSectionMobile();
      
      // منع المعالجة المزدوجة للحدث
      event.preventDefault();
    }
  });

  // تحسين التعامل مع أحداث التاريخ (زر الرجوع، السويب)
  // صيانة: هذا الكود مهم للغاية للتنقل المرن على الأجهزة المحمولة
  // يتعامل مع أزرار الرجوع والتقدم في المتصفح عند فتح الأقسام
  window.addEventListener('popstate', (event)=>{
    // إذا كنا على الموبايل وهناك قسم مفتوح حالياً
    if (isMobile() && mobileState.current) {
      // إغلاق القسم المفتوح حالياً
      closeSectionMobile();
      return;
    }
    
    // التعامل مع حالة الانتقال من #section إلى URL آخر
    const hash = location.hash.replace('#', '');
    if (hash && event.state && event.state.section) {
      // إذا كان هناك section محدد في الـ hash وفي حالة التاريخ
      if (isMobile()) {
        // على الموبايل، نفتح القسم المناسب
        openSectionMobile(hash);
      } else {
        // على سطح المكتب، ننتقل إلى القسم
        const targetSection = document.getElementById(hash);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  });

  // ===== تحميل الصور بتقنية Lazy كحل احتياطي =====
  window.addEventListener('DOMContentLoaded', ()=>{
    $$('img:not([loading])').forEach(img=>{
      // Exclude hero image inside hero section only
      const isHero = img.closest('.hero');
      if (!isHero) img.setAttribute('loading','lazy');
      if (!img.getAttribute('width') || !img.getAttribute('height')){
        // If no dimensions, try to guess from container
        const r = img.getBoundingClientRect();
        if (r.width && r.height){
          img.setAttribute('width', Math.round(r.width));
          img.setAttribute('height', Math.round(r.height));
        }
      }
    });
    
    // إضافة معالج عام لمفتاح Escape للتعامل مع خروج المستخدم من المودالات
    document.addEventListener('keydown', (event) => {
      // إذا كان المفتاح المضغوط هو Escape وهناك قسم مفتوح حالياً
      if (event.key === 'Escape' && isMobile() && mobileState.current) {
        // تأكد من أن الحدث لم يتم معالجته بواسطة نظام focus-trap داخل المودال
        if (!mobileState.keydownHandler || event.defaultPrevented) {
          return;
        }
        
        // إغلاق القسم المفتوح
        closeSectionMobile();
        
        // منع المعالجة المزدوجة للحدث
        event.preventDefault();
      }
    });
  });
})();

// ===== الاستجابة لتغيير حجم الشاشة =====
const handleResize = ()=>{
  if (!isMobile()) return;
  $$('.section-view').forEach(v=>v.classList.remove('active'));
  document.body.style.overflow = 'auto';
  mobileState.current = null;
};
window.addEventListener('resize', handleResize, { passive: true });
window.addEventListener('load', handleResize, { once: true, passive: true });