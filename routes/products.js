// routes/products.js
const express = require('express');
const ProductManager = require('../managers/ProductManager'); 
const router = express.Router();

// Instancia del ProductManager
const productManager = new ProductManager();

// Ruta GET /api/products - Listar todos los productos (con límite opcional)
router.get('/', async (req, res) => {
    try {
        const { category, status, limit, sort, page } = req.query;

        const productManager = new ProductManager();
        let productos = productManager.getAllProducts();

        // Filtros opcionales
        if (category) {
            productos = productos.filter(p => p.category === category);
        }

        if (status) {
            const isActive = status.toLowerCase() === 'true';
            productos = productos.filter(p => p.status === isActive);
        }

        // Ordenamiento opcional
        if (sort) {
            productos = productos.sort((a, b) =>
                sort === 'asc' ? a.price - b.price : b.price - a.price
            );
        }

        // Paginación
        const currentPage = parseInt(page) || 1;
        const itemsPerPage = parseInt(limit) || 10;
        const totalItems = productos.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const paginatedProducts = productos.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

        // Construir la respuesta
        res.render('products', {
            productos: paginatedProducts,
            totalPages,
            currentPage,
            hasPrevPage: currentPage > 1,
            hasNextPage: currentPage < totalPages,
            prevPage: currentPage > 1 ? currentPage - 1 : null,
            nextPage: currentPage < totalPages ? currentPage + 1 : null,
            prevLink:
                currentPage > 1
                    ? `/products?category=${category || ''}&status=${status || ''}&sort=${sort || ''}&page=${currentPage - 1}&limit=${itemsPerPage}`
                    : null,
            nextLink:
                currentPage < totalPages
                    ? `/products?category=${category || ''}&status=${status || ''}&sort=${sort || ''}&page=${currentPage + 1}&limit=${itemsPerPage}`
                    : null,
            title: 'Productos',
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Ruta GET /api/products/:pid - Obtener un producto por ID
router.get('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);  // Convertir el ID a número
    const product = productManager.getProductById(productId);

    if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product);
});

// Ruta POST /api/products - Agregar un nuevo producto
router.post('/', (req, res) => {
    const { title, price, description, code, stock, category, thumbnails } = req.body;
    
    // Leer productos desde el archivo productos.json
    fs.readFile('./data/productos.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer el archivo de productos' });
        }

        const productos = JSON.parse(data); // Parsear los productos actuales
        const newProduct = {
            id: productos.length + 1, // Asignar el nuevo id basado en la longitud del array
            title,
            price,
            description,
            code,
            stock,
            category,
            thumbnails: thumbnails || [] // Usar un array vacío si no se proporcionan thumbnails
        };

        productos.push(newProduct); // Agregar el nuevo producto al arreglo

        // Escribir el archivo productos.json con el nuevo producto
        fs.writeFile('./data/productos.json', JSON.stringify(productos, null, 2), 'utf-8', (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar el archivo de productos' });
            }

            // Emitir todos los productos a todos los clientes conectados
            req.app.get('io').emit('nuevoProducto'); // Solicitar actualización de todos los productos

            // Responder con el producto creado
            res.status(201).json(newProduct);
        });
    });
});

// Ruta PUT /api/products/:pid - Actualizar un producto por ID
router.put('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);  // Convertir el ID a número
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    const updatedProduct = productManager.updateProduct(productId, { title, description, code, price, status, stock, category, thumbnails });

    if (!updatedProduct) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(updatedProduct);
});

// Ruta DELETE /api/products/:pid - Eliminar un producto por ID
router.delete('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);  // Convertir el ID a número
    const result = productManager.deleteProduct(productId);

    if (!result) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado exitosamente" });
});

module.exports = router;
