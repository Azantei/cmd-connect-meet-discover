const { UserWarning } = require('../models');

// Returns all unread warnings for the given user, newest first. Returns empty array if no userId.
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
