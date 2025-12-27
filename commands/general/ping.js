const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency')
    .setDMPermission(true),
  category: 'general',
  async execute(interaction, client) {
    const ws = client.ws.ping;
    await interaction.reply({ content: `Pong! WS: ${ws}ms` });
  }
};
