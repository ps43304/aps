const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    brand_id INTEGER NOT NULL,
    status INTEGER DEFAULT 1,
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) console.error('Error creating table:', err.message);
});

const insertModal = (name, brand_id, callback) => {
    db.run("INSERT INTO models (name, brand_id) VALUES (?, ?)", [name, brand_id], function(err) {
      if (err) {
        console.error("Error inserting:", err.message);
        callback(err, null);
      } else {
        callback(null, { id: this.lastID, name });
      }
    });
};

const deleteBrand = (id, callback) => {
  db.run(
    "UPDATE brands SET status = ? WHERE id = ?",
    [0, id],
    function (err) {
      if (err) {
        console.error("Error updating brand:", err.message);
        callback(err, null);
      } else {
        if (this.changes > 0) {
          console.log("Brand updated successfully!");
          callback(null, { success: true, message : 'Delete Successfuly'  });
        } else {
          console.log("No brand found with the given name.");
          callback(null, { success: false, message: "Something Wrong try again" });
        }
      }
    }
  );
};

const editBrand = (name, id, callback) => {
  db.run(
    "UPDATE brands SET name = ? WHERE id = ?",
    [name, id],
    function (err) {
      if (err) {
        console.error("Error updating brand:", err.message);
        callback(err, null);
      } else {
        if (this.changes > 0) {
          console.log("Brand updated successfully!");
          callback(null, { success: true, message : 'Delete Successfuly'  });
        } else {
          console.log("No brand found with the given name.");
          callback(null, { success: false, message: "Something Wrong try again" });
        }
      }
    }
  );
};

function getAllBrandsInModal(callback) {
    let query = "SELECT * FROM brands where status = ? ORDER BY name ASC";
    let type  = [1];
    db.all(query, type, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
}
module.exports = { db, insertModal, getAllBrandsInModal, deleteBrand, editBrand };