const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electron", {
  insertBrand: (name) => ipcRenderer.invoke("insertBrand", name),
  getAllBrands: () => ipcRenderer.invoke("getAllBrands"),
  deleteBrand: (id) => ipcRenderer.invoke("deleteBrand", id),
  editBrand: (name, id) => ipcRenderer.invoke("editBrand", name, id),
  showNotification: (title, body) => ipcRenderer.send("show-notification", { title, body })
});