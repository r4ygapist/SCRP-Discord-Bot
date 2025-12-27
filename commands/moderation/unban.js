const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user by ID')
    .addStringOption((option) =>
      option.setName('user_id').setDescription('User ID to unban').setRequired(true)
    )
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.BanMembers],
  requireBotPermissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction, client, { db }) {
    const userId = interaction.options.getString('user_id', true);

    await interaction.guild.bans.remove(userId, `Unbanned by ${interaction.user.tag}`);

    if (db.dbEnabled()) {
      await db.logPunishment({
        guildId: interaction.guildId,
        userId,
        moderatorId: interaction.user.id,
        type: 'unban',
        reason: 'Unban',
        active: 0
      });
    }

    await interaction.reply({ content: `Unbanned user ${userId}.` });
  }
};
