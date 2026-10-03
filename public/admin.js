const adminLoggedIn =
    localStorage.getItem("nutriboxAdmin");

if (adminLoggedIn !== "true") {
    window.location.href = "admin-login.html";
}

const socket = io();

async function loadAdminDashboard() {

    try {

        const response =
            await fetch("/api/admin/dashboard");

        if (!response.ok) {
            throw new Error("Failed to load admin dashboard");
        }

        const data =
            await response.json();


        // Dashboard cards

        document.getElementById("totalSales").textContent =
            `₹${data.totalSales.toLocaleString()}`;

        document.getElementById("totalOrders").textContent =
            data.totalOrders;

        document.getElementById("totalCustomers").textContent =
            data.totalCustomers;

        document.getElementById("totalMeals").textContent =
            data.totalMeals;

        document.getElementById("averageOrderValue").textContent =
            `₹${data.averageOrderValue.toLocaleString()}`;

        document.getElementById("customerSatisfaction").textContent =
            `${data.customerSatisfaction} / 5`;


        // Display recent orders

        displayAdminOrders(data.recentOrders);


        // Create charts

        createSalesChart(data.recentOrders);

        createCustomerTypeChart(data.recentOrders);

        createProductChart(data.recentOrders);

        createOrderStatusChart(data.recentOrders);


    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );

    }

}


function displayAdminOrders(orders) {

    const table =
        document.getElementById("adminOrdersTable");

    table.innerHTML = "";


    orders.forEach(order => {

        const row =
            document.createElement("tr");

        const date =
            new Date(order.orderDate)
                .toLocaleDateString();


        row.innerHTML = `

            <td>${order.customerName}</td>

            <td>${order.productName}</td>

            <td>${order.quantity}</td>

            <td>₹${order.totalAmount}</td>

            <td>
                <select onchange="updateOrderStatus('${order._id}', this.value)">
                    <option value="Pending" ${order.orderStatus === "Pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="Confirmed" ${order.orderStatus === "Confirmed" ? "selected" : ""}>
                        Confirmed
                    </option>

                    <option value="Preparing" ${order.orderStatus === "Preparing" ? "selected" : ""}>
                        Preparing
                    </option>

                    <option value="Out for Delivery" ${order.orderStatus === "Out for Delivery" ? "selected" : ""}>
                        Out for Delivery
                    </option>

                    <option value="Delivered" ${order.orderStatus === "Delivered" ? "selected" : ""}>
                        Delivered
                    </option>

                    <option value="Cancelled" ${order.orderStatus === "Cancelled" ? "selected" : ""}>
                        Cancelled
                    </option>
                </select>
            </td>

            <td>${date}</td>

        `;


        table.appendChild(row);

    });

}


// Sales Over Time

function createSalesChart(orders) {

    const salesByDate = {};

    orders.forEach(order => {

        const date =
            new Date(order.orderDate)
                .toLocaleDateString();

        if (!salesByDate[date]) {
            salesByDate[date] = 0;
        }

        salesByDate[date] += order.totalAmount;

    });


    new Chart(
        document.getElementById("salesChart"),
        {
            type: "line",

            data: {

                labels:
                    Object.keys(salesByDate),

                datasets: [

                    {
                        label: "Sales",

                        data:
                            Object.values(salesByDate),

                        borderWidth: 2
                    }

                ]

            },

            options: {
                responsive: true
            }
        }
    );

}


// Sales by Customer Type

function createCustomerTypeChart(orders) {

    const customerTypes = {};

    orders.forEach(order => {

        const type =
            order.customerType;

        if (!customerTypes[type]) {
            customerTypes[type] = 0;
        }

        customerTypes[type] += order.totalAmount;

    });


    new Chart(
        document.getElementById("customerTypeChart"),
        {
            type: "bar",

            data: {

                labels:
                    Object.keys(customerTypes),

                datasets: [

                    {
                        label: "Sales",

                        data:
                            Object.values(customerTypes),

                        borderWidth: 1
                    }

                ]

            },

            options: {
                responsive: true
            }

        }
    );

}


// Best-Selling Products

