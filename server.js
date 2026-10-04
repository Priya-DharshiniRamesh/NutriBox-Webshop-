const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Customer = require("./models/Customer");
const Order = require("./models/Order");
const Feedback = require("./models/Feedback");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const { runNutriBoxAgent } = require("./ai/agent");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("NutriBox Webshop Server is Running!");
});

app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
});

app.post("/api/products", async (req, res) => {
    try {
        const {
            name,
            category,
            description,
            price,
            unit
        } = req.body;

        if (
            !name ||
            !category ||
            !description ||
            !price ||
            !unit
        ) {
            return res.status(400).json({
                message: "Please fill in all product fields."
            });
        }

        const product = new Product({
            name,
            category,
            description,
            price: Number(price),
            unit,
            available: true
        });

        await product.save();

        res.status(201).json({
            message: "Product added successfully.",
            product
        });

    } catch (error) {
        console.error("Product creation error:", error);

        res.status(500).json({
            message: "Failed to add product.",
            error: error.message
        });
    }
});


app.put("/api/products/:id", async (req, res) => {
    try {
        const productId = req.params.id;

        const {
            name,
            category,
            description,
            price,
            unit,
            available
        } = req.body;

        const product = await Product.findByIdAndUpdate(
            productId,
            {
                name,
                category,
                description,
                price: Number(price),
                unit,
                available
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found."
            });
        }

        res.json({
            message: "Product updated successfully.",
            product
        });

    } catch (error) {
        console.error("Product update error:", error);

        res.status(500).json({
            message: "Failed to update product.",
            error: error.message
        });
    }
});


app.delete("/api/products/:id", async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findByIdAndDelete(
            productId
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found."
            });
        }

        res.json({
            message: "Product deleted successfully.",
            product
        });

    } catch (error) {
        console.error("Product deletion error:", error);

        res.status(500).json({
            message: "Failed to delete product.",
            error: error.message
        });
    }
});

app.post("/api/customers/register", async (req, res) => {

    try {

        const {
            organizationName,
            customerType,
            contactPerson,
            email,
            phone,
            location,
            password
        } = req.body;


        if (
            !organizationName ||
            !customerType ||
            !contactPerson ||
            !email ||
            !phone ||
            !location ||
            !password
        ) {
            return res.status(400).json({
                message: "Please fill in all fields."
            });
        }


        const existingCustomer = await Customer.findOne({
            email: email
        });


        if (existingCustomer) {

            return res.status(400).json({
                message: "This email is already registered."
            });

        }


        const customer = new Customer({

            organizationName: organizationName,

            customerType: customerType,

            contactPerson: contactPerson,

            email: email,

            phone: phone,

            location: location,

            password: password

        });


        await customer.save();


        res.status(201).json({

            message: "Customer registered successfully.",

            customer: {
                id: customer._id,
                organizationName: customer.organizationName,
                email: customer.email
            }

        });


    } catch (error) {

        console.error("Registration error:", error);

        res.status(500).json({

            message: "Registration failed.",

            error: error.message

        });

    }

});

app.post("/api/customers/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message: "Please enter email and password."
            });

        }

        const customer = await Customer.findOne({
            email: email
        });

        if (!customer) {

            return res.status(401).json({
                message: "Invalid email or password."
            });

        }

        if (customer.password !== password) {

            return res.status(401).json({
                message: "Invalid email or password."
            });

        }

        res.status(200).json({

            message: "Login successful.",

            customer: {
                id: customer._id,
                organizationName: customer.organizationName,
                customerType: customer.customerType,
                contactPerson: customer.contactPerson,
                email: customer.email,
                phone: customer.phone,
                location: customer.location
            }

        });

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({

            message: "Login failed.",

            error: error.message

        });

    }

});

