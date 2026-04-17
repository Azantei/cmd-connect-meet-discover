module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('community_member', 'moderator', 'admin'),
      defaultValue: 'community_member'
    },
    isBanned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    location: {
      type: DataTypes.STRING(255)
    },
    interests: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  return User;
};
