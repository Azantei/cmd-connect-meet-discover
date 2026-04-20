module.exports = (sequelize, DataTypes) => {
  /* ========================================
     REPORT SCHEMA
     Records user-submitted reports against
     a post or user. status tracks the report
     through the moderation workflow:
       pending → reviewed → escalated → resolved
     ======================================== */
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    reporterId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    /* ========================================
       POLYMORPHIC TARGET
       targetType + targetId point to either
       a post row or a user row (no FK enforced
       so that reports survive deletion)
       ======================================== */
    targetType: {
      type: DataTypes.ENUM('post', 'user'),
      allowNull: false
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'escalated', 'resolved'),
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'reports',
    timestamps: true
  });

  return Report;
};
