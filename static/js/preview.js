var localVideo = document.getElementById("local-video");
var canvas = document.getElementById('blur-canvas');
var micButton = document.getElementById('toggle-audio-button');
var cameraButton = document.getElementById('toggle-video-button');

if(typeof(Storage)!=='undefined'){
    try{
        localVideo.muted = sessionStorage.getItem('audioMuted');
        localVideo.hidden = sessionStorage.getItem('videoVisible');
        console.log('value');
    }
    catch(error){
        console.log('something');
        sessionStorage.setItem('audioMuted', false);
        sessionStorage.setItem('videoVisible', true);
    }
}else{
    console.log('Browser is not supporting some features of the application');
}

cameraButton.addEventListener('click', () => {
    if (localVideo.hidden){
        localVideo.hidden = false;
        sessionStorage.setItem('videoVisible',true);
        cameraButton.innerHTML = 'Video off';
    }else{
        localVideo.hidden = true;
        sessionStorage.setItem('videoVisible',false);
        cameraButton.innerHTML = 'Video on';
    }
})

micButton.addEventListener('click', () => {
    if (localVideo.muted){
        localVideo.muted = false;
        sessionStorage.setItem('audioMuted', false);
        micButton.innerHTML = 'Mute';
    }else{
        localVideo.muted = true;
        sessionStorage.setItem('audioMuted', true);
        micButton.innerHTML = 'Unmute';
    }
})


const devices = {
    'video':true,
    'audio':true
};

navigator.mediaDevices.getUserMedia(devices)
    .then(incomingStream =>{
        localVideo.srcObject = incomingStream;
    })

localVideo.onplaying = () => {
    canvas.height = localVideo.style.height;
    canvas.width = localVideo.style.width;
}