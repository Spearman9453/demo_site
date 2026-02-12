(function() {
    console.log("AliAccess Pro: V9.1 (Back to Basics - No Filters)");

    // --- 1. הגדרות שפה ---
    const translations = {
        he: { dir: 'rtl', title: 'נגישות', contrast: 'ניגודיות', grayscale: 'שחור לבן', links: 'הדגשת קישורים וטפסים', readable: 'גופן קריא', cursor: 'סמן גדול', tts: 'קורא מסך', spacing: 'ריווח טקסט', stopAnim: 'עצור אנימציות', reset: 'איפוס הגדרות', close: 'סגור', langName: 'עברית', fontPlus: 'הגדל טקסט', fontMinus: 'הקטן טקסט', touchMode: 'מצב מגע', skipLink: 'דלג לתוכן המרכזי', readingGuide: 'סרגל קריאה', hideImages: 'הסתר תמונות', headingsMap: 'מפת אתר (כותרות)', noHeadings: 'לא נמצאו כותרות בדף זה', on: 'מופעל', off: 'כבוי' },
        en: { dir: 'ltr', title: 'Accessibility', contrast: 'Contrast', grayscale: 'Grayscale', links: 'Highlight Links & Forms', readable: 'Readable Font', cursor: 'Big Cursor', tts: 'Screen Reader', spacing: 'Text Spacing', stopAnim: 'Stop Animations', reset: 'Reset Settings', close: 'Close', langName: 'English', fontPlus: 'Increase Text', fontMinus: 'Decrease Text', touchMode: 'Touch Mode', skipLink: 'Skip to Main Content', readingGuide: 'Reading Guide', hideImages: 'Hide Images', headingsMap: 'Page Headings', noHeadings: 'No headings found', on: 'On', off: 'Off' },
        ar: { dir: 'rtl', title: 'سهولة الوصول', contrast: 'تباين', grayscale: 'تدرج رمادي', links: 'تمييز الروابط والنماذج', readable: 'خط مقروء', cursor: 'مؤشر كبير', tts: 'قارئ الشاشة', spacing: 'تباعد النص', stopAnim: 'إيقاف الرسوم', reset: 'إعادة تعيين', close: 'إغلاق', langName: 'العربية', fontPlus: 'تكبير النص', fontMinus: 'تصغير النص', touchMode: 'وضع اللمس', skipLink: 'الذهاب للمحتوى الرئيسي', readingGuide: 'دليل القراءة', hideImages: 'إخفاء الصور', headingsMap: 'خريطة الموقع', noHeadings: 'لا توجد عناوين', on: 'مُفَعَّل', off: 'مُعَطَّل' },
        ru: { dir: 'ltr', title: 'Доступность', contrast: 'Контраст', grayscale: 'Ч/Б режим', links: 'Выделение ссылок и форм', readable: 'Шрифт', cursor: 'Курсор', tts: 'Чтение экрана', spacing: 'Интервалы', stopAnim: 'Без анимации', reset: 'Сброс', close: 'Закрыть', langName: 'Русский', fontPlus: 'Увеличить текст', fontMinus: 'Уменьшить текст', touchMode: 'Сенсорный режим', skipLink: 'Перейти к контенту', readingGuide: 'Направляющая для чтения', hideImages: 'Скрыть изображения', headingsMap: 'Карта заголовков', noHeadings: 'Заголовки не найдены', on: 'Включено', off: 'Выключено' }
    };

    function determineLanguage() {
        const saved = localStorage.getItem('ali_access_lang');
        return (saved && translations[saved]) ? saved : 'he';
    }

    let currentLang = determineLanguage();
    
    // מצב פנימי
    let fontSizePct = 100;
    let ttsActive = false;
    let isMenuOpen = false;
    let isLangMenuOpen = false;
    const speechSynth = window.speechSynthesis;
    let availableVoices = [];
    const originalFontSizes = new Map();

    function loadVoices() { 
        availableVoices = speechSynth.getVoices(); 
        if (availableVoices.length > 0) console.log(`📢 Voices loaded: ${availableVoices.length}`);
    }
    if (speechSynth.onvoiceschanged !== undefined) { speechSynth.onvoiceschanged = loadVoices; }

    // --- לוגיקה ---
    function injectSkipLink() {
        const existing = document.querySelector('.ali-skip-link');
        if (existing) existing.remove();
        const link = document.createElement('a');
        link.href = '#ali-main-content';
        link.className = 'ali-skip-link';
        link.innerText = translations[currentLang].skipLink;
        document.body.prepend(link);
        const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.querySelector('h1')?.parentNode || document.body;
        if (!mainContent.id) mainContent.id = 'ali-main-content';
        mainContent.setAttribute('tabindex', '-1');
    }

    function createReadingGuide() {
        const guide = document.createElement('div');
        guide.id = 'ali-reading-guide-bar';
        guide.style.cssText = `display: none; position: fixed; left: 0; width: 100vw; height: 30px; background: rgba(255, 255, 0, 0.4); border-top: 2px solid red; border-bottom: 2px solid red; pointer-events: none; z-index: 2147483646; box-shadow: 0 0 10px rgba(0,0,0,0.5);`;
        document.body.appendChild(guide);
        document.addEventListener('mousemove', (e) => {
            if (document.body.classList.contains('ali-guide')) {
                guide.style.display = 'block';
                guide.style.top = (e.clientY - 15) + 'px';
            } else {
                guide.style.display = 'none';
            }
        });
    }

    function toggleHeadingsModal() {
        const existing = document.getElementById('ali-headings-modal');
        if (existing) { existing.remove(); return; }

        const t = translations[currentLang];
        const overlay = document.createElement('div');
        overlay.id = 'ali-headings-modal';
        overlay.className = 'ali-modal-overlay';
        overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };

        const modal = document.createElement('div');
        modal.className = 'ali-modal-content';
        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 10px;">
                <h3 style="margin:0; font-size: 18px;">${t.headingsMap}</h3>
                <button onclick="document.getElementById('ali-headings-modal').remove()" style="background:none; border:none; font-size:20px; cursor:pointer;">✕</button>
            </div>
            <div id="ali-headings-list"></div>
        `;
        
        modal.style.direction = t.dir;
        modal.style.textAlign = t.dir === 'rtl' ? 'right' : 'left';
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const listContainer = modal.querySelector('#ali-headings-list');
        const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let count = 0;

        headers.forEach((h, index) => {
            if (!h.innerText.trim() || h.closest('#ali-access-wrapper') || h.closest('.ali-modal-content')) return;
            if (!h.id) h.id = `ali-header-auto-${index}`;

            const link = document.createElement('div');
            link.innerText = h.innerText;
            link.className = 'ali-head-link';
            const level = parseInt(h.tagName.substring(1));
            link.style.paddingInlineStart = (level * 15) + 'px'; 
            link.style.fontSize = (18 - level) + 'px'; 

            link.onclick = () => {
                h.scrollIntoView({ behavior: 'smooth', block: 'center' });
                h.setAttribute('tabindex', '-1');
                h.focus();
                h.style.outline = '3px solid #f1c40f';
                setTimeout(() => h.style.outline = '', 2000);
                overlay.remove();
            };
            
            listContainer.appendChild(link);
            count++;
        });

        if (count === 0) listContainer.innerHTML = `<p style="padding: 20px; text-align: center; color: #666;">${t.noHeadings}</p>`;
    }

    const styles = `
        .ali-skip-link { position: fixed !important; top: -200px; left: 0; background-color: #000 !important; color: #fff !important; padding: 15px 25px !important; z-index: 2147483647 !important; font-size: 18px !important; font-weight: bold !important; text-decoration: none !important; border-bottom-right-radius: 8px; transition: top 0.2s ease-out; outline: 4px solid #f1c40f !important; }
        .ali-skip-link:focus { top: 0 !important; }
        #ali-access-btn { position: fixed; bottom: 20px; z-index: 2147483647; width: 55px; height: 55px; background: #0d6efd; border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; border: 2px solid white; }
        #ali-access-btn:hover { transform: scale(1.1); }
        #ali-access-btn svg { width: 32px; height: 32px; fill: white; }
        #ali-access-menu { display: none; position: fixed; bottom: 90px; width: 320px; max-height: 80vh; overflow-y: auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.25); padding: 20px; z-index: 2147483647; font-family: 'Segoe UI', Arial, sans-serif; border: 1px solid #e0e0e0; }
        #ali-access-menu.open { display: block; animation: aliFadeIn 0.3s; }
        @keyframes aliFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .ali-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; position: sticky; top: 0; background: white; z-index: 10; }
        .ali-title { font-weight: bold; font-size: 18px; color: #333; }
        .ali-controls { display: flex; gap: 10px; align-items: center; }
        .ali-icon-btn { cursor: pointer; font-size: 18px; color: #666; padding: 5px; border-radius: 4px; transition: 0.2s; }
        .ali-icon-btn:hover { background: #f0f0f0; color: #0d6efd; }
        .ali-lang-dropdown { display: none; position: absolute; top: 50px; left: 20px; right: 20px; background: white; border: 1px solid #eee; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 8px; z-index: 20; padding: 5px; }
        .ali-lang-dropdown.show { display: block; }
        .ali-lang-option { padding: 8px 12px; cursor: pointer; border-radius: 4px; display: flex; justify-content: space-between; color: #333; }
        .ali-lang-option:hover { background: #f8f9fa; color: #0d6efd; }
        .ali-lang-option.selected { background: #e7f1ff; color: #0d6efd; font-weight: bold; }
        .ali-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ali-option { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 10px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: 0.2s; color: #333; user-select: none; }
        .ali-option:hover { background: #e9ecef; border-color: #0d6efd; }
        .ali-option.active { background: #0d6efd; color: white; border-color: #0d6efd; font-weight: bold; } 
        .ali-icon { font-size: 16px; min-width: 20px; text-align: center; }
        .ali-reset { grid-column: span 2; margin-top: 10px; background: #fff0f0; color: #dc3545; border: 1px solid #ffcccc; justify-content: center; }
        .ali-reset:hover { background: #ffe6e6; }
        html.ali-contrast { filter: contrast(120%) invert(100%); background: white; }
        html.ali-grayscale { filter: grayscale(100%); }
        body.ali-links a, body.ali-links button, body.ali-links input, body.ali-links select, body.ali-links textarea { text-decoration: underline !important; background: #ffeb3b !important; color: #000 !important; font-weight: bold !important; border: 2px solid #000 !important; }
        body.ali-links a:focus, body.ali-links button:focus, body.ali-links input:focus, body.ali-links select:focus, body.ali-links textarea:focus { outline: 4px solid #d00 !important; background: #fff0f0 !important; }
        body.ali-font * { font-family: Arial, Helvetica, sans-serif !important; }
        body.ali-cursor * { cursor: url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 2l12 11.2-5.8.5 3.3 7.3-2.2.9-3.2-7.4-4.4 4V2z' fill='black' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E"), auto !important; }
        .ali-speaking { outline: 4px solid #0d6efd !important; background-color: rgba(13, 110, 253, 0.3) !important; box-shadow: 0 0 15px rgba(13, 110, 253, 0.6) !important; transition: background-color 0.2s; z-index: 99999; position: relative; }
        body.ali-spacing * { line-height: 2 !important; letter-spacing: 0.15em !important; word-spacing: 0.2em !important; }
        body.ali-spacing p { margin-bottom: 2em !important; }
        body.ali-no-anim *, body.ali-no-anim *:before, body.ali-no-anim *:after { animation: none !important; transition: none !important; transform: none !important; }
        body.ali-touch a, body.ali-touch button, body.ali-touch input, body.ali-touch select { padding: 12px !important; margin: 4px !important; min-height: 44px !important; min-width: 44px !important; }
        body.ali-hide-images img, body.ali-hide-images svg, body.ali-hide-images video, body.ali-hide-images canvas { opacity: 0 !important; visibility: hidden !important; }
        body.ali-hide-images * { background-image: none !important; } 
        .ali-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 2147483647; display: flex; justify-content: center; align-items: center; }
        .ali-modal-content { background: white; padding: 20px; border-radius: 12px; width: 85%; max-width: 500px; max-height: 70vh; overflow-y: auto; color: #333; font-family: 'Segoe UI', Arial, sans-serif; box-shadow: 0 10px 40px rgba(0,0,0,0.5); border: 1px solid #ccc; }
        .ali-head-link { display: block; padding: 8px 12px; border-bottom: 1px solid #eee; cursor: pointer; transition: 0.2s; border-radius: 4px; }
        .ali-head-link:hover { background: #f0f0f0; color: #0d6efd; font-weight: bold; }
    `;

    function render() {
        const t = translations[currentLang];
        const isRTL = t.dir === 'rtl';
        const btnPos = isRTL ? 'left: 20px' : 'right: 20px';
        const align = isRTL ? 'right' : 'left';
        
        const container = document.getElementById("ali-access-wrapper");
        container.innerHTML = `
            <div id="ali-access-btn" role="button" aria-label="${t.title}" style="${btnPos}"><svg viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg></div>
            <div id="ali-access-menu" class="${isMenuOpen ? 'open' : ''}" style="${btnPos}; direction: ${t.dir}; text-align: ${align}">
                <div class="ali-header"><span class="ali-title">${t.title}</span><div class="ali-controls"><span class="ali-icon-btn" id="ali-lang-btn">🌐</span><span class="ali-icon-btn" id="ali-close-btn">✕</span></div></div>
                <div class="ali-lang-dropdown ${isLangMenuOpen ? 'show' : ''}">
                    ${Object.keys(translations).map(lang => `<div class="ali-lang-option ${lang === currentLang ? 'selected' : ''}" data-lang="${lang}"><span>${translations[lang].langName}</span>${lang === currentLang ? '<span>✔</span>' : ''}</div>`).join('')}
                </div>
                <div class="ali-grid">
                    ${renderOption('contrast', t.contrast, '◑')}
                    ${renderOption('grayscale', t.grayscale, 'BW')}
                    ${renderOption('font-plus', t.fontPlus, 'A+')}
                    ${renderOption('font-minus', t.fontMinus, 'A-')}
                    ${renderOption('headings-map', t.headingsMap, '📑')}
                    ${renderOption('links', t.links, '🔗')}
                    ${renderOption('readable', t.readable, 'T')}
                    ${renderOption('cursor', t.cursor, '↗')}
                    ${renderOption('reading-guide', t.readingGuide, '📏')}
                    ${renderOption('hide-images', t.hideImages, '🚫')}
                    ${renderOption('touch-mode', t.touchMode, '👆')}
                    ${renderOption('stop-anim', t.stopAnim, '⏸')}
                    ${renderOption('spacing', t.spacing, '↔')}
                    ${renderOption('tts', t.tts, '🔊')}
                    <div class="ali-option ali-reset" data-action="reset">⟲ ${t.reset}</div>
                </div>
            </div>`;
        bindEvents();
    }

    function renderOption(action, text, icon) {
        let isActive = false;
        if (action === 'contrast' && document.documentElement.classList.contains('ali-contrast')) isActive = true;
        if (action === 'grayscale' && document.documentElement.classList.contains('ali-grayscale')) isActive = true;
        if (action === 'links' && document.body.classList.contains('ali-links')) isActive = true;
        if (action === 'readable' && document.body.classList.contains('ali-font')) isActive = true;
        if (action === 'cursor' && document.body.classList.contains('ali-cursor')) isActive = true;
        if (action === 'spacing' && document.body.classList.contains('ali-spacing')) isActive = true;
        if (action === 'stop-anim' && document.body.classList.contains('ali-no-anim')) isActive = true;
        if (action === 'touch-mode' && document.body.classList.contains('ali-touch')) isActive = true;
        if (action === 'reading-guide' && document.body.classList.contains('ali-guide')) isActive = true;
        if (action === 'hide-images' && document.body.classList.contains('ali-hide-images')) isActive = true;
        if (action === 'tts' && ttsActive) isActive = true;

        return `<button class="ali-option ${isActive ? 'active' : ''}" data-action="${action}" aria-pressed="${isActive}" role="switch">
                    <span class="ali-icon">${icon}</span> ${text}
                </button>`;
    }

    function bindEvents() {
        document.getElementById("ali-access-btn").onclick = () => { isMenuOpen = !isMenuOpen; render(); };
        document.getElementById("ali-close-btn").onclick = () => { isMenuOpen = false; isLangMenuOpen = false; render(); };
        document.getElementById("ali-lang-btn").onclick = (e) => { e.stopPropagation(); isLangMenuOpen = !isLangMenuOpen; render(); };
        document.querySelectorAll(".ali-lang-option").forEach(opt => { opt.onclick = () => { localStorage.setItem('ali_access_lang', opt.getAttribute("data-lang")); location.reload(); }; });
        document.querySelectorAll(".ali-option").forEach(opt => { opt.onclick = () => handleAction(opt.getAttribute("data-action"), opt); });
        
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === '9') { isMenuOpen = !isMenuOpen; render(); }
        });
    }

    function saveState() {
        const state = {
            fontSizePct: fontSizePct,
            bodyClasses: Array.from(document.body.classList).filter(c => c.startsWith('ali-')),
            htmlClasses: Array.from(document.documentElement.classList).filter(c => c.startsWith('ali-')),
        };
        localStorage.setItem('ali_access_state', JSON.stringify(state));
    }

    function loadState() {
        const saved = localStorage.getItem('ali_access_state');
        if (!saved) return;
        try {
            const state = JSON.parse(saved);
            if (state.fontSizePct && state.fontSizePct !== 100) {
                fontSizePct = state.fontSizePct;
                setTimeout(updateTextSize, 100); 
            }
            if (state.bodyClasses) state.bodyClasses.forEach(cls => document.body.classList.add(cls));
            if (state.htmlClasses) state.htmlClasses.forEach(cls => document.documentElement.classList.add(cls));
        } catch (e) { console.error("Error loading state", e); }
    }

    function updateTextSize() {
        const selectors = 'p, span, h1, h2, h3, h4, h5, h6, li, a, td, th, blockquote, div, input, button, textarea, select, label'; 
        const elements = document.querySelectorAll(selectors);
        elements.forEach(el => {
            if (el.closest('#ali-access-wrapper') || el.classList.contains('fa') || el.classList.contains('material-icons')) return;
            if (!originalFontSizes.has(el)) { const computed = window.getComputedStyle(el).fontSize; if (computed) originalFontSizes.set(el, parseFloat(computed)); }
            const original = originalFontSizes.get(el);
            if (original) { el.style.fontSize = (original * (fontSizePct / 100)) + 'px'; }
        });
    }

    function handleAction(action, btnElement) {
        const toggleState = (cls) => { 
            const isActive = document.body.classList.toggle(cls); 
            btnElement.classList.toggle("active"); 
            btnElement.setAttribute("aria-pressed", isActive);
        };
        const toggleHtml = (cls) => { 
            const isActive = document.documentElement.classList.toggle(cls); 
            btnElement.classList.toggle("active");
            btnElement.setAttribute("aria-pressed", isActive);
        };

        if (action === "contrast") toggleHtml("ali-contrast");
        if (action === "grayscale") toggleHtml("ali-grayscale");
        
        if (action === "links") toggleState("ali-links");
        if (action === "readable") toggleState("ali-font");
        if (action === "cursor") toggleState("ali-cursor");
        if (action === "spacing") toggleState("ali-spacing");
        if (action === "touch-mode") toggleState("ali-touch");
        if (action === "reading-guide") toggleState("ali-guide");
        if (action === "hide-images") toggleState("ali-hide-images");
        
        if (action === "headings-map") {
            toggleHeadingsModal();
            if (ttsActive) speakText(translations[currentLang].headingsMap);
            return; 
        }

        if (action === "font-plus") { fontSizePct += 10; updateTextSize(); }
        if (action === "font-minus") { fontSizePct = Math.max(70, fontSizePct - 10); updateTextSize(); }
        
        if (action === "stop-anim") { 
            document.body.classList.toggle("ali-no-anim"); 
            btnElement.classList.toggle("active");
            btnElement.setAttribute("aria-pressed", document.body.classList.contains("ali-no-anim"));
            const shouldPause = document.body.classList.contains("ali-no-anim"); 
            document.querySelectorAll('video, audio').forEach(v => shouldPause ? v.pause() : v.play()); 
        }

        if (action === "tts") {
            ttsActive = !ttsActive;
            btnElement.classList.toggle("active");
            btnElement.setAttribute("aria-pressed", ttsActive);
            
            if (ttsActive) { 
                document.addEventListener('mouseover', speakHandler); 
                document.addEventListener('focusin', speakHandler);
            } else { 
                document.removeEventListener('mouseover', speakHandler); 
                document.removeEventListener('focusin', speakHandler);
                speechSynth.cancel(); 
                document.querySelectorAll('.ali-speaking').forEach(el => el.classList.remove('ali-speaking')); 
            }
        }

        if (ttsActive) {
            let textToSay = btnElement.innerText;
            if (btnElement.hasAttribute('aria-pressed')) {
                const isActive = btnElement.classList.contains('active');
                const t = translations[currentLang];
                const status = isActive ? t.on : t.off;
                textToSay = `${textToSay} - ${status}`;
            }
            speakText(textToSay);
        }

        if (action === "reset") { resetAll(); render(); }
        saveState();
    }

    function speakText(text, targetElement = null) {
        speechSynth.cancel();
        document.querySelectorAll('.ali-speaking').forEach(el => el.classList.remove('ali-speaking'));

        if (!text || text.trim() === '') return;

        const u = new SpeechSynthesisUtterance(text);
        const langCode = detectLanguageFromText(text);
        u.lang = langCode;

        // V4 Logic: Simple StartsWith + Specific Name Override
        const bestVoice = getBestVoice(langCode);
        if (bestVoice) {
            u.voice = bestVoice;
            console.log(`🎤 Speaking ${langCode} with ${bestVoice.name}`);
        }

        if (targetElement) {
            targetElement.classList.add('ali-speaking');
            u.onend = () => targetElement.classList.remove('ali-speaking');
            u.onerror = () => targetElement.classList.remove('ali-speaking');
        }

        speechSynth.speak(u);
    }

    // --- חזרנו למצב ללא סינונים (הוסר target.children check) ---
    function speakHandler(e) {
        if (!availableVoices || availableVoices.length === 0) loadVoices();

        const target = e.target.closest('.ali-option, p, h1, h2, h3, h4, h5, h6, a, button, li, span, div, label, input, textarea, select') || e.target;
        if (target.id === 'ali-access-wrapper' || target.id === 'ali-access-menu' || target.classList.contains('ali-grid')) return;

        let textToRead = target.innerText;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
            textToRead = target.getAttribute('placeholder') || target.getAttribute('aria-label') || target.value;
            if (!textToRead && target.id) { const label = document.querySelector(`label[for="${target.id}"]`); if (label) textToRead = label.innerText; }
        }

        if (textToRead && textToRead.trim().length > 0) {
            speakText(textToRead, target);
        }
    }

    function detectLanguageFromText(text) {
        if (/[\u0590-\u05FF]/.test(text)) return 'he'; 
        if (/[\u0600-\u06FF]/.test(text)) return 'ar'; 
        if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Russian check
        return 'en'; 
    }

    function getBestVoice(langCode) {
        if (!availableVoices.length) availableVoices = speechSynth.getVoices();
        
        let voice = availableVoices.find(v => v.lang.startsWith(langCode));
        
        // V4 Logic for Russian/Arabic
        if (!voice && langCode === 'ru') voice = availableVoices.find(v => v.name.includes("Russian") || v.name.includes("русский"));
        if (!voice && langCode === 'ar') voice = availableVoices.find(v => v.name.includes("Arabic") || v.name.includes("العربية"));
        
        return voice;
    }

    function resetAll() {
        document.documentElement.classList.remove("ali-contrast", "ali-grayscale");
        document.body.classList.remove("ali-links", "ali-font", "ali-cursor", "ali-spacing", "ali-no-anim", "ali-touch", "ali-guide", "ali-hide-images");
        fontSizePct = 100;
        originalFontSizes.forEach((size, el) => { el.style.fontSize = ""; });
        originalFontSizes.clear();
        ttsActive = false;
        document.querySelectorAll('video, audio').forEach(v => v.play());
        speechSynth.cancel();
        document.removeEventListener('mouseover', speakHandler);
        document.removeEventListener('focusin', speakHandler);
        document.querySelectorAll('.ali-speaking').forEach(el => el.classList.remove('ali-speaking'));
        const guide = document.getElementById('ali-reading-guide-bar');
        if (guide) guide.style.display = 'none';
        localStorage.removeItem('ali_access_state');
    }

    function init() {
        loadVoices();
        const styleSheet = document.createElement("style");
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        const container = document.createElement("div");
        container.id = "ali-access-wrapper";
        document.body.appendChild(container);

        injectSkipLink();
        createReadingGuide();
        render();
        setTimeout(loadState, 500);
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }

})();