const db = require('../models');
const { Cliente, Venta } = db;
const { Op } = require('sequelize');

class ClienteController {
    static async create(req, res) {
        try {
            const { nombre, apellido, email, telefono, nit, direccion, fecha_nacimiento } = req.body;
            
            if (!nombre || !apellido) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y apellido son requeridos'
                });
            }
            
            if (email) {
                const clienteExistente = await Cliente.findOne({
                    where: { email }
                });
                
                if (clienteExistente) {
                    return res.status(400).json({
                        success: false,
                        message: 'El email ya está registrado'
                    });
                }
            }
            
            const cliente = await Cliente.create({
                nombre,
                apellido,
                email,
                telefono,
                nit,
                direccion,
                fecha_nacimiento
            });
            
            res.status(201).json({
                success: true,
                message: 'Cliente creado exitosamente',
                data: cliente
            });
            
        } catch (error) {
            console.error('Error al crear cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear cliente',
                error: error.message
            });
        }
    }
    
    static async getAll(req, res) {
        try {
            const clientes = await Cliente.findAll({
                order: [['id_cliente', 'DESC']]
            });
            
            res.status(200).json({
                success: true,
                data: clientes,
                total: clientes.length
            });
            
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener clientes',
                error: error.message
            });
        }
    }
    
    static async getById(req, res) {
        try {
            const { id } = req.params;
            
            const cliente = await Cliente.findByPk(id);
            
            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente no encontrado'
                });
            }
            
            res.status(200).json({
                success: true,
                data: cliente
            });
            
        } catch (error) {
            console.error('Error al obtener cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener cliente',
                error: error.message
            });
        }
    }
    
    static async search(req, res) {
        try {
            const { query } = req.query;
            
            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'El parámetro de búsqueda es requerido'
                });
            }
            
            const clientes = await Cliente.findAll({
                where: {
                    [Op.or]: [
                        { nombre: { [Op.like]: '%' + query + '%' } },
                        { apellido: { [Op.like]: '%' + query + '%' } },
                        { nit: { [Op.like]: '%' + query + '%' } },
                        { email: { [Op.like]: '%' + query + '%' } }
                    ],
                    estado: true
                }
            });
            
            res.status(200).json({
                success: true,
                data: clientes,
                total: clientes.length
            });
            
        } catch (error) {
            console.error('Error al buscar clientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar clientes',
                error: error.message
            });
        }
    }
    
    static async getHistorialCompras(req, res) {
        try {
            const { id } = req.params;
            
            const cliente = await Cliente.findByPk(id);
            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente no encontrado'
                });
            }
            
            const ventas = await Venta.findAll({
                where: { id_cliente: id },
                attributes: ['id_venta', 'numero_venta', 'fecha_venta', 'total', 'estado'],
                order: [['fecha_venta', 'DESC']]
            });
            
            res.status(200).json({
                success: true,
                data: {
                    cliente: {
                        id_cliente: cliente.id_cliente,
                        nombre: cliente.nombre,
                        apellido: cliente.apellido,
                        nit: cliente.nit
                    },
                    historial_compras: ventas,
                    total_compras: ventas.length
                }
            });
            
        } catch (error) {
            console.error('Error al obtener historial de compras:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener historial de compras',
                error: error.message
            });
        }
    }
    
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, apellido, email, telefono, nit, direccion, fecha_nacimiento, estado } = req.body;
            
            const cliente = await Cliente.findByPk(id);
            
            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente no encontrado'
                });
            }
            
            await cliente.update({
                nombre: nombre || cliente.nombre,
                apellido: apellido || cliente.apellido,
                email: email !== undefined ? email : cliente.email,
                telefono: telefono !== undefined ? telefono : cliente.telefono,
                nit: nit !== undefined ? nit : cliente.nit,
                direccion: direccion !== undefined ? direccion : cliente.direccion,
                fecha_nacimiento: fecha_nacimiento !== undefined ? fecha_nacimiento : cliente.fecha_nacimiento,
                estado: estado !== undefined ? estado : cliente.estado
            });
            
            res.status(200).json({
                success: true,
                message: 'Cliente actualizado exitosamente',
                data: cliente
            });
            
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar cliente',
                error: error.message
            });
        }
    }
    
    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            const cliente = await Cliente.findByPk(id);
            
            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente no encontrado'
                });
            }
            
            await cliente.update({ estado: false });
            
            res.status(200).json({
                success: true,
                message: 'Cliente eliminado exitosamente'
            });
            
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar cliente',
                error: error.message
            });
        }
    }
}

module.exports = ClienteController;