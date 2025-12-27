const fs = require('fs');
const path = require('path');

function loadCommands(baseDir) {
  const commands = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!entry.isFile() || !entry.name.endsWith('.js')) continue;

      const command = require(fullPath);
      if (!command || !command.data || !command.execute) {
        continue;
      }

      const relPath = path.relative(baseDir, fullPath);
      const parts = relPath.split(path.sep);
      const folder = parts.length > 1 ? parts[0] : 'general';
      command.folder = command.folder || folder;
      command.category = command.category || folder;
      commands.push(command);
    }
  }

  walk(baseDir);
  return commands;
}

module.exports = {
  loadCommands
};
