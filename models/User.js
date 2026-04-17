module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('user', 'moderator', 'admin'), defaultValue: 'user' },
    bio: { type: DataTypes.TEXT },
    profilePic: { type: DataTypes.STRING(255) },
    isBanned: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, { tableName: 'users', timestamps: true });

  return User;
};
