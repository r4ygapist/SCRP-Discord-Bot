const { EmbedBuilder } = require('discord.js');

function collectCategories(commands) {
  const map = new Map();
  for (const command of commands.values()) {
    const category = command.category || 'general';
    if (!map.has(category)) {
      map.set(category, []);
    }
    map.get(category).push(command);
  }

  for (const entries of map.values()) {
    entries.sort((a, b) => a.data.name.localeCompare(b.data.name));
  }

  return map;
}

function buildHelpEmbed(commands, category) {
  const categories = collectCategories(commands);
  const list = category && categories.has(category) ? [category] : Array.from(categories.keys());

  const embed = new EmbedBuilder()
    .setTitle('Command Help')
    .setDescription('Use the menu to switch categories.')
    .setColor(0x4f46e5);

  for (const cat of list) {
    const commandsInCategory = categories.get(cat) || [];
    const summary = commandsInCategory
      .map((cmd) => `/${cmd.data.name} — ${cmd.data.description}`)
      .join('\n') || 'No commands found.';
    embed.addFields({ name: cat, value: summary.slice(0, 1024) });
  }

  return embed;
}

function buildCategoryOptions(commands) {
  const categories = collectCategories(commands);
  return Array.from(categories.keys()).map((category) => ({
    label: category,
    value: category
  }));
}

module.exports = {
  buildHelpEmbed,
  buildCategoryOptions
};
