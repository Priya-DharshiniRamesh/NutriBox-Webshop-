document
    .getElementById("forgotPasswordForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message =
            document.getElementById("message");

        if (newPassword !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            return;
        }

        if (newPassword.length < 6) {
            message.textContent =
                "Password must contain at least 6 characters.";
            return;
        }

        try {

            const response = await fetch(
                "/api/customers/forgot-password",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        newPassword: newPassword
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                message.textContent =
                    "Password reset successfully! Redirecting to login...";

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);

            } else {

                message.textContent =
                    data.message || "Unable to reset password.";
            }

        } catch (error) {

            console.error("Password reset error:", error);

            message.textContent =
                "Unable to connect to the server.";
        }
    });