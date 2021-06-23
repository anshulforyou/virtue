var localVideo = document.getElementById("local-video");
var canvas = document.getElementById('blur-canvas');
var micButton = document.getElementById('toggle-audio-button');
var cameraButton = document.getElementById('toggle-video-button');

cameraButton.addEventListener('click', () => {
    if (localVideo.hidden){
        localVideo.hidden = false;
        cameraButton.innerHTML = 'Video off';
    }else{
        localVideo.hidden = true;
        cameraButton.innerHTML = 'Video on';
    }
})

micButton.addEventListener('click', () => {
    if (localVideo.muted){
        localVideo.muted = false;
        micButton.innerHTML = 'Mute';
    }else{
        localVideo.muted = true;
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