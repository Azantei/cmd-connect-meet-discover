require('dotenv').config();
const { Sequelize } = require('sequelize');

/* ========================================
   DATABASE CONNECTION
   Connects to MySQL using credentials from
   .env; logging is disabled in all environments
   ======================================== */
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

/* ========================================
   MODEL REGISTRATION
   Each model file exports a factory function
   that receives the sequelize instance and
   DataTypes, then returns the defined Model
   ======================================== */
db.User           = require('./User')(sequelize, Sequelize.DataTypes);
db.Post           = require('./Post')(sequelize, Sequelize.DataTypes);
db.RSVP           = require('./RSVP')(sequelize, Sequelize.DataTypes);
db.Report         = require('./Report')(sequelize, Sequelize.DataTypes);
db.Category       = require('./Category')(sequelize, Sequelize.DataTypes);
db.ModerationLog      = require('./ModerationLog')(sequelize, Sequelize.DataTypes);
db.PlatformSetting    = require('./PlatformSetting')(sequelize, Sequelize.DataTypes);
db.UserWarning        = require('./UserWarning')(sequelize, Sequelize.DataTypes);
db.Interest           = require('./Interest')(sequelize, Sequelize.DataTypes);

/* ========================================
   MODEL ASSOCIATIONS
   Defines foreign-key relationships between
   models so Sequelize can JOIN them with
   include: [...] in queries
   ======================================== */

// ── User ↔ Post ─────────────────────────────────────────────
db.User.hasMany(db.Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Post.belongsTo(db.User, { foreignKey: 'userId', as: 'author' });

// ── User ↔ RSVP ─────────────────────────────────────────────
db.User.hasMany(db.RSVP, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.RSVP.belongsTo(db.User, { foreignKey: 'userId', as: 'attendee' });

// ── Post ↔ RSVP ─────────────────────────────────────────────
db.Post.hasMany(db.RSVP, { foreignKey: 'postId', onDelete: 'CASCADE' });
db.RSVP.belongsTo(db.Post, { foreignKey: 'postId' });

// ── User ↔ Interest ↔ Post ──────────────────────────────────
db.User.hasMany(db.Interest, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Interest.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Post.hasMany(db.Interest, { foreignKey: 'postId', onDelete: 'CASCADE' });
db.Interest.belongsTo(db.Post, { foreignKey: 'postId', as: 'post' });

// ── User ↔ Report (as reporter) ─────────────────────────────
db.User.hasMany(db.Report, { foreignKey: 'reporterId', onDelete: 'CASCADE' });
db.Report.belongsTo(db.User, { foreignKey: 'reporterId', as: 'reporter' });

// ── User ↔ ModerationLog (as moderator) ─────────────────────
db.User.hasMany(db.ModerationLog, { foreignKey: 'moderatorId', onDelete: 'CASCADE' });
db.ModerationLog.belongsTo(db.User, { foreignKey: 'moderatorId', as: 'moderator' });

// ── User ↔ UserWarning (warned user) ────────────────────────
db.User.hasMany(db.UserWarning, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.UserWarning.belongsTo(db.User, { foreignKey: 'userId', as: 'warnedUser' });

module.exports = db;
