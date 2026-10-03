document
    .getElementById("registrationForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const organizationName =
            document.getElementById("organizationName").value;

        const customerType =
            document.getElementById("customerType").value;

        const contactPerson =
            document.getElementById("contactPerson").value;

        const email =
            document.getElementById("email").value;

        const phone =
            document.getElementById("phone").value;

        const location =
            document.getElementById("location").value;

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("registrationMessage");

        try {

            const response = await fetch("/api/customers/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    organizationName,
                    customerType,
                    contactPerson,
                    email,
                    phone,
                    location,
                    password
                })

            });

            const data = await response.json();

            if (response.ok) {

                message.textContent =
                    "Registration successful!";

                message.style.color = "green";

                document.getElementById("registrationForm").reset();

            } else {

                message.textContent =
                    data.message || "Registration failed.";

                message.style.color = "red";
            }

        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to the server.";

            message.style.color = "red";
        }

    });