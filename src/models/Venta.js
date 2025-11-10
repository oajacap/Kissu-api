module.exports = (sequelize, DataTypes) => {
  const Venta = sequelize.define('Venta', {
    id_venta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero_venta: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clientes',
        key: 'id_cliente'
      }
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id_usuario'
      }
    },
    fecha_venta: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    descuento: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    iva: {
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
    },
    estado: {
      type: DataTypes.STRING(20),
      defaultValue: 'COMPLETADA'
    },
    metodo_pago: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 'ventas',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false
  });

  return Venta;
};