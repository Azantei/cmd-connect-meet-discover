module.exports = (sequelize, DataTypes) => {
  /* ========================================
     CATEGORY SCHEMA
     Lookup table of community-defined tags
     (e.g. Outdoors, Music, Sports).
     Name must be unique; no timestamps needed.
     ======================================== */
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'categories',
    timestamps: false
  });

  return Category;
};
