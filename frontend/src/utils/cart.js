// Get cart
export const getCart = () => {
    return JSON.parse(localStorage.getItem("cart")) || [];
};

// Add item
export const addToCart = (product) => {
    let cart = getCart();

    const exist = cart.find(item => item._id === product._id);

    if (exist) {
        cart = cart.map(item =>
            item._id === product._id
                ? { ...item, qty: item.qty + 1 }
                : item
        );
    } else {
        cart.push({ ...product, qty: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
};

// Remove item
export const removeFromCart = (id) => {
    const cart = getCart().filter(item => item._id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
};

// Update quantity
export const updateQty = (id, qty) => {
    let cart = getCart();

    cart = cart.map(item =>
        item._id === id ? { ...item, qty } : item
    );

    localStorage.setItem("cart", JSON.stringify(cart));
};