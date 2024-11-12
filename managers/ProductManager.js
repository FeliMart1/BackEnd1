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

    getAllProducts(limit) {
        const productos = this.readProductosFile();
        return limit ? productos.slice(0, limit) : productos;
    }

    getProductById(id) {
        const productos = this.readProductosFile();
        return productos.find((p) => p.id === id);
    }

    addProduct(newProduct) {
        const productos = this.readProductosFile();
        productos.push(newProduct);
        this.writeProductosFile(productos);
        return newProduct;
    }

    updateProduct(id, updatedData) {
        const productos = this.readProductosFile();
        const productIndex = productos.findIndex((p) => p.id === id);
        if (productIndex === -1) return null;
        const updatedProduct = { ...productos[productIndex], ...updatedData };
        productos[productIndex] = updatedProduct;
        this.writeProductosFile(productos);
        return updatedProduct;
    }

    deleteProduct(id) {
        const productos = this.readProductosFile();
        const newProductos = productos.filter((p) => p.id !== id);
        if (productos.length === newProductos.length) return null;
        this.writeProductosFile(newProductos);
        return { message: "Producto eliminado exitosamente" };
    }
}

module.exports = ProductManager;
