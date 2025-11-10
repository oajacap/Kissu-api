const db = require('../models');
const { Lote, Producto, Proveedor, Inventario } = db;
const { Op } = require('sequelize');

class LoteController {
    static async create(req, res) {
        const transaction = await db.sequelize.transaction();
        
        try {
            const { numero_lote, id_producto, id_proveedor, cantidad, costo_unitario, fecha_ingreso, fecha_vencimiento } = req.body;
            
            if (!numero_lote || !id_producto || !id_proveedor || !cantidad || !costo_unitario || !fecha_ingreso) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos'
                });
            }
            
            const producto = await Producto.findByPk(id_producto);
            if (!producto) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }
            
            const proveedor = await Proveedor.findByPk(id_proveedor);
            if (!proveedor) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Proveedor no encontrado'
                });
            }
            
            const loteExistente = await Lote.findOne({
                where: { numero_lote }
            });
            
            if (loteExistente) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'El número de lote ya existe'
                });
            }
            
            const lote = await Lote.create({
                numero_lote,
                id_producto,
                id_proveedor,
                cantidad,
                costo_unitario,
                costo_total: cantidad * costo_unitario,
                fecha_ingreso,
                fecha_vencimiento: fecha_vencimiento || null,
                estado: 'ACTIVO'
            }, { transaction });
            
            const [inventario, created] = await Inventario.findOrCreate({
                where: {
                    id_producto,
                    id_lote: lote.id_lote
                },
                defaults: {
                    cantidad_disponible: cantidad
                },
                transaction
            });
            
            if (!created) {
                await inventario.update({
                    cantidad_disponible: inventario.cantidad_disponible + cantidad
                }, { transaction });
            }
            
            await transaction.commit();
            
            res.status(201).json({
                success: true,
                message: 'Lote creado exitosamente',
                data: lote
            });
            
        } catch (error) {
            await transaction.rollback();
            console.error('Error al crear lote:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear lote',
                error: error.message
            });
        }
    }
    
    static async getAll(req, res) {
        try {
            const lotes = await Lote.findAll({
                include: [
                    {
                        model: Producto,
                        as: 'producto',
                        attributes: ['id_producto', 'codigo_producto', 'nombre']
                    },
                    {
                        model: Proveedor,
                        as: 'proveedor',
                        attributes: ['id_proveedor', 'nombre_empresa']
                    },
                    {
                        model: Inventario,
                        as: 'inventario',
                        attributes: ['cantidad_disponible']
                    }
                ],
                order: [['fecha_ingreso', 'DESC']]
            });
            
            res.status(200).json({
                success: true,
                data: lotes,
                total: lotes.length
            });
            
        } catch (error) {
            console.error('Error al obtener lotes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener lotes',
                error: error.message
            });
        }
    }
    
    static async getById(req, res) {
        try {
            const { id } = req.params;
            
            const lote = await Lote.findByPk(id, {
                include: [
                    {
                        model: Producto,
                        as: 'producto',
                        attributes: ['id_producto', 'codigo_producto', 'nombre']
                    },
                    {
                        model: Proveedor,
                        as: 'proveedor'
                    },
                    {
                        model: Inventario,
                        as: 'inventario',
                        attributes: ['cantidad_disponible']
                    }
                ]
            });
            
            if (!lote) {
                return res.status(404).json({
                    success: false,
                    message: 'Lote no encontrado'
                });
            }
            
            res.status(200).json({
                success: true,
                data: lote
            });
            
        } catch (error) {
            console.error('Error al obtener lote:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener lote',
                error: error.message
            });
        }
    }
    
    static async getByProducto(req, res) {
        try {
            const { id_producto } = req.params;
            
            const lotes = await Lote.findAll({
                where: {
                    id_producto,
                    estado: 'ACTIVO'
                },
                include: [
                    {
                        model: Proveedor,
                        as: 'proveedor',
                        attributes: ['nombre_empresa']
                    },
                    {
                        model: Inventario,
                        as: 'inventario',
                        attributes: ['cantidad_disponible']
                    }
                ],
                order: [['fecha_vencimiento', 'ASC']]
            });
            
            res.status(200).json({
                success: true,
                data: lotes,
                total: lotes.length
            });
            
        } catch (error) {
            console.error('Error al obtener lotes por producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener lotes por producto',
                error: error.message
            });
        }
    }
    
    static async getLotesProximosVencer(req, res) {
        try {
            const { dias = 30 } = req.query;
            
            const fechaActual = new Date();
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() + parseInt(dias));
            
            const lotes = await Lote.findAll({
                where: {
                    fecha_vencimiento: {
                        [Op.between]: [fechaActual, fechaLimite]
                    },
                    estado: 'ACTIVO'
                },
                include: [
                    {
                        model: Producto,
                        as: 'producto',
                        attributes: ['codigo_producto', 'nombre']
                    },
                    {
                        model: Proveedor,
                        as: 'proveedor',
                        attributes: ['nombre_empresa']
                    },
                    {
                        model: Inventario,
                        as: 'inventario',
                        attributes: ['cantidad_disponible'],
                        where: {
                            cantidad_disponible: { [Op.gt]: 0 }
                        }
                    }
                ],
                order: [['fecha_vencimiento', 'ASC']]
            });
            
            res.status(200).json({
                success: true,
                data: lotes,
                total: lotes.length,
                dias_filtro: parseInt(dias)
            });
            
        } catch (error) {
            console.error('Error al obtener lotes próximos a vencer:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener lotes próximos a vencer',
                error: error.message
            });
        }
    }
    
    static async updateEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            
            if (!estado) {
                return res.status(400).json({
                    success: false,
                    message: 'El estado es requerido'
                });
            }
            
            const lote = await Lote.findByPk(id);
            
            if (!lote) {
                return res.status(404).json({
                    success: false,
                    message: 'Lote no encontrado'
                });
            }
            
            await lote.update({ estado });
            
            res.status(200).json({
                success: true,
                message: 'Estado del lote actualizado exitosamente',
                data: lote
            });
            
        } catch (error) {
            console.error('Error al actualizar estado del lote:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar estado del lote',
                error: error.message
            });
        }
    }
}

module.exports = LoteController;