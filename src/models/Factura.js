module.exports = (sequelize, DataTypes) => {
  const Factura = sequelize.define('Factura', {
    id_factura: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero_factura: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    serie: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    id_venta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ventas',
        key: 'id_venta'
      }
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'id_cliente'
      }
    },
    nombre_cliente: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    nit_cliente: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    direccion_cliente: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha_emision: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    iva: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING(20),
      defaultValue: 'EMITIDA'
    }
  }, {
    tableName: 'facturas',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false
  });

  return Factura;
};