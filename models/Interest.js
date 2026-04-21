module.exports = (sequelize, DataTypes) => {
  const Interest = sequelize.define('Interest', {
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
    tableName: 'interests',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId', 'postId'] }
    ]
  });

  return Interest;
};
