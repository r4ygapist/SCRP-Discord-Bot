const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete messages in a channel')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addUserOption((option) =>
      option.setName('user').setDescription('Only delete messages from this user')
    )
    .setDMPermission(false),
  category: 'moderation',
  guildOnly: true,
  requireMemberPermissions: [PermissionFlagsBits.ManageMessages],
  requireBotPermissions: [PermissionFlagsBits.ManageMessages],
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount', true);
    const user = interaction.options.getUser('user');
    const channel = interaction.channel;

    let deleted = 0;

    if (user) {
      const messages = await channel.messages.fetch({ limit: 100 });
      const filtered = messages.filter((msg) => msg.author.id === user.id).first(amount);
      if (!filtered || filtered.length === 0) {
        await interaction.reply({ content: 'No messages found for that user.', ephemeral: true });
        return;
      }
      const results = await channel.bulkDelete(filtered, true);
      deleted = results.size;
    } else {
      const results = await channel.bulkDelete(amount, true);
      deleted = results.size;
    }

    await interaction.reply({ content: `Deleted ${deleted} message(s).`, ephemeral: true });
  }
};
