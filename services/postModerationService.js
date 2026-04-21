const { Report } = require('../models');
const { containsProfanity } = require('../utils/contentFilter');

function getPostStatus({ requestedStatus, title, description }) {
  if (requestedStatus === 'draft') return 'draft';
  if (containsProfanity(title) || containsProfanity(description)) return 'pending';
  return 'published';
}

async function createAutoModerationReport({ postId, reporterId }) {
  return Report.create({
    reporterId,
    targetType: 'post',
    targetId: postId,
    reason: 'Auto-flagged by content filter: potential profanity detected.'
  });
}

module.exports = {
  getPostStatus,
  createAutoModerationReport
};
