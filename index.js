
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('node:path')
const { insertBrand, getAllBrands, deleteBrand, editBrand, existBrand } = require('./Brand/database');
const { getAllBrandsInModal, insertModal, getAllModels, deleteModel, editModel, existModel } = require('./Modal/database');

const { getBrandByModel, getAllTypes, existType, insertType, editTypes, deleteType } = require('./Type/database');
const { insertStock, getAllStock, existStock, editStock, viewDetail } = require('./Stock/database');
const { insertBill, getAllBill } = require('./Bill/database');

const createWindow = () => {
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        devTools: true,
        contextIsolation: true
      }
    })

    ipcMain.handle('minimize', () => {
      win.minimize();
    })

    ipcMain.handle('maximize', () => {
      if (win.isMaximized()) { win.restore() } else { win.maximize() };
      return (win.isMaximized()) ? true : false;
    })

    ipcMain.handle('closeApp', () => {
      win.close();
    })

    const menuTemplate = [
      { label: "Brand", click: () => mainWindow.loadFile("Brand/index.html") },
      { label: "Model", click: () => mainWindow.loadFile("Modal/index.html") },
      { label: "Product", click: () =>  mainWindow.loadFile("Type/index.html") },
      { label: "Stock", click: () => mainWindow.loadFile("Stock/list.html")},
      {
        label: "Bill",
        submenu: [
          { label: "Add", click: () => mainWindow.loadFile("Bill/add.html") },
          { label: "List", click: () => mainWindow.loadFile("Bill/List.html") }
        ]
      },
      { label: "Exit", role: "quit" },
      {
        label: "View",
        submenu: [
          { role: "reload" },
          { role: "forcereload" },
          { role: "toggledevtools" }, // **DevTools खोलने का ऑप्शन**
          {
            label: "View Source",
            click: () => {
              mainWindow.webContents.executeJavaScript('window.open("view-source:" + window.location.href, "_blank");');
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    /*  Brand  */
  
    ipcMain.handle('insertBrand', async (_, name) => {
      return new Promise((resolve, reject) => {
        insertBrand(name, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });

    ipcMain.handle('deleteBrand', async (_, id) => {
      return new Promise((resolve, reject) => {
        deleteBrand(id, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });

    ipcMain.handle('editBrand', async (_, name, id) => {
      return new Promise((resolve, reject) => {
        editBrand(name, id, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });

    ipcMain.handle("getAllBrands", async (_, param={}) => {
      return new Promise((resolve, reject) => {
        getAllBrands(param, (err, brands) => {
          if (err)  resolve({ error: true, message: err.message });
          else resolve({ error: false, data: brands });
        });
      });
    });

    ipcMain.handle("existBrand", async (_, param={}) => {
      return new Promise((resolve, reject) => {
        existBrand(param, (err, brands) => {
          if (err)  resolve({ error: true, message: err.message });
          else resolve({ error: false, data: brands });
        });
      });
    });


    /*  Modal  */

  
    ipcMain.handle("getAllModels", async (_, param={}) => {
      return new Promise((resolve, reject) => {
        getAllModels(param, (err, brands) => {
          if (err)  resolve({ error: true, message: err.message });
          else resolve({ error: false, data: brands });
        });
      });
    });

    ipcMain.handle("getAllBrandsInModal", async () => {
      return new Promise((resolve, reject) => {
        getAllBrandsInModal((err, brands) => {
          if (err)  resolve({ error: true, message: err.message });
          else resolve({ error: false, data: brands });
        });
      });
    });
    
    ipcMain.handle('insertModal', async (_, name, brand_id) => {
      return new Promise((resolve, reject) => {
        insertModal(name, brand_id, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });

    ipcMain.handle("existModel", async (_, param={}) => {
      return new Promise((resolve, reject) => {
        existModel(param, (err, brands) => {
          if (err)  resolve({ error: true, message: err.message });
          else resolve({ error: false, data: brands });
        });
      });
    });

    ipcMain.handle('deleteModel', async (_, id) => {
      return new Promise((resolve, reject) => {
        deleteModel(id, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });

    ipcMain.handle('editModel', async (_, name, id, brand) => {
     
      return new Promise((resolve, reject) => {
        editModel(name, id, brand, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });
    
    
    /* Type Modules */
    
    ipcMain.handle("getBrandByModel", async (_, param = {}) => {
      return new Promise((resolve, reject) => {
        getBrandByModel(param , (err, brands) => {
          if (err)  resolve({ error: true, message: err.message });
          else resolve({ error: false, data: brands });
        });
      });
    });
    
    ipcMain.handle("getAllTypes", async (_, param={}) => {
      return new Promise((resolve, reject) => {
        getAllTypes(param, (err, brands) => {
          if (err)  resolve({ error: true, message: err.message });
          else resolve({ error: false, data: brands });
        });
      });
    });
    
    ipcMain.handle("existType", async (_, param={}) => {
      return new Promise((resolve, reject) => {
        existType(param, (err, brands) => {
          if (err)  resolve({ error: true, message: err.message });
          else resolve({ error: false, data: brands });
        });
      });
    });
    
    ipcMain.handle('insertType', async (_, param) => {
      return new Promise((resolve, reject) => {
        insertType(param, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });
    
    ipcMain.handle('editTypes', async (_, param) => {
     
      return new Promise((resolve, reject) => {
        editTypes(param, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });

    ipcMain.handle('deleteType', async (_, id) => {
      return new Promise((resolve, reject) => {
        deleteType(id, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });

    /* Stock */
    
    ipcMain.handle('insertStock', async (_, param) => {
      return new Promise((resolve, reject) => {
        insertStock(param, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });

    ipcMain.handle("getAllStock", async (_, param={}) => {
      return new Promise((resolve, reject) => {
        getAllStock(param, (err, brands) => {
          if (err)  resolve({ error: true, message: err.message });
          else resolve({ error: false, data: brands });
        });
      });
    });

    ipcMain.handle("existStock", async (_, param={}) => {
      return new Promise((resolve, reject) => {
        existStock(param, (err, brands) => {
          if (err)  resolve({ error: true, message: err.message });
          else resolve({ error: false, data: brands });
        });
      });
    });

    ipcMain.handle('editStock', async (_, param) => {
      return new Promise((resolve, reject) => {
        editStock(param, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });
    
    ipcMain.handle('viewDetail', async (_, id) => {
      return new Promise((resolve, reject) => {
        viewDetail(id, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });

    /* Bill Module */

    ipcMain.handle('insertBill', async (_, param) => {
      return new Promise((resolve, reject) => {
        insertBill(param, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });

    ipcMain.handle("getAllBill", async (_, param={}) => {
      return new Promise((resolve, reject) => {
        getAllBill(param, (err, brands) => {
          if (err)  resolve({ error: true, message: err.message });
          else resolve({ error: false, data: brands });
        });
      });
    });
    


    
    mainWindow.loadURL(`index.html`);
  }
  
  
  app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
  })