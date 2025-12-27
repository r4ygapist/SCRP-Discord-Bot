const task = process.argv[2];

if (task === 'deploy') {
  require('./deploy-commands');
} else if (task === 'start') {
  require('./index');
} else {
  console.error('Usage: node run <deploy|start>');
  process.exit(1);
}
