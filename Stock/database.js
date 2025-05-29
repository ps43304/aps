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

db.run(`CREATE TABLE IF NOT EXISTS stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type_id INTEGER NOT NULL,
  brand_id INTEGER NOT NULL,
  model_id INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  price FLOAT,
  status INTEGER DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) console.error('Error creating table stock:', err.message);
});

db.run(`CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stock_id INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  stock_movement VARCHAR(10) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) console.error('Error creating table inventory:', err.message);
});

const insertStock = (param, callback) => {
  const { type_id, brand_id, model_id, qty, price } = param;
  if (!type_id || !brand_id || !model_id || !qty) {
    return callback(new Error("Missing required fields"), null);
  }
  db.run(
    "INSERT INTO stock (type_id, brand_id, model_id, qty, price) VALUES (?, ?, ?, ?, ?)",
    [type_id, brand_id, model_id, qty, price],
    function (err) {
      if (err) {
        console.error("Error inserting into stock:", err.message);
        return callback(err, null);
      }
      const stockId = this.lastID;
      db.run(
        "INSERT INTO inventory (stock_id, qty, stock_movement) VALUES (?, ?, ?)",
        [stockId, qty, '+'],
        function (err) {
          if (err) {
            console.error("Error inserting into inventory:", err.message);
            return callback(err, null);
          }
          callback(null, { id: stockId });
        }
      );
    }
  );
};

function getAllStock(param, callback) {
  let query = `SELECT stock.*, brands.name as brandName, types.name as typeName, models.name as modelName FROM stock JOIN types ON types.id = stock.type_id JOIN models ON models.id = stock.model_id JOIN brands ON brands.id = stock.brand_id where stock.status = ?`;
  let type  = [1];
  if (param) {
      if (Array.isArray(param.dateRange) && param.dateRange.length === 2) {
          query += " AND (stock.created_at >= ? AND stock.created_at <= ?)";
          type.push(param.dateRange[0].trim() + ' 00:00:00', param.dateRange[1].trim() + ' 23:59:59');
      }

      if (typeof param.search !== 'undefined' && param.search) {
          query += ` AND (brands.name LIKE ? OR types.name LIKE ? OR models.name LIKE ? )`;
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

function existStock(param, callback) {
  let query = "SELECT count(*) as count, qty FROM stock where status = ? AND type_id = ? AND brand_id = ? AND model_id = ?";
  let type  = [1, param?.type_id, param?.brand_id, param?.model_id];
  db.get(query, type, (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
}

const editStock = (param, callback) => {
  const query = "SELECT qty FROM stock WHERE status = ? AND id = ?";
  const type = [1, param.id];

  db.get(query, type, (err, row) => {
    if (err) {
      console.error("Error fetching stock:", err.message);
      return callback(err, null);
    }

    if (!row) {
      return callback(null, { success: false, message: "Stock not found." });
    }

    let stock_movement = '';
    let invQty = 0;

    if (row.qty > param.qty) {
      stock_movement = '-';
      invQty = row.qty - param.qty;
    } else if (param.qty > row.qty) {
      stock_movement = '+';
      invQty = param.qty - row.qty;
    }

    console.log(stock_movement, invQty);


    const typeUpdate = [param.type_id, param.brand_id, param.model_id, param.qty, param.price, param.id];
    const updateQuery = "UPDATE stock SET type_id = ?, brand_id = ?, model_id = ?, qty = ?, price = ? WHERE id = ?";

    db.run(updateQuery, typeUpdate, function (err) {
      if (err) {
        console.error("Error updating type:", err.message);
        return callback(err, null);
      }

      if (this.changes > 0) {
        if (invQty > 0) {
          const invInsert = "INSERT INTO inventory (stock_id, qty, stock_movement) VALUES (?, ?, ?)";
          db.run(invInsert, [param.id, invQty, stock_movement], function (err) {
            if (err) {
              console.error("Error inserting into inventory:", err.message);
              return callback(null, { success: false, message: "Type updated, but inventory insert failed." });
            }
            return callback(null, { success: true, message: "Type and inventory updated successfully." });
          });
        } else {
          return callback(null, { success: true, message: "Type updated successfully (no inventory change)." });
        }
      } else {
        return callback(null, { success: false, message: "No type updated. Check ID." });
      }
    });
  });
};

function viewDetail(id, callback) {
  const query = `
    SELECT 
      stock.*, 
      brands.name as brandName, 
      types.name as typeName, 
      models.name as modelName,
      inventory.stock_id AS inv_stock_id,
      inventory.qty,
      inventory.stock_movement
    FROM stock 
    JOIN types ON types.id = stock.type_id 
    JOIN models ON models.id = stock.model_id 
    JOIN brands ON brands.id = stock.brand_id 
    LEFT JOIN inventory ON inventory.stock_id = stock.id
    WHERE stock.id = ?
  `;

  db.all(query, [id], (err, rows) => {
    if (err) return callback(err);
    if (!rows || rows.length === 0) return callback(null, null);

    const stock = {
      id: rows[0].id,
      typeName: rows[0].typeName,
      brand_id: rows[0].brand_id,
      type_id: rows[0].type_id,
      model_id: rows[0].model_id,
      brandName: rows[0].brandName,
      modelName: rows[0].modelName,
      qty: rows[0].qty,
      price: rows[0].price,
      created_at: rows[0].created_at,
      inventory: []
    };

    rows.forEach(row => {
      if (row.inv_stock_id) {
        stock.inventory.push({
          stock_id: row.inv_stock_id,
          qty: row.qty,
          stock_movement: row.stock_movement,
          date: row.created_at
        });
      }
    });

    callback(null, stock);
  });
}
module.exports = { db, insertStock, getAllStock, existStock, editStock, viewDetail };