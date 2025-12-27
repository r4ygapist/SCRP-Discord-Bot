const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('globalkick')
    .setDescription('Kick a user from every server the bot is in')
    .addStringOption((option) =>
      option.setName('user_id').setDescription('User ID to kick').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Reason for kick')
    )
    .setDMPermission(false),
  category: 'admin',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.KickMembers],
  requireBotPermissions: [PermissionFlagsBits.KickMembers],
  async execute(interaction, client, { db }) {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.options.getString('user_id', true);
    const reason = interaction.options.getString('reason') || 'Global kick';

    let success = 0;
    let failed = 0;

    for (const guild of client.guilds.cache.values()) {
      try {
        const me = guild.members.me || await guild.members.fetchMe();
        if (!me.permissions.has(PermissionFlagsBits.KickMembers)) {
          failed += 1;
          continue;
        }
        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member || !member.kickable) {
          failed += 1;
          continue;
        }
        await member.kick(reason);
        success += 1;

        if (db.dbEnabled()) {
          await db.logPunishment({
            guildId: guild.id,
            userId,
            moderatorId: interaction.user.id,
            type: 'globalkick',
            reason,
            active: 1
          });
        }
      } catch (error) {
        failed += 1;
      }
    }

    await interaction.editReply({ content: `Global kick complete. Success: ${success}, Failed: ${failed}.` });
  }
};
