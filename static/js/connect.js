var username = JSON.parse(document.getElementById('passed').textContent);
console.log(username);

var loc = window.location;
var wsStart = 'ws://';

if(loc.protocol == 'https:'){
    wsStart = 'wss://';
}

var endPoint = wsStart + loc.host+":8001" + loc.pathname+'/';
var peerIndex = {}

console.log('endPoint: ', endPoint);
var webSocket;

var localStream = new MediaStream();
var broadcastingStream = new MediaStream();

const devices = {
    'video':true,
    'audio':true
};

const toggleAudioButton = document.querySelector('#toggle-audio-button');
const toggleVideoButton = document.querySelector('#toggle-video-button');

// console.log(navigator.mediaDevices.enumerateDevices());

var localVideo = document.getElementById('local-video');
localVideo.width = screen.width*0.8;
localVideo.height = screen.height*0.7;
var userMedia = navigator.mediaDevices.getUserMedia(devices)
    .then(incomingStream =>{
        console.log(incomingStream);
        localStream = incomingStream;
        broadcastingStream = incomingStream;
        localVideo.srcObject = localStream;
        // localVideo.muted = true; 

        var audioTracks = localStream.getAudioTracks();
        var videoTracks = localStream.getVideoTracks();
        // var deviceLabel = videoTracks[0]['label'];

        // audioTracks[0].enabled = true;
        // videoTracks[0].enabled = true;

        if(typeof(Storage)!=='undefined'){
            var tempAudio = sessionStorage.getItem('audioOn');
            if (tempAudio == 'true') audioTracks[0].enabled = true;
            else audioTracks[0].enabled = false;
            
            if (audioTracks[0].enabled) toggleAudioButton.innerHTML = "<i class='microphone slash icon'></i>";
            else toggleAudioButton.innerHTML = "<i class='microphone icon'></i>";
            
            var tempVideo = sessionStorage.getItem('videoVisible');
            if (tempVideo == 'true') videoTracks[0].enabled = true;
            else videoTracks[0].enabled = false;
            
            if (videoTracks[0].enabled)toggleVideoButton.innerHTML = "<i class='video slash icon'></i>";
            else toggleVideoButton.innerHTML = "<i class='video icon'></i>";
        }else{
            console.log('Browser is not supporting some features of the application');
        }

        toggleAudioButton.addEventListener('click', () => {
            audioTracks[0].enabled = !audioTracks[0].enabled;
            if (audioTracks[0].enabled){
                toggleAudioButton.innerHTML = "<i class='microphone slash icon'></i>";
                return;
            }
            toggleAudioButton.innerHTML = "<i class='microphone mic'></i>";
        });

        toggleVideoButton.addEventListener('click', () => {
            videoTracks[0].enabled = !videoTracks[0].enabled;
            if (videoTracks[0].enabled){
                toggleVideoButton.innerHTML = "<i class='video slash icon'></i>";
                return;
            }
            toggleVideoButton.innerHTML = "<i class='video icon'></i>";
        });

        webSocket = new WebSocket(endPoint);
        console.log('here');
        console.log(webSocket);

        webSocket.addEventListener('open',(e)=>{
            console.log('Connection Opened!');
            sendSignal('new-join', {})
        });

        webSocket.addEventListener('message', webSocketManager);

        webSocket.addEventListener('close', (e)=>{
            console.log('Connection Closed!');
        });

        webSocket.addEventListener('error', (e)=>{
            console.log('Error Occured');
        });
    })
    .catch(error =>{
        console.log('Error accessing audio or video device', error);
    });

