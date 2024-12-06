const express = require('express');
const CartManager = require('../managers/CartManager');
const router = express.Router();
const cartManager = new CartManager();

router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: "Error al crear carrito" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const cart = await cartManager.getCartById(req.params.id);
        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener carrito" });
    }
});

router.post('/:id/product/:productId', async (req, res) => {
    const { id, productId } = req.params;
    const { quantity } = req.body;

    try {
        const updatedCart = await cartManager.addProductToCart(id, productId, quantity);
        if (!updatedCart) {
            return res.status(404).json({ error: "Carrito no encontrado" });
        }
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ error: "Error al agregar producto al carrito" });
    }
});

module.exports = router;
