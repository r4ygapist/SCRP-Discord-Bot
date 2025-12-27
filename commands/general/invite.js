const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get the bot invite link')
    .setDMPermission(true),
  category: 'general',
  async execute(interaction, client) {
    const permissions = [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ModerateMembers,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.BanMembers,
      PermissionFlagsBits.ManageRoles
    ];

    const invite = await client.generateInvite({
      scopes: ['bot', 'applications.commands'],
      permissions
    });

    const embed = new EmbedBuilder()
      .setTitle('Invite Southern Cali Bot')
      .setDescription(`[Click here to invite](${invite})`)
      .setColor(0x6366f1);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
