require('dotenv').config();

const path = require('path');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  StringSelectMenuBuilder
} = require('discord.js');
const { loadCommands } = require('./lib/command-loader');
const db = require('./lib/db');
const { canAccessCommand } = require('./lib/permissions');
const { buildHelpEmbed, buildCategoryOptions } = require('./lib/help');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();
const commands = loadCommands(path.join(__dirname, 'commands'));
for (const command of commands) {
  client.commands.set(command.data.name, command);
}

async function checkAccess(interaction, command) {
  if (command.guildOnly && !interaction.inGuild()) {
    await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
    return false;
  }

  if (interaction.inGuild()) {
    if (!canAccessCommand(interaction.member, command)) {
      await interaction.reply({ content: 'You do not have the required role for this command.', ephemeral: true });
      return false;
    }

    if (command.requireMemberPermissions && command.requireMemberPermissions.length > 0) {
      const missing = interaction.memberPermissions.missing(command.requireMemberPermissions);
      if (missing.length > 0) {
        await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        return false;
      }
    }

    if (command.requireBotPermissions && command.requireBotPermissions.length > 0) {
      const me = interaction.guild.members.me;
      if (!me) {
        await interaction.reply({ content: 'Bot permissions are not available yet.', ephemeral: true });
        return false;
      }
      const missing = me.permissions.missing(command.requireBotPermissions);
      if (missing.length > 0) {
        await interaction.reply({ content: 'I am missing required permissions to run this command.', ephemeral: true });
        return false;
      }
    }
  }

  return true;
}

client.once('ready', async () => {
  let dbReady = false;
  try {
    dbReady = await db.initDb();
  } catch (error) {
    console.error('Database init failed:', error.message);
  }

  console.log(`Logged in as ${client.user.tag}. DB ready: ${dbReady}`);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    const allowed = await checkAccess(interaction, command);
    if (!allowed) return;

    try {
      await command.execute(interaction, client, { db });
    } catch (error) {
      console.error(`Command error (${command.data.name}):`, error);
      const reply = { content: 'Something went wrong while running that command.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
    return;
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'help-menu') {
    const category = interaction.values[0];
    const embed = buildHelpEmbed(client.commands, category);
    await interaction.update({ embeds: [embed] });
    return;
  }

  if (interaction.isButton() && interaction.customId === 'help-close') {
    await interaction.update({ content: 'Help closed.', embeds: [], components: [] });
    return;
  }

  if (interaction.isButton() && interaction.customId === 'verify-role') {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: 'This button only works in a server.', ephemeral: true });
      return;
    }

    if (!db.dbEnabled()) {
      await interaction.reply({ content: 'Verification is not configured yet.', ephemeral: true });
      return;
    }

    const config = await db.getGuildConfig(interaction.guildId);
    if (!config || !config.verify_role_id) {
      await interaction.reply({ content: 'Verification role is not configured.', ephemeral: true });
      return;
    }

    const role = interaction.guild.roles.cache.get(config.verify_role_id);
    if (!role) {
      await interaction.reply({ content: 'Verification role no longer exists.', ephemeral: true });
      return;
    }

    const me = interaction.guild.members.me;
    if (!me || !me.permissions.has('ManageRoles')) {
      await interaction.reply({ content: 'I need Manage Roles permission to verify users.', ephemeral: true });
      return;
    }

    try {
      await interaction.member.roles.add(role, 'Verification');
      await interaction.reply({ content: 'You are now verified.', ephemeral: true });
    } catch (error) {
      console.error('Verify role error:', error);
      await interaction.reply({ content: 'Failed to assign the verification role.', ephemeral: true });
    }
    return;
  }
});

const menuRow = new ActionRowBuilder().addComponents(
  new StringSelectMenuBuilder()
    .setCustomId('help-menu')
    .setPlaceholder('Select a category')
    .addOptions(buildCategoryOptions(client.commands))
);
const closeRow = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId('help-close')
    .setStyle(ButtonStyle.Secondary)
    .setLabel('Close')
);

client.helpComponents = [menuRow, closeRow];

const token = process.env.DISCORD_TOKEN || process.env.TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN or TOKEN in environment.');
  process.exit(1);
}

client.login(token);
