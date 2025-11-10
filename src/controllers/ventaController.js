const db = require('../models');
const { Venta, DetalleVenta, Producto, Cliente, Usuario, Inventario, Lote } = db;
const { Op } = require('sequelize');

class VentaController {
    static async create(req, res) {
        const transaction = await db.sequelize.transaction();
        
        try {
            const { id_cliente, detalles, descuento, metodo_pago } = req.body;
            const id_usuario = req.user.id_usuario;
            
            if (!detalles || detalles.length === 0) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Debe incluir al menos un producto en la venta'
                });
            }
            
            if (!metodo_pago) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'El método de pago es requerido'
                });
            }
            
            for (const detalle of detalles) {
                if (!detalle.id_producto || !detalle.cantidad || !detalle.precio_unitario) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Cada detalle debe tener id_producto, cantidad y precio_unitario'
                    });
                }
                
                const producto = await Producto.findByPk(detalle.id_producto);
                if (!producto || !producto.estado) {
                    await transaction.rollback();
                    return res.status(404).json({
                        success: false,
                        message: 'Producto con ID ' + detalle.id_producto + ' no encontrado o inactivo'
                    });
                }
                
                const stockTotal = await Inventario.sum('cantidad_disponible', {
                    where: { id_producto: detalle.id_producto }
                });
                
                if (!stockTotal || stockTotal < detalle.cantidad) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Stock insuficiente para el producto: ' + producto.nombre + '. Disponible: ' + (stockTotal || 0)
                    });
                }
            }
            
            const ultimaVenta = await Venta.findOne({
                order: [['id_venta', 'DESC']],
                attributes: ['numero_venta']
            });
            
            let numeroVenta = 'V00000001';
            if (ultimaVenta && ultimaVenta.numero_venta) {
                const ultimoNumero = parseInt(ultimaVenta.numero_venta.substring(1));
                numeroVenta = 'V' + String(ultimoNumero + 1).padStart(8, '0');
            }
            
            let subtotal = 0;
            for (const detalle of detalles) {
                subtotal += detalle.cantidad * detalle.precio_unitario;
            }
            
            const descuento_total = descuento || 0;
            const iva = (subtotal - descuento_total) * 0.12;
            const total = subtotal - descuento_total + iva;
            
            const venta = await Venta.create({
                numero_venta: numeroVenta,
                id_cliente: id_cliente || null,
                id_usuario,
                fecha_venta: new Date(),
                subtotal,
                descuento: descuento_total,
                iva,
                total,
                metodo_pago,
                estado: 'COMPLETADA'
            }, { transaction });
            
            for (const detalle of detalles) {
                const { id_producto, cantidad, precio_unitario, descuento_item } = detalle;
                const subtotal_item = cantidad * precio_unitario;
                const descuento_item_total = descuento_item || 0;
                const total_item = subtotal_item - descuento_item_total;
                
                const inventarioDisponible = await Inventario.findOne({
                    where: {
                        id_producto,
                        cantidad_disponible: { [Op.gt]: 0 }
                    },
                    include: [{
                        model: Lote,
                        as: 'lote',
                        where: { estado: 'ACTIVO' }
                    }],
                    order: [[{ model: Lote, as: 'lote' }, 'fecha_ingreso', 'ASC']]
                });
                
                if (!inventarioDisponible || inventarioDisponible.cantidad_disponible < cantidad) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Stock insuficiente en inventario para el producto ' + id_producto
                    });
                }
                
                const id_lote = inventarioDisponible.id_lote;
                
                await DetalleVenta.create({
                    id_venta: venta.id_venta,
                    id_producto,
                    id_lote,
                    cantidad,
                    precio_unitario,
                    subtotal: subtotal_item,
                    descuento: descuento_item_total,
                    total: total_item
                }, { transaction });
                
                await inventarioDisponible.update({
                    cantidad_disponible: inventarioDisponible.cantidad_disponible - cantidad
                }, { transaction });
            }
            
            await transaction.commit();
            
            res.status(201).json({
                success: true,
                message: 'Venta creada exitosamente',
                data: {
                    id_venta: venta.id_venta,
                    numero_venta: venta.numero_venta,
                    total: venta.total
                }
            });
            
        } catch (error) {
            await transaction.rollback();
            console.error('Error al crear venta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear venta',
                error: error.message
            });
        }
    }
    
    static async getAll(req, res) {
        try {
            const { fecha_inicio, fecha_fin, estado } = req.query;
            
            const whereClause = {};
            
            if (fecha_inicio && fecha_fin) {
                whereClause.fecha_venta = {
                    [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin + ' 23:59:59')]
                };
            } else if (fecha_inicio) {
                whereClause.fecha_venta = {
                    [Op.gte]: new Date(fecha_inicio)
                };
            } else if (fecha_fin) {
                whereClause.fecha_venta = {
                    [Op.lte]: new Date(fecha_fin + ' 23:59:59')
                };
            }
            
            if (estado) {
                whereClause.estado = estado;
            }
            
            const ventas = await Venta.findAll({
                where: whereClause,
                include: [
                    {
                        model: Cliente,
                        as: 'cliente',
                        attributes: ['id_cliente', 'nombre', 'apellido', 'nit']
                    },
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['id_usuario', 'nombre', 'apellido']
                    },
                    {
                        model: DetalleVenta,
                        as: 'detalles',
                        attributes: ['id_detalle_venta', 'cantidad']
                    }
                ],
                order: [['fecha_venta', 'DESC']]
            });
            
            const ventasFormateadas = ventas.map(venta => {
                const ventaData = venta.toJSON();
                return {
                    ...ventaData,
                    nombre_cliente: venta.cliente ? venta.cliente.nombre + ' ' + venta.cliente.apellido : 'Cliente Genérico',
                    nombre_usuario: venta.usuario.nombre + ' ' + venta.usuario.apellido,
                    total_items: venta.detalles.length,
                    detalles: undefined
                };
            });
            
            res.status(200).json({
                success: true,
                data: ventasFormateadas,
                total: ventasFormateadas.length
            });
            
        } catch (error) {
            console.error('Error al obtener ventas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener ventas',
                error: error.message
            });
        }
    }
    
    static async getById(req, res) {
        try {
            const { id } = req.params;
            
            const venta = await Venta.findByPk(id, {
                include: [
                    {
                        model: Cliente,
                        as: 'cliente',
                        attributes: ['id_cliente', 'nombre', 'apellido', 'nit', 'direccion']
                    },
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['id_usuario', 'nombre', 'apellido']
                    },
                    {
                        model: DetalleVenta,
                        as: 'detalles',
                        include: [{
                            model: Producto,
                            as: 'producto',
                            attributes: ['id_producto', 'codigo_producto', 'nombre']
                        }]
                    }
                ]
            });
            
            if (!venta) {
                return res.status(404).json({
                    success: false,
                    message: 'Venta no encontrada'
                });
            }
            
            res.status(200).json({
                success: true,
                data: venta
            });
            
        } catch (error) {
            console.error('Error al obtener venta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener venta',
                error: error.message
            });
        }
    }
    
    static async cancel(req, res) {
        const transaction = await db.sequelize.transaction();
        
        try {
            const { id } = req.params;
            
            const venta = await Venta.findByPk(id, {
                include: [{
                    model: DetalleVenta,
                    as: 'detalles'
                }]
            });
            
            if (!venta) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Venta no encontrada'
                });
            }
            
            if (venta.estado === 'CANCELADA') {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'La venta ya está cancelada'
                });
            }
            
            for (const detalle of venta.detalles) {
                const inventario = await Inventario.findOne({
                    where: {
                        id_producto: detalle.id_producto,
                        id_lote: detalle.id_lote
                    }
                });
                
                if (inventario) {
                    await inventario.update({
                        cantidad_disponible: inventario.cantidad_disponible + detalle.cantidad
                    }, { transaction });
                }
            }
            
            await venta.update({ estado: 'CANCELADA' }, { transaction });
            
            await transaction.commit();
            
            res.status(200).json({
                success: true,
                message: 'Venta cancelada exitosamente'
            });
            
        } catch (error) {
            await transaction.rollback();
            console.error('Error al cancelar venta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cancelar venta',
                error: error.message
            });
        }
    }
}

module.exports = VentaController;