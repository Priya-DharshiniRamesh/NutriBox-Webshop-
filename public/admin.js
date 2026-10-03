const adminLoggedIn =
    localStorage.getItem("nutriboxAdmin");

if (adminLoggedIn !== "true") {
    window.location.href = "admin-login.html";
}

const socket = io();

let salesChartInstance = null;
let customerTypeChartInstance = null;
let productChartInstance = null;
let orderStatusChartInstance = null;

async function loadAdminDashboard() {

    try {

        const dashboardResponse =
            await fetch("/api/admin/dashboard");

        if (!dashboardResponse.ok) {
            throw new Error("Failed to load admin dashboard");
        }

        const data =
            await dashboardResponse.json();

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

        displayAdminOrders(data.recentOrders);

        const analyticsResponse =
            await fetch("/api/admin/analytics");

        if (!analyticsResponse.ok) {
            throw new Error("Failed to load analytics");
        }

        const analytics =
            await analyticsResponse.json();

        createSalesChart(analytics.salesByDate);

        createCustomerTypeChart(
            analytics.salesByCustomerType
        );

        createProductChart(
            analytics.productsSold
        );

        createOrderStatusChart(
            analytics.orderStatuses
        );

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

                    <option value="Pending"
                        ${order.orderStatus === "Pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="Confirmed"
                        ${order.orderStatus === "Confirmed" ? "selected" : ""}>
                        Confirmed
                    </option>

                    <option value="Preparing"
                        ${order.orderStatus === "Preparing" ? "selected" : ""}>
                        Preparing
                    </option>

                    <option value="Out for Delivery"
                        ${order.orderStatus === "Out for Delivery" ? "selected" : ""}>
                        Out for Delivery
                    </option>

                    <option value="Delivered"
                        ${order.orderStatus === "Delivered" ? "selected" : ""}>
                        Delivered
                    </option>

                    <option value="Cancelled"
                        ${order.orderStatus === "Cancelled" ? "selected" : ""}>
                        Cancelled
                    </option>

                </select>
            </td>

            <td>${date}</td>

        `;

        table.appendChild(row);

    });

}

function createSalesChart(salesByDate) {

    const labels =
        Object.keys(salesByDate);

    const values =
        Object.values(salesByDate);

    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    salesChartInstance = new Chart(
        document.getElementById("salesChart"),
        {
            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {
                        label: "Sales",

                        data: values,

                        borderWidth: 2,

                        tension: 0.3
                    }

                ]

            },

            options: {

                responsive: true,

               
            }

        }
    );

}

function createCustomerTypeChart(
    salesByCustomerType
) {

    const labels =
        Object.keys(salesByCustomerType);

    const values =
        Object.values(salesByCustomerType);

    if (customerTypeChartInstance) {
        customerTypeChartInstance.destroy();
    }

    customerTypeChartInstance = new Chart(
        document.getElementById("customerTypeChart"),
        {
            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {
                        label: "Sales",

                        data: values,

                        borderWidth: 1
                    }

                ]

            },

            options: {

                responsive: true,

                

            }

        }
    );

}

function createProductChart(productsSold) {

    const labels =
        Object.keys(productsSold);

    const values =
        Object.values(productsSold);

    if (productChartInstance) {
        productChartInstance.destroy();
    }

    productChartInstance = new Chart(
        document.getElementById("productChart"),
        {
            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {
                        label: "Quantity Sold",

                        data: values,

                        borderWidth: 1
                    }

                ]

            },

            options: {

                responsive: true,

              

            }

        }
    );

}

function createOrderStatusChart(orderStatuses) {

    const labels =
        Object.keys(orderStatuses);

    const values =
        Object.values(orderStatuses);

    if (orderStatusChartInstance) {
        orderStatusChartInstance.destroy();
    }

    orderStatusChartInstance = new Chart(
        document.getElementById("orderStatusChart"),
        {
            type: "doughnut",

            data: {

                labels: labels,

                datasets: [

                    {
                        label: "Orders",

                        data: values,

                        borderWidth: 1
                    }

                ]

            },

            options: {

                responsive: true,


            }

        }
    );

}

loadAdminDashboard();

socket.on("newOrder", (order) => {

    console.log(
        "New order received:",
        order
    );

    alert(
        "New NutriBox order received!\n\n" +
        "Customer: " +
        order.customerName +
        "\nProduct: " +
        order.productName +
        "\nQuantity: " +
        order.quantity +
        "\nTotal: ₹" +
        order.totalAmount
    );

    loadAdminDashboard();

});

async function updateOrderStatus(
    orderId,
    newStatus
) {

    try {

        const response =
            await fetch(
                `/api/orders/${orderId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        orderStatus:
                            newStatus
                    })
                }
            );

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
        document.getElementById(
            "feedbackTable"
        );

    try {

        const response =
            await fetch(
                "/api/admin/feedback"
            );

        const feedback =
            await response.json();

        feedbackTable.innerHTML = "";

        if (feedback.length === 0) {

            feedbackTable.innerHTML =
                '<tr><td colspan="4">No feedback available.</td></tr>';

            return;
        }

        feedback.forEach(item => {

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>
                    ${item.customerName}
                </td>

                <td>
                    ${item.rating}/5
                </td>

                <td>
                    ${item.comment}
                </td>

                <td>
                    ${new Date(
                        item.createdAt
                    ).toLocaleDateString()}
                </td>

            `;

            feedbackTable.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Feedback loading error:",
            error
        );

        feedbackTable.innerHTML =
            '<tr><td colspan="4">Unable to load feedback.</td></tr>';

    }

}

loadFeedback();

function adminLogout() {

    localStorage.removeItem(
        "nutriboxAdmin"
    );

    window.location.href =
        "admin-login.html";

}

function askSuggestedQuestion(
    question
) {

    document.getElementById(
        "aiQuestion"
    ).value = question;

    askAIAgent();

}

async function askAIAgent() {

    const questionInput =
        document.getElementById(
            "aiQuestion"
        );

    const messages =
        document.getElementById(
            "aiMessages"
        );

    const question =
        questionInput.value.trim();

    if (!question) {

        alert(
            "Please enter a question."
        );

        return;
    }

    messages.innerHTML += `

        <div class="user-message">

            <strong>You:</strong>
            ${question}

        </div>

    `;

    questionInput.value = "";

    messages.innerHTML += `

        <div
            class="ai-message"
            id="aiLoading"
        >

            🤖 Analyzing NutriBox data...

        </div>

    `;

    try {

        const response =
            await fetch(
                "/api/ai-agent",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question: question
                    })
                }
            );

        const data =
            await response.json();

        const loadingMessage =
            document.getElementById(
                "aiLoading"
            );

        if (loadingMessage) {
            loadingMessage.remove();
        }

        if (response.ok) {

            messages.innerHTML += `

                <div class="ai-message">

                    <strong>
                        🤖 NutriBox AI:
                    </strong>

                    <p>
                        ${data.answer}
                    </p>

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

        console.error(
            "AI Agent error:",
            error
        );

        const loadingMessage =
            document.getElementById(
                "aiLoading"
            );

        if (loadingMessage) {
            loadingMessage.remove();
        }

        messages.innerHTML += `

            <div class="ai-message">

                Unable to connect
                to the AI Agent.

            </div>

        `;

    }

}