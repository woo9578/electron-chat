// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain,} = require('electron');
const debug = require('electron');
const path = require('path');
const sqlManager = require('./manager/sqlManager');
const bcrypt = require('bcrypt');
const iconPath = path.join(__dirname,'public/image/TTOS.png');
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
var mainWindow;
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 960,
    resizable : true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true, 
      contextIsolation : false 
      //devTools: true
    },
    icon: iconPath
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname,'/src/pages/login.html'));
  mainWindow.setMenu(null);
  // Open the DevTools.
  mainWindow.webContents.openDevTools()

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  mainWindow = null;
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.



ipcMain.on('data',(evt,data)=>{
  console.log(data);

  sqlManager(function(err,conn){
    var query = `select password from kadminuser where user_id = '${data.id}' limit 1`;
    conn.query(query,function(err,result){
      conn.release();
      if(err){return;};
      //if(result.length){
        bcrypt.compare(data.pwd,result[0].password.replace('2y','2b'),(err,same)=>{
          console.log(same);
          if(same){
            //subWindow.show();
            mainWindow.loadFile(path.join(__dirname,'/src/pages/index.html'));
          }else{
            evt.reply('message','아이디 및 비밀번호를 다시 확인해주세요');
          }
        });
      // }else{
      //   evt.reply('message','없는 아이디 입니다.');
      // }
    });
  });
});

ipcMain.on('onfocus',(evt)=>{
  mainWindow.show();
});