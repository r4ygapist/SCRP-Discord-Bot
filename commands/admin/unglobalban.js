const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unglobalban')
    .setDescription('Unban a user from every server the bot is in')
    .addStringOption((option) =>
      option.setName('user_id').setDescription('User ID to unban').setRequired(true)
    )
    .setDMPermission(false),
  category: 'admin',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.BanMembers],
  requireBotPermissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction, client, { db }) {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.options.getString('user_id', true);

    let success = 0;
    let failed = 0;

    for (const guild of client.guilds.cache.values()) {
      try {
        const me = guild.members.me || await guild.members.fetchMe();
        if (!me.permissions.has(PermissionFlagsBits.BanMembers)) {
          failed += 1;
          continue;
        }
        await guild.bans.remove(userId, `Global unban by ${interaction.user.tag}`);
        success += 1;

        if (db.dbEnabled()) {
          await db.logPunishment({
            guildId: guild.id,
            userId,
            moderatorId: interaction.user.id,
            type: 'unglobalban',
            reason: 'Global unban',
            active: 0
          });
        }
      } catch (error) {
        failed += 1;
      }
    }

    await interaction.editReply({ content: `Global unban complete. Success: ${success}, Failed: ${failed}.` });
  }
};
