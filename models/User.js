const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  /* ========================================
     USER SCHEMA
     Stores account credentials, role,
     ban status, profile data, and privacy flags
     ======================================== */
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
    /* ========================================
       INTERESTS
       Stored as a JSON array of category
       name strings (e.g. ["Outdoors","Music"])
       ======================================== */
    interests: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    profilePic: {
      type: DataTypes.STRING(255),
      defaultValue: null
    },
    /* ========================================
       PRIVACY FLAGS
       Controls whether location and interests
       are visible on the public profile page
       ======================================== */
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

  /* ========================================
     PASSWORD HASHING HOOK
     Automatically bcrypt-hashes the password
     field whenever it changes before saving,
     so plain-text passwords are never stored
     ======================================== */
  User.addHook('afterFind', (result) => {
    if (!result) return;
    const normalize = (instance) => {
      if (typeof instance.interests === 'string') {
        try { instance.setDataValue('interests', JSON.parse(instance.interests)); }
        catch { instance.setDataValue('interests', []); }
      }
    };
    Array.isArray(result) ? result.forEach(normalize) : normalize(result);
  });

  User.addHook('beforeSave', async (user) => {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 12);
    }
  });

  return User;
};
