const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption((option) =>
      option.setName('user').setDescription('User to warn').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Reason for warning')
    )
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client, { db }) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (db.dbEnabled()) {
      await db.logPunishment({
        guildId: interaction.guildId,
        userId: user.id,
        moderatorId: interaction.user.id,
        type: 'warn',
        reason,
        active: 1
      });
    }

    try {
      await user.send({ content: `You were warned in ${interaction.guild.name}: ${reason}` });
    } catch (error) {
      // Ignore DM failures.
    }

    await interaction.reply({ content: `Warned ${user.tag}.` });
  }
};
