const express = require('express');
const ProductManager = require('../managers/ProductManager');
const router = express.Router();

const productManager = new ProductManager();

router.get('/', async (req, res) => {
    try {
        const { limit, category, sort, page } = req.query;
        let products = await productManager.getAllProducts(limit);

        if (category) {
            products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }

        if (sort) {
            products.sort((a, b) => (sort === 'asc' ? a.price - b.price : b.price - a.price));
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

router.post('/', async (req, res) => {
    const { title, description, price, code, stock, category, thumbnails } = req.body;

    if (!title || !price || !description || !code || !stock || !category) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    try {
        const newProduct = await productManager.addProduct({ title, description, price, code, stock, category, thumbnails });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: "Error al crear producto" });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedProduct = await productManager.updateProduct(id, updates);
        if (!updatedProduct) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar producto" });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await productManager.deleteProduct(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar producto" });
    }
});

module.exports = router;