function webSocketManager(event){
    var parsedData = JSON.parse(event.data);
    var peerUsername = parsedData['peer'];  //username of the user from which the signal came
    var action = parsedData['action'];
    console.log(action);
    console.log(peerUsername);

    if (username == peerUsername){
        console.log("Function is returned from here");
        return;
    }

    var receiver_channel_name = parsedData['keyword']['receiver_channel_name'];
    if(action == 'new-join'){
        createOfferer(peerUsername, receiver_channel_name);
        return;
    }

    if (action == 'new-offer'){
        var offer = parsedData['keyword']['sdp'];
        createReceiver(offer, peerUsername, receiver_channel_name);
        return;
    }

    if (action == 'new-answer'){
        var answer = parsedData['keyword']['sdp'];
        var peer = peerIndex[peerUsername][0];
        var temp = document.getElementById(peerUsername+'-video');
        setOnTrack(peer, temp);
        peer.setRemoteDescription(answer);
        return;

    }
}

function sendSignal(action, keyword){
    var jsonStr = JSON.stringify({
        'peer':username,
        'action':action,
        'keyword':keyword,
    });
    webSocket.send(jsonStr);
}

var disconnect = document.querySelector('#disconnect-button');
disconnect.addEventListener('click', () => {
    console.log('Disconnect button is pressed')
    sendSignal('close', {});
})

var servers = {
    config : {
        iceServers:[
            {urls:'stun:stun.l.google.com:19302'},
            {urls: 'turn:65.2.87.14:3478?transport=tcp', credential:'anshul@123', username:'virtue'}
        ]
    }
}

function createOfferer(peerUsername, receiver_channel_name){
    var peer = new RTCPeerConnection(servers);
    addLocalInputs(peer);

    var channelFormed = peer.createDataChannel('channel');
    channelFormed.addEventListener('open', () => {
        console.log('Connection opened');
    });
    channelFormed.addEventListener('message', channelOnMessage);  //For chat messages

    var remoteVideo = createVideo(peerUsername);
    setOnTrack(peer, remoteVideo);                                //For displaying other peers stream
    peerIndex[peerUsername] = [peer, channelFormed];

    console.log("This is offerer function");

    // disconnect.addEventListener('click', () => {
    //     console.log('disconnect offerer is called');
    //     peer.close();
    //     removeVideo(remoteVideo);
    // })

    peer.addEventListener('iceconnectionstatechange', () => {     //When peer leaves the room
        var iceConnectionState = peer.iceConnectionState;
        if (iceConnectionState === 'failed' || iceConnectionState === 'disconnected' || iceConnectionState === 'closed'){
            delete peerIndex[peerUsername];
            if(iceConnectionState != 'closed'){
                peer.close();
            }
            removeVideo(remoteVideo);
        }

    });
    peer.addEventListener('icecandidate', (event) => {
        if(event.candidate){
            // console.log('New ice candidate: ', JSON.stringify(peer.localDescription));
            return;
        }

        sendSignal('new-offer', {
            'sdp':peer.localDescription,
            'receiver_channel_name':receiver_channel_name       //Because we want to send the signal to only that peer which sent it to us first
        });
    });
    peer.createOffer()
        .then(o => peer.setLocalDescription(o))
        .then(() => {
            console.log('Local description set successful')
        })
}

function createReceiver(offer, peerUsername, receiver_channel_name){
    var peer = new RTCPeerConnection(servers);
    addLocalInputs(peer);
    console.log(peer);
    var remoteVideo = createVideo(peerUsername);
    setOnTrack(peer, remoteVideo);

    peer.addEventListener('datachannel', (e) => {
        peer.channelFormed = e.channel;
        peer.channelFormed.addEventListener('open', () => {
            console.log('Connection opened');
        });
        peer.channelFormed.addEventListener('message', channelOnMessage);
        peerIndex[peerUsername] = [peer, peer.channelFormed];
    })

    peerIndex[peerUsername] = [peer, peer.channelFormed];

    console.log("This is receiver function")

    // disconnect.addEventListener('click', () => {
    //     console.log('disconnect receiver is called');
    //     peer.close();
    //     removeVideo(remoteVideo);
    // })

    peer.addEventListener('iceconnectionstatechange', () => {
        var iceConnectionState = peer.iceConnectionState;
        if (iceConnectionState === 'failed' || iceConnectionState === 'disconnected' || iceConnectionState === 'closed'){
            delete peerIndex[peerUsername];
            if(iceConnectionState != 'closed'){
                peer.close();
            }
            removeVideo(remoteVideo);
        }

    });
    peer.addEventListener('icecandidate', (event) => {
        if(event.candidate){
            // console.log('New ice candidate: ', JSON.stringify(peer.localDescription));
            return;
        }

        sendSignal('new-answer', {
            'sdp':peer.localDescription,
            'receiver_channel_name':receiver_channel_name
        });
    });
    peer.setRemoteDescription(offer)
        .then(()=>{
            console.log("Remote description set successfully", peerUsername);
            return;
        })
        .then(a => {
            console.log('Answer Created');
            peer.setLocalDescription(a);
        })
}

