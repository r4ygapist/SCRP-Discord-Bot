const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { parseDuration, formatDuration } = require('../../lib/utils');

const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout a user')
    .addUserOption((option) =>
      option.setName('user').setDescription('User to timeout').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('duration').setDescription('Duration (e.g. 10m, 2h, 1d)').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Reason for timeout')
    )
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.ModerateMembers],
  requireBotPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client, { db }) {
    const user = interaction.options.getUser('user', true);
    const durationInput = interaction.options.getString('duration', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const durationMs = parseDuration(durationInput);
    if (!durationMs || durationMs <= 0) {
      await interaction.reply({ content: 'Provide a valid duration like 10m, 2h, or 1d.', ephemeral: true });
      return;
    }

    if (durationMs > MAX_TIMEOUT_MS) {
      await interaction.reply({ content: 'Timeout duration cannot exceed 28 days.', ephemeral: true });
      return;
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member || !member.moderatable) {
      await interaction.reply({ content: 'I cannot timeout that user.', ephemeral: true });
      return;
    }

    await member.timeout(durationMs, reason);

    if (db.dbEnabled()) {
      await db.logPunishment({
        guildId: interaction.guildId,
        userId: user.id,
        moderatorId: interaction.user.id,
        type: 'mute',
        reason,
        expiresAt: new Date(Date.now() + durationMs),
        active: 1
      });
    }

    await interaction.reply({ content: `Timed out ${user.tag} for ${formatDuration(durationMs)}.` });
  }
};
