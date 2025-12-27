const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getid')
    .setDescription('Get the ID of a user, role, or channel')
    .addUserOption((option) =>
      option.setName('user').setDescription('User to get ID for')
    )
    .addRoleOption((option) =>
      option.setName('role').setDescription('Role to get ID for')
    )
    .addChannelOption((option) =>
      option.setName('channel').setDescription('Channel to get ID for')
    )
    .setDMPermission(true),
  category: 'general',
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const channel = interaction.options.getChannel('channel');

    if (!user && !role && !channel) {
      await interaction.reply({ content: 'Provide a user, role, or channel to get an ID.', ephemeral: true });
      return;
    }

    const lines = [];
    if (user) lines.push(`User: ${user.tag} — ${user.id}`);
    if (role) lines.push(`Role: ${role.name} — ${role.id}`);
    if (channel) lines.push(`Channel: ${channel.name} — ${channel.id}`);

    await interaction.reply({ content: lines.join('\n') });
  }
};
