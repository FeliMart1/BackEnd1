// managers/ProductManager.js
const fs = require('fs');
const path = require('path');

class ProductManager {
    constructor() {
        this.productosFilePath = path.join(__dirname, '../data/productos.json');
    }

    readProductosFile() {
        try {
            const data = fs.readFileSync(this.productosFilePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Error al leer el archivo productos.json", error);
            return [];
        }
    }

    writeProductosFile(data) {
        try {
            fs.writeFileSync(this.productosFilePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error("Error al escribir en el archivo productos.json", error);
        }
    }

    // Método para agregar un nuevo producto
    addProduct(newProduct) {
        const productos = this.readProductosFile();
        const lastId = productos.length > 0 ? productos[productos.length - 1].id : 0; 
        const newId = lastId + 1;
        const productWithId = { id: newId, ...newProduct };
        productos.push(productWithId);    
        this.writeProductosFile(productos);
    
        return productWithId;
    }
    

    // Método para obtener todos los productos
    getAllProducts(limit) {
        const productos = this.readProductosFile();
        return limit ? productos.slice(0, limit) : productos;
    }

    // Método para obtener un producto por ID
    getProductById(id) {
        const productos = this.readProductosFile();
        return productos.find((p) => p.id === id);
    }

    // Método para actualizar un producto por ID
    updateProduct(id, updatedData) {
        const productos = this.readProductosFile();
        const productIndex = productos.findIndex((p) => p.id === id);
        if (productIndex === -1) return null; // Si no se encuentra el producto, retornamos null
        const updatedProduct = { ...productos[productIndex], ...updatedData };
        productos[productIndex] = updatedProduct;
        this.writeProductosFile(productos);
        return updatedProduct;
    }

    // Método para eliminar un producto por ID
    deleteProduct(id) {
        const productos = this.readProductosFile();
        const newProductos = productos.filter((p) => p.id !== id);
        if (productos.length === newProductos.length) return null; // Si no se encontró el producto, retornamos null
        this.writeProductosFile(newProductos);
        return { message: "Producto eliminado exitosamente" };
    }
}

module.exports = ProductManager;
