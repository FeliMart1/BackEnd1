const fs = require('fs');
const path = require('path');

class CartManager {
    constructor() {
        this.cartsFilePath = path.join(__dirname, '../data/carts.json');
    }

    readCartsFile() {
        try {
            const data = fs.readFileSync(this.cartsFilePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Error al leer el archivo carts.json:", error);
            return [];
        }
    }

    writeCartsFile(data) {
        try {
            fs.writeFileSync(this.cartsFilePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error("Error al escribir en el archivo carts.json:", error);
        }
    }

    createCart() {
        const carts = this.readCartsFile();
        const newCart = {
            id: this.generateUniqueId(),
            products: []
        };
        carts.push(newCart);
        this.writeCartsFile(carts);
        return newCart;
    }

    generateUniqueId() {
        return Math.floor(Math.random() * 1000000).toString();
    }

    getCartById(id) {
        const carts = this.readCartsFile();
        return carts.find((cart) => cart.id === id);
    }

    addProductToCart(cartId, productId, quantity = 1) {
        const carts = this.readCartsFile();
        const cartIndex = carts.findIndex((cart) => cart.id === cartId);

        if (cartIndex === -1) return null;

        const productIndex = carts[cartIndex].products.findIndex((p) => p.product === productId);

        if (productIndex !== -1) {
            carts[cartIndex].products[productIndex].quantity += quantity;
        } else {
            carts[cartIndex].products.push({ product: productId, quantity });
        }

        this.writeCartsFile(carts);
        return carts[cartIndex];
    }

    removeProductFromCart(cartId, productId) {
        const carts = this.readCartsFile();
        const cartIndex = carts.findIndex((cart) => cart.id === cartId);

        if (cartIndex === -1) return null;

        carts[cartIndex].products = carts[cartIndex].products.filter((p) => p.product !== productId);

        this.writeCartsFile(carts);
        return carts[cartIndex];
    }

    updateCart(cartId, products) {
        const carts = this.readCartsFile();
        const cartIndex = carts.findIndex((cart) => cart.id === cartId);

        if (cartIndex === -1) return null;

        carts[cartIndex].products = products;

        this.writeCartsFile(carts);
        return carts[cartIndex];
    }

    clearCart(cartId) {
        const carts = this.readCartsFile();
        const cartIndex = carts.findIndex((cart) => cart.id === cartId);

        if (cartIndex === -1) return null;

        carts[cartIndex].products = [];

        this.writeCartsFile(carts);
        return carts[cartIndex];
    }
}

module.exports = CartManager;
