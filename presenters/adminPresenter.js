const { relativeTime } = require('../utils/helpers');

const AVATAR_COLORS = ['#D2691E', '#C85A54', '#CD853F', '#A0522D', '#8B4513', '#6B4423', '#B87333'];

/* ========================================
   FORMAT USER ROW
   Shapes a raw User record into the display
   object expected by the admin users view
   ======================================== */
function formatUserRow(user, index) {
  const nameParts = (user.name || '').trim().split(/\s+/);
  const initials = nameParts.map(p => p.charAt(0).toUpperCase()).join('').substring(0, 2) || '?';
  return {
    id: user.id,
    firstName: user.name || '',
    lastName: '',
    email: user.email || '',
    role: user.role === 'admin' ? 'Admin' : (user.role === 'moderator' ? 'Mod' : 'Member'),
    status: user.isBanned ? 'banned' : 'active',
    joinDate: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).replace(',', ''),
    initials,
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length]
  };
}

/* ========================================
   FORMAT ESCALATED ROW
   Shapes an enriched report object into the
   display row expected by the escalated view
   ======================================== */
function formatEscalatedRow(r) {
  return {
    id: r.id,
    type: r.type,
    targetId: r.targetId,
    title: r.targetName || (r.type === 'post' ? `Post #${r.targetId}` : 'Unknown User'),
    reporterName: r.reporterName,
    escalatedBy: r.escalatedBy,
    originalReason: r.originalReason,
    moderatorNotes: r.moderatorNotes,
    status: r.status === 'escalated' ? 'open' : 'resolved',
    createdAt: r.createdAt,
    timeAgo: relativeTime(r.createdAt),
    isBanned: r.targetIsBanned || false
  };
}

module.exports = { formatUserRow, formatEscalatedRow };
