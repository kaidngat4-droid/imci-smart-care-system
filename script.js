const STORAGE_KEY = "imci_children";

// حماية الجلسة
if (localStorage.getItem("imci_logged_in") !== "true") {
    window.location.href = "login.html";
}

// إظهار اسم المرفق
document.addEventListener("DOMContentLoaded", () => {
    const facility = localStorage.getItem("imci_facility");
    const el = document.getElementById("facilityName");
    if (el && facility) el.textContent = facility;

    // ربط زر الحفظ
    document.querySelector(".save")?.addEventListener("click", saveChildData);
});

// الانتقال بين الصفحات
function goTo(page) {
    window.location.href = page;
}

// تسجيل الخروج
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// حفظ بيانات الطفل + التصنيف التلقائي
function saveChildData() {
    const childData = {
        id: Date.now(),
        facility: localStorage.getItem("imci_facility") || "",
        child_name: document.querySelector('[name="child_name"]')?.value || "",
        age: Number(document.querySelector('[name="age"]')?.value || 0),
        weight: Number(document.querySelector('[name="weight"]')?.value || 0),
        height: Number(document.querySelector('[name="height"]')?.value || 0),
        temperature: Number(document.querySelector('[name="temperature"]')?.value || 0),
visit_type: document.querySelector('[name="visit_type"]')?.value || "",
        problem: document.querySelector('[name="problem"]')?.value || "",
        dangerSigns: {
            cannotDrink: document.querySelector('[name="danger1"]')?.checked || false,
            vomiting: document.querySelector('[name="danger2"]')?.checked || false,
            convulsions: document.querySelector('[name="danger3"]')?.checked || false,
            unconscious: document.querySelector('[name="danger4"]')?.checked || false
        },
        saved_at: new Date().toISOString()
    };
    // التصنيف التلقائي: مثال سريع
    let classification = [];
    if (childData.dangerSigns.cannotDrink || childData.dangerSigns.unconscious || childData.temperature >= 39) {
        classification.push("حالة خطرة ⚠️");
    } else if (childData.temperature >= 37.5) {
        classification.push("حمى 🔥");
    } else {
        classification.push("حالة مستقرة ✅");
    }
    childData.classification = classification.join(", ");

    // جلب البيانات السابقة
    let children = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    children.push(childData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(children));

    alert("✅ تم حفظ بيانات الطفل بنجاح\nتصنيف الحالة: " + childData.classification);

    // تفريغ الحقول
    document.querySelectorAll("input, textarea, select").forEach(el => el.value = "");
    document.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach(el => el.checked = false);
}
/***********************************
 * التصنيف الآلي – السعال
 ***********************************/
function classifyCough() {

    const cough = document.querySelector('[name="cough"]:checked')?.value;
    const respRate = Number(document.querySelector('[name="resp_rate"]')?.value || 0);
    const chestIndrawing = document.querySelector('[name="chest_indrawing"]')?.checked;
    const stridor = document.querySelector('[name="stridor"]')?.checked;

    const resultBox = document.getElementById("coughResult");
    if (!resultBox) return;

    if (cough !== "yes") {
        resultBox.innerHTML = "لا يوجد سعال";
        resultBox.style.background = "#e5e7eb";
        return;
    }

    if (chestIndrawing || stridor) {
        resultBox.innerHTML = "🔴 التهاب رئوي شديد أو مرض شديد جداً";
        resultBox.style.background = "#fecaca";
    }
    else if (respRate >= 50) {
        resultBox.innerHTML = "🟡 التهاب رئوي";
        resultBox.style.background = "#fde68a";
    }
    else {
        resultBox.innerHTML = "🟢 سعال أو نزلة برد";
        resultBox.style.background = "#bbf7d0";
    }
}
/* ربط الأحداث */
document.addEventListener("change", function(e) {
    if (e.target.closest('[name="cough"], [name="resp_rate"], [name="chest_indrawing"], [name="stridor"]')) {
        classifyCough();
    }
});
/***********************************
 * التصنيف الآلي – علامات الخطورة
 ***********************************/
