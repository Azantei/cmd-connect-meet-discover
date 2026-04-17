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

db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Post = require('./Post')(sequelize, Sequelize.DataTypes);
db.Event = require('./Event')(sequelize, Sequelize.DataTypes);
db.Report = require('./Report')(sequelize, Sequelize.DataTypes);

// Associations
db.User.hasMany(db.Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Post.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.Event, { foreignKey: 'organizerId', onDelete: 'CASCADE' });
db.Event.belongsTo(db.User, { foreignKey: 'organizerId', as: 'organizer' });

db.Post.hasMany(db.Report, { foreignKey: 'postId', onDelete: 'CASCADE' });
db.Report.belongsTo(db.Post, { foreignKey: 'postId' });

db.User.hasMany(db.Report, { foreignKey: 'reporterId', onDelete: 'CASCADE' });
db.Report.belongsTo(db.User, { foreignKey: 'reporterId', as: 'reporter' });

module.exports = db;
