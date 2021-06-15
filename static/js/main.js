var labelUsername = document.querySelector('#label-username');
var usernameInput = document.querySelector('#username');
var btnJoin = document.querySelector('#btn-join');
var username;

// console.log('something')

var peerIndex = {};

var webSocket;

function webSocketManager(event){
    var parsedData = JSON.parse(event.data);
    var peerUsername = parsedData['peer'];
    var action = parsedData['action'];

    if (username == peerUsername){
        return;
    }

    var receiver_channel_name = parsedData['keyword']['receiver_channel_name'];
    if(action == 'new-join'){
        createSender(peerUsername, receiver_channel_name);
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
        peer.setRemoteDescription(answer);
        return;

    }
}

btnJoin.addEventListener('click', () => {
    username = usernameInput.value;
    console.log('Username: ', username);
    if (username == ''){
        return;
    }
    usernameInput.value = '';
    usernameInput.disabled = true;
    usernameInput.style.visibility = 'hidden';

    btnJoin.disabled = true;
    btnJoin.style.visibility = 'hidden';

    var labelUsername = document.querySelector('#label-username');
    labelUsername.innerHTML = username;

    var loc = window.location;
    var wsStart = 'ws://';

    if(loc.protocol == 'https:'){
        wsStart = 'wss://';
    }

    var endPoint = wsStart + loc.host + loc.pathname;

    console.log('endPoint: ', endPoint);
    webSocket = new WebSocket(endPoint);

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
});

var stream = new MediaStream();

const constraints = {
    'video':true,
    'audio':true
};

const toggleAudioButton = document.querySelector('#toggle-audio-button');
const toggleVideoButton = document.querySelector('#toggle-video-button');


const video = document.querySelector('#local-video');
var userMedia = navigator.mediaDevices.getUserMedia(constraints)
    .then(incomingStream =>{
        stream = incomingStream;
        video.srcObject = stream;
        video.muted = true; 

        var audioTracks = stream.getAudioTracks();
        var videoTracks = stream.getVideoTracks();

        audioTracks[0].enabled = true;
        videoTracks[0].enabled = true;

        toggleAudioButton.addEventListener('click', () => {
            audioTracks[0].enabled = !audioTracks[0].enabled;
            if (audioTracks[0].enabled){
                toggleAudioButton.innerHTML = 'Audio Mute';
                return;
            }
            toggleAudioButton.innerHTML = 'Audio Unmute';
        });

        toggleVideoButton.addEventListener('click', () => {
            videoTracks[0].enabled = !videoTracks[0].enabled;
            if (videoTracks[0].enabled){
                toggleVideoButton.innerHTML = 'Video Mute';
                return;
            }
            toggleVideoButton.innerHTML = 'Video Unmute';
        });
    })
    .catch(error =>{
        console.log('Error accessing audio, video devices', error);
    });

function sendSignal(action, keyword){
    var jsonStr = JSON.stringify({
        'peer':username,
        'action':action,
        'keyword':keyword,
    });
    // console.log(jsonStr);
    webSocket.send(jsonStr);
}

function createSender(peerUsername, receiver_channel_name){
    var peer = new RTCPeerConnection(null);
    addLocalTracks(peer);

    var channelFormed = peer.createDataChannel('channel');
    channelFormed.addEventListener('open', () => {
        console.log('Connection opened');
    });
    channelFormed.addEventListener('message', channelOnMessage);  //This is for text chat messages

    var remoteVideo = createVideo(peerUsername);
    setOnTrack(peer, remoteVideo);
    peerIndex[peerUsername] = [peer, channelFormed]

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
            console.log('New ice candidate: ', JSON.stringify(peer.localDescription));
            return;
        }

        sendSignal('new-offer', {
            'sdp':peer.localDescription,
            'receiver_channel_name':receiver_channel_name
        });
    });
    peer.createOffer()
        .then(o => peer.setLocalDescription(o))
        .then(() => {
            console.log('Local description set successful')
        })
}

function createReceiver(offer, peerUsername, receiver_channel_name){
    var peer = new RTCPeerConnection(null);
    addLocalTracks(peer);
    // console.log(peer);
    var remoteVideo = createVideo(peerUsername);
    setOnTrack(peer, remoteVideo);

    peer.addEventListener('datachannel', e => {
        peer.channelFormed = e.channel;
        peer.channelFormed.addEventListener('open', () => {
            console.log('Connection opened');
        });
        channelFormed.addEventListener('message', channelOnMessage);
        peerIndex[peerUsername] = [peer, peer.channelFormed];
    })

    peerIndex[peerUsername] = [peer, peer.channelFormed]

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
            console.log('New ice candidate: ', JSON.stringify(peer.localDescription));
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

function addLocalTracks(peer){
    stream.getTracks().forEach(track => {
        peer.addTrack(track, stream);
    });
    return;
}

var messageList = document.querySelector('#message-list');
function channelOnMessage(event){                             //listing all the messages
    var message = event.data;
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(message));
    messageList.appendChild(li);
}

var sendMsgButton = document.querySelector('#send-msg-button');
sendMsgButton.addEventListener('click', sendMsgOnClick);

var messageInput = document.querySelector('#message');

function sendMsgOnClick(){
    var message = messageInput.value;
    var li = document.createElement('li');
    li.appendChild(document.createTextNode('Me: '+message));
    messageList.appendChild(li);

    var dataChannels = getDataChannels();
    message = username+": "+message;
    for (i in getDataChannels){
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
    
    var videoWrapper = document.createElement('div');
    videoContainer.appendChild(videoWrapper);
    videoWrapper.appendChild(remoteVideo);

    return remoteVideo;
}

function setOnTrack(peer, remoteVideo){
    var remoteStream = new MediaStream();
    remoteVideo.srcObject = remoteStream;
    peer.addEventListener('track', async(event) => {
        remoteStream.addTrack(event.track, remoteStream);
    });
}

function removeVideo(video){
    var videoWrapper = video.parentNode;
    videoWrapper.parentNode.removeChild(videoWrapper);
}

function getDataChannels(){
    var dataChannels = [];
    console.log(peerIndex);
    for(peerUsername in peerIndex){
        var dataChannel = peerIndex[peerUsername][1];
        dataChannels.push(dataChannel);
    }
    return dataChannels;
}