function classifyDangerSigns() {

    const cannotDrink = document.querySelector('[name="danger1"]')?.checked;
    const unconscious = document.querySelector('[name="danger2"]')?.checked;
    const vomiting = document.querySelector('[name="danger3"]')?.checked;
    const convulsions = document.querySelector('[name="danger4"]')?.checked;

    const resultBox = document.getElementById("dangerResult");
    if (!resultBox) return;

    if (cannotDrink || unconscious || vomiting || convulsions) {

        resultBox.innerHTML = `
            🔴 مرض شديد جداً<br>
            🚑 إحالة فورية للمستشفى<br>
            💉 إعطاء الجرعة الأولى الأمبيسلين والجنتاميسين عضل ومحلول سكرومضادللتشنجات قبل الإحالة
        `;

        resultBox.style.background = "#fecaca";
        resultBox.style.color = "#7f1d1d";

    } else {

        resultBox.innerHTML = "🟢 لا توجد علامات خطورة عامة";
        resultBox.style.background = "#bbf7d0";
        resultBox.style.color = "#065f46";
    }
}

/* تشغيل التصنيف تلقائياً عند التغيير */
document.addEventListener("change", function(e) {
    if (["danger1","danger2","danger3","danger4"].includes(e.target.name)) {
        classifyDangerSigns();
    }
});
/**********************
 * تصنيف الإسهال - IMCI
 **********************/
function classifyDiarrhea() {

    const diarrhea = document.querySelector('input[name="diarrhea"]:checked')?.value;
    const generalState = document.querySelector('[name="general_state"]')?.value;
    const sunkenEyes = document.querySelector('[name="sunken_eyes"]')?.checked;
    const notDrinking = document.querySelector('[name="not_drinking"]')?.checked;
    const drinksEagerly = document.querySelector('[name="drinks_eagerly"]')?.checked;
    const skinPinch = document.querySelector('[name="skin_pinch"]')?.value;

    const resultBox = document.getElementById("diarrheaResult");
    if (!resultBox) return;

    // إذا لا يوجد إسهال
    if (diarrhea !== "yes") {
        resultBox.innerHTML = "🟢 لا يوجد إسهال";
        resultBox.style.background = "#e5e7eb";
        return;
    }

    let severe = 0;
    let some = 0;

    // 🔴 علامات الجفاف الشديد
    if (generalState === "lethargic") severe++;
    if (sunkenEyes) severe++;
    if (notDrinking) severe++;
    if (skinPinch === "very_slow") severe++;

    // 🟠 علامات بعض الجفاف
    if (generalState === "restless") some++;
    if (sunkenEyes) some++;
    if (drinksEagerly) some++;
    if (skinPinch === "slow") some++;

    if (severe >= 2) {
        resultBox.innerHTML = "🔴 جفاف شديد – خطة ج (إحالة فورية + سوائل وريدية)";
        resultBox.style.background = "#fecaca";
    }
    else if (some >= 2) {
        resultBox.innerHTML = "🟠 بعض الجفاف – خطة ب (محلول إرواء فموي 75 مل/كجم خلال 4 ساعات)";
        resultBox.style.background = "#fde68a";
    }
    else {
        resultBox.innerHTML = "🟢 لا يوجد جفاف – خطة أ (سوائل منزلية + زنك 10–14 يوم)";
        resultBox.style.background = "#bbf7d0";
    }
}
document.addEventListener("change", function (e) {

    if (
        e.target.name === "diarrhea" ||
        e.target.name === "general_state" ||
        e.target.name === "sunken_eyes" ||
        e.target.name === "not_drinking" ||
        e.target.name === "drinks_eagerly" ||
        e.target.name === "skin_pinch"
    ) {
        classifyDiarrhea();
    }

});
/**********************
 * تصنيف مشكلة الحلق - IMCI
 **********************/
