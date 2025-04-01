
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('node:path')
const { insertBrand, getUsers } = require('./database');

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      devTools: true,
    }
  })

  ipcMain.handle('minimize', () => {
    win.minimize();
  })

  ipcMain.handle('maximize', () => {
    if (win.isMaximized()) { win.restore() } else { win.maximize() };
    return (win.isMaximized()) ? true : false;
  })


  ipcMain.handle('add-user', async (_, name, email) => {
    return new Promise((resolve, reject) => {
      insertBrand(name, email, (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });
  });

  ipcMain.handle('get-users', async () => {
    return new Promise((resolve, reject) => {
      getUsers((err, users) => {
        if (err) reject(err);
        else resolve(users);
      });
    });
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

app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})