app.get("/api/customers/:id/dashboard", async (req, res) => {

    try {

        const customerId = req.params.id;


        // Get customer orders
        const orders = await Order.find({
            customerId: customerId
        })
        .sort({ orderDate: -1 });


        // Total number of orders
        const totalOrders = orders.length;


        // Total meals ordered
        const totalMeals = orders.reduce(
            (sum, order) => sum + order.quantity,
            0
        );


        // Total spending
        const totalSpending = orders.reduce(
            (sum, order) => sum + order.totalAmount,
            0
        );


        // Average order value
        const averageOrderValue =
            totalOrders > 0
                ? Math.round(totalSpending / totalOrders)
                : 0;


        // Get customer feedback
        const feedback = await Feedback.find({
            customerId: customerId
        });


        // Customer satisfaction
        let customerSatisfaction = 0;

        if (feedback.length > 0) {

            const totalRating = feedback.reduce(
                (sum, item) => sum + item.rating,
                0
            );

            customerSatisfaction =
                Math.round(
                    (totalRating / feedback.length) * 10
                ) / 10;
        }


        // Send dashboard data
        res.json({

            totalOrders: totalOrders,

            totalMeals: totalMeals,

            totalSpending: totalSpending,

            averageOrderValue: averageOrderValue,

            customerSatisfaction: customerSatisfaction,

            recentOrders: orders.slice(0, 10)

        });


    } catch (error) {

        console.error(
            "Customer dashboard error:",
            error
        );


        res.status(500).json({

            message: "Unable to load customer dashboard.",

            error: error.message

        });

    }

});

app.post("/api/orders", async (req, res) => {
    try {
        const {
            customerId,
            productId,
            quantity
        } = req.body;

        if (!customerId || !productId || !quantity) {
            return res.status(400).json({
                message: "Customer, product and quantity are required."
            });
        }

        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found."
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found."
            });
        }

        const totalAmount = product.price * quantity;

        const order = new Order({
            customerId: customer._id,
            customerName: customer.organizationName,
            customerType: customer.customerType,
            location: customer.location,
            productName: product.name,
            quantity: quantity,
            pricePerUnit: product.price,
            totalAmount: totalAmount,
            orderStatus: "Pending"
        });

        await order.save();
        io.emit("newOrder", order);

        res.status(201).json({
            message: "Order placed successfully.",
            order: order
        });

    } catch (error) {
        console.error("Order creation error:", error);

        res.status(500).json({
            message: "Failed to place order.",
            error: error.message
        });
    }
});

app.get("/api/admin/dashboard", async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ orderDate: -1 });

        const customers = await Customer.find();

        const feedback = await Feedback.find();

        const totalOrders = orders.length;

        const totalCustomers = customers.length;

        const totalMeals = orders.reduce(
            (sum, order) => sum + order.quantity,
            0
        );

        const totalSales = orders.reduce(
            (sum, order) => sum + order.totalAmount,
            0
        );

        const averageOrderValue =
            totalOrders > 0
                ? Math.round(totalSales / totalOrders)
                : 0;

        let customerSatisfaction = 0;

        if (feedback.length > 0) {

            const totalRating = feedback.reduce(
                (sum, item) => sum + item.rating,
                0
            );

            customerSatisfaction =
                Math.round(
                    (totalRating / feedback.length) * 10
                ) / 10;
        }

        res.json({

            totalSales: totalSales,

            totalOrders: totalOrders,

            totalCustomers: totalCustomers,

            totalMeals: totalMeals,

            averageOrderValue: averageOrderValue,

            customerSatisfaction: customerSatisfaction,

            recentOrders: orders.slice(0, 10)

        });

    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );

        res.status(500).json({

            message:
                "Unable to load admin dashboard.",

            error:
                error.message

        });
    }
});

app.get("/api/admin/analytics", async (req, res) => {
    try {

        const orders = await Order.find().sort({ orderDate: 1 });

        const salesByDate = {};
        const salesByCustomerType = {};
        const productsSold = {};
        const orderStatuses = {};

        orders.forEach(order => {

            const date =
                new Date(order.orderDate).toLocaleDateString();

            if (!salesByDate[date]) {
                salesByDate[date] = 0;
            }

            salesByDate[date] += order.totalAmount;


            const customerType =
                order.customerType;

            if (!salesByCustomerType[customerType]) {
                salesByCustomerType[customerType] = 0;
            }

            salesByCustomerType[customerType] +=
                order.totalAmount;


            const product =
                order.productName;

            if (!productsSold[product]) {
                productsSold[product] = 0;
            }

            productsSold[product] += order.quantity;


            const status =
                order.orderStatus;

            if (!orderStatuses[status]) {
                orderStatuses[status] = 0;
            }

            orderStatuses[status]++;

        });


        res.json({

            salesByDate: salesByDate,

            salesByCustomerType:
                salesByCustomerType,

            productsSold:
                productsSold,

            orderStatuses:
                orderStatuses

        });

    } catch (error) {

        console.error(
            "Analytics error:",
            error
        );

        res.status(500).json({

            message:
                "Unable to load analytics.",

            error:
                error.message

        });

    }
});

