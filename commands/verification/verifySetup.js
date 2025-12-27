const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifysetup')
    .setDescription('Configure verification role and channel')
    .addRoleOption((option) =>
      option.setName('role').setDescription('Role to grant on verification').setRequired(true)
    )
    .addChannelOption((option) =>
      option.setName('channel').setDescription('Channel to post the verify message').setRequired(true)
    )
    .setDMPermission(false),
  category: 'verification',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.ManageGuild],
  requireBotPermissions: [PermissionFlagsBits.ManageRoles],
  async execute(interaction, client, { db }) {
    if (!db.dbEnabled()) {
      await interaction.reply({ content: 'Database is not configured yet.', ephemeral: true });
      return;
    }

    const role = interaction.options.getRole('role', true);
    const channel = interaction.options.getChannel('channel', true);

    await db.setGuildConfig(interaction.guildId, {
      verify_role_id: role.id,
      verify_channel_id: channel.id
    });

    await interaction.reply({ content: `Verification set. Channel: ${channel}, Role: ${role}.`, ephemeral: true });
  }
};
