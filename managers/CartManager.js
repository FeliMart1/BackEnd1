// managers/CartManager.js
const fs = require('fs');
const path = require('path');

class CartManager {
    constructor() {
        // Define la ruta del archivo donde se almacenan los datos de los carritos
        this.cartsFilePath = path.join(__dirname, '../data/carts.json');
    }

    // Lee el archivo de carritos y devuelve los datos como un array de carritos
    readCartsFile() {
        try {
            const data = fs.readFileSync(this.cartsFilePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Error al leer el archivo carts.json", error);
            return [];
        }
    }

    // Escribe los datos proporcionados en el archivo de carritos
    writeCartsFile(data) {
        try {
            fs.writeFileSync(this.cartsFilePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error("Error al escribir en el archivo carts.json", error);
        }
    }

    // Crea un nuevo carrito vacío y lo guarda en el archivo
    createCart() {
        const carts = this.readCartsFile();
        const newCart = {
            id: this.generateUniqueId(),
            products: []
        };
        carts.push(newCart);
        this.writeCartsFile(carts);
        return newCart;
    }

    // Genera un ID único para un nuevo carrito
    generateUniqueId() {
        return Math.floor(Math.random() * 1000000).toString();
    }

    // Devuelve el carrito con el ID especificado
    getCartById(id) {
        const carts = this.readCartsFile();
        return carts.find((cart) => cart.id === id);
    }

    // Agrega un producto a un carrito existente
    addProductToCart(cartId, productId, quantity = 1) {
        const carts = this.readCartsFile();
        const cartIndex = carts.findIndex((cart) => cart.id === cartId);

        // Verifica si el carrito existe
        if (cartIndex === -1) return null;

        // Busca si el producto ya existe en el carrito
        const productIndex = carts[cartIndex].products.findIndex((p) => p.product === productId);

        if (productIndex !== -1) {
            // Si el producto ya existe, incrementa la cantidad
            carts[cartIndex].products[productIndex].quantity += quantity;
        } else {
            // Si el producto no existe, lo agrega al carrito
            carts[cartIndex].products.push({ product: productId, quantity });
        }

        // Guarda los cambios en el archivo
        this.writeCartsFile(carts);
        return carts[cartIndex];
    }
}

module.exports = CartManager;
