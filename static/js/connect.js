var username = JSON.parse(document.getElementById('passed').textContent);
console.log(username);

var loc = window.location;
var wsStart = 'ws://';

if(loc.protocol == 'https:'){
    wsStart = 'wss://';
}

var endPoint = wsStart + loc.host + loc.pathname+'/';
var peerIndex = {}

console.log('endPoint: ', endPoint);
var webSocket;

var stream = new MediaStream();

const devices = {
    'video':true,
    'audio':true
};

const toggleAudioButton = document.querySelector('#toggle-audio-button');
const toggleVideoButton = document.querySelector('#toggle-video-button');

// console.log(navigator.mediaDevices.enumerateDevices());

var localVideo = document.getElementById('local-video');

var userMedia = navigator.mediaDevices.getUserMedia(devices)
    .then(incomingStream =>{
        console.log(incomingStream);
        stream = incomingStream;
        localVideo.srcObject = stream;
        // localVideo.muted = true; 

        var audioTracks = stream.getAudioTracks();
        var videoTracks = stream.getVideoTracks();
        // var deviceLabel = videoTracks[0]['label'];

        audioTracks[0].enabled = true;
        videoTracks[0].enabled = true;

        toggleAudioButton.addEventListener('click', () => {
            audioTracks[0].enabled = !audioTracks[0].enabled;
            if (audioTracks[0].enabled){
                toggleAudioButton.innerHTML = 'Mute';
                return;
            }
            toggleAudioButton.innerHTML = 'Unmute';
        });

        toggleVideoButton.addEventListener('click', () => {
            videoTracks[0].enabled = !videoTracks[0].enabled;
            if (videoTracks[0].enabled){
                toggleVideoButton.innerHTML = 'Video Mute';
                return;
            }
            toggleVideoButton.innerHTML = 'Video Unmute';
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

function createOfferer(peerUsername, receiver_channel_name){
    var peer = new RTCPeerConnection(null);
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
    var peer = new RTCPeerConnection(null);
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
    stream.getTracks().forEach(track => {
        console.log(track);
        peer.addTrack(track, stream);
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
    
    var videoWrapper = document.createElement('div');
    videoContainer.appendChild(videoWrapper);
    videoWrapper.appendChild(remoteVideo);

    return remoteVideo;
}

function removeVideo(video){
    var videoWrapper = video.parentNode;
    videoWrapper.parentNode.removeChild(videoWrapper);
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