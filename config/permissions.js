function parseIdList(input) {
  if (!input) return [];
  return String(input)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

module.exports = {
  hierarchy: [
    { name: 'owner', roles: parseIdList(process.env.OWNER_ROLE_IDS), users: parseIdList(process.env.OWNER_USER_IDS) },
    { name: 'admin', roles: parseIdList(process.env.ADMIN_ROLE_IDS) },
    { name: 'mod', roles: parseIdList(process.env.MOD_ROLE_IDS) },
    { name: 'helper', roles: parseIdList(process.env.HELPER_ROLE_IDS) }
  ],
  folders: {
    general: { requiredTier: null },
    moderation: { requiredTier: 'mod' },
    admin: { requiredTier: 'admin' },
    verification: { requiredTier: 'helper' }
  }
};
