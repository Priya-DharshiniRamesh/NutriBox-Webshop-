document
    .getElementById("loginForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("loginMessage");

        try {

            const response = await fetch("/api/customers/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })

            });

            const data = await response.json();

            if (response.ok) {

                message.textContent =
                    "Login successful!";

                message.style.color = "green";

                localStorage.setItem(
                    "nutriboxCustomer",
                    JSON.stringify(data.customer)
                );

                setTimeout(() => {
                    window.location.href = "customer.html";
                }, 1000);

            } else {

                message.textContent =
                    data.message || "Invalid email or password.";

                message.style.color = "red";

            }

        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to the server.";

            message.style.color = "red";

        }

    });