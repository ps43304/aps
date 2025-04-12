const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electron", {
  insertBrand: (name) => ipcRenderer.invoke("insertBrand", name),
  getAllBrands: (param) => ipcRenderer.invoke("getAllBrands", param),
  deleteBrand: (id) => ipcRenderer.invoke("deleteBrand", id),
  editBrand: (name, id) => ipcRenderer.invoke("editBrand", name, id),
  showNotification: (title, body) => ipcRenderer.send("show-notification", { title, body }),

  /* Modal Route */
  getAllBrandsInModal: () => ipcRenderer.invoke("getAllBrandsInModal"),
  insertModal : (name, brand_id) => ipcRenderer.invoke("insertModal", name, brand_id),
  
  /* Type Routes */
  getAllBrandsInType: () => ipcRenderer.invoke("getAllBrandsInType"),
  getAllModels: (param) => ipcRenderer.invoke("getAllModels", param),
  deleteModels: (id) => ipcRenderer.invoke("deleteModels", id),
  editModal: (name, id, brandSelect) => ipcRenderer.invoke("editModal", name, id, brandSelect),

});