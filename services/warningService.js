const { UserWarning } = require('../models');

async function getUnreadWarningsForUser(userId) {
  if (!userId) return [];
  return UserWarning.findAll({
    where: { userId, isRead: false },
    order: [['createdAt', 'DESC']]
  });
}

module.exports = {
  getUnreadWarningsForUser
};
