const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function parseIds(input) {
  return Array.from(new Set(
    String(input)
      .split(/[\s,]+/)
      .map((value) => value.trim())
      .filter(Boolean)
  ));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('masskick')
    .setDescription('Kick multiple users by ID')
    .addStringOption((option) =>
      option
        .setName('user_ids')
        .setDescription('Comma or space-separated user IDs')
        .setRequired(true)
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
    const ids = parseIds(interaction.options.getString('user_ids', true));
    const reason = interaction.options.getString('reason') || 'Mass kick';

    let success = 0;
    let failed = 0;

    for (const userId of ids) {
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!member || !member.kickable) {
        failed += 1;
        continue;
      }
      try {
        await member.kick(reason);
        success += 1;

        if (db.dbEnabled()) {
          await db.logPunishment({
            guildId: interaction.guildId,
            userId,
            moderatorId: interaction.user.id,
            type: 'masskick',
            reason,
            active: 1
          });
        }
      } catch (error) {
        failed += 1;
      }
    }

    await interaction.editReply({ content: `Mass kick complete. Success: ${success}, Failed: ${failed}.` });
  }
};
