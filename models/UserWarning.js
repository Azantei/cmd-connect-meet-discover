module.exports = (sequelize, DataTypes) => {
  /* ========================================
     USER WARNING SCHEMA
     Stores per-user moderator warnings.
     Shown to the warned user as a red dot
     indicator in the navigation bar until
     they dismiss the notification.
     ======================================== */
  const UserWarning = sequelize.define('UserWarning', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    moderatorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'user_warnings',
    timestamps: true,
    updatedAt: false
  });

  return UserWarning;
};