console.log(peerIndex);

function addLocalInputs(peer){  //Adds the local media tracks to the other peers
    broadcastingStream.getTracks().forEach(track => {
        console.log(track);
        peer.addTrack(track, broadcastingStream);
    });
    console.log('Stream added to peer');
    return;
}

function setOnTrack(peer, remoteVideo){
    console.log("setOnTrack is called");
    var remoteStream = new MediaStream();
    remoteVideo.srcObject = remoteStream;
    peer.addEventListener('track', async(event) => {
        remoteStream.addTrack(event.track, remoteStream);
    });
}

var messageList = document.querySelector('#message-list');
function channelOnMessage(event){
    var message = event.data;
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(message));
    messageList.appendChild(li);
}

var sendMsgButton = document.querySelector('#send-msg-button');
var messageInput = document.querySelector('#message');
// console.log(messageInput);
sendMsgButton.addEventListener('click', sendMsgOnClick);

function sendMsgOnClick(){
    console.log('send msg on click is called');
    var message = messageInput.value;
    console.log(message);
    var li = document.createElement('li');
    li.appendChild(document.createTextNode('Me: '+message));
    messageList.appendChild(li);

    var dataChannels = getDataChannels();
    message = username+": "+message;
    for (i in dataChannels){
        dataChannels[i].send(message);
    }
    messageInput.value = '';
}

function createVideo(peerUsername){
    var videoContainer = document.querySelector('#video-box');
    var remoteVideo = document.createElement('video');
    remoteVideo.id = peerUsername + '-video';
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.className = 'video-style';

    var videoWrapper = document.createElement('div');
    videoWrapper.id = 'inner';
    videoContainer.appendChild(videoWrapper);
    videoWrapper.appendChild(remoteVideo);

    var innerElements = document.querySelectorAll('#inner').length;
    var layout = decideLayout(innerElements);
    var columns = layout[1];
    var rows = layout[0];
    var extras = layout[2];
    videoContainer.style.gridTemplateColumns = 'repeat('+columns+', 1fr)';
    videoContainer.style.gridTemplateRows = 'repeat('+rows+', 1fr)';
    var allVideos = document.querySelectorAll('.video-style');
    for (var x = 0;x<allVideos.length; x++){
        allVideos[x].height = Math.floor(100/(rows+1))*screen.height/100;
        allVideos[x].width = Math.floor(100/columns)*(screen.width-screen.width*0.1)/100;
        console.log(allVideos[x].width);
        console.log(allVideos[x].height);
        if(innerElements>2){
            var ab = allVideos[x].parentElement;
            ab.style.setProperty('grid-area', 'initial');
        }
    }
    for(var x = allVideos.length - extras; x<allVideos.length; x++){
        if (extras==1){
            if (rows==2){
                var ab = allVideos[x].parentElement;
                ab.style.gridArea = "2 / 1 / span 1 / span 2";
            }else if (rows==3){
                var ab = allVideos[x].parentElement;
                ab.style.gridArea = "3 / 1/ span 1/ span 3";
            }
        }else if(extras == 2){
            if(rows ==2){
                var ab = allVideos[x].parentElement;
                if ( x == allVideos.length-2)ab.style.gridArea = "2/1/span 1/ span 2";
                else ab.style.gridArea = "2/2/span 1/span 2";
            }else if(rows == 3){
                var ab = allVideos[x].parentElement;
                if ( x == allVideos.length-2) ab.style.gridArea = "3/1/span 1/ span 2";
                else ab.style.gridArea = "3/2/span 1/ span 2";
            }
        }
    }
    return remoteVideo;
}

