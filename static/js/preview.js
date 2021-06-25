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

var ml4 = {};
ml4.opacityIn = [0,1];
ml4.scaleIn = [0.2, 1];
ml4.scaleOut = 3;
ml4.durationIn = 800;
ml4.durationOut = 600;
ml4.delay = 500;

var mainScreen = document.getElementById('main-screen');
ml4Screen = document.getElementById('ml4');
var joinBtn = document.getElementById('btn-join');

joinBtn.addEventListener('click', ()=>{
    mainScreen.hidden = true;
    ml4Screen.hidden = false;
    anime.timeline({loop: false})
    .add({
        targets: '.ml4 .letters-1',
        opacity: ml4.opacityIn,
        scale: ml4.scaleIn,
        duration: ml4.durationIn
    }).add({
        targets: '.ml4 .letters-1',
        opacity: 0,
        scale: ml4.scaleOut,
        duration: ml4.durationOut,
        easing: "easeInExpo",
        delay: ml4.delay
    }).add({
        targets: '.ml4 .letters-2',
        opacity: ml4.opacityIn,
        scale: ml4.scaleIn,
        duration: ml4.durationIn
    }).add({
        targets: '.ml4 .letters-2',
        opacity: 0,
        scale: ml4.scaleOut,
        duration: ml4.durationOut,
        easing: "easeInExpo",
        delay: ml4.delay
    }).add({
        targets: '.ml4 .letters-3',
        opacity: ml4.opacityIn,
        scale: ml4.scaleIn,
        duration: ml4.durationIn
    }).add({
        targets: '.ml4 .letters-3',
        opacity: 0,
        scale: ml4.scaleOut,
        duration: ml4.durationOut,
        easing: "easeInExpo",
        delay: ml4.delay
    }).add({
        targets: '.ml4',
        opacity: 0,
        duration: 500,
        delay: 500
    });
    setTimeout(() => {document.getElementById('preview-form').submit()}, 5000)
})