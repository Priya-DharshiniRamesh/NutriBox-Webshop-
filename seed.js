const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Product = require("./models/Product");
const Customer = require("./models/Customer");
const Order = require("./models/Order");
const Feedback = require("./models/Feedback");

dotenv.config();

const products = [
    {
        name: "Protein Meal Box",
        category: "High Protein",
        description: "Nutritious meal box with high protein content",
        price: 180,
        unit: "Box",
        available: true
    },
    {
        name: "Healthy Lunch Box",
        category: "Healthy Meals",
        description: "Balanced lunch with vegetables, grains and protein",
        price: 150,
        unit: "Box",
        available: true
    },
    {
        name: "Nutri Snack Box",
        category: "Healthy Snacks",
        description: "Healthy snacks suitable for offices and fitness centres",
        price: 100,
        unit: "Box",
        available: true
    },
    {
        name: "Fruit & Fitness Box",
        category: "Fruits",
        description: "Fresh fruits and nutritious fitness snacks",
        price: 120,
        unit: "Box",
        available: true
    },
    {
        name: "Energy Breakfast Box",
        category: "Breakfast",
        description: "Healthy breakfast combination for active customers",
        price: 130,
        unit: "Box",
        available: true
    },
    {
        name: "Fitness Salad Box",
        category: "Salads",
        description: "Fresh vegetables and protein-rich salad",
        price: 140,
        unit: "Box",
        available: true
    },
    {
        name: "Power Meal Box",
        category: "High Protein",
        description: "Complete nutritious meal for fitness-focused customers",
        price: 200,
        unit: "Box",
        available: true
    },
    {
        name: "Healthy Wrap Box",
        category: "Healthy Meals",
        description: "Fresh and healthy vegetable protein wraps",
        price: 110,
        unit: "Box",
        available: true
    },
    {
        name: "Oats & Nuts Box",
        category: "Healthy Snacks",
        description: "Oats, nuts and nutritious ingredients",
        price: 125,
        unit: "Box",
        available: true
    },
    {
        name: "Wellness Combo Box",
        category: "Wellness",
        description: "Combination of healthy meals, fruits and snacks",
        price: 220,
        unit: "Box",
        available: true
    }
];

const customerTypes = [
    "Gym / Fitness Centre",
    "Corporate Office",
    "College Hostel",
    "Hospital / Wellness Centre",
    "Hotel / Cafeteria",
    "Sports Academy"
];

const locations = [
    "Coimbatore",
    "Chennai",
    "Bangalore",
    "Madurai",
    "Trichy",
    "Salem",
    "Erode",
    "Tiruppur",
    "Thanjavur",
    "Pondicherry"
];

const organizationNames = [
    "FitZone",
    "HealthFirst",
    "Wellness Hub",
    "PowerFit",
    "GreenLife",
    "ActiveCore",
    "HealthySpace",
    "FitnessPro",
    "NutriCare",
    "Vitality Centre"
];

const contactNames = [
    "Arun",
    "Priya",
    "Karthik",
    "Divya",
    "Rahul",
    "Ananya",
    "Vignesh",
    "Sneha",
    "Sanjay",
    "Keerthana"
];

const comments = [
    "Good quality and timely delivery.",
    "The food was fresh and nutritious.",
    "Very good meal options.",
    "Excellent service.",
    "Healthy and tasty food.",
    "Delivery was on time.",
    "Good packaging and quality.",
    "Our customers liked the meals.",
    "Very useful for our organization.",
    "Good overall experience."
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("Connected to MongoDB Atlas.");

        await Product.deleteMany({});
        await Customer.deleteMany({});
        await Order.deleteMany({});
        await Feedback.deleteMany({});

        console.log("Old demo data cleared.");

        const createdProducts = await Product.insertMany(products);

        console.log(`${createdProducts.length} products inserted.`);

        const customers = [];

        for (let i = 1; i <= 100; i++) {
            const organization =
                organizationNames[(i - 1) % organizationNames.length];

            const contact =
                contactNames[(i - 1) % contactNames.length];

            customers.push({
                organizationName: `${organization} ${i}`,
                customerType:
                    customerTypes[(i - 1) % customerTypes.length],
                contactPerson: contact,
                email: `customer${i}@nutriboxdemo.com`,
                phone: `900000${String(i).padStart(4, "0")}`,
                location:
                    locations[(i - 1) % locations.length],
                password: "Nutri@2026"
            });
        }

        const createdCustomers = await Customer.insertMany(customers);

        console.log(`${createdCustomers.length} customers inserted.`);

        const orders = [];

        const orderStatuses = [
            "Pending",
            "Confirmed",
            "Preparing",
            "Out for Delivery",
            "Delivered"
        ];

        for (let i = 1; i <= 500; i++) {
            const customer =
                createdCustomers[(i - 1) % createdCustomers.length];

            const product =
                createdProducts[(i - 1) % createdProducts.length];

            const quantity = ((i - 1) % 10) + 1;

            const totalAmount =
                quantity * product.price;

            const orderDate = new Date();

            orderDate.setDate(
                orderDate.getDate() - ((i - 1) % 90)
            );

            orders.push({
                customerId: customer._id,
                customerName: customer.organizationName,
                customerType: customer.customerType,
                location: customer.location,
                productName: product.name,
                quantity: quantity,
                pricePerUnit: product.price,
                totalAmount: totalAmount,
                orderStatus:
                    orderStatuses[(i - 1) % orderStatuses.length],
                orderDate: orderDate
            });
        }

        const createdOrders = await Order.insertMany(orders);

        console.log(`${createdOrders.length} orders inserted.`);

        const feedback = [];

        for (let i = 1; i <= 100; i++) {
            const customer =
                createdCustomers[(i - 1) % createdCustomers.length];

            const order =
                createdOrders[(i - 1) % createdOrders.length];

            feedback.push({
                customerId: customer._id,
                customerName: customer.organizationName,
                rating: ((i - 1) % 5) + 1,
                comment:
                    comments[(i - 1) % comments.length],
                orderId: order._id
            });
        }

        const createdFeedback =
            await Feedback.insertMany(feedback);

        console.log(`${createdFeedback.length} feedback records inserted.`);

        console.log("");
        console.log("=================================");
        console.log("NutriBox database seeding complete!");
        console.log("=================================");
        console.log(`Products: ${createdProducts.length}`);
        console.log(`Customers: ${createdCustomers.length}`);
        console.log(`Orders: ${createdOrders.length}`);
        console.log(`Feedback: ${createdFeedback.length}`);

        await mongoose.connection.close();

        console.log("MongoDB connection closed.");
    } catch (error) {
        console.error("Database seeding failed:");
        console.error(error.message);

        await mongoose.connection.close();
    }
}

seedDatabase();