
const { app, BrowserWindow, ipcMain, Menu, Notification } = require('electron')
const path = require('node:path')
const { insertBrand, getAllBrands, deleteBrand, editBrand } = require('./database');

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

  ipcMain.handle("getAllBrands", async () => {
    return new Promise((resolve, reject) => {
      getAllBrands((err, brands) => {
        if (err)  resolve({ error: true, message: err.message });
        else resolve({ error: false, data: brands });
      });
    });
  });

  ipcMain.on("show-notification", (_, { title, body }) => {
    new Notification({ title, body }).show();
  });
 

  ipcMain.handle('closeApp', () => {
    win.close();
  })

  const menuTemplate = [
    {
      label: "File", // यहाँ मेनू का नया नाम डालें
      submenu: [
        { label: "Brand", click: () => mainWindow.loadFile("Brand.html") },
        { label: "Model", click: () => console.log("Open clicked") },
        { label: "Type", click: () => console.log("Open clicked") },
        { label: "Exit", role: "quit" }
      ]
    },
    {
      label: "Stock",
      click: () => console.log("Stock")
    },
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