function classifyThroat() {

    const soreThroat = document.querySelector('input[name="sore_throat"]:checked')?.value;
    const fever = document.querySelector('[name="throat_fever"]')?.value;
    const tenderNodes = document.querySelector('[name="tender_nodes"]')?.checked;
    const tonsilExudate = document.querySelector('[name="tonsil_exudate"]')?.checked;

    const resultBox = document.getElementById("throatResult");
    if (!resultBox) return;

    // 🟢 لا توجد مشكلة
    if (soreThroat !== "yes") {
        resultBox.innerHTML = "🟢 لا توجد مشكلة في الحلق";
        resultBox.style.background = "#e5e7eb";
        return;
    }

    // 🔴 التهاب حلق سبحي
    if (fever === "yes" && tenderNodes && tonsilExudate) {
        resultBox.innerHTML = "🔴  penzathin pencilin التهاب الحلق السبحي – أعطِ أموكسيسيلين حسب الوزن لمدة 10 أيام او";
        resultBox.style.background = "#fecaca";
        return;
    }

    // 🟡 التهاب حلق غير سبحي
    resultBox.innerHTML = "🟡 التهاب الحلق غير السبحي – علاج عرضي فقط";
    resultBox.style.background = "#fde68a";
}


/**********************
 * ربط الأحداث بالحقل
 **********************/
document.addEventListener("change", function (e) {

    if (
        e.target.name === "sore_throat" ||
        e.target.name === "throat_fever" ||
        e.target.name === "tender_nodes" ||
        e.target.name === "tonsil_exudate"
    ) {
        classifyThroat();
    }

});
/**********************
 * تصنيف مشكلة الأذن - IMCI
 **********************/
function classifyEar() {

    const earPain = document.querySelector('input[name="ear_pain"]:checked')?.value;
    const earPainDays = Number(document.querySelector('[name="ear_pain_days"]')?.value || 0);

    const earDischarge = document.querySelector('input[name="ear_discharge"]:checked')?.value;
    const earDischargeDays = Number(document.querySelector('[name="ear_discharge_days"]')?.value || 0);

    const mastoid = document.querySelector('[name="mastoid_swelling"]')?.checked;

    const resultBox = document.getElementById("earResult");
    if (!resultBox) return;

    // 🔴 التهاب خشاء
    if (mastoid) {
        resultBox.innerHTML = "🔴 التهاب خشاء – إحالة فورية + جرعة أولى أموكسيسيلين";
        resultBox.style.background = "#fecaca";
        return;
    }

    // 🟡 التهاب أذن حاد
    if (
        earPain === "yes" ||
        (earDischarge === "yes" && earDischargeDays < 14)
    ) {
        resultBox.innerHTML = "🟡 التهاب أذن حاد – أموكسيسيلين لمدة 5 أيام + باراسيتامول";
        resultBox.style.background = "#fde68a";
        return;
    }

    // 🟢 التهاب أذن مزمن
    if (earDischarge === "yes" && earDischargeDays >= 14) {
        resultBox.innerHTML = "🟢 التهاب أذن مزمن – تنظيف الأذن يومياً + قطرات موضعية لمدة 14 يوم";
        resultBox.style.background = "#bbf7d0";
        return;
    }

    // ⚪ لا توجد مشكلة
    resultBox.innerHTML = "⚪ لا توجد مشكلة في الأذن";
    resultBox.style.background = "#e5e7eb";
}


/**********************
 * ربط الحقول بالتصنيف
 **********************/
document.addEventListener("change", function (e) {

    if (
        e.target.name === "ear_pain" ||
        e.target.name === "ear_pain_days" ||
        e.target.name === "ear_discharge" ||
        e.target.name === "ear_discharge_days" ||
        e.target.name === "mastoid_swelling"
    ) {
        classifyEar();
    }

});
/**********************
 * تصنيف الحمى والملاريا - IMCI
 **********************/
