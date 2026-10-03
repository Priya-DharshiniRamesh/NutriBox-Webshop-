let selectedProduct = null;

async function loadProducts() {
    const productList = document.getElementById("productList");

    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        const products = await response.json();

        productList.innerHTML = "";

        products.forEach(product => {
            const productCard = document.createElement("div");

            productCard.className = "product-card";

            productCard.innerHTML = `
                <div class="product-icon">🥗</div>

                <h3>${product.name}</h3>

                <p>${product.description}</p>

                <h4>₹${product.price} / ${product.unit}</h4>

                <button onclick="openOrderForm(
                    '${product._id}',
                    '${product.name}',
                    ${product.price}
                )">
                    Add to Order
                </button>
            `;

            productList.appendChild(productCard);
        });

    } catch (error) {
        console.error("Product loading error:", error);

        productList.innerHTML =
            "<p>Unable to load NutriBox products.</p>";
    }
}


function openOrderForm(productId, productName, productPrice) {

    selectedProduct = {
        id: productId,
        name: productName,
        price: productPrice
    };

    const customerData =
        JSON.parse(localStorage.getItem("nutriboxCustomer"));

    if (!customerData) {
        alert("Please login before placing an order.");
        window.location.href = "login.html";
        return;
    }

    document.getElementById("orderProductName").textContent =
        productName;

    document.getElementById("orderProductPrice").textContent =
        `₹${productPrice}`;

    document.getElementById("quantity").value = 1;

    document.getElementById("orderModal").style.display = "flex";
}


function closeOrderForm() {

    document.getElementById("orderModal").style.display = "none";
}


async function placeOrder() {

    const customerData =
        JSON.parse(localStorage.getItem("nutriboxCustomer"));

    if (!customerData) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const quantity =
        Number(document.getElementById("quantity").value);

    if (!quantity || quantity < 1) {
        alert("Please enter a valid quantity.");
        return;
    }

    try {

        const response = await fetch("/api/orders", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                customerId: customerData.id,

                productId: selectedProduct.id,

                quantity: quantity

            })

        });

        const data = await response.json();

        if (response.ok) {

            alert(
                "Order placed successfully!\n\n" +
                "Product: " + selectedProduct.name +
                "\nQuantity: " + quantity +
                "\nTotal: ₹" +
                data.order.totalAmount
            );

            closeOrderForm();

        } else {

            alert(
                data.message ||
                "Unable to place order."
            );
        }

    } catch (error) {

        console.error("Order error:", error);

        alert(
            "Unable to connect to the server."
        );
    }
}


loadProducts();