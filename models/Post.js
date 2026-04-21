module.exports = (sequelize, DataTypes) => {
  /* ========================================
     POST SCHEMA
     Stores community activity and event posts.
     category is a JSON array of tag strings.
     status controls draft vs published visibility.
     isHidden is set by moderators during escalation.
     ======================================== */
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
    /* ========================================
       CATEGORY
       JSON array of tag strings chosen by the
       author (e.g. ["Outdoors","Music"])
       ======================================== */
    category: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    imageUrl: {
      type: DataTypes.STRING(255)
    },
    /* ========================================
       RSVP SETTINGS
       rsvpEnabled toggles the RSVP feature.
       maxAttendees caps the RSVP count (null = unlimited).
       ======================================== */
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
      type: DataTypes.ENUM('published', 'draft', 'pending'),
      defaultValue: 'published'
    }
  }, {
    tableName: 'posts',
    timestamps: true
  });

  /* ========================================
     POST.SEARCH STATIC METHOD
     Queries published, visible posts with
     optional full-text keyword search (?q)
     and category filter (?category).
     Category filter uses a JSON LIKE match
     against the stored array string.
     ======================================== */
  Post.search = async function(q, categories, dateFrom, dateTo) {
    const { Op } = require('sequelize');
    const now = new Date();

    // When a dateFrom is given use it as the lower bound; otherwise hide past events
    const effectiveFrom = dateFrom ? new Date(dateFrom) : now;
    const dateFilter = { [Op.gte]: effectiveFrom };
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      dateFilter[Op.lte] = end;
    }

    const conditions = [
      { isHidden: false, status: 'published' },
      // Activities and undated posts always show; events must pass the date window
      {
        [Op.or]: [
          { type: 'activity' },
          { date: null },
          { date: dateFilter }
        ]
      }
    ];

    if (q && q.trim()) {
      conditions.push({
        [Op.or]: [
          { title:       { [Op.like]: `%${q.trim()}%` } },
          { description: { [Op.like]: `%${q.trim()}%` } }
        ]
      });
    }

    if (categories && categories.length > 0) {
      conditions.push({
        [Op.or]: categories.map(cat => ({
          category: { [Op.like]: `%"${cat.trim().replace(/["%_\\]/g, '\\$&')}"%` }
        }))
      });
    }

    const User = Post.sequelize.models.User;
    return Post.findAll({
      where: { [Op.and]: conditions },
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });
  };

  return Post;
};
