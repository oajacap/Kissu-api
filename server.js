
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const db = require('./src/models');

const authRoutes = require('./src/routes/authRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const ventaRoutes = require('./src/routes/ventaRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const loteRoutes = require('./src/routes/loteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(req.method + ' ' + req.path + ' - ' + new Date().toISOString());
    next();
});

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Kissu - Sistema de Ventas de Postres Coreanos',
        version: '1.0.0',
        arquitectura: 'MVC con Sequelize ORM',
        endpoints: {
            auth: '/api/auth',
            productos: '/api/productos',
            ventas: '/api/ventas',
            clientes: '/api/clientes',
            lotes: '/api/lotes'
        }
    });
});

app.get('/health', async (req, res) => {
    try {
        await db.sequelize.authenticate();
        res.json({
            success: true,
            status: 'OK',
            database: 'Connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'ERROR',
            database: 'Disconnected',
            error: error.message
        });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/lotes', loteRoutes);

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado'
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const startServer = async () => {
    try {
        if (process.env.NODE_ENV === 'development') {
            await db.sequelize.sync({ alter: false });
            console.log('[OK] Base de datos sincronizada');
        }
        
        await db.sequelize.authenticate();
        console.log('[OK] Conexión exitosa a la base de datos MySQL con Sequelize');
        
        app.listen(PORT, () => {
            console.log('='.repeat(60));
            console.log('  API KISSU - POSTRES COREANOS');
            console.log('='.repeat(60));
            console.log('  Servidor: http://localhost:' + PORT);
            console.log('  Ambiente: ' + process.env.NODE_ENV);
            console.log('  ORM: Sequelize v6');
            console.log('  Arquitectura: MVC');
            console.log('='.repeat(60));
            console.log('  Endpoints disponibles:');
            console.log('  - POST   /api/auth/login');
            console.log('  - POST   /api/auth/logout');
            console.log('  - GET    /api/auth/profile');
            console.log('  - GET    /api/productos');
            console.log('  - POST   /api/productos');
            console.log('  - GET    /api/ventas');
            console.log('  - POST   /api/ventas');
            console.log('  - GET    /api/clientes');
            console.log('  - POST   /api/clientes');
            console.log('  - GET    /api/lotes');
            console.log('  - POST   /api/lotes');
            console.log('='.repeat(60));
        });
        
    } catch (error) {
        console.error('[ERROR] Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;