const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    addUser: (name, email) => ipcRenderer.invoke('add-user', name, email),
    getUsers: () => ipcRenderer.invoke('get-users')
});