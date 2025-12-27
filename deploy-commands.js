require('dotenv').config();

const path = require('path');
const { REST, Routes } = require('discord.js');
const { loadCommands } = require('./lib/command-loader');

const token = process.env.DISCORD_TOKEN || process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const clearGlobalOnGuild = ['1', 'true', 'yes'].includes(String(process.env.CLEAR_GLOBAL_ON_GUILD || '').toLowerCase());
const clearGuildIds = String(process.env.CLEAR_GUILD_IDS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

if (!token || !clientId) {
  console.error('Missing DISCORD_TOKEN/TOKEN or CLIENT_ID in environment.');
  process.exit(1);
}

const commands = loadCommands(path.join(__dirname, 'commands')).map((cmd) => cmd.data.toJSON());
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log(`Deployed ${commands.length} guild commands to ${guildId}.`);

      if (clearGlobalOnGuild) {
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log('Cleared global commands.');
      }
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log(`Deployed ${commands.length} global commands.`);

      if (clearGuildIds.length > 0) {
        for (const id of clearGuildIds) {
          await rest.put(Routes.applicationGuildCommands(clientId, id), { body: [] });
          console.log(`Cleared guild commands for ${id}.`);
        }
      }
    }
  } catch (error) {
    console.error('Command deploy failed:', error);
    process.exit(1);
  }
})();
