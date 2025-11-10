const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    timezone: dbConfig.timezone,
    define: dbConfig.define,
    pool: dbConfig.pool
  }
);

const db = {};

db.Rol = require('./Rol')(sequelize, Sequelize.DataTypes);
db.Usuario = require('./Usuario')(sequelize, Sequelize.DataTypes);
db.Token = require('./Token')(sequelize, Sequelize.DataTypes);
db.Categoria = require('./Categoria')(sequelize, Sequelize.DataTypes);
db.Producto = require('./Producto')(sequelize, Sequelize.DataTypes);
db.Cliente = require('./Cliente')(sequelize, Sequelize.DataTypes);
db.Proveedor = require('./Proveedor')(sequelize, Sequelize.DataTypes);
db.Lote = require('./Lote')(sequelize, Sequelize.DataTypes);
db.Inventario = require('./Inventario')(sequelize, Sequelize.DataTypes);
db.Venta = require('./Venta')(sequelize, Sequelize.DataTypes);
db.DetalleVenta = require('./DetalleVenta')(sequelize, Sequelize.DataTypes);
db.Factura = require('./Factura')(sequelize, Sequelize.DataTypes);
db.DetalleFactura = require('./DetalleFactura')(sequelize, Sequelize.DataTypes);

// Relaciones Usuario - Rol
db.Usuario.belongsTo(db.Rol, { foreignKey: 'id_rol', as: 'rol' });
db.Rol.hasMany(db.Usuario, { foreignKey: 'id_rol', as: 'usuarios' });

// Relaciones Usuario - Token
db.Token.belongsTo(db.Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
db.Usuario.hasMany(db.Token, { foreignKey: 'id_usuario', as: 'tokens' });

// Relaciones Producto - Categoria
db.Producto.belongsTo(db.Categoria, { foreignKey: 'id_categoria', as: 'categoria' });
db.Categoria.hasMany(db.Producto, { foreignKey: 'id_categoria', as: 'productos' });

// Relaciones Lote - Producto
db.Lote.belongsTo(db.Producto, { foreignKey: 'id_producto', as: 'producto' });
db.Producto.hasMany(db.Lote, { foreignKey: 'id_producto', as: 'lotes' });

// Relaciones Lote - Proveedor
db.Lote.belongsTo(db.Proveedor, { foreignKey: 'id_proveedor', as: 'proveedor' });
db.Proveedor.hasMany(db.Lote, { foreignKey: 'id_proveedor', as: 'lotes' });

// Relaciones Inventario - Producto
db.Inventario.belongsTo(db.Producto, { foreignKey: 'id_producto', as: 'producto' });
db.Producto.hasMany(db.Inventario, { foreignKey: 'id_producto', as: 'inventarios' });

// Relaciones Inventario - Lote
db.Inventario.belongsTo(db.Lote, { foreignKey: 'id_lote', as: 'lote' });
db.Lote.hasOne(db.Inventario, { foreignKey: 'id_lote', as: 'inventario' });

// Relaciones Venta - Cliente
db.Venta.belongsTo(db.Cliente, { foreignKey: 'id_cliente', as: 'cliente' });
db.Cliente.hasMany(db.Venta, { foreignKey: 'id_cliente', as: 'ventas' });

// Relaciones Venta - Usuario
db.Venta.belongsTo(db.Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
db.Usuario.hasMany(db.Venta, { foreignKey: 'id_usuario', as: 'ventas' });

// Relaciones Venta - DetalleVenta
db.Venta.hasMany(db.DetalleVenta, { foreignKey: 'id_venta', as: 'detalles' });
db.DetalleVenta.belongsTo(db.Venta, { foreignKey: 'id_venta', as: 'venta' });

// Relaciones DetalleVenta - Producto
db.DetalleVenta.belongsTo(db.Producto, { foreignKey: 'id_producto', as: 'producto' });
db.Producto.hasMany(db.DetalleVenta, { foreignKey: 'id_producto', as: 'detallesVenta' });

// Relaciones DetalleVenta - Lote
db.DetalleVenta.belongsTo(db.Lote, { foreignKey: 'id_lote', as: 'lote' });
db.Lote.hasMany(db.DetalleVenta, { foreignKey: 'id_lote', as: 'detallesVenta' });

// Relaciones Factura - Venta
db.Factura.belongsTo(db.Venta, { foreignKey: 'id_venta', as: 'venta' });
db.Venta.hasOne(db.Factura, { foreignKey: 'id_venta', as: 'factura' });

// Relaciones Factura - Cliente
db.Factura.belongsTo(db.Cliente, { foreignKey: 'id_cliente', as: 'cliente' });
db.Cliente.hasMany(db.Factura, { foreignKey: 'id_cliente', as: 'facturas' });

// Relaciones Factura - DetalleFactura
db.Factura.hasMany(db.DetalleFactura, { foreignKey: 'id_factura', as: 'detalles' });
db.DetalleFactura.belongsTo(db.Factura, { foreignKey: 'id_factura', as: 'factura' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;