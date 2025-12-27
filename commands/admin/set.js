const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set')
    .setDescription('Update bot configuration values')
    .addRoleOption((option) =>
      option.setName('mod_role').setDescription('Moderator role')
    )
    .addChannelOption((option) =>
      option.setName('log_channel').setDescription('Moderation log channel')
    )
    .addChannelOption((option) =>
      option.setName('verify_channel').setDescription('Verification channel')
    )
    .addRoleOption((option) =>
      option.setName('verify_role').setDescription('Verification role')
    )
    .setDMPermission(false),
  category: 'admin',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction, client, { db }) {
    if (!db.dbEnabled()) {
      await interaction.reply({ content: 'Database is not configured yet.', ephemeral: true });
      return;
    }

    const modRole = interaction.options.getRole('mod_role');
    const logChannel = interaction.options.getChannel('log_channel');
    const verifyChannel = interaction.options.getChannel('verify_channel');
    const verifyRole = interaction.options.getRole('verify_role');

    const updates = {
      mod_role_id: modRole?.id,
      log_channel_id: logChannel?.id,
      verify_channel_id: verifyChannel?.id,
      verify_role_id: verifyRole?.id
    };

    if (!modRole && !logChannel && !verifyChannel && !verifyRole) {
      await interaction.reply({ content: 'Provide at least one setting to update.', ephemeral: true });
      return;
    }

    const config = await db.setGuildConfig(interaction.guildId, updates);

    await interaction.reply({
      content: `Settings updated. Mod role: ${config.mod_role_id || 'none'}, Log channel: ${config.log_channel_id || 'none'}, Verify channel: ${config.verify_channel_id || 'none'}, Verify role: ${config.verify_role_id || 'none'}`,
      ephemeral: true
    });
  }
};
