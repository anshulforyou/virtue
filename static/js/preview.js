var localVideo = document.getElementById("local-video");
var canvas = document.getElementById('blur-canvas');
var micButton = document.getElementById('toggle-audio-button');
var cameraButton = document.getElementById('toggle-video-button');

if(typeof(Storage)!=='undefined'){
    // try{
    //     localVideo.muted = sessionStorage.getItem('audioMuted');
    //     localVideo.hidden = sessionStorage.getItem('videoVisible');
    //     console.log('value');
    // }
    // catch(error){
    //     console.log('something');
    //     sessionStorage.setItem('audioMuted', false);
    //     sessionStorage.setItem('videoVisible', true);
    // }
    sessionStorage.setItem('audioOn', true);
    sessionStorage.setItem('videoVisible', true);
}else{
    console.log('Browser is not supporting some features of the application');
}

// sessionStorage.setItem('audioMuted', false);
// sessionStorage.setItem('videoVisible', true);

const devices = {
    'video':true,
    'audio':true
};

navigator.mediaDevices.getUserMedia(devices)
    .then(incomingStream =>{
        console.log(incomingStream);
        localVideo.srcObject = incomingStream;
        var audioTracks = incomingStream.getAudioTracks();
        var videoTracks = incomingStream.getVideoTracks();

        cameraButton.addEventListener('click', () => {
            videoTracks[0].enabled = !videoTracks[0].enabled;
            if (videoTracks[0].enabled){
                cameraButton.innerHTML = 'Video off';
                sessionStorage.setItem('videoVisible', true);
                return;
            }
            cameraButton.innerHTML = 'Video on';
            sessionStorage.setItem('videoVisible', false);
        })

        micButton.addEventListener('click', () => {
            audioTracks[0].enabled = !audioTracks[0].enabled;
            if (audioTracks[0].enabled){
                micButton.innerHTML = 'Mute';
                sessionStorage.setItem('audioOn', true);
                return;
            }
            micButton.innerHTML = 'Unmute';
            sessionStorage.setItem('audioOn', false);
        })
    })

localVideo.onplaying = () => {
    canvas.height = localVideo.style.height;
    canvas.width = localVideo.style.width;
}

anime.timeline({loop: false})
  .add({
    targets: '.ml15 .word',
    scale: [14,1],
    opacity: [0,1],
    easing: "easeOutCirc",
    duration: 800,
    delay: (el, i) => 800 * i
  });
//   }).add({
//     targets: '.ml15',
//     opacity: 0,
//     duration: 1000,
//     easing: "easeOutExpo",
//     delay: 1000
//   });