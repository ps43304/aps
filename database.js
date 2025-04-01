const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db'); // डेटाबेस फ़ाइल
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) console.error('Error creating table:', err.message);
});

const insertBrand = (name, email, callback) => {
    const sql = `INSERT INTO brands (name, created_at) VALUES (?, ?)`;
    db.run(sql, [name, email], function (err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, name, email });
    });
};

const getUsers = (callback) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows);
    });
};

module.exports = { db, insertBrand, getUsers };