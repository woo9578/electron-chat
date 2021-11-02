var sendData = {};
var roominfo = [];
var socket;
var scroll;
$(document).ready(()=>{
  socket = io('https://ttos-arena.com:3006',{ transports: ['websocket'] });
  console.log(socket);
  socket.emit('join-user', { roomname: '' , username: '',type:'manager' });
  
  socket.on('roomcreat',roomData); // 생성된 방 정보 가져오기
  socket.on('roomlist',roomCheck); //새로고침 or 처음 입장시 이미 생성된 방정보 가져오기
  
  socket.on('chat-message',onMessageReceived);
  socket.on('chat-notice', onDisconnetion);
  socket.on('disconnect',disconneion);

  scroll = $('#chat'); 

  $('#send-button').click(()=>{
    sendMsg(sendData);
  });
  
  $('#roomlist').click(()=>{
    console.log('방정보')
    socket.emit('roomlist',sendData);
  });

  $(document).on('click','.roomlist',function(){
    $('#chat').html('');
    console.log(roominfo[`${$(this).attr('id')}`])
    sendData = roominfo[`${$(this).attr('id')}`];
    const {username , roomname} = sendData;
    $('#username').text(username);
    $('#roomname').text(roomname);
    //socket.emit('chat_connection',roomconnetion);

    $('#send-button, #chatmsg').attr('disabled',false);
    
    socket.emit('chatsave',sendData,(calldata)=>{ //여기 채팅 내역 가져오기
      console.log(calldata);
      for(var i in calldata){
        if(calldata[i].type == "client"){
          onMessageReceived(calldata[i]);
        }else{
          emitMessage(calldata[i])
        }
      }
    });
  });

  $('#chatmsg').keydown(onKeyDown);
  $('#chatmsg').keyup(onKeyUp);
});


function roomCheck(data){
  console.log(data)
  //for(var value of data){
  for(var value in data){
    roomCreate(data[value]);
  }
}

function roomData(data){
  var noti_title = '방이 생성 되었습니다.';
  var noti_body = '방이 생성 되었습니다. 해당 내용을 보시려면 노티를 클릭해주세요';
  notifcation(noti_title,noti_body);
  roomCreate(data);
}
function roomCreate(data){ //방생성
  $('#chatroom').append(`<li id='${data.id}' class='roomlist'><div><h2>${data.username}</h2><h3>
                          <span class="status orange"></span>
                          ${data.roomname}</h3></div></li>`)
  roominfo[data.id] = data;
}

function onMessageReceived(data){
  console.log(data);
  if(data.socket_id == sendData.socket_id){
    var msg = `<li class="you">
                <div class="entete">
                  <span class="status green"></span>
                  <h2>${data.username}</h2>
                </div>
                <div class="triangle"></div>
                <div class="message">${data.message}</div>
              </li>`
    chatAdd(msg);
  }
}

function emitMessage(sendData){
  var msg = `<li class="me">
            <div class="entete">
              <span class="status green"></span>
              <h2>서비스 지원</h2>
            </div>
            <div class="triangle"></div>
            <div class="message">${sendData.message}</div>
          </li>`
  chatAdd(msg);
}

function onDisconnetion(data){//상담 종료
  console.log(data);
  if(data.action == 'exited'){
    $(`#${data.data.id}`).remove();
    $('#chat').children('li').remove();
    $('#username, #roomname').text('');
    $('#send-button, #chatmsg').attr('disabled',true);
    sendData = {};
  }
}

function chatAdd(msg){ //메세지 표시
  $('#chat').append(msg);
  $('#chatmsg').val('');
  scrollEnd();
}

function onKeyUp(){
  const length = $(this).val().length;
  if (length == 0) {
    $('#send-button').prop('disabled', true);
  } else {
    $('#send-button').prop('disabled', false);
  }
}

function onKeyDown(event) { //엔터키
  if (event.keyCode == 13 && event.shiftKey) {
    console.log('keydown is shift + enter');
    return;
  } else if (event.keyCode == 13) {
    event.preventDefault();
    sendMsg(sendData);
  }
}

function sendMsg(sendData){ //메세지 보내기
  sendData.type = 'manager';
  sendData.username = '서비스 지원';
  sendData.message= $('#chatmsg').val();
  socket.emit('room-chat',sendData);
  emitMessage(sendData);
}

function disconneion(){ //소켓 연결 끊김
  var noti_title = '실시간 상담 연결 오류 발생';
  var noti_body = `실시간 상담 서비스 연결이 끊어졌습니다. 새로고침 부탁드립니다.\n`;
  notifcation(noti_title,noti_body);
  location.reload();
}

function scrollEnd(){ //스크롤 맨 하단 
  scroll.scrollTop(scroll[0].scrollHeight - scroll.height());
}