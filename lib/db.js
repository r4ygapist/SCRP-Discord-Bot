const mysql = require('mysql2/promise');

let pool = null;

function hasDbConfig() {
  return Boolean(process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME);
}

async function initDb() {
  if (!hasDbConfig()) {
    return false;
  }

  const port = Number(process.env.DB_PORT || 3306);
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port,
    waitForConnections: true,
    connectionLimit: 5,
    enableKeepAlive: true
  });

  await pool.execute('SELECT 1');

  await pool.execute(
    `CREATE TABLE IF NOT EXISTS guild_config (
      guild_id BIGINT UNSIGNED PRIMARY KEY,
      prefix VARCHAR(10) DEFAULT '!',
      mod_role_id BIGINT UNSIGNED NULL,
      log_channel_id BIGINT UNSIGNED NULL,
      verify_channel_id BIGINT UNSIGNED NULL,
      verify_role_id BIGINT UNSIGNED NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  );

  await pool.execute(
    `CREATE TABLE IF NOT EXISTS punishments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guild_id BIGINT UNSIGNED NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      moderator_id BIGINT UNSIGNED NOT NULL,
      type VARCHAR(32) NOT NULL,
      reason VARCHAR(512) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NULL,
      active TINYINT(1) DEFAULT 1
    )`
  );

  return true;
}

function dbEnabled() {
  return Boolean(pool);
}

async function getGuildConfig(guildId) {
  if (!pool) return null;
  const [rows] = await pool.execute('SELECT * FROM guild_config WHERE guild_id = ? LIMIT 1', [guildId]);
  if (rows.length > 0) return rows[0];

  await pool.execute('INSERT INTO guild_config (guild_id) VALUES (?)', [guildId]);
  const [fresh] = await pool.execute('SELECT * FROM guild_config WHERE guild_id = ? LIMIT 1', [guildId]);
  return fresh[0];
}

async function setGuildConfig(guildId, values) {
  if (!pool) return null;
  const entries = Object.entries(values).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return getGuildConfig(guildId);

  const columns = entries.map(([key]) => `${key} = VALUES(${key})`).join(', ');
  const keys = entries.map(([key]) => key).join(', ');
  const placeholders = entries.map(() => '?').join(', ');
  const params = entries.map(([, value]) => value);

  await pool.execute(
    `INSERT INTO guild_config (guild_id, ${keys}) VALUES (?, ${placeholders})
     ON DUPLICATE KEY UPDATE ${columns}`,
    [guildId, ...params]
  );

  return getGuildConfig(guildId);
}

async function logPunishment({ guildId, userId, moderatorId, type, reason, expiresAt, active = 1 }) {
  if (!pool) return null;
  await pool.execute(
    `INSERT INTO punishments (guild_id, user_id, moderator_id, type, reason, expires_at, active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [guildId, userId, moderatorId, type, reason || null, expiresAt || null, active]
  );
}

async function getPunishments({ guildId, userId, limit = 10 }) {
  if (!pool) return [];
  const [rows] = await pool.execute(
    `SELECT * FROM punishments
     WHERE guild_id = ? AND user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [guildId, userId, Number(limit)]
  );
  return rows;
}

async function updatePunishment({ id, reason, expiresAt, active }) {
  if (!pool) return null;
  const fields = [];
  const params = [];

  if (reason !== undefined) {
    fields.push('reason = ?');
    params.push(reason || null);
  }

  if (expiresAt !== undefined) {
    fields.push('expires_at = ?');
    params.push(expiresAt || null);
  }

  if (active !== undefined) {
    fields.push('active = ?');
    params.push(active ? 1 : 0);
  }

  if (fields.length === 0) return null;

  params.push(id);
  await pool.execute(`UPDATE punishments SET ${fields.join(', ')} WHERE id = ?`, params);
}

async function wipePunishments({ guildId, userId }) {
  if (!pool) return null;
  await pool.execute('DELETE FROM punishments WHERE guild_id = ? AND user_id = ?', [guildId, userId]);
}

async function getPunishmentCounts(guildId) {
  if (!pool) return null;
  const [rows] = await pool.execute(
    `SELECT type, COUNT(*) AS count
     FROM punishments
     WHERE guild_id = ?
     GROUP BY type`,
    [guildId]
  );
  return rows;
}

module.exports = {
  initDb,
  dbEnabled,
  getGuildConfig,
  setGuildConfig,
  logPunishment,
  getPunishments,
  updatePunishment,
  wipePunishments,
  getPunishmentCounts
};
