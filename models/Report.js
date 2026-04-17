module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    reporterId: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'reviewed', 'escalated', 'resolved'), defaultValue: 'pending' },
    moderatorNote: { type: DataTypes.TEXT }
  }, { tableName: 'reports', timestamps: true });

  return Report;
};
