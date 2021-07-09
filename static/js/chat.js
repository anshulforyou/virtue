var email = JSON.parse(document.getElementById('passed').textContent);

nameModal = document.getElementById('nameModal')
nameForm = document.getElementById('name-form')
nameForm.addEventListener('submit', function(event){
    event.preventDefault();
    updateName();
});

var loc = window.location;

console.log(loc.protocol)
console.log(loc.host)

roomModal = document.getElementById('roomModal')
function create_meeting(){
    roomModal.hidden = false;
    roomModal.style.display = "block";
}

roomForm = document.getElementById('room-form')
roomForm.addEventListener('submit', function(event){
    event.preventDefault();
    var FD = new FormData(roomForm);
    var roomName = FD.get('roomname')
    var emails = FD.get('invite-friends')
    console.log(roomName)
    window.location.href = "/create/"+email+"?roomname="+roomName+"&emails="+emails
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

var wsStart = 'ws://';

if(loc.protocol == 'https:'){
    wsStart = 'wss://';
}

var endPoint = wsStart + loc.host+'/chat';
var peerIndex = {}
console.log(endPoint);

websockets = []

firstButton = document.querySelector('.list-button');
connect(firstButton.id);

function connect(secret){
    temp_endPoint = endPoint + '/'+secret+'/';
    console.log(temp_endPoint);
    for (i in websockets)websockets[i].close();
    var webSocket = new WebSocket(temp_endPoint);
    console.log(webSocket);
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
    chatButton = document.getElementById(secret);
    chatButton.className += " active";
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
    var content = message['message'].split(":")[1]
    console.log(message);
    // var name = message[0];
    // var content = message[1];

    var div1 = document.createElement('div');
    var div2 = document.createElement('div');
    
    if(message['email']==email){
        div1.className ='d-flex justify-content-start mb-4';
        div2.className = 'msg_cotainer_send';
    }else{
        div1.className ='d-flex justify-content-end mb-4';
        div2.className = 'msg_cotainer';
    }
    
    div2.innerHTML = content;
    div1.appendChild(div2);
    
    // div3.className = 'msg-container';
    // div3.innerHTML = content;
    // div1.appendChild(div3);
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

function closeModal(){
    roomModal.hidden = true;
}