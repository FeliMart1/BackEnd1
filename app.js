const express = require('express');
const { Server } = require('socket.io'); // Importamos socket.io
const handlebars = require('express-handlebars'); // Importamos handlebars
const productosRouter = require('./routes/products');
const cartsRouter = require('./routes/carts'); 
const path = require('path');

const app = express();
const PORT = 8080;


const viewsRoutes = require('./routes/viewsRoutes'); // Importa el archivo de rutas
app.use('/', viewsRoutes); // Usar las rutas de vistas

// Configurar Handlebars
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main', 
    layoutsDir: path.join(__dirname, 'views', 'layouts'), 
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); 

// Configurar middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Para archivos estáticos

// Configurar rutas
app.use('/api/products', productosRouter);
app.use('/api/carts', cartsRouter); 

// Ruta principal para la vista home
app.get('/', (req, res) => {
    const productos = require('./data/productos.json');
    res.render('home', { productos });
});

// Ruta para la vista en tiempo real
app.get('/realtimeproducts', (req, res) => {
    const productos = require('./data/productos.json');
    res.render('realTimeProducts', { productos });
});

// Iniciar el servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Configurar WebSocket
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    
    // Emitir productos actualizados a todos los clientes cuando se agregue un nuevo producto
    socket.on('nuevoProducto', (producto) => {
        io.emit('actualizarProductos', producto);
    });
});

app.set('io', io);
