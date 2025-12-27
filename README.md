# Southern Cali Bot

Discord.js v14 bot with slash commands, folder-based permissions, and Lodestone deployment.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in values.
3. Deploy slash commands:
   ```bash
   npm run deploy
   ```
4. Start the bot:
   ```bash
   npm start
   ```

## Permissions (Role Hierarchy)

Permissions are based on folders and tiered roles, defined in `config/permissions.js`:

- `owner` > `admin` > `mod` > `helper`
- Folder access:
  - `general`: open
  - `moderation`: `mod`+
  - `admin`: `admin`+
  - `verification`: `helper`+

Set role IDs (comma-separated) in `.env`:

```
OWNER_ROLE_IDS=
ADMIN_ROLE_IDS=
MOD_ROLE_IDS=
HELPER_ROLE_IDS=
OWNER_USER_IDS=
```

Higher tiers inherit lower tiers automatically.

## Lodestone Hosting Setup

1. Create a GitHub repo and push this project.
2. In Lodestone:
   - Go to **Configuration → Startup Parameters**.
   - Set **Git Repo Address** to your repo.
   - Set **Install Branch** (e.g. `main`).
   - Set **Auto Update** to `1` if you want auto pulls on restart.
3. In **Startup Parameters → Environment Variables** (or `.env` file if provided), add:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
   - `OWNER_ROLE_IDS`, `ADMIN_ROLE_IDS`, `MOD_ROLE_IDS`, `HELPER_ROLE_IDS`, `OWNER_USER_IDS`
4. Deploy slash commands by running `npm run deploy` once from the Lodestone console.
5. Start the server.

## GitHub Workflow (Recommended)

1. Initialize repo:
   ```bash
   git init
   git add .
   git commit -m "Initial bot"
   ```
2. Create GitHub repo and add remote:
   ```bash
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
3. In Lodestone, add the GitHub repo + access token.
4. Push updates locally, then restart the Lodestone server (or use auto update).

## Commands

Slash commands are in `commands/` and grouped by folder. Use `/help` for the full list.

- `general`: about, avatar, getid, help, invite, ping, serverinfo, userinfo
- `moderation`: ban, clear, dm, kick, mute, unmute, slowmode, syncnick, warn, punishmenthistory, punishmentmodify, punishmentwipe, mod, modcachestats, unban
- `admin`: globalban, unglobalban, globalkick, masskick, massglobalkick, permissions, prefix, set
- `verification`: verifysetup, verifypost
