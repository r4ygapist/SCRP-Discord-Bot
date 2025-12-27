const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verifypost')
    .setDescription('Post the verification message')
    .addChannelOption((option) =>
      option.setName('channel').setDescription('Optional channel override')
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

    const config = await db.getGuildConfig(interaction.guildId);
    const channel = interaction.options.getChannel('channel') ||
      (config.verify_channel_id ? interaction.guild.channels.cache.get(config.verify_channel_id) : null);

    if (!channel || !channel.isTextBased()) {
      await interaction.reply({ content: 'Verification channel is not configured.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Verification')
      .setDescription('Click the button below to verify and unlock the server.')
      .setColor(0x10b981);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('verify-role')
        .setLabel('Verify')
        .setStyle(ButtonStyle.Success)
    );

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: `Verification message posted in ${channel}.`, ephemeral: true });
  }
};
