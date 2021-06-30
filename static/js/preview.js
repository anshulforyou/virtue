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
        sessionStorage.setItem('audioOn', true);
        micButton.innerHTML = 'Mute';
    }else{
        localVideo.muted = true;
        sessionStorage.setItem('audioOn', false);
        micButton.innerHTML = 'Unmute';
    }
})


const devices = {
    'video':true,
    // 'audio':true
};

navigator.mediaDevices.getUserMedia(devices)
    .then(incomingStream =>{
        console.log(incomingStream);
        localVideo.srcObject = incomingStream;
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