function decideLayout(n){
    maxParticipants = 9;
    rows = 3;
    columns = 3;
    extras = 0;
    if (n<=maxParticipants){
        if(n==1){
            rows=1
            columns=1
        }
        else if(n==2){
            rows =1;
            columns =2;
        }else if(n<=4 && n>2){
            rows = 2;
            columns = 2;
            extras = 4-n;
        }else if(n<=9){
            rows=3;
            columns=3;
            extras = 9-n;
        }
    }
    return [rows, columns, extras];
}

function removeVideo(video){
    var videoContainer = document.querySelector('#video-box');
    var videoWrapper = video.parentNode;
    videoWrapper.parentNode.removeChild(videoWrapper);
    var innerElements = document.querySelectorAll('#inner').length;
    var layout = decideLayout(innerElements);
    var columns = layout[1];
    var rows = layout[0];
    var extras = layout[2];
    videoContainer.style.gridTemplateColumns = 'repeat('+columns+', 1fr)';
    videoContainer.style.gridTemplateRows = 'repeat('+rows+', 1fr)';
    var allVideos = document.querySelectorAll('.video-style');
    for ( var x =0; x< allVideos.length;x++){
        allVideos[x].height = Math.floor(100/(rows+1))*screen.height/100;
        allVideos[x].width = Math.floor(100/columns)*(screen.width-screen.width*0.1)/100;
        var ab = allVideos[x].parentElement;
        ab.style.setProperty('grid-area', 'initial');
    }
    for(var x = allVideos.length - extras; x<allVideos.length; x++){
        if (extras==1){
            if (rows==2){
                var ab = allVideos[x].parentElement;
                ab.style.gridArea = "2 / 1 / span 1 / span 2";
            }else if (rows==3){
                var ab = allVideos[x].parentElement;
                ab.style.gridArea = "3 / 1 / span 1 / span 3";
            }
        }else if(extras == 2){
            if(rows ==2){
                var ab = allVideos[x].parentElement;
                if ( x == allVideos.length-2)ab.style.gridArea = "2/1/span 1/ span 2";
                else ab.style.gridArea = "2/2/span 1/span 2";
            }else if(rows == 3){
                var ab = allVideos[x].parentElement;
                if ( x == allVideos.length-2) ab.style.gridArea = "3/1/span 1/ span 2";
                else ab.style.gridArea = "3/2/span 1/ span 2";
            }
        }
    }
    // var columns = innerElements % 3;
    // if (columns ==0)columns = 3;
    // var rows = Math.ceil(innerElements / 3);
    // console.log(columns);
    // console.log(rows);
    // videoContainer.style.gridTemplateColumns = 'repeat('+columns+', 1fr)';
    // videoContainer.style.gridTemplateRows = 'repeat('+rows+', 1fr)';
    // var allVideos = document.querySelectorAll('.video-style');
    // for (x in allVideos){
    //     if (innerElements == 1){
    //         // allVideos[x].height = 480;
    //         allVideos[x].width = 780;
    //     }else{
    //         // allVideos[x].height = Math.floor(100/rows)*screen.height/100;
    //         allVideos[x].width = Math.floor(100/columns)*screen.width/100;
    //     }
    // }
}

function getDataChannels(){
    var dataChannels = [];
    console.log(peerIndex);
    for(peerUsername in peerIndex){
        console.log('inside loop');
        console.log(peerUsername);
        var dataChannel = peerIndex[peerUsername][1];
        dataChannels.push(dataChannel);
    }
    return dataChannels;
}

// if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
//     console.info( "This page is reloaded" );
//     location.href="/video";
// } else {
//     console.info( "This page is not reloaded");
// }
