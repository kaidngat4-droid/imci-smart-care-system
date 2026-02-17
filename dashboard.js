// ===== حماية الصفحة =====
if(localStorage.getItem("imci_logged_in") !== "true") {
    window.location.href = "login.html";
}

// ===== تحميل اسم المركز والسنة =====
const facility = localStorage.getItem("imci_facility") || "مركز غير معروف";
document.getElementById("facilityName").textContent = facility;
document.getElementById("facilityNameDisplay").textContent = facility;
document.getElementById("currentYear").textContent = new Date().getFullYear();

// ===== تحميل بيانات الأطفال =====
const children = JSON.parse(localStorage.getItem("imci_children")) || [];
const filteredChildren = children.filter(c => c.facility === facility);

// ===== تحديث الإحصاءات =====
document.getElementById("totalChildren").textContent = filteredChildren.length;
document.getElementById("pneumoniaCases").textContent = filteredChildren.filter(c => c.classifications?.cough?.includes("التهاب رئوي")).length;
document.getElementById("diarrheaCases").textContent = filteredChildren.filter(c => c.classifications?.diarrhea?.includes("إسهال")).length;
document.getElementById("referralCases").textContent = filteredChildren.filter(c => c.treatment?.referral).length;

// ===== وظيفة العدادات المتحركة =====
function animateCounter(id, endValue, duration = 1000) {
    const element = document.getElementById(id);
    let start = 0;
    const increment = endValue / (duration / 16);
    function step() {
        start += increment;
        if(start >= endValue) {
            element.textContent = endValue;
        } else {
            element.textContent = Math.floor(start);
            requestAnimationFrame(step);
        }
    }
    step();
}

// تشغيل العدادات
animateCounter("totalChildren", filteredChildren.length);
animateCounter("pneumoniaCases", filteredChildren.filter(c => c.classifications?.cough?.includes("التهاب رئوي")).length);
animateCounter("diarrheaCases", filteredChildren.filter(c => c.classifications?.diarrhea?.includes("إسهال")).length);
animateCounter("referralCases", filteredChildren.filter(c => c.treatment?.referral).length);

// ===== وظائف التنقل =====
function goTo(page) { window.location.href = page; }
function logout() {
    localStorage.setItem("imci_logged_in","false");
    window.location.href="login.html";
}

// ===== تحديث الرصيد الحالي في حركة المخزون الدوائي =====
const drugTable = document.querySelector("#drugStock tbody");

if(drugTable) {
    const rows = drugTable.querySelectorAll("tr");
    rows.forEach(row => {
        const prevInput = row.querySelector(".prev");
        const inInput = row.querySelector(".in");
        const outInput = row.querySelector(".out");
        const currentCell = row.querySelector(".current");

        function updateCurrent() {
            const prev = parseInt(prevInput.value) || 0;
            const incoming = parseInt(inInput.value) || 0;
            const outgoing = parseInt(outInput.value) || 0;
            currentCell.textContent = prev + incoming - outgoing;
        }

        prevInput.addEventListener("input", updateCurrent);
        inInput.addEventListener("input", updateCurrent);
        outInput.addEventListener("input", updateCurrent);

        // تحديث أول مرة عند تحميل الصفحة
        updateCurrent();
    });
}