function classifyFever() {

    const fever = document.querySelector('input[name="fever"]:checked')?.value;
    const neckStiffness = document.querySelector('[name="neck_stiffness"]')?.value;
    const malariaTest = document.querySelector('[name="malaria_test"]')?.value;
    const bacterialSigns = document.querySelector('[name="bacterial_signs"]')?.value;
    const runnyNose = document.querySelector('[name="runny_nose"]')?.value;

    const resultBox = document.getElementById("feverResult");
    if (!resultBox) return;

    // ⚪ لا توجد حمى
    if (fever !== "yes") {
        resultBox.innerHTML = "⚪ لا توجد حمى";
        resultBox.style.background = "#e5e7eb";
        return;
    }

    // 🔴 مرض حموي شديد جداً
    if (neckStiffness === "yes") {
        resultBox.innerHTML = "🔴 مرض حموي شديد جدًا – إحالة فورية + جرعة أولى أرتسونات";
        resultBox.style.background = "#fecaca";
        return;
    }

    // 🔴 ملاريا مؤكدة
    if (malariaTest === "positive") {
        resultBox.innerHTML = "🔴 ملاريا مؤكدة – أرتيمثر + لوميفانترين حسب الوزن";
        resultBox.style.background = "#fecaca";
        return;
    }

    // 🟡 حمى بكتيرية
    if (bacterialSigns === "yes") {
        resultBox.innerHTML = "🟡 حمى بكتيرية محتملة – أموكسيسيلين 5 أيام";
        resultBox.style.background = "#fde68a";
        return;
    }

    // 🟢 حمى فيروسية
    if (runnyNose === "yes") {
        resultBox.innerHTML = "🟢 حمى فيروسية – باراسيتامول + سوائل";
        resultBox.style.background = "#bbf7d0";
        return;
    }

    // 🟡 حمى غير محددة السبب
    resultBox.innerHTML = "🟡 حمى غير محددة – متابعة بعد يومين";
    resultBox.style.background = "#fde68a";
}


/**********************
 * ربط الحقول بالتصنيف
 **********************/
document.addEventListener("change", function (e) {

    if (
        e.target.name === "fever" ||
        e.target.name === "neck_stiffness" ||
        e.target.name === "malaria_test" ||
        e.target.name === "bacterial_signs" ||
        e.target.name === "runny_nose"
    ) {
        classifyFever();
    }

});
/**********************
 * تصنيف الحصبة - IMCI
 **********************/
function classifyMeasles() {

    const measlesNow = document.querySelector('input[name="measles_now"]:checked')?.value;
    const mouthUlcers = document.querySelector('[name="mouth_ulcers"]')?.value;
    const eyeDischarge = document.querySelector('[name="eye_discharge"]')?.value;
    const corneaClouding = document.querySelector('[name="cornea_clouding"]')?.value;

    const resultBox = document.getElementById("measlesResult");
    if (!resultBox) return;

    // ⚪ لا توجد حصبة
    if (measlesNow !== "yes") {
        resultBox.innerHTML = "⚪ لا توجد حصبة";
        resultBox.style.background = "#e5e7eb";
        return;
    }

    // 🔴 حصبة شديدة مع مضاعفات
    if (corneaClouding === "yes" || mouthUlcers === "yes") {
        resultBox.innerHTML =
            "🔴 حصبة شديدة مع مضاعفات – فيتامين A فورًا + إحالة عاجلة";
        resultBox.style.background = "#fecaca";
        return;
    }

    // 🟡 حصبة بدون مضاعفات
    resultBox.innerHTML =
        "🟡 حصبة بدون مضاعفات – أعطِ فيتامين A يوم 1 ويوم 2 + علاج داعم";
    resultBox.style.background = "#fde68a";
}
/**********************
 * ربط التصنيف بالتغيير
 **********************/