function createProductChart(orders) {

    const products = {};

    orders.forEach(order => {

        const product =
            order.productName;

        if (!products[product]) {
            products[product] = 0;
        }

        products[product] += order.quantity;

    });


    new Chart(
        document.getElementById("productChart"),
        {
            type: "bar",

            data: {

                labels:
                    Object.keys(products),

                datasets: [

                    {
                        label: "Quantity Sold",

                        data:
                            Object.values(products),

                        borderWidth: 1
                    }

                ]

            },

            options: {
                responsive: true
            }

        }
    );

}


// Order Status Overview

function createOrderStatusChart(orders) {

    const statuses = {};

    orders.forEach(order => {

        const status =
            order.orderStatus;

        if (!statuses[status]) {
            statuses[status] = 0;
        }

        statuses[status]++;

    });


    new Chart(
        document.getElementById("orderStatusChart"),
        {
            type: "doughnut",

            data: {

                labels:
                    Object.keys(statuses),

                datasets: [

                    {
                        label: "Orders",

                        data:
                            Object.values(statuses),

                        borderWidth: 1
                    }

                ]

            },

            options: {
                responsive: true
            }

        }
    );

}


loadAdminDashboard();

socket.on("newOrder", (order) => {

    console.log("New order received:", order);

    alert(
        "New NutriBox order received!\n\n" +
        "Customer: " + order.customerName +
        "\nProduct: " + order.productName +
        "\nQuantity: " + order.quantity +
        "\nTotal: ₹" + order.totalAmount
    );

    loadAdminDashboard();

});

async function updateOrderStatus(orderId, newStatus) {

    try {

        const response =
            await fetch(`/api/orders/${orderId}/status`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    orderStatus: newStatus
                })

            });


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Unable to update order status."
            );

            return;
        }


        alert(
            "Order status updated to " +
            newStatus
        );


        loadAdminDashboard();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );

    }

}

async function loadFeedback() {
    const feedbackTable =
        document.getElementById("feedbackTable");

    try {
        const response =
            await fetch("/api/admin/feedback");

        const feedback = await response.json();

        feedbackTable.innerHTML = "";

        if (feedback.length === 0) {
            feedbackTable.innerHTML =
                '<tr><td colspan="4">No feedback available.</td></tr>';
            return;
        }

        feedback.forEach(item => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${item.customerName}</td>
                <td>${item.rating}/5</td>
                <td>${item.comment}</td>
                <td>${new Date(item.createdAt).toLocaleDateString()}</td>
            `;

            feedbackTable.appendChild(row);
        });

    } catch (error) {
        console.error("Feedback loading error:", error);

        feedbackTable.innerHTML =
            '<tr><td colspan="4">Unable to load feedback.</td></tr>';
    }
}

loadFeedback();

function adminLogout() {
    localStorage.removeItem("nutriboxAdmin");

    window.location.href = "admin-login.html";
}


function askSuggestedQuestion(question) {
    document.getElementById("aiQuestion").value = question;
    askAIAgent();
}

async function askAIAgent() {
    const questionInput =
        document.getElementById("aiQuestion");

    const messages =
        document.getElementById("aiMessages");

    const question =
        questionInput.value.trim();

    if (!question) {
        alert("Please enter a question.");
        return;
    }

    messages.innerHTML += `
        <div class="user-message">
            <strong>You:</strong> ${question}
        </div>
    `;

    questionInput.value = "";

    messages.innerHTML += `
        <div class="ai-message" id="aiLoading">
            🤖 Analyzing NutriBox data...
        </div>
    `;

    try {
        const response = await fetch("/api/ai-agent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: question
            })
        });

        const data = await response.json();

        const loadingMessage =
            document.getElementById("aiLoading");

        if (loadingMessage) {
            loadingMessage.remove();
        }

        if (response.ok) {

            messages.innerHTML += `
                <div class="ai-message">
                    <strong>🤖 NutriBox AI:</strong>
                    <p>${data.answer}</p>
                </div>
            `;

        } else {

            messages.innerHTML += `
                <div class="ai-message">
                    AI Agent error:
                    ${data.message}
                </div>
            `;
        }

    } catch (error) {

        console.error("AI Agent error:", error);

        const loadingMessage =
            document.getElementById("aiLoading");

        if (loadingMessage) {
            loadingMessage.remove();
        }

        messages.innerHTML += `
            <div class="ai-message">
                Unable to connect to the AI Agent.
            </div>
        `;
    }
}