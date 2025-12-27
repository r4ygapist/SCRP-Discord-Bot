const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption((option) =>
      option.setName('user').setDescription('User to ban').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Reason for ban')
    )
    .addIntegerOption((option) =>
      option
        .setName('delete_days')
        .setDescription('Delete messages from last N days (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
    )
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.BanMembers],
  requireBotPermissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction, client, { db }) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete_days') || 0;

    if (user.id === interaction.user.id) {
      await interaction.reply({ content: 'You cannot ban yourself.', ephemeral: true });
      return;
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (member && !member.bannable) {
      await interaction.reply({ content: 'I cannot ban that user.', ephemeral: true });
      return;
    }

    await interaction.guild.members.ban(user, {
      reason,
      deleteMessageSeconds: deleteDays * 24 * 60 * 60
    });

    if (db.dbEnabled()) {
      await db.logPunishment({
        guildId: interaction.guildId,
        userId: user.id,
        moderatorId: interaction.user.id,
        type: 'ban',
        reason,
        active: 1
      });
    }

    await interaction.reply({ content: `Banned ${user.tag}.` });
  }
};
