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
      type: DataTypes.JSON,
      defaultValue: []
    },
    imageUrl: {
      type: DataTypes.STRING(255)
    },
    maxAttendees: {
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    rsvpEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('published', 'draft'),
      defaultValue: 'published'
    }
  }, {
    tableName: 'posts',
    timestamps: true
  });

  Post.search = async function(q, category) {
    const { Op } = require('sequelize');
    const where = { isHidden: false, status: 'published' };
    if (q && q.trim()) {
      where[Op.or] = [
        { title:       { [Op.like]: `%${q.trim()}%` } },
        { description: { [Op.like]: `%${q.trim()}%` } }
      ];
    }
    if (category && category.trim()) {
      const safe = category.trim().replace(/["%_\\]/g, '\\$&');
      where.category = { [Op.like]: `%"${safe}"%` };
    }
    const User = Post.sequelize.models.User;
    return Post.findAll({
      where,
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });
  };

  return Post;
};
