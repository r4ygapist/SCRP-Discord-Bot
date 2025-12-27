const { PermissionFlagsBits } = require('discord.js');

function parseDuration(input) {
  if (!input) return null;
  const cleaned = String(input).toLowerCase().replace(/\s+/g, '');
  if (/^\d+$/.test(cleaned)) {
    return Number(cleaned) * 60 * 1000;
  }

  const regex = /(\d+)(w|d|h|m|s)/g;
  let match;
  let total = 0;
  while ((match = regex.exec(cleaned)) !== null) {
    const value = Number(match[1]);
    const unit = match[2];
    switch (unit) {
      case 'w':
        total += value * 7 * 24 * 60 * 60 * 1000;
        break;
      case 'd':
        total += value * 24 * 60 * 60 * 1000;
        break;
      case 'h':
        total += value * 60 * 60 * 1000;
        break;
      case 'm':
        total += value * 60 * 1000;
        break;
      case 's':
        total += value * 1000;
        break;
      default:
        break;
    }
  }

  return total || null;
}

function formatDuration(ms) {
  if (!ms || Number.isNaN(ms)) return '0s';
  let remaining = Math.floor(ms / 1000);
  const parts = [];

  const units = [
    ['w', 7 * 24 * 60 * 60],
    ['d', 24 * 60 * 60],
    ['h', 60 * 60],
    ['m', 60],
    ['s', 1]
  ];

  for (const [label, seconds] of units) {
    const value = Math.floor(remaining / seconds);
    if (value > 0) {
      parts.push(`${value}${label}`);
      remaining -= value * seconds;
    }
  }

  return parts.length ? parts.join(' ') : '0s';
}

function requirePermissions(interaction, perms, message) {
  if (!interaction.inGuild()) {
    interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
    return false;
  }

  const needed = Array.isArray(perms) ? perms : [perms];
  const hasAll = needed.every((perm) => interaction.memberPermissions.has(perm));
  if (!hasAll) {
    interaction.reply({ content: message || 'You do not have permission to use this command.', ephemeral: true });
    return false;
  }

  return true;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function formatTag(user) {
  return user ? `${user.username}#${user.discriminator}` : 'Unknown User';
}

module.exports = {
  PermissionFlagsBits,
  parseDuration,
  formatDuration,
  requirePermissions,
  chunkArray,
  formatTag
};
