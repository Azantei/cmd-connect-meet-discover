require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models
db.User           = require('./User')(sequelize, Sequelize.DataTypes);
db.Post           = require('./Post')(sequelize, Sequelize.DataTypes);
db.RSVP           = require('./RSVP')(sequelize, Sequelize.DataTypes);
db.Report         = require('./Report')(sequelize, Sequelize.DataTypes);
db.Category       = require('./Category')(sequelize, Sequelize.DataTypes);
db.ModerationLog  = require('./ModerationLog')(sequelize, Sequelize.DataTypes);

// ── User ↔ Post ─────────────────────────────────────────────
db.User.hasMany(db.Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Post.belongsTo(db.User, { foreignKey: 'userId', as: 'author' });

// ── User ↔ RSVP ─────────────────────────────────────────────
db.User.hasMany(db.RSVP, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.RSVP.belongsTo(db.User, { foreignKey: 'userId', as: 'attendee' });

// ── Post ↔ RSVP ─────────────────────────────────────────────
db.Post.hasMany(db.RSVP, { foreignKey: 'postId', onDelete: 'CASCADE' });
db.RSVP.belongsTo(db.Post, { foreignKey: 'postId' });

// ── User ↔ Report (as reporter) ─────────────────────────────
db.User.hasMany(db.Report, { foreignKey: 'reporterId', onDelete: 'CASCADE' });
db.Report.belongsTo(db.User, { foreignKey: 'reporterId', as: 'reporter' });

// ── User ↔ ModerationLog (as moderator) ─────────────────────
db.User.hasMany(db.ModerationLog, { foreignKey: 'moderatorId', onDelete: 'CASCADE' });
db.ModerationLog.belongsTo(db.User, { foreignKey: 'moderatorId', as: 'moderator' });

module.exports = db;
