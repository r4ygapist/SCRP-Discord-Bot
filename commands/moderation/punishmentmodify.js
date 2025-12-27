const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { parseDuration, formatDuration } = require('../../lib/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('punishmentmodify')
    .setDescription('Modify a punishment record')
    .addIntegerOption((option) =>
      option.setName('id').setDescription('Punishment ID').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('New reason')
    )
    .addBooleanOption((option) =>
      option.setName('active').setDescription('Mark as active/inactive')
    )
    .addStringOption((option) =>
      option.setName('expires').setDescription('New expiry duration (e.g. 1h) or "clear"')
    )
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requiredTier: 'admin',
  requireMemberPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client, { db }) {
    if (!db.dbEnabled()) {
      await interaction.reply({ content: 'Database is not configured for punishment updates.', ephemeral: true });
      return;
    }

    const id = interaction.options.getInteger('id', true);
    const reason = interaction.options.getString('reason');
    const active = interaction.options.getBoolean('active');
    const expires = interaction.options.getString('expires');

    let expiresAt;
    if (expires) {
      if (expires.toLowerCase() === 'clear') {
        expiresAt = null;
      } else {
        const ms = parseDuration(expires);
        if (!ms) {
          await interaction.reply({ content: 'Provide a valid duration like 1h or use "clear".', ephemeral: true });
          return;
        }
        expiresAt = new Date(Date.now() + ms);
      }
    }

    await db.updatePunishment({ id, reason, active, expiresAt });

    const changes = [];
    if (reason !== undefined) changes.push('reason');
    if (active !== undefined) changes.push('active');
    if (expires !== undefined) changes.push(`expires (${expiresAt ? formatDuration(expiresAt - Date.now()) : 'cleared'})`);

    await interaction.reply({ content: `Updated punishment #${id}. Fields: ${changes.join(', ') || 'none'}.` });
  }
};
