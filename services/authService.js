const bcrypt = require('bcrypt');
const { User, Category } = require('../models');

async function authenticateByEmailPassword(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user) return { ok: false, reason: 'invalid_credentials' };

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) return { ok: false, reason: 'invalid_credentials' };
  if (user.isBanned) return { ok: false, reason: 'banned' };

  return { ok: true, user };
}

async function registerUser(name, email, password) {
  return User.create({ name, email, password });
}

async function getSetupCategories() {
  return Category.findAll({ order: [['name', 'ASC']] });
}

async function saveProfileSetup(userId, interests, location) {
  await User.update({ interests, location: location || null }, { where: { id: userId } });
}

module.exports = {
  authenticateByEmailPassword,
  registerUser,
  getSetupCategories,
  saveProfileSetup
};
