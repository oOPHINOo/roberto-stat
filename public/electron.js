const { autoUpdater } = require('electron-updater')
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const log = require('electron-log')
const isDev = require('electron-is-dev')

let mainWindow = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, '/preload.js'),
    },
  })
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', function() {
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow()
  log.transports.file.level = 'debug'
  autoUpdater.logger = log
  // Lets look for some updates.
  try {
    autoUpdater.checkForUpdatesAndNotify()
  } catch (err) {
    console.log(err)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('app_version', event => {
  event.sender.send('app_version', { version: app.getVersion() })
})

// Update handlers.
autoUpdater.on('update-available', () => {
  console.log('update-available')
  mainWindow.webContents.send('update_available')
})
autoUpdater.on('download-progress', args => {
  console.log('download-progress')
  mainWindow.webContents.send('download_progress', ...args)
})
autoUpdater.on('update-downloaded', () => {
  console.log('update-downloaded')
  mainWindow.webContents.send('update_downloaded')
})
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall()
})
