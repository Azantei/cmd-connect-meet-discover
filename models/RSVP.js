module.exports = (sequelize, DataTypes) => {
  /* ========================================
     RSVP SCHEMA
     Join table linking a user to a post they
     have RSVP'd to. The composite unique index
     on (userId, postId) prevents duplicate RSVPs.
     ======================================== */
  const RSVP = sequelize.define('RSVP', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'rsvps',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId', 'postId'] }
    ]
  });

  return RSVP;
};
