/* ========================================
   RELATIVE TIME
   Converts a date to a human-readable
   relative string (e.g. "5 min ago",
   "2 hrs ago", "3 days ago")
   ======================================== */
function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + ' min ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + (hrs > 1 ? ' hrs ago' : ' hr ago');
  const days = Math.floor(hrs / 24);
  return days + (days > 1 ? ' days ago' : ' day ago');
}

/* ========================================
   NORMALIZE CATEGORY ARRAY
   Ensures category always comes back as an
   array regardless of whether the form
   submitted a single string or an array
   ======================================== */
function normalizeCategoryArray(category) {
  const raw = Array.isArray(category) ? category : (category ? [category] : []);
  const cleaned = raw
    .map(item => String(item || '').trim())
    .filter(Boolean);
  return Array.from(new Set(cleaned));
}

/* ========================================
   PARSE COMBINED DATE
   Combines separate date and time strings
   from form inputs into a single Date object;
   defaults time to 00:00 if not provided
   ======================================== */
function parseCombinedDate(date, time) {
  return date ? new Date(`${date}T${time || '00:00'}`) : null;
}

module.exports = { relativeTime, normalizeCategoryArray, parseCombinedDate };
