let cart = JSON.parse(localStorage.getItem("nutriboxCart")) || [];

function saveCart() {
    localStorage.setItem("nutriboxCart", JSON.stringify(cart));
}

function displayCart() {

    const cartItems = document.getElementById("cartItems");
    const totalItems = document.getElementById("cartTotalItems");
    const totalAmount = document.getElementById("cartTotalAmount");

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty 🛒</h2>
                <p>Add some NutriBox products to your cart.</p>
                <a href="index.html#products">
                    Continue Shopping
                </a>
            </div>
        `;

        totalItems.textContent = "0";
        totalAmount.textContent = "₹0";

        return;
    }

    cartItems.innerHTML = "";

    let itemCount = 0;
    let total = 0;

    cart.forEach((item, index) => {

        const itemTotal = item.price * item.quantity;

        itemCount += item.quantity;
        total += itemTotal;

        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <div class="cart-item-info">

                <h3>${item.name}</h3>

                <p>
                    ₹${item.price} / ${item.unit}
                </p>

            </div>

            <div class="cart-item-controls">

                <button onclick="decreaseQuantity(${index})">
                    −
                </button>

                <span>${item.quantity}</span>

                <button onclick="increaseQuantity(${index})">
                    +
                </button>

                <strong>
                    ₹${itemTotal}
                </strong>

                <button
                    onclick="removeFromCart(${index})"
                    class="remove-cart-item"
                >
                    🗑️
                </button>

            </div>
        `;

        cartItems.appendChild(cartItem);
    });

    totalItems.textContent = itemCount;
    totalAmount.textContent = `₹${total}`;
}


function increaseQuantity(index) {

    cart[index].quantity += 1;

    saveCart();
    displayCart();
}


function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity -= 1;

    } else {

        cart.splice(index, 1);
    }

    saveCart();
    displayCart();
}


function removeFromCart(index) {

    cart.splice(index, 1);

    saveCart();
    displayCart();
}


function clearCart() {

    if (cart.length === 0) {
        return;
    }

    const confirmClear =
        confirm("Are you sure you want to clear your cart?");

    if (!confirmClear) {
        return;
    }

    cart = [];

    saveCart();
    displayCart();
}


async function proceedToCheckout() {

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const customerData =
        JSON.parse(localStorage.getItem("nutriboxCustomer"));

    if (!customerData) {
        alert("Please login before checkout.");
        window.location.href = "login.html";
        return;
    }

    const confirmOrder = confirm(
        "Place this NutriBox order?\n\n" +
        "Total Items: " +
        cart.reduce((sum, item) => sum + item.quantity, 0) +
        "\nTotal Amount: ₹" +
        cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        )
    );

    if (!confirmOrder) {
        return;
    }

    try {

        for (const item of cart) {

            const response = await fetch("/api/orders", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    customerId: customerData.id,
                    productId: item.productId,
                    quantity: item.quantity
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Unable to place the order."
                );
                return;
            }
        }

        cart = [];

        saveCart();
        displayCart();

        alert(
            "🎉 Order placed successfully!\n\n" +
            "Your NutriBox order has been sent to the admin dashboard."
        );

        window.location.href = "customer.html";

    } catch (error) {

        console.error("Checkout error:", error);

        alert(
            "Unable to connect to the server."
        );
    }
}

displayCart();