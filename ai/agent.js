const OpenAI = require("openai");

const client = process.env.OPENAI_API_KEY
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })
    : null;


function formatMoney(amount) {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}


function getProductSummary(orders) {
    const products = {};

    orders.forEach(order => {
        const name = order.productName || "Unknown Product";

        if (!products[name]) {
            products[name] = {
                quantity: 0,
                sales: 0,
                orders: 0
            };
        }

        products[name].quantity += Number(order.quantity || 0);
        products[name].sales += Number(order.totalAmount || 0);
        products[name].orders += 1;
    });

    return Object.entries(products)
        .map(([name, data]) => ({
            name,
            ...data
        }))
        .sort((a, b) => b.quantity - a.quantity);
}


function getCustomerTypeSummary(orders) {
    const types = {};

    orders.forEach(order => {
        const type = order.customerType || "Unknown";

        if (!types[type]) {
            types[type] = {
                orders: 0,
                meals: 0,
                sales: 0
            };
        }

        types[type].orders += 1;
        types[type].meals += Number(order.quantity || 0);
        types[type].sales += Number(order.totalAmount || 0);
    });

    return Object.entries(types)
        .map(([name, data]) => ({
            name,
            ...data
        }))
        .sort((a, b) => b.sales - a.sales);
}


function getLocationSummary(orders) {
    const locations = {};

    orders.forEach(order => {
        const location = order.location || "Unknown";

        if (!locations[location]) {
            locations[location] = {
                orders: 0,
                meals: 0,
                sales: 0
            };
        }

        locations[location].orders += 1;
        locations[location].meals += Number(order.quantity || 0);
        locations[location].sales += Number(order.totalAmount || 0);
    });

    return Object.entries(locations)
        .map(([name, data]) => ({
            name,
            ...data
        }))
        .sort((a, b) => b.sales - a.sales);
}


function getStatusSummary(orders) {
    const statuses = {};

    orders.forEach(order => {
        const status = order.orderStatus || "Unknown";

        if (!statuses[status]) {
            statuses[status] = 0;
        }

        statuses[status]++;
    });

    return Object.entries(statuses)
        .map(([name, count]) => ({
            name,
            count
        }))
        .sort((a, b) => b.count - a.count);
}


function getFeedbackSummary(feedback) {
    if (!feedback || feedback.length === 0) {
        return {
            averageRating: 0,
            totalFeedback: 0
        };
    }

    const totalRating = feedback.reduce(
        (sum, item) => sum + Number(item.rating || 0),
        0
    );

    return {
        averageRating: Math.round((totalRating / feedback.length) * 10) / 10,
        totalFeedback: feedback.length
    };
}


