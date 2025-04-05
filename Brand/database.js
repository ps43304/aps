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

db.run(`CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    status INTEGER DEFAULT 1,
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) console.error('Error creating table:', err.message);
});

const insertBrand = (name, callback) => {
    db.run("INSERT INTO brands (name) VALUES (?)", [name], function(err) {
      if (err) {
        console.error("Error inserting brand:", err.message);
        callback(err, null);
      } else {
        console.log("Brand inserted successfully!");
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

function getAllBrands(param, callback) {
    let query = "SELECT * FROM brands where status = ?";
    let type  = [1];
    if (param) {
      if(Array.isArray(param.dateRange) && param.dateRange.length === 2){
        query += " AND (created_at >= ? AND created_at <= ?)";
        type.push(param.dateRange[0].trim() + ' 00:00:00', param.dateRange[1].trim() + ' 23:59:59');
      }
      if( typeof param?.search !== 'undefined' && param?.search){
        query += ` AND name LIKE ?`;
        type.push(`${param?.search}%`);
      }
    }

    db.all(query, type, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
}

module.exports = { db, insertBrand, getAllBrands, deleteBrand, editBrand };