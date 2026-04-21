const bcrypt = require('bcrypt');
const { User } = require('../models');

async function authenticateByEmailPassword(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user) return { ok: false, reason: 'invalid_credentials' };

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) return { ok: false, reason: 'invalid_credentials' };
  if (user.isBanned) return { ok: false, reason: 'banned' };

  return { ok: true, user };
}

module.exports = {
  authenticateByEmailPassword
};
