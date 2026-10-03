document.getElementById("adminLoginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const username =
        document.getElementById("adminUsername").value.trim();

    const password =
        document.getElementById("adminPassword").value;

    const loginMessage =
        document.getElementById("loginMessage");

    if (username === "admin" && password === "NutriAdmin@2026") {

        localStorage.setItem("nutriboxAdmin", "true");

        window.location.href = "admin.html";

    } else {

        loginMessage.textContent =
            "Invalid admin username or password.";

        loginMessage.style.color = "red";
    }
});