module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    type: {
      type: DataTypes.ENUM('activity', 'event'),
      allowNull: false,
      defaultValue: 'activity'
    },
    location: {
      type: DataTypes.STRING(255)
    },
    date: {
      type: DataTypes.DATE
    },
    category: {
      type: DataTypes.STRING(50)
    },
    imageUrl: {
      type: DataTypes.STRING(255)
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'posts',
    timestamps: true
  });

  return Post;
};
