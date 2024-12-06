const Product = require('../models/Product');

class ProductManager {
    async getAllProducts(limit) {
        try {
            const products = await Product.find();
            return limit ? products.slice(0, limit) : products;
        } catch (error) {
            console.error("Error al obtener productos:", error);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            return await Product.findById(id);
        } catch (error) {
            console.error("Error al obtener producto por ID:", error);
            return null;
        }
    }

    async addProduct(newProductData) {
        try {
            const product = new Product(newProductData);
            return await product.save();
        } catch (error) {
            console.error("Error al agregar producto:", error);
            throw error;
        }
    }

    async updateProduct(id, updatedData) {
        try {
            return await Product.findByIdAndUpdate(id, updatedData, { new: true });
        } catch (error) {
            console.error("Error al actualizar producto:", error);
            return null;
        }
    }

    async deleteProduct(id) {
        try {
            await Product.findByIdAndDelete(id);
            return { message: "Producto eliminado exitosamente" };
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            return null;
        }
    }
}

module.exports = ProductManager;
