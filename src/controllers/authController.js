const db = require('../models');
const { generateToken } = require('../utils/tokenUtils');
const { Usuario, Token, Rol } = db;

class AuthController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y password son requeridos'
                });
            }
            
            const usuario = await Usuario.findOne({
                where: { email },
                include: [{
                    model: Rol,
                    as: 'rol',
                    attributes: ['id_rol', 'nombre_rol']
                }]
            });
            
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }
            
            if (!usuario.estado) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario inactivo. Contacte al administrador'
                });
            }
            
            const isValidPassword = await usuario.verifyPassword(password);
            
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }
            
            const token = generateToken({
                id_usuario: usuario.id_usuario,
                email: usuario.email,
                rol: usuario.rol.nombre_rol
            });
            
            const expirationDate = new Date();
            expirationDate.setHours(expirationDate.getHours() + 24);
            
            await Token.create({
                id_usuario: usuario.id_usuario,
                token,
                fecha_expiracion: expirationDate,
                activo: true
            });
            
            res.status(200).json({
                success: true,
                message: 'Login exitoso',
                data: {
                    token,
                    usuario: {
                        id_usuario: usuario.id_usuario,
                        nombre: usuario.nombre,
                        apellido: usuario.apellido,
                        email: usuario.email,
                        rol: usuario.rol.nombre_rol
                    }
                }
            });
            
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error al iniciar sesión',
                error: error.message
            });
        }
    }
    
    static async logout(req, res) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            
            if (token) {
                await Token.update(
                    { activo: false },
                    { where: { token } }
                );
            }
            
            res.status(200).json({
                success: true,
                message: 'Logout exitoso'
            });
            
        } catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cerrar sesión',
                error: error.message
            });
        }
    }
    
    static async getProfile(req, res) {
        try {
            const usuario = await Usuario.findByPk(req.user.id_usuario, {
                include: [{
                    model: Rol,
                    as: 'rol',
                    attributes: ['nombre_rol']
                }],
                attributes: { exclude: ['password'] }
            });
            
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
            
            res.status(200).json({
                success: true,
                data: usuario
            });
            
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener perfil',
                error: error.message
            });
        }
    }
}

module.exports = AuthController;