document.addEventListener("change", function (e) {

    if (
        e.target.name === "measles_now" ||
        e.target.name === "mouth_ulcers" ||
        e.target.name === "eye_discharge" ||
        e.target.name === "cornea_clouding"
    ) {
        classifyMeasles();
    }

});
/**********************
 * تصنيف سوء التغذية وفقر الدم - IMCI
 **********************/
function classifyNutrition() {

    const severeWasting = document.querySelector('[name="severe_wasting"]')?.value || "";
    const edema = document.querySelector('[name="bilateral_edema"]')?.value || "";
    const muac = parseFloat(document.querySelector('[name="muac"]')?.value) || 0;
    const pallor = document.querySelector('[name="pallor_hand"]')?.value || "";
    const hb = parseFloat(document.querySelector('[name="hemoglobin"]')?.value) || 0;
    const weightForHeight = parseFloat(document.querySelector('[name="weight_for_height"]')?.value) || 0;

    const resultBox = document.getElementById("nutritionResult");
    if (!resultBox) return;

    // 🔴 سوء تغذية حاد وخيم / فقر دم شديد
    if (
        severeWasting === "yes" ||
        edema === "yes" ||
        (muac > 0 && muac < 11.5) ||
        (hb > 0 && hb < 7) ||
        pallor === "severe"
    ) {
        resultBox.innerHTML =
            "🔴 سوء تغذية حاد وخيم / فقر دم شديد – إحالة عاجلة + بدء بروتوكول SAM";
        resultBox.style.background = "#fecaca";
        return;
    }

    // 🟡 سوء تغذية متوسط / فقر دم
    if (
        (muac >= 11.5 && muac < 12.5) ||
        (hb >= 7 && hb < 11) ||
        pallor === "mild" ||
        (weightForHeight !== 0 && weightForHeight < -2)
    ) {
        resultBox.innerHTML =
            "🟡 سوء تغذية متوسط / فقر دم – حديد + مكملات غذائية + متابعة بعد أسبوعين";
        resultBox.style.background = "#fde68a";
        return;
    }

    // 🟢 طبيعي
    resultBox.innerHTML =
        "🟢 الحالة التغذوية طبيعية – تثقيف غذائي ومتابعة دورية";
    resultBox.style.background = "#bbf7d0";
}
// ربط التصنيف بالتغيير في الحقول
document.addEventListener("input", function (e) {

    if (
        e.target.name === "severe_wasting" ||
        e.target.name === "bilateral_edema" ||
        e.target.name === "muac" ||
        e.target.name === "pallor_hand" ||
        e.target.name === "hemoglobin" ||
        e.target.name === "weight_for_height"
    ) {
        classifyNutrition();
    }

});
/**********************
 * تصنيف التطعيمات + فيتامين A - IMCI
 **********************/
function classifyVaccination() {

    const ageMonths = parseInt(document.querySelector('[name="age"]')?.value) || 0;

    const bcg = document.querySelector('[name="bcg"]')?.checked;
    const measles1 = document.querySelector('[name="measles1"]')?.checked;
    const measles2 = document.querySelector('[name="measles2"]')?.checked;
    const vitA9 = document.querySelector('[name="vitA_9m"]')?.checked;
    const vitA18 = document.querySelector('[name="vitA_18m"]')?.checked;

    const resultBox = document.getElementById("vaccinationResult");
    if (!resultBox) return;

    let messages = [];

    // -------------------
    // BCG
    // -------------------
    if (ageMonths < 2 && !bcg) {
        messages.push("💉 إعطاء BCG اليوم");
    }

    // -------------------
    // الحصبة
    // -------------------
    if (ageMonths >= 9 && ageMonths < 18 && !measles1) {
        messages.push("💉 إعطاء جرعة الحصبة الأولى");
    }

    if (ageMonths >= 18 && !measles2) {
        messages.push("💉 إعطاء جرعة الحصبة الثانية");
    }

    // -------------------
    // فيتامين A
    // -------------------
    if (ageMonths >= 6 && ageMonths < 12 && !vitA9) {
        messages.push("🟡 فيتامين A 100000 وحدة اليوم");
    }

    if (ageMonths >= 12 && ageMonths <= 59 && !vitA18) {
        messages.push("🟡 فيتامين A 200000 وحدة اليوم");
    }

    // -------------------
    // النتيجة النهائية
    // -------------------
    if (messages.length === 0) {
        resultBox.innerHTML = "🟢 التطعيمات مكتملة حسب العمر";
        resultBox.style.background = "#bbf7d0";
    } else {
        resultBox.innerHTML = messages.join("<br>");
        resultBox.style.background = "#fde68a";
    }
}
document.addEventListener("input", function (e) {

    if (
        e.target.name === "age" ||
        e.target.name === "bcg" ||
        e.target.name === "measles1" ||
        e.target.name === "measles2" ||
        e.target.name === "vitA_9m" ||
        e.target.name === "vitA_18m"
    ) {
        classifyVaccination();
    }

});
/**********************
 * تقييم تغذية الطفل (< سنتين) - IMCI
 **********************/
