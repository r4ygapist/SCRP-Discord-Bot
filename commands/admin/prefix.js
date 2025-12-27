const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('prefix')
    .setDescription('Get or set the command prefix stored in the database')
    .addStringOption((option) =>
      option.setName('value').setDescription('New prefix value')
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

    const value = interaction.options.getString('value');
    if (!value) {
      const config = await db.getGuildConfig(interaction.guildId);
      await interaction.reply({ content: `Current prefix: ${config.prefix || '!'}`, ephemeral: true });
      return;
    }

    const config = await db.setGuildConfig(interaction.guildId, { prefix: value });
    await interaction.reply({ content: `Prefix updated to ${config.prefix}.`, ephemeral: true });
  }
};
