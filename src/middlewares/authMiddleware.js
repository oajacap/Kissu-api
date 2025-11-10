const { verifyToken, validateTokenInDB } = require('../utils/tokenUtils');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación no proporcionado'
            });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        const tokenData = await validateTokenInDB(token);
        if (!tokenData) {
            return res.status(403).json({
                success: false,
                message: 'Token no válido en la base de datos o usuario inactivo'
            });
        }

        req.user = {
            id_usuario: tokenData.id_usuario,
            nombre: tokenData.nombre,
            apellido: tokenData.apellido,
            email: tokenData.email,
            id_rol: tokenData.id_rol,
            nombre_rol: tokenData.nombre_rol
        };

        next();
    } catch (error) {
        console.error('Error en authenticateToken:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar autenticación'
        });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!roles.includes(req.user.nombre_rol)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso'
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};