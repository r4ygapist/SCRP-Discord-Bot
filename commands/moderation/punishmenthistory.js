const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('punishmenthistory')
    .setDescription('Show punishment history for a user')
    .addUserOption((option) =>
      option.setName('user').setDescription('User to look up').setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('How many records to show (1-20)')
        .setMinValue(1)
        .setMaxValue(20)
    )
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client, { db }) {
    if (!db.dbEnabled()) {
      await interaction.reply({ content: 'Database is not configured for punishment history.', ephemeral: true });
      return;
    }

    const user = interaction.options.getUser('user', true);
    const limit = interaction.options.getInteger('limit') || 10;
    const rows = await db.getPunishments({ guildId: interaction.guildId, userId: user.id, limit });

    if (rows.length === 0) {
      await interaction.reply({ content: `No punishments found for ${user.tag}.`, ephemeral: true });
      return;
    }

    const lines = rows.map((row) => {
      const when = Math.floor(new Date(row.created_at).getTime() / 1000);
      const reason = row.reason ? row.reason.slice(0, 80) : 'No reason';
      return `#${row.id} • ${row.type} • <t:${when}:R> • ${reason}`;
    });

    const embed = new EmbedBuilder()
      .setTitle(`Punishments for ${user.tag}`)
      .setDescription(lines.join('\n'))
      .setColor(0xf97316);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
