const permissionsConfig = require('../config/permissions');

function getTierIndex(name) {
  return permissionsConfig.hierarchy.findIndex((tier) => tier.name === name);
}

function getMemberTierIndex(member) {
  if (!member) return null;

  for (let i = 0; i < permissionsConfig.hierarchy.length; i += 1) {
    const tier = permissionsConfig.hierarchy[i];
    const roleMatch = tier.roles && tier.roles.some((roleId) => member.roles.cache.has(roleId));
    const userMatch = tier.users && tier.users.includes(member.id);
    if (roleMatch || userMatch) {
      return i;
    }
  }

  return null;
}

function canAccessCommand(member, command) {
  const folder = command.category || command.folder || 'general';
  const folderRule = permissionsConfig.folders[folder] || {};
  const requiredTier = command.requiredTier || folderRule.requiredTier;

  if (!requiredTier) {
    return true;
  }

  const requiredIndex = getTierIndex(requiredTier);
  if (requiredIndex === -1) {
    return true;
  }

  const memberIndex = getMemberTierIndex(member);
  if (memberIndex === null) {
    return false;
  }

  return memberIndex <= requiredIndex;
}

function describeHierarchy() {
  return permissionsConfig.hierarchy.map((tier) => ({
    name: tier.name,
    roles: tier.roles || [],
    users: tier.users || []
  }));
}

module.exports = {
  permissionsConfig,
  getMemberTierIndex,
  canAccessCommand,
  describeHierarchy
};
