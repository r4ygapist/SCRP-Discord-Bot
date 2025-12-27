const { SlashCommandBuilder } = require('discord.js');
const { buildHelpEmbed } = require('../../lib/help');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show the bot command list')
    .setDMPermission(true),
  category: 'general',
  async execute(interaction, client) {
    const embed = buildHelpEmbed(client.commands);
    const components = client.helpComponents || [];

    await interaction.reply({ embeds: [embed], components, ephemeral: true });
  }
};
