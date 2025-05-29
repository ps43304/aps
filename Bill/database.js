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

db.run(`CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    status INTEGER DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) console.error('Error creating bills table:', err.message);
});

db.run(`CREATE TABLE IF NOT EXISTS bill_childs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    brand_id INTEGER NOT NULL,
    model_id INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    price REAL NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id)
)`, (err) => {
    if (err) console.error('Error creating bill_childs table:', err.message);
});


const insertBill = (param, callback) => {
    if (!param || !Array.isArray(param) || param.length === 0) {
        return callback(new Error("Invalid parameters"), null);
    }

    let name = param[0].customerName;
    if (name !== undefined && name !== null) {
        db.run("INSERT INTO bills (name, status) VALUES (?, ?)", [name, 1], function(err) {
            if (err) {
                return callback(err, null);
            }

            let bill_id = this.lastID;
            let pending = param.length;
            let hasError = false;

            for (let i = 0; i < param.length; i++) {
                let { product, brand, model, qty, price } = param[i];

                db.run(
                    "INSERT INTO bill_childs (bill_id, product_id, brand_id, model_id, qty, price) VALUES (?, ?, ?, ?, ?, ?)",
                    [bill_id, product, brand, model, qty, price],
                    function (err) {
                        if (err && !hasError) {
                            hasError = true;
                            return callback(err, null);
                        }

                        pending--;
                        if (pending === 0 && !hasError) {

                            db.get(
                              "SELECT id, qty FROM stock where type_id = ? AND brand_id = ? AND model_id = ?",
                              [product, brand, model],
                              function(err, row){
                                  if(err){
                                    console.error("Error updating brand:", err.message);
                                    return callback(err, null);
                                  }else{
                                      db.run(
                                          "UPDATE stock SET qty = ? WHERE id = ?",
                                          [(row.qty - qty), row.id],
                                          function (err) {
                                            if (err) {
                                              console.error("Error updating brand:", err.message);
                                              return callback(err, null);
                                            } else {
                                              if (this.changes > 0) {
                                                db.run("INSERT INTO inventory (stock_id, qty, stock_movement) VALUES (?, ?, ?)", [row.id, qty, '-'], function (err) {
                                                  if (err) {
                                                    console.error("Error inserting into inventory:", err.message);
                                                    return callback(null, { success: false, message: "Type updated, but inventory insert failed." });
                                                  }
                                                  return callback(null, { success: true, message: "Type and inventory updated successfully." });
                                                });

                                              } else {
                                                console.log("No brand found with the given name.");
                                                return callback(null, { success: false, message: "Something Wrong try again" });
                                              }
                                            }
                                          }
                                      );
                                    
                                  }
                              }

                            )
                        }
                    }
                );
            }
        });
    } else {
        return callback(new Error("Customer name is undefined"), null);
    }
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

function getAllBill(param, callback) {
  let query = `SELECT bills.*, bill_childs.qty, bill_childs.totalPrice FROM bills LEFT JOIN (SELECT bill_id, sum(qty) as qty, sum(price) as totalPrice FROM bill_childs GROUP BY bill_id ) as bill_childs ON bill_childs.bill_id = bills.id WHERE 1=1` ;
  let type = [];
  if (param) {
      if (Array.isArray(param.dateRange) && param.dateRange.length === 2) {
          query += " AND (bills.created_at >= ? AND bills.created_at <= ?)";
          type.push(param.dateRange[0].trim() + ' 00:00:00', param.dateRange[1].trim() + ' 23:59:59');
      }

      if (typeof param.search !== 'undefined' && param.search) {
          query += ` AND (bills.name LIKE ? )`;
          let searchTerm = `${param.search}%`;
          type.push(searchTerm);
      }
  }

  db.all(query, type, (err, rows) => {
      if (err) {
          return callback(err);
      }
      callback(null, rows);
  });
}



module.exports = { db, getBrandByModel, insertBill, existType, getAllTypes, editTypes, deleteType, getAllBill };