// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Tray, Menu} = require('electron');
const debug = require('electron');
const path = require('path');
const sqlManager = require('./manager/sqlManager');
const bcrypt = require('bcrypt');
const iconPath = path.join(__dirname,'public/image/TTOS.png');
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
const gotTheLock = app.requestSingleInstanceLock();
const Nedb = require('nedb');
const db= new Nedb({
  filename: app.getPath('userData')+'/nedb/login.db',
  autoload: true
});

var login = {_id:'autologin', id:'',pwd: '',autologin: false}
db.insert([login]);

var mainWindow;
let tray = null;

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
  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    {label: 'open', type: 'normal', click: () => {mainWindow.show()}},
    {label: 'exit', type: 'normal', click: () => { app.quit(); app.exit();}}
  ]);
  tray.setToolTip('Chat consultation');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', ()=>{
    mainWindow.show();
  });
  app.getPath('userData')
}

if(!gotTheLock){
  app.quit();
  app.exit();
}else{
  app.on('second-instance',(event,commandLine,workingDirectory) =>{
    if (mainWindow) {
      mainWindow.show();
     }
  });
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

ipcMain.once('logincheck',(evt)=>{
  db.find({_id:{$in:['autologin']}},async function(err,doc){
    var list = doc[0];
    if(list.autologin){
      logincheck(list,evt);
    }
  }); 
});

ipcMain.on('data',(evt,data)=>{
  if(data.autologin){
    db.update({_id:'autologin'},data,{upsert:true});
  }
  logincheck(data,evt)
});

ipcMain.on('onfocus',(evt)=>{
  mainWindow.show();
});

function logincheck(data,evt){
  sqlManager(function(err,conn){
    var query = `select password from kadminuser where user_id = '${data.id}' limit 1`;
    conn.query(query,function(err,result){
      conn.release();
      if(err){return;};
      if(result.length){       
        bcrypt.compare(data.pwd,result[0].password.replace('2y','2b'),(err,same)=>{
          if(same){
            mainWindow.loadFile(path.join(__dirname,'/src/pages/index.html'));
          }else{
            evt.reply('message','아이디 및 비밀번호를 다시 확인해주세요');
            logout();
          }
        });
      }else{
        evt.reply('message','아이디 및 비밀번호를 다시 확인해주세요');
      }
    });
  });
}


function logout(){
  db.update({_id:'autologin'},login,{upsert:true});
}