function localNutriBoxAgent(question, businessData) {

    const q = String(question || "").toLowerCase().trim();
    console.log("AI Question:", q);

    const orders = businessData.orders || [];
    const feedback = businessData.feedback || [];

    const totalSales = Number(businessData.totalSales || 0);
    const totalOrders = Number(businessData.totalOrders || orders.length);
    const totalCustomers = Number(businessData.totalCustomers || 0);
    const totalMeals = Number(
        businessData.totalMealsSold ||
        orders.reduce((sum, order) => sum + Number(order.quantity || 0), 0)
    );

    const averageOrderValue = Number(
        businessData.averageOrderValue ||
        (totalOrders > 0 ? totalSales / totalOrders : 0)
    );

    const products = getProductSummary(orders);
    const customerTypes = getCustomerTypeSummary(orders);
    const locations = getLocationSummary(orders);
    const statuses = getStatusSummary(orders);
    const feedbackSummary = getFeedbackSummary(feedback);


    // SALES QUESTIONS

    if (
        q.includes("total sales") ||
        q.includes("total revenue") ||
        q.includes("revenue") ||
        q.includes("how much did") ||
        q.includes("how much money") ||
        q.includes("sales amount")
    ) {
        return `NutriBox currently has total sales of ${formatMoney(totalSales)} from ${totalOrders} orders. The average order value is ${formatMoney(averageOrderValue)}.`;
    }


    // ORDER QUESTIONS

// CUSTOMER TYPE

  // CUSTOMER TYPE

    if (
        (q.includes("customer") && q.includes("type")) ||
        q.includes("customer segment") ||
        (q.includes("who") && q.includes("buys")) ||
        (q.includes("which") && q.includes("customer"))
    ) {
        if (customerTypes.length === 0) {
            return "There is not enough customer-type order data available.";
        }

        const top = customerTypes[0];

        return `${top.name} currently generates the highest sales among customer types, with ${top.orders} orders, ${top.meals} meals and ${formatMoney(top.sales)} in sales.`;
    }

    // MEAL QUESTIONS

    if (
        q.includes("meals") ||
        q.includes("meal sold") ||
        q.includes("meals sold") ||
        q.includes("how many meals")
    ) {
        return `NutriBox has sold ${totalMeals.toLocaleString("en-IN")} meals across ${totalOrders} orders.`;
    }


    // CUSTOMER QUESTIONS

    if (
        q.includes("customers") ||
        q.includes("customer count") ||
        q.includes("how many customer") ||
        q.includes("registered customer")
    ) {
        return `NutriBox currently has ${totalCustomers} registered customers and has processed ${totalOrders} orders.`;
    }


    // AVERAGE ORDER VALUE

    if (
        q.includes("average order") ||
        q.includes("average value") ||
        q.includes("aov")
    ) {
        return `The current average order value is ${formatMoney(averageOrderValue)}.`;
    }

// BEST PRODUCT

if (
    q.includes("most selling") ||
    q.includes("selling the most") ||
    q.includes("most sold") ||
    q.includes("sold the most") ||
    q.includes("most popular") ||
    q.includes("popular product") ||
    q.includes("top product")
) {
    if (products.length === 0) {
        return "There is not enough product order data to identify the best-selling product.";
    }

    const top = products[0];

    return `${top.name} is currently the most ordered NutriBox product, with ${top.quantity.toLocaleString("en-IN")} units sold and ${formatMoney(top.sales)} in sales.`;
}

    // PRODUCT LIST

    if (
        q.includes("products") ||
        q.includes("product sales") ||
        q.includes("product performance")
    ) {
        if (products.length === 0) {
            return "No product order data is currently available.";
        }

        const result = products
            .slice(0, 5)
            .map((p, index) =>
                `${index + 1}. ${p.name} — ${p.quantity} units, ${formatMoney(p.sales)} sales`
            )
            .join("\n");

        return `Top NutriBox products based on current order data:\n\n${result}`;
    }


    // CUSTOMER TYPE

    if (
        q.includes("customer type") ||
        q.includes("customer segment") ||
        q.includes("which type") ||
        q.includes("who buys the most")
    ) {
        if (customerTypes.length === 0) {
            return "There is not enough customer-type order data available.";
        }

        const top = customerTypes[0];

        return `${top.name} currently generates the highest sales among customer types, with ${top.orders} orders, ${top.meals} meals and ${formatMoney(top.sales)} in sales.`;
    }


    // LOCATION

    if (
        q.includes("location") ||
        q.includes("city") ||
        q.includes("area") ||
        (q.includes("which") && q.includes("sales") && q.includes("where"))
    ) {
        if (locations.length === 0) {
            return "There is not enough location data available.";
        }

        const top = locations[0];

        return `${top.name} currently has the highest sales, with ${top.orders} orders, ${top.meals} meals and ${formatMoney(top.sales)} in sales.`;
    }


    // ORDER STATUS

    if (
        q.includes("status") ||
        q.includes("pending") ||
        q.includes("delivery") ||
        q.includes("delivered") ||
        q.includes("preparing") ||
        q.includes("confirmed")
    ) {
        if (statuses.length === 0) {
            return "There is no order-status data available.";
        }

        const result = statuses
            .map(item => `${item.name}: ${item.count}`)
            .join(", ");

        return `Current order status distribution: ${result}.`;
    }


    // FEEDBACK / SATISFACTION

    if (
        q.includes("feedback") ||
        q.includes("satisfaction") ||
        q.includes("rating") ||
        q.includes("customer happy")
    ) {
        if (feedbackSummary.totalFeedback === 0) {
            return "No customer feedback has been recorded yet.";
        }

        return `NutriBox has received ${feedbackSummary.totalFeedback} feedback records. The average customer rating is ${feedbackSummary.averageRating}/5.`;
    }


    // BUSINESS SUMMARY

    if (
        q.includes("summary") ||
        q.includes("business overview") ||
        q.includes("business performance") ||
        q.includes("overall")
    ) {
        return `NutriBox Business Summary:\n\n• Sales: ${formatMoney(totalSales)}\n• Orders: ${totalOrders}\n• Customers: ${totalCustomers}\n• Meals sold: ${totalMeals.toLocaleString("en-IN")}\n• Average order value: ${formatMoney(averageOrderValue)}\n• Customer satisfaction: ${feedbackSummary.averageRating || "No rating available"}/5`;
    }


    // BUSINESS RECOMMENDATIONS

    if (
        q.includes("recommend") ||
        q.includes("recommendation") ||
        q.includes("suggest") ||
        q.includes("improve") ||
        q.includes("what should") ||
        q.includes("business idea")
    ) {
        let recommendation = "NutriBox should continue monitoring sales, orders and customer feedback.";

        if (products.length > 0) {
            recommendation += ` The current best-selling product is ${products[0].name}, so its availability should be monitored.`;
        }

        if (feedbackSummary.averageRating > 0 && feedbackSummary.averageRating < 3.5) {
            recommendation += " Customer satisfaction is below 3.5/5, so feedback should be reviewed to identify service or product improvements.";
        } else if (feedbackSummary.averageRating >= 4) {
            recommendation += " Customer satisfaction is currently strong, so NutriBox can focus on encouraging repeat orders.";
        }

        return recommendation;
    }


    // FULL FALLBACK

    return `I can analyze the current NutriBox business data. Here is the latest overview:\n\n• Sales: ${formatMoney(totalSales)}\n• Orders: ${totalOrders}\n• Customers: ${totalCustomers}\n• Meals sold: ${totalMeals.toLocaleString("en-IN")}\n• Average order value: ${formatMoney(averageOrderValue)}\n\nYou can ask me about sales, orders, meals, customers, products, customer types, locations, delivery status, feedback, satisfaction, business performance or recommendations.`;
}


async function runNutriBoxAgent(question, businessData) {

    // Use the local analytics agent when no API key is available.
    if (!client) {
        return localNutriBoxAgent(question, businessData);
    }

    try {

        const prompt = `
You are the NutriBox AI Business Analytics Agent.

NutriBox is a healthy food webshop.

Analyze the provided NutriBox business data and answer the user's question.

Important rules:
- Use only the provided data.
- Never invent numbers.
- Give simple and clear answers.
- If the question is about business performance, provide useful insights.
- If the question asks for a recommendation, base it on the data.

NutriBox business data:
${JSON.stringify(businessData, null, 2)}

User question:
${question}
`;

        const response = await client.responses.create({
            model: "gpt-6-luna",
            input: prompt
        });

        return response.output_text;

    } catch (error) {

        if (
            error.status === 429 ||
            error.code === "credit_balance_exhausted" ||
            error.type === "insufficient_quota"
        ) {
            console.log(
                "OpenAI API credits unavailable. Using local NutriBox AI analytics."
            );

            return localNutriBoxAgent(question, businessData);
        }

        throw error;
    }
}


module.exports = {
    runNutriBoxAgent
};