const { Report } = require('../models');
const { containsProfanity } = require('../utils/contentFilter');

// Determines publish status: returns 'draft' if requested, 'pending' if content filter triggers, otherwise 'published'.
function getPostStatus({ requestedStatus, title, description }) {
  if (requestedStatus === 'draft') return 'draft';
  if (containsProfanity(title) || containsProfanity(description)) return 'pending';
  return 'published';
}

// Creates an auto-generated moderation report when the content filter flags a post.
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
