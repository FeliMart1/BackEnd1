const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const productosFilePath = path.join(__dirname, 'productos.json');

// Función para leer el archivo productos.json
function readProductosFile() {
  try {
      const data = fs.readFileSync(productosFilePath, 'utf-8');
      return JSON.parse(data);
  } catch (error) {
      console.error("Error al leer el archivo productos.json", error);
      return [];
  }
}

// Función para escribir en el archivo productos.json
function writeProductosFile(data) {
    try {
        fs.writeFileSync(productosFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error al escribir en el archivo productos.json", error);
    }
}

// Función para generar un ID único
function generateUniqueId() {
    return Math.floor(Math.random() * 1000000).toString();
}

// Rutas de productos

// Ruta GET /api/products - Listar todos los productos
router.get('/', (req, res) => {
    const productos = readProductosFile();
    const limit = parseInt(req.query.limit);

    if (limit && limit > 0) {
        return res.json(productos.slice(0, limit));
    }

    res.json(productos);
});

// Ruta GET /api/products/:pid - Obtener un producto por ID
router.get('/:pid', (req, res) => {
    const productos = readProductosFile();
    const product = productos.find((p) => p.id === req.params.pid);

    if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product);
});

// Ruta POST /api/products - Agregar un nuevo producto
router.post('/', (req, res) => {
    const productos = readProductosFile();
    const { id, title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
        return res.status(400).json({ error: "Todos los campos son obligatorios, excepto thumbnails." });
    }

    const productId = id || generateUniqueId();

    const newProduct = {
        id: productId,
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    };

    productos.push(newProduct);
    writeProductosFile(productos);

    res.status(201).json(newProduct);
});

// Ruta PUT /api/products/:pid - Actualizar un producto por ID
router.put('/:pid', (req, res) => {
    const productos = readProductosFile();
    const productIndex = productos.findIndex((p) => p.id === req.params.pid);

    if (productIndex === -1) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    const updatedProduct = {
        ...productos[productIndex],
        title: title || productos[productIndex].title,
        description: description || productos[productIndex].description,
        code: code || productos[productIndex].code,
        price: price !== undefined ? price : productos[productIndex].price,
        status: status !== undefined ? status : productos[productIndex].status,
        stock: stock !== undefined ? stock : productos[productIndex].stock,
        category: category || productos[productIndex].category,
        thumbnails: thumbnails || productos[productIndex].thumbnails
    };

    productos[productIndex] = updatedProduct;
    writeProductosFile(productos);

    res.json(updatedProduct);
});

// Ruta DELETE /api/products/:pid - Eliminar un producto por ID
router.delete('/:pid', (req, res) => {
    const productos = readProductosFile();
    const newProductos = productos.filter((p) => p.id !== req.params.pid);

    if (productos.length === newProductos.length) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    writeProductosFile(newProductos);

    res.json({ message: "Producto eliminado exitosamente" });
});

module.exports = router;
