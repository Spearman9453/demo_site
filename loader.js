(function() {
    // 1. זיהוי אוטומטי של המפתח מתוך התג שהלקוח הדביק
    const currentScript = document.currentScript || document.querySelector('script[data-key]');
    const LICENSE_KEY = currentScript.getAttribute('data-key');

    if (!LICENSE_KEY) {
        console.error("AliAccess: Missing License Key");
        return;
    }

    // 2. כתובת השרת שלך (ב-Production זה יהיה ה-URL של Render)
    const API_URL = "https:///meydan.pythonanywhere.com/api/validate";

    // 3. פנייה לשרת לאימות
    fetch(`${API_URL}?key=${LICENSE_KEY}`)
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
        if (data && data.valid) {
            // הזרקת הווידג'ט המלא רק אחרי אישור
            const widgetScript = document.createElement('script');
            widgetScript.src = "https://cdn.aliaccess.com/widget-v1.js"; // הקובץ הכבד
            widgetScript.async = true;

            // העברת הגדרות מהשרת ללוח הבקרה של התוסף
            window.AliAccessConfig = data.config;

            document.body.appendChild(widgetScript);
        }
    })
    .catch(() => { /* שקט תעשייתי במקרה של שגיאה */ });
})();