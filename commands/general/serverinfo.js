const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show server information')
    .setDMPermission(false),
  category: 'general',
  guildOnly: true,
  async execute(interaction) {
    const { guild } = interaction;
    const owner = await guild.fetchOwner();

    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .setColor(0x0ea5e9)
      .addFields(
        { name: 'Owner', value: owner.user.tag, inline: true },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  }
};
