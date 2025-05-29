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

const deleteModel = (id, callback) => {
  db.run(
    "UPDATE models SET status = ? WHERE id = ?",
    [0, id],
    function (err) {
      if (err) {
        console.error("Error updating brand:", err.message);
        callback(err, null);
      } else {
        if (this.changes > 0) {
          callback(null, { success: true, message : 'Delete Successfuly'  });
        } else {
          callback(null, { success: false, message: "Something Wrong try again" });
        }
      }
    }
  );
};

const editModel = (name, id, brandSelect,  callback) => {
  let type = [name, brandSelect, id];
  db.run(
    "UPDATE models SET name = ?, brand_id = ? WHERE id = ?",
    type,
    function (err) {
      if (err) {
        console.error("Error updating brand:", err.message);
        callback(err, null);
      } else {
        if (this.changes > 0) {
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

function getAllModels(param, callback) {
  let query = `SELECT models.*, models.name as modelName, models.name as modelName, brands.id as brandId, brands.name as brandName FROM models LEFT JOIN brands ON brands.id = models.brand_id WHERE models.status = ?`;
  let type  = [1];

  if (param) {
      if (Array.isArray(param.dateRange) && param.dateRange.length === 2) {
          query += " AND (models.created_at >= ? AND models.created_at <= ?)";
          type.push(param.dateRange[0].trim() + ' 00:00:00', param.dateRange[1].trim() + ' 23:59:59');
      }

      if (typeof param.search !== 'undefined' && param.search) {
          query += ` AND (models.name LIKE ?  OR brandName LIKE ?  )`;
          type.push(`${param.search}%`);
      }
  }

  db.all(query, type, (err, rows) => {
      if (err) {
          return callback(err);
      }
      callback(null, rows);
  });
}

function existModel(param, callback) {
  let query = "SELECT count(*) as count FROM models where status = ? AND name LIKE ? AND brand_id = ?";
  let type  = [1, `${param?.name}%`, param?.brand_id ];
  db.get(query, type, (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
}


module.exports = { db, insertModal, getAllModels, getAllBrandsInModal, deleteModel, editModel, existModel };