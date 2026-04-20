module.exports = (sequelize, DataTypes) => {
  /* ========================================
     MODERATION LOG SCHEMA
     Immutable audit trail of every moderator
     action (warn / dismiss / escalate).
     updatedAt is disabled since log entries
     are never edited after creation.
     ======================================== */
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
    /* ========================================
       ACTION
       One of: 'warn', 'dismiss', 'escalate'
       ======================================== */
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    /* ========================================
       POLYMORPHIC TARGET
       Same targetType / targetId pattern as Report
       ======================================== */
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
