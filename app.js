const express = require('express');
const { Server } = require('socket.io'); // Importamos socket.io
const handlebars = require('express-handlebars'); // Importamos handlebars
const productosRouter = require('./routes/products');
const cartsRouter = require('./routes/carts'); // Asegúrate de usar este correctamente
const path = require('path');

const app = express();
const PORT = 8080;

app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    helpers: {
        eq: (a, b) => a === b // Helper para comparar valores
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Configurar middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de productos y carritos
app.use('/api/products', productosRouter);
app.use('/api/carts', cartsRouter); 

// Ruta principal para la vista home
app.get('/', (req, res) => {
    const productos = require('./data/productos.json');
    res.render('home', { productos, title: 'Home' });
});

// Ruta para la vista en tiempo real
app.get('/realtimeproducts', (req, res) => {
    const productos = require('./data/productos.json');
    res.render('realTimeProducts', { productos });
});

app.get('/carts', (req, res) => {
    const carts = require('./data/carts.json');
    res.render('carts', { carts, title: 'Carritos' });
});


// Ruta para la vista de productos
app.get('/products', (req, res) => {
    const { category, page = 1, limit = 10, sort = 'asc' } = req.query;
    const productos = require('./data/productos.json');
    
    let filteredProducts = productos;
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    
    if (sort === 'asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const offset = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    const result = {
        status: 'success',
        payload: paginatedProducts,
        totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
        page: parseInt(page),
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevLink: page > 1 ? `/products?category=${category || ''}&page=${page - 1}&limit=${limit}&sort=${sort}` : null,
        nextLink: page < totalPages ? `/products?category=${category || ''}&page=${page + 1}&limit=${limit}&sort=${sort}` : null
    };
    
    res.render('products', { 
        productos: result.payload, 
        title: 'Productos', 
        result: result 
    });
});

// Ruta para el detalle del producto
app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const productos = require('./data/productos.json');
    const product = productos.find(p => p.id === productId);

    if (!product) {
        return res.status(404).render('404', { title: 'Producto no encontrado' });
    }

    res.render('productDetail', { product, title: product.title });
});

// Iniciar el servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Configurar WebSocket
const io = new Server(server);
const fs = require('fs');

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    fs.readFile('./data/productos.json', 'utf-8', (err, data) => {
        if (err) {
            console.error('Error al leer los productos');
            return;
        }
        const productos = JSON.parse(data);
        socket.emit('actualizarProductos', productos);
    });

    socket.on('nuevoProducto', () => {
        fs.readFile('./data/productos.json', 'utf-8', (err, data) => {
            if (err) {
                console.error('Error al leer los productos');
                return;
            }
            const productos = JSON.parse(data);
            io.emit('actualizarProductos', productos);
        });
    });
});

app.set('io', io);
