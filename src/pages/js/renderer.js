// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
//let { remote, ipcRenderer, ipcMain } = require("electron");
var io = require('socket.io-client');
const { ipcRenderer } = require('electron');
const {dialog} = require("electron").remote;

let $ = jQuery = require('jquery')
//require('dotenv').config(); 

$('#password').keydown(onKeyDown);

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
    id:$('#id').val(),
    pwd: $('#password').val()
  }
  
  ipcRenderer.send('data',login)
}

ipcRenderer.on('message',(evt,data)=>{
  console.log(data);
  dialogMsg('error',"login error",data);
});

function dialogMsg(type, title, msg){ //통합경고창
  dialog.showMessageBox(null,{type:type,title:title, message:msg});
}


function notifcation(title,body){ // 노티 
  var CLICK_MESSAGE = 'Notification clicked'

  new Notification(title, { body: body })
  .onclick = () =>  ipcRenderer.send('onfocus')
}