# Life Planner Local Dashboard

Zero-dependency local web checkboard that reads and writes `plans/YYYY/daily/*.md` and `plans/YYYY/weekly/*.md` directly (100% compatible with Obsidian and Antigravity's 06:00 auto-replan).

## Run

- **Windows 1-click**: Double-click `dashboard/start.bat`
- **Terminal**: `node dashboard/server.js` → open `http://127.0.0.1:4310`
- Optional custom port: `LIFEPLANNER_PORT=4320 node dashboard/server.js`

## Privacy & Security

- Binds strictly to `127.0.0.1` (localhost only).
- Contains zero personal data or hardcoded calendar IDs; reads local `plans/` and `profile/` files at runtime only.
