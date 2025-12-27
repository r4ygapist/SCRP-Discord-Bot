const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Show info about the bot')
    .setDMPermission(true),
  category: 'general',
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('Southern Cali Bot')
      .setDescription('Moderation and utility bot running on Lodestone hosting.')
      .setColor(0x10b981)
      .addFields(
        { name: 'Uptime', value: `<t:${Math.floor(client.readyTimestamp / 1000)}:R>`, inline: true },
        { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true }
      )
      .setFooter({ text: `Logged in as ${client.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  }
};
