let currentPosition = null; // لتخزين آخر موقع معروف للعميل
const mapIframe = document.getElementById('map-iframe');

/**
 * تحديث مصدر الـ iframe لعرض موقع معين على الخريطة.
 * @param {object} location - كائن يحتوي على lat و lng.
 * @param {string} type - نوع العرض (place, view).
 */
function updateMapIframe(location, type = 'view') {
    let mapUrl = '';
    const googleMapsEmbedApiKey = 'YOUR_EMBED_API_KEY'; // مفتاح Embed API الخاص بك

    if (!googleMapsEmbedApiKey || googleMapsEmbedApiKey === 'YOUR_EMBED_API_KEY') {
        console.error("يرجى استبدال 'YOUR_EMBED_API_KEY' بمفتاح Embed API الصحيح.");
        return;
    }

    if (type === 'view' && location) {
        mapUrl = `https://www.google.com/maps/embed/v1/view?key=${googleMapsEmbedApiKey}&center=${location.lat},${location.lng}&zoom=16`;
    } else if (type === 'place' && location) {
        // لعرض علامة عند الموقع
        mapUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsEmbedApiKey}&q=${location.lat},${location.lng}&zoom=16`;
    } else {
        // إذا لم يتوفر موقع، يمكن عرض خريطة عامة أو رسالة
        mapUrl = `https://www.google.com/maps/embed/v1/view?key=${googleMapsEmbedApiKey}&center=30.044420,31.235730&zoom=14`; // موقع افتراضي (القاهرة)
    }

    if (mapIframe) {
        mapIframe.src = mapUrl;
    }
}

/**
 * الحصول على موقع المستخدم الحالي باستخدام Geolocation API.
 */
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                currentPosition = pos; // تحديث الموقع الحالي
                console.log(`تم الحصول على الموقع: Lat: ${pos.lat}, Lng: ${pos.lng}`);

                // تحديث الـ iframe لعرض الموقع الجديد
                updateMapIframe(pos, 'place'); // 'place' لعرض علامة عند الموقع

                // إرسال هذا الموقع إلى قاعدة البيانات
                sendLocationToBackend(pos);
            },
            (error) => {
                console.warn(`خطأ في تحديد الموقع: ${error.message}`);
                alert("تعذر تحديد موقعك الحالي. يرجى التأكد من تفعيل خدمات الموقع.");
                // عرض خريطة بموقع افتراضي إذا تعذر تحديد الموقع
                updateMapIframe(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        alert("متصفحك لا يدعم تحديد الموقع الجغرافي.");
        updateMapIframe(null); // عرض خريطة افتراضية
    }
}

/**
 * إرسال موقع العميل إلى الواجهة الخلفية (قاعدة البيانات).
 * @param {object} location - كائن يحتوي على lat و lng.
 */
async function sendLocationToBackend(location) {
    if (!location) {
        console.error("لا يوجد موقع لإرساله.");
        return;
    }

    // هنا يجب أن يكون لديك طريقة لمعرفة هوية المستخدم (حسابه المسجل).
    // يمكن الحصول عليها من ملف تعريف الارتباط (cookie) أو التخزين المحلي (localStorage)
    // بعد تسجيل الدخول، أو إرسال رمز مميز (token) للمصادقة.
    const userId = "USER_ID_FROM_SESSION_OR_LOCALSTORAGE"; // يجب استبدال هذا بمعرف المستخدم الفعلي

    if (!userId || userId === "USER_ID_FROM_SESSION_OR_LOCALSTORAGE") {
        console.warn("لم يتم تحديد معرف المستخدم. لا يمكن إرسال الموقع لقاعدة البيانات.");
        return;
    }

    const apiUrl = "YOUR_BACKEND_API_ENDPOINT/update-user-location"; // استبدل بمسار API الخاص بك

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer YOUR_AUTH_TOKEN` // إذا كنت تستخدم مصادقة (JWT مثلاً)
            },
            body: JSON.stringify({
                userId: userId,
                latitude: location.lat,
                longitude: location.lng,
                timestamp: new Date().toISOString()
            })
        });

        if (response.ok) {
            console.log("تم إرسال الموقع إلى قاعدة البيانات بنجاح.");
        } else {
            const errorData = await response.json();
            console.error(`فشل إرسال الموقع: ${response.status} - ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error("خطأ في الاتصال بالواجهة الخلفية:", error);
    }
}

