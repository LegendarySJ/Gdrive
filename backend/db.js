const sqlite3 = require('sqlite3').verbose();
// Use a file-based database instead of an in-memory database
const db = new sqlite3.Database('a.db', (err) => {
    if (err) {
        console.error("Could not connect to database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS user_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        account_name TEXT,
        encryptedPrivateKey TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
});

module.exports = db;
