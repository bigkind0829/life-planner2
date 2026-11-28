# Life Planner Local Dashboard

Zero-dependency local web checkboard (`127.0.0.1:4310`) reading and writing `plans/YYYY/`, `profile/wealth.md`, and `projects/*/index.md` directly (100% compatible with Obsidian and Antigravity's 06:00 auto-replan).

## Run

- **Silent 1-click (no console window)**: Double-click `dashboard/start-silent.vbs`
- **Desktop shortcut & auto-start on boot**: `powershell -ExecutionPolicy Bypass -File dashboard\install-shortcut.ps1 -AlsoStartup`
- **Terminal / Debug**: `node dashboard/server.js` (or `dashboard/start.bat`)
- Custom port: `LIFEPLANNER_PORT=4320 node dashboard/server.js`

## Privacy & Security

- Binds strictly to `127.0.0.1` (localhost only).
- Contains zero personal data or hardcoded calendar IDs; reads local files at runtime only.
