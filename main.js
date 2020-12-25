// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const log4js = require('log4js')
const date = new Date().getTime()
const log_path = "./log/" + date + ".log"
const mysql = require('mysql')
log4js.configure({
  appenders: { bank: { type: "file", filename: log_path } },
  categories: { default: { appenders: ["bank"], level: "info" } }
})
const logger = log4js.getLogger('bank')

let mainWindow
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  logger.info("启动程序")

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    logger.info('退出程序')
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


let username = "";
ipcMain.on('login', (event, arg) => {
  logger.info("用户" + arg + '登录')
  if (arg === "admin") {
    const adminWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true
      }
    })
    adminWindow.loadFile('admin.html');

  }
  else {
    username = arg;
    const userWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true
      }
    })
    userWindow.loadFile('user.html');
  }
})

ipcMain.on('get_log_path', (event) => {
  event.returnValue = log_path;
})

ipcMain.on('get_username', (event) => {
  event.returnValue = username;
})


ipcMain.on('get_data', (event, arg) => {
  const db = mysql.createConnection({
    host: 'localhost',
    user: arg,
    password: arg,
    database: 'lab4',
  });

  if (arg === "admin") {
    db.query('SELECT id, username, currency,valid FROM bank ', (err, result) => {
      if (err) {
        console.log(err);
        logger.error("admin连接数据库失败");
      };
      result = JSON.parse(JSON.stringify(result));
      event.returnValue = result;
    })
  } else {
    db.query('SELECT username, currency FROM bank WHERE username = ?',
      [username], (err, result) => {
        if (err) {
          console.log(err);
          logger.error("用户" + arg + "连接数据库失败");
        };
        result = JSON.parse(JSON.stringify(result));
        console.log(result)
        event.returnValue = result;
      })

  }
})