// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
//let { remote, ipcRenderer, ipcMain } = require("electron");
const { ipcRenderer } = require('electron');
const {dialog,app} = require("electron").remote;

let $ = jQuery = require('jquery')
$('#password').keydown(onKeyDown);

ipcRenderer.send('logincheck');

function onKeyDown(event) {
  if (event.keyCode == 13 && event.shiftKey) {
    console.log('keydown is shift + enter');
    return;
  } else if (event.keyCode == 13) {
    event.preventDefault();
    onConnetion();
  }
}

function onConnetion(){
  console.log($('#id').val());
  console.log($('#password').val());
  var login = { 
    _id:'autologin',
    id:$('#id').val(),
    pwd: $('#password').val(),
    autologin: false
  }
  if($('#autologin ').is(':checked')){
    login.autologin = true;
   // db.insert([login]);
  }
  ipcRenderer.send('data',login)
}

ipcRenderer.on('message',(evt,data)=>{
  console.log(data);
  dialogMsg('error',"login error",data);
});

ipcRenderer.on('check',(evt,data)=>{
  console.log(data);
});

function dialogMsg(type, title, msg){ //통합경고창
  dialog.showMessageBox(null,{type:type,title:title, message:msg});
}


function notifcation(title,body){ // 노티 
  var CLICK_MESSAGE = 'Notification clicked'

  new Notification(title, { body: body })
  .onclick = () =>  ipcRenderer.send('onfocus')
}