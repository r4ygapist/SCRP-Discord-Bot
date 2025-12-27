const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { permissionsConfig, getMemberTierIndex, describeHierarchy } = require('../../lib/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('permissions')
    .setDescription('Show permission tiers and folder access')
    .setDMPermission(false),
  category: 'admin',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction) {
    const tiers = describeHierarchy();
    const lines = tiers.map((tier, index) => {
      const roles = tier.roles.length ? tier.roles.map((id) => `<@&${id}>`).join(' ') : 'none';
      const users = tier.users.length ? tier.users.map((id) => `<@${id}>`).join(' ') : 'none';
      return `#${index + 1} ${tier.name} — roles: ${roles} — users: ${users}`;
    });

    const folderLines = Object.entries(permissionsConfig.folders).map(
      ([folder, rule]) => `${folder}: ${rule.requiredTier || 'open'}`
    );

    const memberTierIndex = getMemberTierIndex(interaction.member);
    const memberTier = memberTierIndex === null ? 'none' : tiers[memberTierIndex].name;

    const embed = new EmbedBuilder()
      .setTitle('Permission Tiers')
      .setColor(0x7c3aed)
      .addFields(
        { name: 'Your tier', value: memberTier, inline: true },
        { name: 'Folder access', value: folderLines.join('\n') || 'None', inline: false },
        { name: 'Hierarchy', value: lines.join('\n') || 'None', inline: false }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
