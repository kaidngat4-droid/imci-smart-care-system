// حماية الصفحة
if (localStorage.getItem("imci_logged_in") !== "true") {
    window.location.href = "login.html";
}

// المركز الصحي الحالي
const facility = localStorage.getItem("imci_facility") || "مركز غير معروف";
document.getElementById("facilityName").textContent = facility;
document.getElementById("gov").textContent = "محافظة افتراضية"; // يمكن تعديلها حسب المركز

// تحميل بيانات الأطفال
const children = JSON.parse(localStorage.getItem("imci_children")) || [];

// تصفية الأطفال حسب المركز
const filteredChildren = children.filter(c => c.facility === facility);

// ====================
// إحصاءات عامة
// ====================
const maleCount = filteredChildren.filter(c => c.sex === "ذكر").length;
const femaleCount = filteredChildren.filter(c => c.sex === "أنثى").length;

document.getElementById("maleCount").textContent = maleCount;
document.getElementById("femaleCount").textContent = femaleCount;

// العمر
document.getElementById("age1").textContent = filteredChildren.filter(c => c.age < 2).length;
document.getElementById("age2").textContent = filteredChildren.filter(c => c.age >= 2 && c.age < 12).length;
document.getElementById("age3").textContent = filteredChildren.filter(c => c.age >= 12 && c.age < 24).length;
document.getElementById("age4").textContent = filteredChildren.filter(c => c.age >= 24 && c.age < 60).length;

// نوع الزيارة
document.getElementById("firstVisit").textContent = filteredChildren.filter(c => c.visit_type === "أولية").length;
document.getElementById("followVisit").textContent = filteredChildren.filter(c => c.visit_type === "متابعة").length;

// التصنيفات
const classificationsCount = {
    severe: 0, pneumoniaSevere: 0, pneumonia: 0, coughNone: 0,
    diarrheaSevere:0, diarrheaSome:0, diarrheaNone:0,
    throatSevere:0, throatMild:0, throatNone:0,
    earAcute:0, earChronic:0, earNone:0,
    feverSevere:0, malaria:0, feverUnknown:0,
    nutritionSevere:0, nutritionModerate:0, nutritionMild:0,
    muacSevere:0, muacModerate:0, muacNormal:0,
    severeCases:0, referral:0
};

filteredChildren.forEach(child => {
    const c = child.classifications || {};
    const t = child.treatment || {};

    // سعال
    if(c.cough?.includes("شديد")) classificationsCount.pneumoniaSevere++;
    else if(c.cough?.includes("التهاب رئوي")) classificationsCount.pneumonia++;
    else classificationsCount.coughNone++;

    // إسهال
    if(c.diarrhea?.includes("جفاف شديد")) classificationsCount.diarrheaSevere++;
    else if(c.diarrhea?.includes("بعض الجفاف")) classificationsCount.diarrheaSome++;
    else classificationsCount.diarrheaNone++;

    // حلق
    if(c.throat?.includes("سبحي")) classificationsCount.throatSevere++;
    else if(c.throat?.includes("غير السبحي")) classificationsCount.throatMild++;
    else classificationsCount.throatNone++;

    // أذن
    if(c.ear?.includes("حاد")) classificationsCount.earAcute++;
    else if(c.ear?.includes("مزمن")) classificationsCount.earChronic++;
    else classificationsCount.earNone++;

    // حمى
    if(c.fever?.includes("شديد")) classificationsCount.feverSevere++;
    if(c.fever?.includes("ملاريا")) classificationsCount.malaria++;
    if(c.fever?.includes("غير محددة")) classificationsCount.feverUnknown++;

    // تغذية
    if(c.nutrition?.includes("حاد")) classificationsCount.nutritionSevere++;
    else if(c.nutrition?.includes("متوسط")) classificationsCount.nutritionModerate++;
    else classificationsCount.nutritionMild++;

    // MUAC
    const muac = parseFloat(child.muac || 0);
    if(muac > 0 && muac < 11.5) classificationsCount.muacSevere++;
    else if(muac >= 11.5 && muac < 12.5) classificationsCount.muacModerate++;
    else if(muac >= 12.5) classificationsCount.muacNormal++;

    // حالات خطرة وإحالات
    if(c.danger?.includes("🔴")) classificationsCount.severeCases++;
    if(t.referral) classificationsCount.referral++;
});

// تعبئة القيم
document.getElementById("pneumoniaCount").textContent = classificationsCount.pneumonia + classificationsCount.pneumoniaSevere;
document.getElementById("severeDehydrationCount").textContent = classificationsCount.diarrheaSevere;
document.getElementById("referralCount").textContent = classificationsCount.referral;
document.getElementById("severeCasesCount").textContent = classificationsCount.severeCases;

// هنا يمكنك إضافة التعبئة التلقائية لبقية الحقول مثل المضادات الحيوية، خطة الأرواء، متابعة الحالات، بنفس الطريقة
// على سبيل المثال:
document.querySelector('[name="artesunate_sulfadoxine"]').value = filteredChildren.filter(c => c.treatment?.malariaArtesunate).length;
document.querySelector('[name="artemether_lumefantrine"]').value = filteredChildren.filter(c => c.treatment?.malariaArtemether).length;
document.querySelector('[name="plan_a"]').value = filteredChildren.filter(c => c.classifications?.diarrhea?.includes("خطة أ")).length;
document.querySelector('[name="plan_b"]').value = filteredChildren.filter(c => c.classifications?.diarrhea?.includes("خطة ب")).length;
document.querySelector('[name="plan_c"]').value = filteredChildren.filter(c => c.classifications?.diarrhea?.includes("خطة ج")).length;