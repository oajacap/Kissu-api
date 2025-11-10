module.exports = (sequelize, DataTypes) => {
  const Inventario = sequelize.define('Inventario', {
    id_inventario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id_producto'
      }
    },
    id_lote: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'lotes',
        key: 'id_lote'
      }
    },
    cantidad_disponible: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'inventario',
    timestamps: true,
    createdAt: false,
    updatedAt: 'fecha_actualizacion'
  });

  return Inventario;
};