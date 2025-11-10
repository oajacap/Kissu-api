module.exports = (sequelize, DataTypes) => {
  const DetalleFactura = sequelize.define('DetalleFactura', {
    id_detalle_factura: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_factura: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'facturas',
        key: 'id_factura'
      }
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'detalle_facturas',
    timestamps: false
  });

  return DetalleFactura;
};