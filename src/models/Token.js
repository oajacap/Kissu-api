module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define('Token', {
    id_token: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id_usuario'
      }
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    fecha_expiracion: {
      type: DataTypes.DATE,
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'tokens',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false
  });

  return Token;
};