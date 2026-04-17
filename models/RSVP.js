module.exports = (sequelize, DataTypes) => {
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