function classifyChildNutrition() {

    const ageMonths = parseInt(document.querySelector('[name="age"]')?.value) || 0;

    const breastfeeding = document.querySelector('input[name="breastfeeding"]:checked')?.value;
    const breastfeedCount = parseInt(document.querySelector('[name="breastfeed_count"]')?.value) || 0;
    const breastfeedNight = document.querySelector('[name="breastfeed_night"]')?.value;

    const otherFoods = document.querySelector('[name="other_foods"]')?.value;
    const foodTimes = parseInt(document.querySelector('[name="food_times"]')?.value) || 0;
    const foodAmount = document.querySelector('[name="food_amount"]')?.value;

    const nutritionChange = document.querySelector('[name="nutrition_change"]')?.value;

    const resultBox = document.getElementById("nutritionStatusResult");
    if (!resultBox) return;

    // لا ينطبق إذا العمر ≥ 24 شهر
    if (ageMonths >= 24 || ageMonths === 0) {
        resultBox.innerHTML = "⚪ التقييم مخصص للأطفال أقل من سنتين";
        resultBox.style.background = "#e5e7eb";
        return;
    }

    // 🔴 مشكلة تغذية شديدة
    if (
        (ageMonths < 6 && breastfeeding !== "yes") ||
        (breastfeeding === "yes" && breastfeedCount < 8) ||
        breastfeedNight === "no" ||
        (ageMonths >= 6 && otherFoods !== "yes") ||
        nutritionChange === "yes"
    ) {
        resultBox.innerHTML =
            "🔴 مشكلة تغذية شديدة – قدم مشورة مكثفة + متابعة بعد 5 أيام";
        resultBox.style.background = "#fecaca";
        return;
    }

    // 🟡 مشكلة تغذية
    if (
        foodTimes < 3 ||
        foodAmount === "صغير"
    ) {
        resultBox.innerHTML =
            "🟡 مشكلة تغذية – قدم مشورة غذائية للأم";
        resultBox.style.background = "#fde68a";
        return;
    }

    // 🟢 تغذية جيدة
    resultBox.innerHTML =
        "🟢 تغذية جيدة – شجع الأم على الاستمرار";
    resultBox.style.background = "#bbf7d0";
}
document.addEventListener("input", function (e) {

    if (
        e.target.name === "age" ||
        e.target.name === "breastfeeding" ||
        e.target.name === "breastfeed_count" ||
        e.target.name === "breastfeed_night" ||
        e.target.name === "other_foods" ||
        e.target.name === "food_times" ||
        e.target.name === "food_amount" ||
        e.target.name === "nutrition_change"
    ) {
        classifyChildNutrition();
    }

});
/**********************
 * تقييم اللعب والتواصل - IMCI
 **********************/
