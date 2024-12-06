const Cart = require('../models/Cart');

class CartManager {
    async createCart() {
        try {
            const newCart = new Cart({ products: [] });
            return await newCart.save();
        } catch (error) {
            console.error("Error al crear carrito:", error);
            throw error;
        }
    }

    async getCartById(id) {
        try {
            return await Cart.findById(id).populate('products.product');
        } catch (error) {
            console.error("Error al obtener carrito por ID:", error);
            return null;
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) return null;

            const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
            if (productIndex !== -1) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }

            return await cart.save();
        } catch (error) {
            console.error("Error al agregar producto al carrito:", error);
            throw error;
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) return null;

            cart.products = cart.products.filter(p => p.product.toString() !== productId);
            return await cart.save();
        } catch (error) {
            console.error("Error al eliminar producto del carrito:", error);
            throw error;
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) return null;

            cart.products = [];
            return await cart.save();
        } catch (error) {
            console.error("Error al vaciar carrito:", error);
            throw error;
        }
    }
}

module.exports = CartManager;
