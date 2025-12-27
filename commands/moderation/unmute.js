const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove a timeout from a user')
    .addUserOption((option) =>
      option.setName('user').setDescription('User to unmute').setRequired(true)
    )
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.ModerateMembers],
  requireBotPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client, { db }) {
    const user = interaction.options.getUser('user', true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member || !member.moderatable) {
      await interaction.reply({ content: 'I cannot unmute that user.', ephemeral: true });
      return;
    }

    await member.timeout(null, 'Timeout cleared');

    if (db.dbEnabled()) {
      await db.logPunishment({
        guildId: interaction.guildId,
        userId: user.id,
        moderatorId: interaction.user.id,
        type: 'unmute',
        reason: 'Timeout cleared',
        active: 0
      });
    }

    await interaction.reply({ content: `Timeout removed for ${user.tag}.` });
  }
};
