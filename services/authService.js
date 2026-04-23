const bcrypt = require('bcrypt');
const { User, Category } = require('../models');

// Verifies email/password credentials; returns { ok, user } on success or { ok, reason } on failure.
async function authenticateByEmailPassword(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user) return { ok: false, reason: 'invalid_credentials' };

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) return { ok: false, reason: 'invalid_credentials' };
  if (user.isBanned) return { ok: false, reason: 'banned' };

  return { ok: true, user };
}

// Creates a new user record with the given name, email, and password.
async function registerUser(name, email, password) {
  return User.create({ name, email, password });
}

// Fetches all categories sorted alphabetically for the post-registration setup form.
async function getSetupCategories() {
  return Category.findAll({ order: [['name', 'ASC']] });
}

// Saves the user's selected interests and location after the setup step.
async function saveProfileSetup(userId, interests, location) {
  await User.update({ interests, location: location || null }, { where: { id: userId } });
}

module.exports = {
  authenticateByEmailPassword,
  registerUser,
  getSetupCategories,
  saveProfileSetup
};
