module.exports = (sequelize, DataTypes) => {
  const Lote = sequelize.define('Lote', {
    id_lote: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero_lote: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id_producto'
      }
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'proveedores',
        key: 'id_proveedor'
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    costo_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    costo_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    fecha_ingreso: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_vencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    estado: {
      type: DataTypes.STRING(20),
      defaultValue: 'ACTIVO'
    }
  }, {
    tableName: 'lotes',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false,
    hooks: {
      beforeCreate: (lote) => {
        lote.costo_total = lote.cantidad * lote.costo_unitario;
      },
      beforeUpdate: (lote) => {
        if (lote.changed('cantidad') || lote.changed('costo_unitario')) {
          lote.costo_total = lote.cantidad * lote.costo_unitario;
        }
      }
    }
  });

  return Lote;
};