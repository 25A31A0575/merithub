const Database = require('better-sqlite3');
const path = require('path');

// Store the SQLite database file in the database folder
const dbPath = path.join(__dirname, 'showcase.db');
const db = new Database(dbPath);

// Enable WAL mode (Write-Ahead Logging) for better performance and reliability
db.pragma('journal_mode = WAL');

module.exports = db;
