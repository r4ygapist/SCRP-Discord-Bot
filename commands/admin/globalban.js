const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('globalban')
    .setDescription('Ban a user from every server the bot is in')
    .addStringOption((option) =>
      option.setName('user_id').setDescription('User ID to ban').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Reason for ban')
    )
    .setDMPermission(false),
  category: 'admin',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.BanMembers],
  requireBotPermissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction, client, { db }) {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.options.getString('user_id', true);
    const reason = interaction.options.getString('reason') || 'Global ban';

    let success = 0;
    let failed = 0;

    for (const guild of client.guilds.cache.values()) {
      try {
        const me = guild.members.me || await guild.members.fetchMe();
        if (!me.permissions.has(PermissionFlagsBits.BanMembers)) {
          failed += 1;
          continue;
        }
        await guild.members.ban(userId, { reason });
        success += 1;

        if (db.dbEnabled()) {
          await db.logPunishment({
            guildId: guild.id,
            userId,
            moderatorId: interaction.user.id,
            type: 'globalban',
            reason,
            active: 1
          });
        }
      } catch (error) {
        failed += 1;
      }
    }

    await interaction.editReply({ content: `Global ban complete. Success: ${success}, Failed: ${failed}.` });
  }
};
