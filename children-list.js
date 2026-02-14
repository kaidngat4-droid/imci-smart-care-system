document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#childrenTable tbody");
    const noData = document.getElementById("noData");

    const children = JSON.parse(localStorage.getItem("imci_children")) || [];

    if (children.length === 0) {
        noData.style.display = "block";
        return;
    }

    noData.style.display = "none";

    children.forEach((child, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${child.child_name || "-"}</td>
            <td>${child.age || "-"}</td>
            <td>${child.sex || "-"}</td>
            <td>${child.weight || "-"}</td>
            <td>${child.height || "-"}</td>
            <td>${child.temperature || "-"}</td>
            <td>${child.visit_date || "-"}</td>
            <td>${child.problem || "-"}</td>
        `;

        tableBody.appendChild(row);
    });
});

function goBack() {
    window.location.href = "dashboard.html";
}