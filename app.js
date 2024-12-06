const express = require('express');
const { Server } = require('socket.io'); // Importamos socket.io
const handlebars = require('express-handlebars'); // Importamos handlebars
const mongoose = require('mongoose'); // Importamos mongoose para MongoDB
const productosRouter = require('./routes/products');
const cartsRouter = require('./routes/carts'); // Asegúrate de usar este correctamente
const Product = require('./models/Product'); // Modelo de productos
const Cart = require('./models/Cart'); // Modelo de carritos
const path = require('path');

const app = express();
const PORT = 8080;

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB', err));

// Configuración de Handlebars
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
app.get('/', async (req, res) => {
    try {
        const productos = await Product.find(); // Obtener productos de MongoDB
        res.render('home', { productos, title: 'Home' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar productos');
    }
});

// Ruta para la vista en tiempo real
app.get('/realtimeproducts', async (req, res) => {
    try {
        const productos = await Product.find(); // Obtener productos de MongoDB
        res.render('realTimeProducts', { productos });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar productos');
    }
});

app.get('/carts', async (req, res) => {
    try {
        const carts = await Cart.find().populate('products.product'); // Obtener carritos de MongoDB
        res.render('carts', { carts, title: 'Carritos' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar carritos');
    }
});

// Ruta para la vista de productos
app.get('/products', async (req, res) => {
    try {
        const { category, page = 1, limit = 10, sort = 'asc' } = req.query;
        const query = category ? { category: category.toLowerCase() } : {};
        const sortOption = sort === 'asc' ? { price: 1 } : { price: -1 };

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);
        const productos = await Product.find(query)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const result = {
            status: 'success',
            payload: productos,
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
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar productos');
    }
});

// Ruta para el detalle del producto
app.get('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId); // Buscar producto en MongoDB

        if (!product) {
            return res.status(404).render('404', { title: 'Producto no encontrado' });
        }

        res.render('productDetail', { product, title: product.title });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar el producto');
    }
});

// Iniciar el servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Configurar WebSocket
const io = new Server(server);

io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado');

    try {
        const productos = await Product.find(); // Obtener productos de MongoDB
        socket.emit('actualizarProductos', productos);
    } catch (err) {
        console.error('Error al leer los productos', err);
    }

    socket.on('nuevoProducto', async () => {
        try {
            const productos = await Product.find(); // Obtener productos de MongoDB
            io.emit('actualizarProductos', productos);
        } catch (err) {
            console.error('Error al leer los productos', err);
        }
    });
});

app.set('io', io);
