const express = require('express');
const CartManager = require('../managers/CartManager');
const router = express.Router();
const cartManager = new CartManager();

// Crear un nuevo carrito
router.post('/', (req, res) => {
    const newCart = cartManager.createCart();
    res.status(201).json({ status: "success", cart: newCart });
});

// Obtener un carrito por ID
router.get('/:cid', (req, res) => {
    const { cid } = req.params;
    const cart = cartManager.getCartById(cid);

    if (!cart) {
        return res.status(404).json({ status: "error", message: "Cart not found" });
    }

    res.status(200).json({ status: "success", cart });
});

// Agregar un producto a un carrito
router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const updatedCart = cartManager.addProductToCart(cid, pid, parseInt(quantity) || 1);

    if (!updatedCart) {
        return res.status(404).json({ status: "error", message: "Cart not found" });
    }

    res.status(200).json({ status: "success", cart: updatedCart });
});

// Eliminar un producto de un carrito
router.delete('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;

    const updatedCart = cartManager.removeProductFromCart(cid, pid);

    if (!updatedCart) {
        return res.status(404).json({ status: "error", message: "Cart not found" });
    }

    res.status(200).json({ status: "success", message: "Product removed", cart: updatedCart });
});

// Actualizar productos de un carrito
router.put('/:cid', (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;

    const updatedCart = cartManager.updateCart(cid, products);

    if (!updatedCart) {
        return res.status(404).json({ status: "error", message: "Cart not found" });
    }

    res.status(200).json({ status: "success", message: "Cart updated", cart: updatedCart });
});

// Vaciar un carrito
router.delete('/:cid', (req, res) => {
    const { cid } = req.params;

    const clearedCart = cartManager.clearCart(cid);

    if (!clearedCart) {
        return res.status(404).json({ status: "error", message: "Cart not found" });
    }

    res.status(200).json({ status: "success", message: "Cart emptied", cart: clearedCart });
});

module.exports = router;
