module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define('Producto', {
    id_producto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    codigo_producto: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    id_categoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categorias',
        key: 'id_categoria'
      }
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    stock_minimo: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      validate: {
        min: 0
      }
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    imagen_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'productos',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  return Producto;
};