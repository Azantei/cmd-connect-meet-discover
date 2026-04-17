module.exports = (sequelize, DataTypes) => {
  const ModerationLog = sequelize.define('ModerationLog', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    moderatorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    targetType: {
      type: DataTypes.ENUM('post', 'user'),
      allowNull: false
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'moderation_logs',
    timestamps: true,
    updatedAt: false
  });

  return ModerationLog;
};
