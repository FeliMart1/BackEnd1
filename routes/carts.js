// routes/carts.js
const express = require('express');
const CartManager = require('../managers/CartManager');
const router = express.Router();

// Instancia del CartManager
const cartManager = new CartManager();

// Ruta POST /api/carts - Crear un nuevo carrito
router.post('/', (req, res) => {
    const newCart = cartManager.createCart();
    res.status(201).json(newCart);
});

// Ruta GET /api/carts/:cid - Obtener un carrito por ID
router.get('/:cid', (req, res) => {
    const cartId = req.params.cid;
    const cart = cartManager.getCartById(cartId);

    if (!cart) {
        return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(cart);
});

// Ruta POST /api/carts/:cid/product/:pid - Agregar un producto a un carrito
router.post('/:cid/product/:pid', (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = parseInt(req.body.quantity) || 1; // Cantidad predeterminada: 1

    const updatedCart = cartManager.addProductToCart(cartId, productId, quantity);

    if (!updatedCart) {
        return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(updatedCart);
});

module.exports = router;
