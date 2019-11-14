const { autoUpdater } = require('electron-updater')
const { app, BrowserWindow, ipcMain } = require('electron')
const log = require('electron-log')
let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  })
  mainWindow.loadFile('index.html')
  mainWindow.on('closed', function() {
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow()
  log.transports.file.level = 'debug'
  autoUpdater.logger = log
  // Lets look for some updates.
  autoUpdater.checkForUpdatesAndNotify().catch(err => {
    console.log(err)
  })
})

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('app_version', event => {
  event.sender.send('app_version', { version: app.getVersion() })
})

// Update handlers.
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available')
})
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded')
})

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall()
})
