const express = require('express');
const app = express();
const productosRouter = require('./routes/products');
const cartsRouter = require('./routes/carts'); 

app.use(express.json());

// Configura las rutas
app.use('/api/products', productosRouter);
app.use('/api/carts', cartsRouter); 
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
