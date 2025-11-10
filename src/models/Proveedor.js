module.exports = (sequelize, DataTypes) => {
  const Proveedor = sequelize.define('Proveedor', {
    id_proveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_empresa: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    nombre_contacto: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nit: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'proveedores',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false
  });

  return Proveedor;
};