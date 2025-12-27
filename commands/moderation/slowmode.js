const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode in a channel')
    .addIntegerOption((option) =>
      option
        .setName('seconds')
        .setDescription('Seconds between messages (0-21600)')
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option.setName('channel').setDescription('Target channel')
    )
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.ManageChannels],
  requireBotPermissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds', true);
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    if (!channel || !channel.isTextBased()) {
      await interaction.reply({ content: 'Select a text channel.', ephemeral: true });
      return;
    }

    await channel.setRateLimitPerUser(seconds, `Slowmode set by ${interaction.user.tag}`);
    await interaction.reply({ content: `Slowmode set to ${seconds}s in ${channel}.` });
  }
};
