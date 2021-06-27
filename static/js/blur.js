const blurBtn = document.getElementById('toggle-blur-mode');
const canvas = document.getElementById('blur-canvas');

options = {
      multiplier: 0.75,
      stride: 32,
      quantBytes: 4
}

var net;
bodyPix.load(options).then(function(loadedModel){
    net = loadedModel;
    blurBtn.hidden = false;
})

var textWrapperBlur = document.querySelector('.blur-mode');
function blurMode(){
    // container.hidden = true;
    blurBackground.hidden = false;
    textWrapperBlur.innerHTML = textWrapperBlur.textContent.replace(/\S/g, "<span class='letter' style='opacity:0'>$&</span>");
    setTimeout(()=>{
        anime.timeline({loop: false})
        .add({
            targets: '.blur-mode .letter',
            translateY: [100,0],
            translateZ: 0,
            opacity: [0,1],
            easing: "easeOutExpo",
            duration: 800,
            delay: (el, i) => 300 + 30 * i
        }).add({
            targets: '.blur-mode .letter',
            translateY: [0,-100],
            opacity: [1,0],
            easing: "easeInExpo",
            duration: 1000,
            delay: (el, i) => 100 + 30 * i
        })
    }, 1000);
    textWrapperBlur.hidden = false;
    setTimeout(()=>{
        blurBackground.hidden=true;
        textWrapperBlur.hidden=true;
        textWrapperBlur.innerHTML='Blur Mode on'
    },5000);
}

blurBtn.addEventListener('click', e=>{
    if (canvas.hidden){
        blurMode();
        // localVideo.width = 0;
        localVideo.hidden = true;
        // localVideo.play = true;
        canvas.hidden = false;
        // loadBodyPix();
        var tempStream = canvas.captureStream();
        var tempLocalTracks = tempStream.getVideoTracks()[0];
        broadcastingStream = tempStream;
        console.log(tempLocalTracks);
        console.log(peerIndex);
        if (Object.keys(peerIndex).length>0){
            for (let x in peerIndex){
                var sender = peerIndex[x][0].getSenders().find(function(s){
                    console.log(s);
                    return s.track.kind == tempLocalTracks.kind;
                })
                console.log('Found sender: ', sender);
                sender.replaceTrack(tempLocalTracks);
            }
        }
        perform(net);

    }else{
        localVideo.hidden=false;
        navigator.mediaDevices.getUserMedia(devices)
            .then(incomingStream =>{
                localVideo.srcObject = incomingStream;
                var tempLocalTracks = incomingStream.getVideoTracks()[0];
                broadcastingStream = incomingStream;
                console.log(incomingStream);
                if (Object.keys(peerIndex).length>0){
                    for (let x in peerIndex){
                        var sender = peerIndex[x][0].getSenders().find(function(s){
                            console.log(s);
                            return s.track.kind == tempLocalTracks.kind;
                        })
                        console.log('Found sender: ', sender);
                        sender.replaceTrack(tempLocalTracks);
                    }
                }
            })
        canvas.hidden=true;
    }
})

localVideo.onplaying = () => {
    canvas.height = localVideo.videoHeight;
    canvas.width = localVideo.videoWidth;
};

async function perform(net) {

    while(!canvas.hidden){
        const segmentation = await net.segmentPerson(localVideo);
        // console.log(segmentation);

        const backgroundBlurAmount = 6;
        const edgeBlurAmount = 2;
        const flipHorizontal = false;
        // console.log(canvas.height);

        bodyPix.drawBokehEffect(
            canvas, localVideo, segmentation, backgroundBlurAmount,
            edgeBlurAmount, flipHorizontal
        );
    }
}