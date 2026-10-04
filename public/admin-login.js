document.getElementById("adminLoginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username =
        document.getElementById("adminUsername").value.trim();

    const password =
        document.getElementById("adminPassword").value;

    const loginMessage =
        document.getElementById("loginMessage");

    if (!username || !password) {
        loginMessage.textContent = "Please enter username and password.";
        loginMessage.style.color = "red";
        return;
    }

    try {
        const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            loginMessage.textContent =
                data.message || "Invalid admin username or password.";
            loginMessage.style.color = "red";
            return;
        }

        localStorage.setItem("nutriboxAdminToken", data.token);

        window.location.href = "admin.html";

    } catch (error) {
        console.error("Admin login error:", error);

        loginMessage.textContent =
            "Unable to connect to the server.";
        loginMessage.style.color = "red";
    }
});