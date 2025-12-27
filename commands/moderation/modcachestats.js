const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('modcachestats')
    .setDescription('Show moderation cache stats')
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client, { db }) {
    if (!db.dbEnabled()) {
      await interaction.reply({ content: 'Database is not configured yet.', ephemeral: true });
      return;
    }

    const counts = await db.getPunishmentCounts(interaction.guildId);
    const lines = counts && counts.length > 0
      ? counts.map((row) => `${row.type}: ${row.count}`).join('\n')
      : 'No punishments logged yet.';

    const embed = new EmbedBuilder()
      .setTitle('Moderation Stats')
      .setColor(0x64748b)
      .setDescription(lines);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
