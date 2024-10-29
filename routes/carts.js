const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const carritoFilePath = path.join(__dirname, 'carrito.json');

// Función para leer el archivo carrito.json
function readCarritoFile() {
    try {
        const data = fs.readFileSync(carritoFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error al leer el archivo carrito.json", error);
        return [];
    }
}

// Función para escribir en el archivo carrito.json
function writeCarritoFile(data) {
    try {
        fs.writeFileSync(carritoFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error al escribir en el archivo carrito.json", error);
    }
}

// Función para generar un ID único para el carrito
function generateUniqueId() {
    return Math.floor(Math.random() * 1000000).toString();
}

// Rutas de carrito

// Ruta POST /api/carts - Crea un nuevo carrito
router.post('/', (req, res) => {
    const carritos = readCarritoFile();

    const newCarrito = {
        id: generateUniqueId(),
        products: []
    };

    carritos.push(newCarrito);
    writeCarritoFile(carritos);

    res.status(201).json(newCarrito);
});

// Ruta GET /api/carts/:cid - Muestra los productos en el carrito especificado por cid
router.get('/:cid', (req, res) => {
    const carritos = readCarritoFile();
    const carrito = carritos.find((c) => c.id === req.params.cid);

    if (!carrito) {
        return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(carrito.products);
});

// Ruta POST /api/carts/:cid/product/:pid - Agrega el producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
    const carritos = readCarritoFile();
    const carrito = carritos.find((c) => c.id === req.params.cid);

    if (!carrito) {
        return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const productId = req.params.pid;
    const existingProduct = carrito.products.find((p) => p.product === productId);

    if (existingProduct) {
        // Si el producto ya existe en el carrito, incrementa quantity
        existingProduct.quantity += 1;
    } else {
        // Si el producto no está en el carrito, agrégalo con quantity = 1
        carrito.products.push({ product: productId, quantity: 1 });
    }

    writeCarritoFile(carritos);

    res.status(201).json(carrito);
});

module.exports = router;
