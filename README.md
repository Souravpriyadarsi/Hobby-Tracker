# Hobby Tracker

One place to track every hobby you have — time spent, streaks, and notes.
A small, offline-first desktop app.

## Features

- **Timers** — an app-wide stopwatch with start / pause / resume / stop. An
  active timer survives a reload, and stopping it writes a session.
- **Manual entries** — log time after the fact with flexible input
  (`45m`, `1h 30m`, `1:30`, or a bare number of minutes).
- **Streaks & check-ins** — a GitHub-style heatmap per hobby, plus current and
  longest streak from the days you logged time or ticked the daily check-in.
- **Dashboard** — time today, weekly totals, time split by hobby, and recent
  sessions.
- **Backup / restore / reset** — export everything to a JSON file and load it
  back on another machine, from Settings.
- **Light and dark themes** — a warm pastel Material 3 palette.

## Stack

| Concern  | Choice                                              |
| -------- | --------------------------------------------------- |
| Shell    | Tauri 2 (small installers, native webview)          |
| UI       | React 19 · TypeScript · Vite                        |
| Styling  | Tailwind CSS v4, Material 3 design tokens           |
| State    | Zustand                                             |
| Charts   | Recharts                                            |
| Storage  | SQLite (desktop) · localStorage (browser dev)       |

## Running it

```bash
npm install
```

**Desktop app** (SQLite, native file dialogs):

```bash
npm run tauri dev
```

The first run compiles the Rust side and takes a few minutes. Requires a Rust
toolchain — see [Tauri's prerequisites](https://tauri.app/start/prerequisites/).

**Browser only** (no Rust toolchain needed):

```bash
npm run dev
```

Everything works in the browser, backed by `localStorage` instead of SQLite.
Backups still download as a normal file. Browser data is separate from the
desktop app's — use Backup and Restore to move between them.

### Other scripts

```bash
npm run build      # typecheck + production bundle
npm run lint       # oxlint
npm run tauri build # produce installers (.exe / .msi / .dmg)
```

## Where your data lives

| Mode    | Location                                              |
| ------- | ----------------------------------------------------- |
| Desktop | `hobby.db` in the OS app-data folder for `com.hobbytracker.app` |
| Browser | `localStorage` under `hobby-tracker.data`             |

Nothing is sent anywhere. There is no network access, no account, no telemetry.

## Project layout

```
src/
  db/          storage backends (SQLite + localStorage) behind one interface
  store/       Zustand stores: data, timer, UI
  lib/         date, duration, streak and stats helpers
  components/  UI primitives, layout, charts, heatmap
  pages/       Dashboard, Hobbies, Hobby detail, Settings
src-tauri/     Rust shell, SQLite migrations, backup file commands
```

## Roadmap

Collections (books read, films watched, recipes, craft projects) and journal
entries with photo/file attachments are next — their tables already exist in
the schema.
