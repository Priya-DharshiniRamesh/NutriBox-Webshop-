const OpenAI = require("openai");

const client = process.env.OPENAI_API_KEY
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })
    : null;

function localNutriBoxAgent(question, businessData) {
    const q = question.toLowerCase();

    const totalSales = businessData.totalSales;
    const totalOrders = businessData.totalOrders;
    const totalCustomers = businessData.totalCustomers;
    const totalMeals = businessData.totalMealsSold;
    const averageOrderValue = businessData.averageOrderValue;

    if (
        q.includes("total sales") ||
        q.includes("sales") && q.includes("orders")
    ) {
        return `NutriBox currently has total sales of ₹${totalSales.toLocaleString("en-IN")} from ${totalOrders} orders. The average order value is ₹${averageOrderValue.toLocaleString("en-IN")}.`;
    }

    if (
        q.includes("total orders") ||
        q.includes("number of orders")
    ) {
        return `NutriBox has received ${totalOrders} orders. A total of ${totalMeals.toLocaleString("en-IN")} meals have been sold.`;
    }

    if (
        q.includes("customers") ||
        q.includes("customer count")
    ) {
        return `NutriBox currently has ${totalCustomers} registered customers. The business has processed ${totalOrders} orders from these customers.`;
    }

    if (
        q.includes("average order") ||
        q.includes("average value")
    ) {
        return `The current average order value is ₹${averageOrderValue.toLocaleString("en-IN")}. This is calculated using total sales divided by total orders.`;
    }

    if (
        q.includes("meals") ||
        q.includes("meals sold")
    ) {
        return `NutriBox has sold a total of ${totalMeals.toLocaleString("en-IN")} meals across ${totalOrders} orders.`;
    }

    if (
        q.includes("product") ||
        q.includes("products")
    ) {
        const productSummary = {};

        businessData.orders.forEach(order => {
            if (!productSummary[order.productName]) {
                productSummary[order.productName] = 0;
            }

            productSummary[order.productName] += order.quantity;
        });

        const sortedProducts = Object.entries(productSummary)
            .sort((a, b) => b[1] - a[1]);

        if (sortedProducts.length > 0) {
            const topProduct = sortedProducts[0];

            return `Based on the current NutriBox order data, the most ordered product is ${topProduct[0]} with ${topProduct[1]} units sold. Consider monitoring its stock and promoting it to suitable customer groups.`;
        }
    }

    if (
        q.includes("recommend") ||
        q.includes("recommendation") ||
        q.includes("suggest")
    ) {
        return `NutriBox has ${totalOrders} orders, ${totalCustomers} customers and ₹${totalSales.toLocaleString("en-IN")} in sales. A useful business action is to identify the best-selling products, encourage repeat orders and monitor customer feedback to improve satisfaction.`;
    }

    if (
        q.includes("status") ||
        q.includes("pending") ||
        q.includes("delivery")
    ) {
        const statuses = {};

        businessData.orders.forEach(order => {
            if (!statuses[order.orderStatus]) {
                statuses[order.orderStatus] = 0;
            }

            statuses[order.orderStatus]++;
        });

        const statusText = Object.entries(statuses)
            .map(([status, count]) => `${status}: ${count}`)
            .join(", ");

        return `Current order status distribution: ${statusText}. Monitoring pending and delivery-related orders can help improve customer service.`;
    }

    return `I analyzed the current NutriBox business data. There are ${totalOrders} orders, ${totalCustomers} customers, ${totalMeals} meals sold and total sales of ₹${totalSales.toLocaleString("en-IN")}. Try asking about sales, orders, customers, products, meals, order status or recommendations.`;
}

async function runNutriBoxAgent(question, businessData) {
    if (!client) {
        return localNutriBoxAgent(question, businessData);
    }

    try {
        const prompt = `
You are the NutriBox AI Business Analytics Agent.

NutriBox is a healthy food webshop.

Your job is to:
1. Understand the user's business question.
2. Analyze the provided NutriBox data.
3. Explain important findings.
4. Give practical business recommendations.

Always base your answer on the provided data.
Do not invent numbers.

NutriBox business data:
${JSON.stringify(businessData, null, 2)}

User question:
${question}

Give a clear and simple business-focused answer.
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
            console.log("OpenAI API credits unavailable. Using local NutriBox AI analysis.");
            return localNutriBoxAgent(question, businessData);
        }

        throw error;
    }
}

module.exports = {
    runNutriBoxAgent
};