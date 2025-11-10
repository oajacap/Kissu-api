const jwt = require('jsonwebtoken');
const db = require('../models');
const { Token, Usuario, Rol } = db;
const { Op } = require('sequelize');

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const validateTokenInDB = async (token) => {
    try {
        const tokenData = await Token.findOne({
            where: {
                token,
                activo: true,
                fecha_expiracion: { [Op.gt]: new Date() }
            },
            include: [{
                model: Usuario,
                as: 'usuario',
                where: { estado: true },
                include: [{
                    model: Rol,
                    as: 'rol',
                    attributes: ['nombre_rol']
                }]
            }]
        });
        
        if (!tokenData) return null;
        
        return {
            id_usuario: tokenData.usuario.id_usuario,
            nombre: tokenData.usuario.nombre,
            apellido: tokenData.usuario.apellido,
            email: tokenData.usuario.email,
            id_rol: tokenData.usuario.id_rol,
            nombre_rol: tokenData.usuario.rol.nombre_rol
        };
    } catch (error) {
        console.error('Error al validar token en BD:', error);
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken,
    validateTokenInDB
};