app.get("/api/customers/:id/orders", async (req, res) => {
    try {
        const customerId = req.params.id;

        const orders = await Order.find({
            customerId: customerId
        }).sort({
            orderDate: -1
        });

        res.json(orders);

    } catch (error) {

        console.error(
            "Order history error:",
            error
        );

        res.status(500).json({
            message: "Unable to load order history.",
            error: error.message
        });
    }
});

app.put("/api/orders/:id/status", async (req, res) => {
    try {
        const orderId = req.params.id;
        const { orderStatus } = req.body;

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Preparing",
            "Out for Delivery",
            "Delivered",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(orderStatus)) {
            return res.status(400).json({
                message: "Invalid order status."
            });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                orderStatus: orderStatus
            },
            {
                new: true
            }
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found."
            });
        }

        io.emit("orderStatusUpdated", order);

        res.json({
            message: "Order status updated successfully.",
            order: order
        });

    } catch (error) {

        console.error(
            "Order status update error:",
            error
        );

        res.status(500).json({
            message: "Unable to update order status.",
            error: error.message
        });
    }
});

app.post("/api/feedback", async (req, res) => {
    try {
        const { customerId, orderId, rating, comment } = req.body;

        if (!customerId || !orderId || !rating || !comment) {
            return res.status(400).json({
                message: "All feedback fields are required."
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5."
            });
        }

        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found."
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found."
            });
        }

        const feedback = new Feedback({
            customerId: customer._id,
            customerName: customer.organizationName,
            rating: Number(rating),
            comment: comment,
            orderId: order._id
        });

        await feedback.save();

        io.emit("newFeedback", feedback);

        res.status(201).json({
            message: "Feedback submitted successfully.",
            feedback
        });

    } catch (error) {
        console.error("Feedback error:", error);

        res.status(500).json({
            message: "Unable to submit feedback."
        });
    }
});

app.get("/api/admin/feedback", async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .sort({ createdAt: -1 });

        res.json(feedback);

    } catch (error) {
        console.error("Feedback loading error:", error);

        res.status(500).json({
            message: "Unable to load feedback."
        });
    }
});

app.post("/api/ai-agent", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                message: "Please enter a question."
            });
        }

        const orders = await Order.find();

        const customers = await Customer.find();

        const products = await Product.find();

        const feedback = await Feedback.find();

        const totalSales = orders.reduce(
            (sum, order) => sum + order.totalAmount,
            0
        );

        const totalMeals = orders.reduce(
            (sum, order) => sum + order.quantity,
            0
        );

        const averageOrderValue =
            orders.length > 0
                ? Math.round(totalSales / orders.length)
                : 0;

        const businessData = {
            totalOrders: orders.length,
            totalCustomers: customers.length,
            totalProducts: products.length,
            totalMealsSold: totalMeals,
            totalSales: totalSales,
            averageOrderValue: averageOrderValue,
            feedbackCount: feedback.length,

            products: products.map(product => ({
                name: product.name,
                category: product.category,
                price: product.price
            })),

            orders: orders.map(order => ({
                productName: order.productName,
                quantity: order.quantity,
                totalAmount: order.totalAmount,
                customerType: order.customerType,
                location: order.location,
                orderStatus: order.orderStatus
            })),

            feedback: feedback.map(item => ({
                rating: item.rating,
                comment: item.comment
            }))
        };

        const answer = await runNutriBoxAgent(
            question,
            businessData
        );

        res.json({
            answer: answer
        });

    } catch (error) {
        console.error("AI Agent error:", error);

        res.status(500).json({
            message: "AI Agent could not process the request."
        });
    }
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Atlas connected successfully!");

        server.listen(PORT, () => {
            console.log(`NutriBox server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    }); 