module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    organizerId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT },
    location: { type: DataTypes.STRING(255) },
    eventDate: { type: DataTypes.DATE, allowNull: false },
    imageUrl: { type: DataTypes.STRING(255) },
    category: { type: DataTypes.STRING(50) }
  }, { tableName: 'events', timestamps: true });

  return Event;
};