function classifyPlayCommunication() {

    const plays = document.querySelector('input[name="plays_with_child"]:checked')?.value;
    const playDetails = document.querySelector('[name="play_details"]')?.value?.trim();

    const communicates = document.querySelector('input[name="communicates"]:checked')?.value;
    const communicatesHow = document.querySelector('[name="communicates_how"]')?.value?.trim();

    const resultBox = document.getElementById("playCommunicationResult");
    if (!resultBox) return;

    // لم يتم اختيار شيء
    if (!plays && !communicates) {
        resultBox.innerHTML = "⚪ لم يتم التقييم بعد";
        resultBox.style.background = "#e5e7eb";
        return;
    }

    // 🔴 تأخر نمائي محتمل
    if (
        plays === "no" &&
        communicates === "no"
    ) {
        resultBox.innerHTML =
            "🔴 تأخر نمائي محتمل – قدم إرشاد مكثف + متابعة خلال شهر";
        resultBox.style.background = "#fecaca";
        return;
    }

    // 🟡 تفاعل ضعيف
    if (
        (plays === "yes" && !playDetails) ||
        (communicates === "yes" && !communicatesHow)
    ) {
        resultBox.innerHTML =
            "🟡 تفاعل ضعيف – قدم نصائح لتحفيز اللعب والتواصل يوميًا";
        resultBox.style.background = "#fde68a";
        return;
    }

    // 🟢 تفاعل جيد
    if (
        plays === "yes" &&
        communicates === "yes"
    ) {
        resultBox.innerHTML =
            "🟢 تفاعل جيد – شجع الأم على الاستمرار";
        resultBox.style.background = "#bbf7d0";
        return;
    }

    // حالة مختلطة
    resultBox.innerHTML =
        "🟡 يحتاج تعزيز التفاعل واللعب";
    resultBox.style.background = "#fde68a";
}
document.addEventListener("input", function (e) {

    if (
        e.target.name === "plays_with_child" ||
        e.target.name === "play_details" ||
        e.target.name === "communicates" ||
        e.target.name === "communicates_how"
    ) {
        classifyPlayCommunication();
    }

});
function saveChildData() {
    const childData = {
        id: Date.now(),
        facility: localStorage.getItem("imci_facility") || "",
        child_name: document.querySelector('[name="child_name"]')?.value || "",
        sex: document.querySelector('[name="sex"]:checked')?.value || "",
        age: Number(document.querySelector('[name="age"]')?.value || 0),
        weight: Number(document.querySelector('[name="weight"]')?.value || 0),
        height: Number(document.querySelector('[name="height"]')?.value || 0),
        temperature: Number(document.querySelector('[name="temperature"]')?.value || 0),
        visit_date: document.querySelector('[name="visit_date"]')?.value || "",
        visit_type: document.querySelector('[name="visit_type"]:checked')?.value || "",
        problem: document.querySelector('[name="problem"]')?.value || "",
        
        // علامات الخطر
        dangerSigns: {
            cannotDrink: document.querySelector('[name="danger1"]')?.checked || false,
            vomiting: document.querySelector('[name="danger2"]')?.checked || false,
            convulsions: document.querySelector('[name="danger3"]')?.checked || false,
            unconscious: document.querySelector('[name="danger4"]')?.checked || false
        },

        // التصنيفات حسب IMCI
        classifications: {
            danger: "",        // ستحصل على نص تلقائي
            cough: "",
            diarrhea: "",
            fever: "",
            throat: "",
            ear: "",
            nutrition: "",
            vaccination: "",
            play: ""
        },

        // العلاج
        treatment: {
            antibiotics: false,
            oralRehydration: false,
            zinc: false,
            referral: false
        },

        saved_at: new Date().toISOString()
    };

    // ===== التصنيف التلقائي =====
    let classif = childData.classifications;

    // علامات خطورة
    if (childData.dangerSigns.cannotDrink || childData.dangerSigns.unconscious || childData.temperature >= 39) {
        classif.danger = "🔴 حالة خطرة";
        childData.treatment.referral = true;
    } else {
        classif.danger = "🟢 لا توجد علامات خطورة";
    }

    // سعال
    const cough = document.querySelector('[name="cough"]:checked')?.value;
    const respRate = Number(document.querySelector('[name="resp_rate"]')?.value || 0);
    const chestIndrawing = document.querySelector('[name="chest_indrawing"]')?.checked;
    const stridor = document.querySelector('[name="stridor"]')?.checked;

    if (cough === "yes") {
        if (chestIndrawing || stridor || respRate >= 50) {
            classif.cough = "🔴 التهاب رئوي – أعطِ مضاد حيوي";
            childData.treatment.antibiotics = true;
        } else {
            classif.cough = "🟢 سعال أو نزلة برد";
        }
    } else {
        classif.cough = "🟢 لا يوجد سعال";
    }

    // إسهال
    const diarrhea = document.querySelector('input[name="diarrhea"]:checked')?.value;
    const generalState = document.querySelector('[name="general_state"]')?.value;
    const sunkenEyes = document.querySelector('[name="sunken_eyes"]')?.checked;
    const notDrinking = document.querySelector('[name="not_drinking"]')?.checked;
    const drinksEagerly = document.querySelector('[name="drinks_eagerly"]')?.checked;
    const skinPinch = document.querySelector('[name="skin_pinch"]')?.value;

    if (diarrhea === "yes") {
        let severe = 0;
        let some = 0;
        if (generalState === "lethargic") severe++;
        if (sunkenEyes) severe++;
        if (notDrinking) severe++;
        if (skinPinch === "very_slow") severe++;

        if (generalState === "restless") some++;
        if (sunkenEyes) some++;
        if (drinksEagerly) some++;
        if (skinPinch === "slow") some++;

        if (severe >= 2) {
            classif.diarrhea = "🔴 جفاف شديد – خطة ج";
            childData.treatment.oralRehydration = true;
        } else if (some >= 2) {
            classif.diarrhea = "🟠 بعض الجفاف – خطة ب";
            childData.treatment.oralRehydration = true;
        } else {
            classif.diarrhea = "🟢 لا يوجد جفاف – خطة أ";
        }
    } else {
        classif.diarrhea = "🟢 لا يوجد إسهال";
    }

    // حمى
    const fever = document.querySelector('input[name="fever"]:checked')?.value;
    if (fever === "yes") {
        classif.fever = "🟡 حمى – متابعة وعلاج حسب السبب";
    } else {
        classif.fever = "🟢 لا توجد حمى";
    }

    // التغذية
    const severeWasting = document.querySelector('[name="severe_wasting"]')?.value || "";
    const edema = document.querySelector('[name="bilateral_edema"]')?.value || "";
    const muac = parseFloat(document.querySelector('[name="muac"]')?.value || 0);

    if (severeWasting === "yes" || edema === "yes" || muac < 11.5) {
        classif.nutrition = "🔴 سوء تغذية حاد";
    } else if ((muac >= 11.5 && muac < 12.5)) {
        classif.nutrition = "🟡 سوء تغذية متوسط";
    } else {
        classif.nutrition = "🟢 تغذية طبيعية";
    }

    // ===== حفظ البيانات في LocalStorage =====
    const children = JSON.parse(localStorage.getItem("imci_children")) || [];
    children.push(childData);
    localStorage.setItem("imci_children", JSON.stringify(children));

    alert(`✅ تم حفظ بيانات الطفل\nتصنيف الحالة: ${classif.danger}, ${classif.cough}, ${classif.diarrhea}, ${classif.fever}, ${classif.nutrition}`);

    // تفريغ الحقول
    document.querySelectorAll("input, textarea, select").forEach(el => el.value = "");
    document.querySelectorAll("input[type='checkbox'], input[type='radio']").forEach(el => el.checked = false);
}
