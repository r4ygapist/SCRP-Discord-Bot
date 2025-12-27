const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('syncnick')
    .setDescription('Sync a user nickname to their username or set a nickname')
    .addUserOption((option) =>
      option.setName('user').setDescription('User to update').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('nickname').setDescription('Optional nickname to set')
    )
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.ManageNicknames],
  requireBotPermissions: [PermissionFlagsBits.ManageNicknames],
  async execute(interaction) {
    const user = interaction.options.getUser('user', true);
    const nickname = interaction.options.getString('nickname');

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member || !member.manageable) {
      await interaction.reply({ content: 'I cannot update that nickname.', ephemeral: true });
      return;
    }

    const targetName = nickname || user.username;
    await member.setNickname(targetName, `Synced by ${interaction.user.tag}`);

    await interaction.reply({ content: `Updated nickname for ${user.tag} to ${targetName}.` });
  }
};
