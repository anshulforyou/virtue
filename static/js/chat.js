var email = JSON.parse(document.getElementById('passed').textContent);

nameModal = document.getElementById('nameModal')
nameForm = document.getElementById('name-form')
nameForm.addEventListener('submit', function(event){
    event.preventDefault();
    updateName();
});

roomModal = document.getElementById('roomModal')
function create_meeting(){
    roomModal.hidden = false;
    roomModal.style.display = "block";
}

roomForm = document.getElementById('room-form')
roomForm.addEventListener('submit', function(event){
    var FD = new FormData(roomForm);
    var roomName = FD.get('roomname')
    console.log(roomName)
    window.location.href = 'http://127.0.0.1:8000/create/'+email+"?roomname="+roomName
})

try{
    var nameUser = JSON.parse(document.getElementById('nameUser').textContent);
}
catch{
    var nameUser;
    nameModal.hidden= false;
    nameModal.style.display = "block";
}

function updateName(){
    const XHR = new XMLHttpRequest();
    var FD = new FormData(nameForm);
    FD.append('email', email)
    nameUser = FD.get('name')
    console.log(nameUser)
    // var success = document.getElementById("modal-success");
    XHR.addEventListener("load", function(event){
        nameModal.hidden = true;
        console.log(event)
    })
    XHR.addEventListener("error", function(event){
        console.log(event);
    })
    XHR.open("POST", "/room/updatename");
    XHR.send(FD);
}

var loc = window.location;
var wsStart = 'ws://';

if(loc.protocol == 'https:'){
    wsStart = 'wss://';
}

var endPoint = wsStart + loc.host+'/chat';
var peerIndex = {}
console.log(endPoint);

websockets = []

function connect(secret){
    temp_endPoint = endPoint + '/'+secret+'/';
    for (i in websockets)websockets[i].close();
    var webSocket = new WebSocket(temp_endPoint);
    websockets.push(webSocket);
    webSocket.addEventListener('open',(e)=>{
        console.log('Connection Opened!');
        // sendMessage('new-join',{})
    });

    webSocket.addEventListener('message', function(event){ 
        webSocketOnMessage(event,secret);
    })

    webSocket.addEventListener('close', (e)=>{
        console.log('Connection Closed!');
    });

    webSocket.addEventListener('error', (e)=>{
        console.log('Error Occured');
    });
    all_chats = document.querySelectorAll('.chat-card');
    for (var x=0; x<all_chats.length ; x++){
        all_chats[x].hidden = true;
    }
    list_item = document.getElementById(secret+"-name");
    list_item.active = true;
    chat_box = document.getElementById(secret+"-chat");
    chat_box.hidden = false;
    sendBtn = document.getElementById(secret+'-send_btn');
    sendBtn.addEventListener('click', () => {
        message = document.getElementById(secret+'-text_area').value;
        console.log(message);
        storemsg(message, secret);
        sendMessage(webSocket, nameUser+':'+message);
    })
}

function sendMessage(webSocket, message){
    var jsonStr = JSON.stringify({
        'peer':email,
        'message':message
    });
    webSocket.send(jsonStr);
}


function webSocketOnMessage(event, secret){
    console.log(secret)
    var messageBox = document.getElementById(secret+'-msg-box');
    var message = JSON.parse(event.data);
    console.log(message);
    if (message['email']==email){
        var name = "me: "
    }else{
        var name = message['message'].split(":")[0]+": "
    }
    var content = message['message'].split(":")[1]
    console.log(message);
    // var name = message[0];
    // var content = message[1];

    var div1 = document.createElement('div');
    div1.className ='d-flex justify-content-start mb-4';
    var div2 = document.createElement('div');
    div2.className = 'name-user';
    div2.innerHTML = name+": ";
    div1.appendChild(div2);
    var div3 = document.createElement('div');
    div3.className = 'msg-container';
    div3.innerHTML = content;
    div1.appendChild(div3);
    messageBox.appendChild(div1);
}

function storemsg(message, secret){
    const XHR = new XMLHttpRequest();
    var FD = new FormData();
    var csrf = document.getElementById('csrf').innerHTML;
    FD.append('message', message);
    FD.append('email', email);
    FD.append('roomsecret', secret);
    FD.append('csrfmiddlewaretoken', csrf);
    // var success = document.getElementById("modal-success");
    XHR.addEventListener("load", function(event){
        // nameModal.hidden = true;
        console.log(event)
    })
    XHR.addEventListener("error", function(event){
        console.log(event);
    })
    var url = loc.protocol+'//'+ loc.host+"/room/storemsg";
    console.log(url);
    XHR.open("POST", url);
    XHR.send(FD);
}