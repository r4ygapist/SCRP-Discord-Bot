const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Show a user avatar')
    .addUserOption((option) =>
      option.setName('user').setDescription('User to view').setRequired(false)
    )
    .setDMPermission(true),
  category: 'general',
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s avatar`)
      .setImage(user.displayAvatarURL({ size: 1024 }))
      .setColor(0x3b82f6);

    await interaction.reply({ embeds: [embed] });
  }
};
