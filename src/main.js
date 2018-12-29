const { app, BrowserWindow } = require('electron')
const path = require('path')

let mainWindow

if (!app.requestSingleInstanceLock()) {
  app.quit()
  return
}

app.on('ready', createWindow)

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

app.on('second-instance', () => {
  if (mainWindow) {
    mainWindow.restore()
    mainWindow.focus()
  }
})

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: './sanus.png',
  })

  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
