const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electron", {
  insertBrand: (name) => ipcRenderer.invoke("insertBrand", name),
  getAllBrands: (param) => ipcRenderer.invoke("getAllBrands", param),
  deleteBrand: (id) => ipcRenderer.invoke("deleteBrand", id),
  editBrand: (name, id) => ipcRenderer.invoke("editBrand", name, id),
  showNotification: (title, body) => ipcRenderer.send("show-notification", { title, body }),
  existBrand: (param) => ipcRenderer.invoke("existBrand", param),
  
  /* Modal Route */
  getAllBrandsInModal: () => ipcRenderer.invoke("getAllBrandsInModal"),
  insertModal : (name, brand_id) => ipcRenderer.invoke("insertModal", name, brand_id),
  existModel: (param) => ipcRenderer.invoke("existModel", param),
  getAllModels: (param) => ipcRenderer.invoke("getAllModels", param),
  deleteModel: (id) => ipcRenderer.invoke("deleteModel", id),
  editModel: (name, id, brand) => ipcRenderer.invoke("editModel", name, id, brand),
  
  /* Type Routes */
  getBrandByModel: (param) => ipcRenderer.invoke("getBrandByModel", param),
  insertType : (param) => ipcRenderer.invoke("insertType", param),
  getAllTypes: (param) => ipcRenderer.invoke("getAllTypes", param),
  existType: (param) => ipcRenderer.invoke("existType", param),
  editTypes: (param) => ipcRenderer.invoke("editTypes", param),
  deleteType: (id) => ipcRenderer.invoke("deleteType", id),
  
  /*  Stock  */
  insertStock : (param) => ipcRenderer.invoke("insertStock", param),
  getAllStock: (param) => ipcRenderer.invoke("getAllStock", param),
  existStock: (param) => ipcRenderer.invoke("existStock", param),
  editStock: (param) => ipcRenderer.invoke("editStock", param),
  viewDetail: (id) => ipcRenderer.invoke("viewDetail", id),
  
  /* Bill */
  insertBill : (param) => ipcRenderer.invoke("insertBill", param),
  getAllBill: (param) => ipcRenderer.invoke("getAllBill", param),
  
});