const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('punishmentwipe')
    .setDescription('Delete all punishment history for a user')
    .addUserOption((option) =>
      option.setName('user').setDescription('User to wipe').setRequired(true)
    )
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requiredTier: 'admin',
  requireMemberPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client, { db }) {
    if (!db.dbEnabled()) {
      await interaction.reply({ content: 'Database is not configured for punishment wipes.', ephemeral: true });
      return;
    }

    const user = interaction.options.getUser('user', true);
    await db.wipePunishments({ guildId: interaction.guildId, userId: user.id });

    await interaction.reply({ content: `Punishment history wiped for ${user.tag}.` });
  }
};
