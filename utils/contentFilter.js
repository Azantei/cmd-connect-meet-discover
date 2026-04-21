const PROFANITY_RE = /\b(fuck|shit|ass)\b/i;

function containsProfanity(text) {
  if (!text || typeof text !== 'string') return false;
  return PROFANITY_RE.test(text);
}

module.exports = {
  containsProfanity
};
