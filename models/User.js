const bcrypt = require('bcrypt');

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
    },
    profilePic: {
      type: DataTypes.STRING(255),
      defaultValue: null
    },
    showLocation: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    showInterests: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  User.addHook('beforeSave', async (user) => {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 12);
    }
  });

  return User;
};
