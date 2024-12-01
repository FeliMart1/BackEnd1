const express = require('express');
const router = express.Router();
const productos = require('../data/productos.json'); // Simulamos datos

// Ruta principal para la vista home
router.get('/', (req, res) => {
    res.render('home', { title: 'Página Principal', productos });
});

// Ruta para la vista en tiempo real
router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real', productos });
});


module.exports = router;
