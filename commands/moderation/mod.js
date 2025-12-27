const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mod')
    .setDescription('Show moderation configuration')
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client, { db }) {
    if (!db.dbEnabled()) {
      await interaction.reply({ content: 'Database is not configured yet.', ephemeral: true });
      return;
    }

    const config = await db.getGuildConfig(interaction.guildId);
    const embed = new EmbedBuilder()
      .setTitle('Moderation Config')
      .setColor(0x0f172a)
      .addFields(
        { name: 'Prefix', value: config.prefix || '!', inline: true },
        { name: 'Mod Role', value: config.mod_role_id ? `<@&${config.mod_role_id}>` : 'Not set', inline: true },
        { name: 'Log Channel', value: config.log_channel_id ? `<#${config.log_channel_id}>` : 'Not set', inline: true },
        { name: 'Verify Channel', value: config.verify_channel_id ? `<#${config.verify_channel_id}>` : 'Not set', inline: true },
        { name: 'Verify Role', value: config.verify_role_id ? `<@&${config.verify_role_id}>` : 'Not set', inline: true }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
