const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Show info about a user')
    .addUserOption((option) =>
      option.setName('user').setDescription('User to look up')
    )
    .setDMPermission(false),
  category: 'general',
  guildOnly: true,
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const embed = new EmbedBuilder()
      .setTitle(user.tag)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setColor(0x22c55e)
      .addFields(
        { name: 'User ID', value: user.id, inline: true },
        { name: 'Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true }
      );

    if (member) {
      embed.addFields(
        { name: 'Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`, inline: true },
        { name: 'Roles', value: `${member.roles.cache.size - 1}`, inline: true }
      );
    }

    await interaction.reply({ embeds: [embed] });
  }
};
