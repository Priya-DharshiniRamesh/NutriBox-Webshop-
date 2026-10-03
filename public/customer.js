const socket = io();
const customerData =
    JSON.parse(localStorage.getItem("nutriboxCustomer"));


if (!customerData) {

    window.location.href = "login.html";

} else {

    document.getElementById("organizationName").textContent =
        customerData.organizationName;

    document.getElementById("customerType").textContent =
        customerData.customerType;

    document.getElementById("contactPerson").textContent =
        customerData.contactPerson;

    document.getElementById("email").textContent =
        customerData.email;

    document.getElementById("phone").textContent =
        customerData.phone;

    document.getElementById("location").textContent =
        customerData.location;

    document.getElementById("welcomeMessage").textContent =
        `Welcome, ${customerData.organizationName}!`;

    loadCustomerDashboard();

}


async function loadCustomerDashboard() {

    try {

        const response = await fetch(
            `/api/customers/${customerData.id}/dashboard`
        );


        if (!response.ok) {

            throw new Error(
                "Unable to load customer dashboard"
            );

        }


        const data = await response.json();


        document.getElementById("totalOrders").textContent =
            data.totalOrders;


        document.getElementById("totalMeals").textContent =
            data.totalMeals;


        document.getElementById("totalSpending").textContent =
            `₹${data.totalSpending.toLocaleString()}`;


        document.getElementById("averageOrderValue").textContent =
            `₹${data.averageOrderValue.toLocaleString()}`;


        document.getElementById("customerSatisfaction").textContent =
            `${data.customerSatisfaction} / 5`;


        displayOrders(data.recentOrders);
        loadOrderHistory();

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


function displayOrders(orders) {

    const ordersTable =
        document.getElementById("ordersTable");


    ordersTable.innerHTML = "";


    if (orders.length === 0) {

        ordersTable.innerHTML = `
            <tr>
                <td colspan="5">
                    No orders found.
                </td>
            </tr>
        `;

        return;

    }


    orders.forEach(order => {

        const row =
            document.createElement("tr");


        const orderDate =
            new Date(order.orderDate)
                .toLocaleDateString();


        row.innerHTML = `

            <td>
                ${order.productName}
            </td>

            <td>
                ${order.quantity}
            </td>

            <td>
                ₹${order.totalAmount}
            </td>

            <td>
                ${order.orderStatus}
            </td>

            <td>
                ${orderDate}
            </td>

        `;


        ordersTable.appendChild(row);

    });

}


function logout() {

    localStorage.removeItem(
        "nutriboxCustomer"
    );

    window.location.href =
        "login.html";

}

async function loadOrderHistory() {

    try {

        const response =
            await fetch(
                `/api/customers/${customerData.id}/orders`
            );

        if (!response.ok) {
            throw new Error(
                "Unable to load order history"
            );
        }

        const orders =
            await response.json();

        const table =
            document.getElementById(
                "orderHistoryTable"
            );

        table.innerHTML = "";

        if (orders.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="6">
                        No order history found.
                    </td>
                </tr>
            `;

            return;
        }

        orders.forEach(order => {

            const row =
                document.createElement("tr");

            const orderDate =
                new Date(
                    order.orderDate
                ).toLocaleDateString();

            row.innerHTML = `

                <td>${order.productName}</td>

                <td>${order.quantity}</td>

                <td>₹${order.pricePerUnit}</td>

                <td>₹${order.totalAmount}</td>

                <td>${order.orderStatus}</td>

                <td>${orderDate}</td>

            `;

            table.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Order history error:",
            error
        );

    }
}

socket.on("orderStatusUpdated", (order) => {

    console.log(
        "Order status updated:",
        order
    );

    if (
        customerData &&
        String(order.customerId) === String(customerData.id)
    ) {

        alert(
            "Your NutriBox order status has been updated!\n\n" +
            "Product: " + order.productName +
            "\nNew Status: " + order.orderStatus
        );

        loadCustomerDashboard();
        loadOrderHistory();
    }

});

async function loadFeedbackOrders() {
    const feedbackOrder = document.getElementById("feedbackOrder");

    try {
        const response = await fetch(
            `/api/customers/${customerData.id}/orders`
        );

        const orders = await response.json();

        feedbackOrder.innerHTML =
            '<option value="">Select an order</option>';

        orders.forEach(order => {
            if (order.orderStatus === "Delivered") {
                const option = document.createElement("option");

                option.value = order._id;

                option.textContent =
                    `${order.productName} - ₹${order.totalAmount} - ${new Date(order.orderDate).toLocaleDateString()}`;

                feedbackOrder.appendChild(option);
            }
        });

    } catch (error) {
        console.error("Feedback orders error:", error);
    }
}


async function submitFeedback() {
    const orderId =
        document.getElementById("feedbackOrder").value;

    const rating =
        document.getElementById("feedbackRating").value;

    const comment =
        document.getElementById("feedbackComment").value.trim();

    if (!orderId) {
        alert("Please select an order.");
        return;
    }

    if (!rating) {
        alert("Please select a rating.");
        return;
    }

    if (!comment) {
        alert("Please enter your feedback.");
        return;
    }

    try {
        const response = await fetch("/api/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customerId: customerData.id,
                orderId: orderId,
                rating: Number(rating),
                comment: comment
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Feedback submitted successfully!");

            document.getElementById("feedbackOrder").value = "";
            document.getElementById("feedbackRating").value = "";
            document.getElementById("feedbackComment").value = "";

            loadCustomerDashboard();

        } else {
            alert(data.message || "Unable to submit feedback.");
        }

    } catch (error) {
        console.error("Feedback submission error:", error);
        alert("Unable to connect to the server.");
    }
}

loadFeedbackOrders();