/**
 * وظيفة محاكاة لحجز تاكسي (تحتاج لتطويرها في الواجهة الخلفية).
 */
async function bookTaxi() {
    if (!currentPosition) {
        alert("يرجى تحديد موقعك أولاً.");
        return;
    }

    const destination = document.getElementById("searchInput").value;
    if (!destination) {
        alert("الرجاء إدخال وجهتك.");
        return;
    }

    console.log(`طلب تاكسي من: ${currentPosition.lat}, ${currentPosition.lng} إلى: ${destination}`);

    const bookingApiUrl = "YOUR_BACKEND_API_ENDPOINT/book-ride"; // استبدل بمسار API الخاص بك

    try {
        const response = await fetch(bookingApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer YOUR_AUTH_TOKEN`
            },
            body: JSON.stringify({
                userId: "USER_ID_FROM_SESSION_OR_LOCALSTORAGE", // معرف المستخدم
                pickupLocation: currentPosition,
                destination: destination,
            })
        });

        if (response.ok) {
            const bookingData = await response.json();
            console.log("تم حجز الرحلة بنجاح:", bookingData);
            alert("تم إرسال طلب حجز التاكسي بنجاح! سيتم البحث عن سائق.");
        } else {
            const errorData = await response.json();
            console.error(`فشل حجز الرحلة: ${response.status} - ${errorData.message || response.statusText}`);
            alert(`فشل حجز الرحلة: ${errorData.message || "حدث خطأ"}`);
        }
    } catch (error) {
        console.error("خطأ في الاتصال بواجهة حجز الرحلة:", error);
        alert("حدث خطأ أثناء محاولة حجز الرحلة. يرجى المحاولة مرة أخرى.");
    }
}

// --- وظائف التحكم في القائمة الجانبية (Sidebar) ---
function openNav() {
    document.getElementById("mySidebar").classList.add("open");
}

function closeNav() {
    document.getElementById("mySidebar").classList.remove("open");
}

// --- إضافة مستمعات الأحداث (Event Listeners) ---
document.addEventListener('DOMContentLoaded', () => {
    // Buttons for UI interaction
    const openMenuBtn = document.getElementById('openMenu');
    const closeMenuBtn = document.getElementById('closeMenu');
    const myLocationBtn = document.getElementById('myLocationBtn');
    const bookTaxiBtn = document.getElementById('bookTaxiBtn');
    const searchInput = document.getElementById('searchInput');

    if (openMenuBtn) {
        openMenuBtn.addEventListener('click', openNav);
    }
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeNav);
    }
    if (myLocationBtn) {
        myLocationBtn.addEventListener('click', getCurrentLocation); // إعادة تحديد الموقع
    }
    if (bookTaxiBtn) {
        bookTaxiBtn.addEventListener('click', bookTaxi);
    }

    // عند تحميل الصفحة، حاول الحصول على الموقع وعرضه على الخريطة
    getCurrentLocation();

    // وظيفة Debounce لتحسين أداء البحث (تمنع تشغيل الدالة إلا بعد فترة توقف عن الكتابة)
    if (searchInput) {
        searchInput.addEventListener('input', debounce((event) => {
            const query = event.target.value;
            if (query.length > 2) {
                console.log(`البحث عن: ${query}`);
                // هنا يمكن دمج خدمة Geocoding API (عبر واجهة خلفية أو باستخدام حلول طرف ثالث)
                // لتحويل النص إلى إحداثيات وعرضها على الخريطة إذا أردت.
                // حالياً، هذا الجزء لا يؤثر على الـ iframe مباشرةً لعدم وجود API لـ iframe.
            }
        }, 300));
    }
});

// وظيفة Debounce
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

