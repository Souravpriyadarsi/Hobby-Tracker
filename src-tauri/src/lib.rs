use tauri_plugin_sql::{Migration, MigrationKind};

const MIGRATION_V1: &str = r#"
CREATE TABLE hobbies (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  icon              TEXT NOT NULL DEFAULT '🎯',
  color             TEXT NOT NULL DEFAULT '#6366f1',
  daily_goal_minutes INTEGER,
  track_streak      INTEGER NOT NULL DEFAULT 1,
  archived          INTEGER NOT NULL DEFAULT 0,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL
);

CREATE TABLE sessions (
  id               TEXT PRIMARY KEY,
  hobby_id         TEXT NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
  started_at       TEXT NOT NULL,
  ended_at         TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  note             TEXT NOT NULL DEFAULT '',
  created_at       TEXT NOT NULL
);
CREATE INDEX idx_sessions_hobby_started ON sessions(hobby_id, started_at);

CREATE TABLE daily_checks (
  id         TEXT PRIMARY KEY,
  hobby_id   TEXT NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
  date       TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(hobby_id, date)
);

-- Stub tables for later milestones (collections, journal). No UI yet.
CREATE TABLE collections (
  id         TEXT PRIMARY KEY,
  hobby_id   TEXT NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  kind       TEXT NOT NULL DEFAULT 'generic',
  schema     TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);

CREATE TABLE collection_items (
  id            TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  fields        TEXT NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT '',
  rating        INTEGER,
  created_at    TEXT NOT NULL
);

CREATE TABLE journal_entries (
  id         TEXT PRIMARY KEY,
  hobby_id   TEXT NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  date       TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE attachments (
  id         TEXT PRIMARY KEY,
  entry_id   TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  path       TEXT NOT NULL,
  kind       TEXT NOT NULL DEFAULT 'file',
  created_at TEXT NOT NULL
);
"#;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: MIGRATION_V1,
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:hobby.db", migrations)
                .build(),
        )
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
