const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Send a DM to a user')
    .addUserOption((option) =>
      option.setName('user').setDescription('User to DM').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('message').setDescription('Message to send').setRequired(true)
    )
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction) {
    const user = interaction.options.getUser('user', true);
    const message = interaction.options.getString('message', true);

    try {
      await user.send({ content: message });
      await interaction.reply({ content: `Sent a DM to ${user.tag}.`, ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: 'Failed to send the DM (user may have DMs closed).', ephemeral: true });
    }
  }
};
