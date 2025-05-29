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

db.run(`CREATE TABLE IF NOT EXISTS types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    brand_id INTEGER NOT NULL,
    model_id INTEGER NOT NULL,
    HSN VARCHAR(100) NOT NULL,
    status INTEGER DEFAULT 1,
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) console.error('Error creating table:', err.message);
});


const insertType = (param, callback) => {
    let {name, brand_id, model_id, HSN} = param
    db.run("INSERT INTO types (name, brand_id, model_id, HSN) VALUES (?, ?, ?, ?)", [name, brand_id, model_id, HSN], function(err) {
      if (err) {
        console.error("Error inserting:", err.message);
        callback(err, null);
      } else {
        callback(null, { id: this.lastID, name });
      }
    });
};

function getBrandByModel(param, callback) {
    let query = "SELECT name, id FROM models where brand_id = ? ORDER BY name ASC";
    let type  = [param?.brand_id];
    db.all(query, type, (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
}

function existType(param, callback) {
  let query = "SELECT count(*) as count FROM type where status = ? AND name LIKE ? AND brand_id = ? AND model_id = ?";
  let type  = [1, `${param?.name}%`, param?.brand_id, param?.model_id];
  db.get(query, type, (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
}

function getAllTypes(param, callback) {
  let query = `SELECT types.*, models.id as modelId, models.name as modelName, brands.id as brandId, brands.name as brandName FROM types JOIN brands ON brands.id = types.brand_id JOIN models ON models.id = types.model_id where types.status = ?`;
  let type  = [1];

  if (param) {
      if (Array.isArray(param.dateRange) && param.dateRange.length === 2) {
          query += " AND (types.created_at >= ? AND types.created_at <= ?)";
          type.push(param.dateRange[0].trim() + ' 00:00:00', param.dateRange[1].trim() + ' 23:59:59');
      }

      if (typeof param.search !== 'undefined' && param.search) {
          query += ` AND (models.name LIKE ? OR brandName LIKE ? OR types.name LIKE ? )`;
          let searchTerm = `${param.search}%`;
          type.push(searchTerm, searchTerm, searchTerm);
      }
  }

  db.all(query, type, (err, rows) => {
      if (err) {
          return callback(err);
      }
      callback(null, rows);
  });
}

const editTypes = (param,  callback) => {
  let type = [param.name, param.brand_id, param.model_id, param.id];
  db.run(
    "UPDATE types SET name = ?, brand_id = ?, model_id = ? WHERE id = ?",
    type,
    function (err) {
      if (err) {
        console.error("Error updating brand:", err.message);
        callback(err, null);
      } else {
        if (this.changes > 0) {
          callback(null, { success: true, message : 'Updated Successfuly'  });
        } else {
          console.log("No brand found with the given name.");
          callback(null, { success: false, message: "Something Wrong try again" });
        }
      }
    }
  );
};

const deleteType = (id, callback) => {
  db.run(
    "UPDATE types SET status = ? WHERE id = ?",
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



module.exports = { db, getBrandByModel, insertType, existType, getAllTypes, editTypes, deleteType };