module.exports = (sequelize, DataTypes) => {
  const PlatformSetting = sequelize.define('PlatformSetting', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'platform_settings',
    timestamps: false
  });

  return PlatformSetting;
};
