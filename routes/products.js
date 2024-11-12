// routes/products.js
const express = require('express');
const ProductManager = require('../managers/ProductManager');
const router = express.Router();

// Instancia del ProductManager
const productManager = new ProductManager();

// Ruta GET /api/products - Listar todos los productos (con límite opcional)
router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit);
    const products = productManager.getProducts(limit);
    res.json(products);
});

// Ruta GET /api/products/:pid - Obtener un producto por ID
router.get('/:pid', (req, res) => {
    const productId = req.params.pid;
    const product = productManager.getProductById(productId);

    if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product);
});

// Ruta POST /api/products - Agregar un nuevo producto
router.post('/', (req, res) => {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
        return res.status(400).json({ error: "Todos los campos son obligatorios, excepto thumbnails." });
    }

    const newProduct = productManager.addProduct({ title, description, code, price, status, stock, category, thumbnails });
    res.status(201).json(newProduct);
});

// Ruta PUT /api/products/:pid - Actualizar un producto por ID
router.put('/:pid', (req, res) => {
    const productId = req.params.pid;
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    const updatedProduct = productManager.updateProduct(productId, { title, description, code, price, status, stock, category, thumbnails });

    if (!updatedProduct) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(updatedProduct);
});

// Ruta DELETE /api/products/:pid - Eliminar un producto por ID
router.delete('/:pid', (req, res) => {
    const productId = req.params.pid;
    const result = productManager.deleteProduct(productId);

    if (!result) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado exitosamente" });
});

module.exports = router;
