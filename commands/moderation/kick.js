const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption((option) =>
      option.setName('user').setDescription('User to kick').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Reason for kick')
    )
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.KickMembers],
  requireBotPermissions: [PermissionFlagsBits.KickMembers],
  async execute(interaction, client, { db }) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (user.id === interaction.user.id) {
      await interaction.reply({ content: 'You cannot kick yourself.', ephemeral: true });
      return;
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member || !member.kickable) {
      await interaction.reply({ content: 'I cannot kick that user.', ephemeral: true });
      return;
    }

    await member.kick(reason);

    if (db.dbEnabled()) {
      await db.logPunishment({
        guildId: interaction.guildId,
        userId: user.id,
        moderatorId: interaction.user.id,
        type: 'kick',
        reason,
        active: 1
      });
    }

    await interaction.reply({ content: `Kicked ${user.tag}.` });
  }
};
