
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('node:path')
const { insertBrand, getAllBrands, deleteBrand, editBrand } = require('./Brand/database');
const { getAllBrandsInModal, insertModal, getAllModels, deleteModels, editModal } = require('./Modal/database');

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
      {
        label: "Dashboard"
      },
      { label: "Brand", click: () => mainWindow.loadFile("Brand/index.html") },
      { label: "Model", click: () => mainWindow.loadFile("Modal/index.html") },
      {label: "Stock", click: () => console.log("Stock")},
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


    /*  Modal  */

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

    ipcMain.handle("getAllModels", async (_, param={}) => {
      return new Promise((resolve, reject) => {
        getAllModels(param, (err, brands) => {
          if (err)  resolve({ error: true, message: err.message });
          else resolve({ error: false, data: brands });
        });
      });
    });

    ipcMain.handle('deleteModels', async (_, id) => {
      return new Promise((resolve, reject) => {
        deleteModels(id, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });

    ipcMain.handle('editModal', async (_, name, id, brandSelect) => {
      return new Promise((resolve, reject) => {
        editModal(name, id, brandSelect, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
    });


  mainWindow.loadURL(`index.html`);
  //mainWindow.webContents.openDevTools();
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