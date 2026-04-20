module.exports = (sequelize, DataTypes) => {
  /* ========================================
     PLATFORM SETTING SCHEMA
     Simple key/value store for admin-controlled
     platform config (e.g. platformName,
     distanceRadius). Upserted by the admin
     settings controller, no timestamps needed.
     ======================================== */
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
