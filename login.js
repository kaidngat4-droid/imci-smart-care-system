document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const facility = document.getElementById("facility").value;
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // المستخدمون
    const users = {
        maliky: {
            facilityName: "المركز الصحي بلادالمليكي",
            username: "imci_maliky",
            password: "123456"
        },
        rayas: {
            facilityName: "المركز الصحي الرئاس",
            username: "imci_rayas",
            password: "123456"
        },
        jabalin: {
            facilityName: "المركز الصحي الجبلين",
            username: "imci_jabalin",
            password: "123456"
        }
    };

    // تحقق من اختيار المرفق
    if (facility === "") {
        alert("⚠️ الرجاء اختيار المرفق الصحي");
        return;
    }

    // تحقق من المستخدم
    if (
        users[facility] &&
        username === users[facility].username &&
        password === users[facility].password
    ) {
        // حفظ الجلسة
        localStorage.setItem("imci_logged_in", "true");
        localStorage.setItem("imci_facility", users[facility].facilityName);
        localStorage.setItem("imci_username", username);

        // الانتقال
        window.location.href = "dashboard.html";
    } else {
        alert("❌ اسم المستخدم أو كلمة المرور غير صحيحة");
    }
});