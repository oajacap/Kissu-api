
const db = require('../models');
const { Producto, Categoria, Inventario } = db;
const { Op } = require('sequelize');

class ProductoController {
    static async create(req, res) {
        try {
            const { codigo_producto, nombre, descripcion, id_categoria, precio_unitario, stock_minimo, imagen_url } = req.body;
            
            if (!codigo_producto || !nombre || !id_categoria || !precio_unitario) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos: codigo_producto, nombre, id_categoria, precio_unitario'
                });
            }
            
            const categoria = await Categoria.findByPk(id_categoria);
            if (!categoria) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }
            
            const productoExistente = await Producto.findOne({
                where: { codigo_producto }
            });
            
            if (productoExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'El código de producto ya existe'
                });
            }
            
            const producto = await Producto.create({
                codigo_producto,
                nombre,
                descripcion,
                id_categoria,
                precio_unitario,
                stock_minimo: stock_minimo || 10,
                imagen_url
            });
            
            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: producto
            });
            
        } catch (error) {
            console.error('Error al crear producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear producto',
                error: error.message
            });
        }
    }
    
    static async getAll(req, res) {
        try {
            const productos = await Producto.findAll({
                include: [
                    {
                        model: Categoria,
                        as: 'categoria',
                        attributes: ['id_categoria', 'nombre_categoria']
                    },
                    {
                        model: Inventario,
                        as: 'inventarios',
                        attributes: ['cantidad_disponible']
                    }
                ],
                order: [['id_producto', 'DESC']]
            });
            
            const productosConStock = productos.map(producto => {
                const stockTotal = producto.inventarios.reduce((sum, inv) => sum + inv.cantidad_disponible, 0);
                const productoData = producto.toJSON();
                return {
                    ...productoData,
                    stock_actual: stockTotal,
                    inventarios: undefined
                };
            });
            
            res.status(200).json({
                success: true,
                data: productosConStock,
                total: productosConStock.length
            });
            
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener productos',
                error: error.message
            });
        }
    }
    
    static async getById(req, res) {
        try {
            const { id } = req.params;
            
            const producto = await Producto.findByPk(id, {
                include: [
                    {
                        model: Categoria,
                        as: 'categoria',
                        attributes: ['id_categoria', 'nombre_categoria']
                    },
                    {
                        model: Inventario,
                        as: 'inventarios',
                        attributes: ['cantidad_disponible']
                    }
                ]
            });
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            
            const stockTotal = producto.inventarios.reduce((sum, inv) => sum + inv.cantidad_disponible, 0);
            const productoData = producto.toJSON();
            
            res.status(200).json({
                success: true,
                data: {
                    ...productoData,
                    stock_actual: stockTotal,
                    inventarios: undefined
                }
            });
            
        } catch (error) {
            console.error('Error al obtener producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener producto',
                error: error.message
            });
        }
    }
    
    static async getByCategoria(req, res) {
        try {
            const { id_categoria } = req.params;
            
            const productos = await Producto.findAll({
                where: { 
                    id_categoria,
                    estado: true
                },
                include: [
                    {
                        model: Categoria,
                        as: 'categoria',
                        attributes: ['id_categoria', 'nombre_categoria']
                    },
                    {
                        model: Inventario,
                        as: 'inventarios',
                        attributes: ['cantidad_disponible']
                    }
                ],
                order: [['nombre', 'ASC']]
            });
            
            const productosConStock = productos.map(producto => {
                const stockTotal = producto.inventarios.reduce((sum, inv) => sum + inv.cantidad_disponible, 0);
                const productoData = producto.toJSON();
                return {
                    ...productoData,
                    stock_actual: stockTotal,
                    inventarios: undefined
                };
            });
            
            res.status(200).json({
                success: true,
                data: productosConStock,
                total: productosConStock.length
            });
            
        } catch (error) {
            console.error('Error al obtener productos por categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener productos por categoría',
                error: error.message
            });
        }
    }
    
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { codigo_producto, nombre, descripcion, id_categoria, precio_unitario, stock_minimo, imagen_url, estado } = req.body;
            
            const producto = await Producto.findByPk(id);
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            
            await producto.update({
                codigo_producto: codigo_producto || producto.codigo_producto,
                nombre: nombre || producto.nombre,
                descripcion: descripcion !== undefined ? descripcion : producto.descripcion,
                id_categoria: id_categoria || producto.id_categoria,
                precio_unitario: precio_unitario || producto.precio_unitario,
                stock_minimo: stock_minimo !== undefined ? stock_minimo : producto.stock_minimo,
                imagen_url: imagen_url !== undefined ? imagen_url : producto.imagen_url,
                estado: estado !== undefined ? estado : producto.estado
            });
            
            res.status(200).json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: producto
            });
            
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar producto',
                error: error.message
            });
        }
    }
    
    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            const producto = await Producto.findByPk(id);
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            
            await producto.update({ estado: false });
            
            res.status(200).json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });
            
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar producto',
                error: error.message
            });
        }
    }
}

module.exports = ProductoController;