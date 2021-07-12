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
    console.log('Blur animation on')
    blurBackground.hidden = false;
    textWrapperBlur.hidden = false;
    textWrapperBlur.innerHTML = textWrapperBlur.textContent.replace(/\S/g, "<span class='letter' style='opacity:0'>$&</span>");
    // setTimeout(()=>{
        anime.timeline({loop: false})
        .add({
            targets: '.blur-mode .letter',
            translateY: [100,0],
            translateZ: 0,
            opacity: [0,1],
            easing: "easeOutExpo",
            duration: 1400,
            delay: (el, i) => 300 + 30 * i
        }).add({
            targets: '.blur-mode .letter',
            translateY: [0,-100],
            opacity: [1,0],
            easing: "easeInExpo",
            duration: 1200,
            delay: (el, i) => 100 + 30 * i
        })
    // }, 1000);
    setTimeout(()=>{
        blurBackground.hidden=true;
        textWrapperBlur.hidden=true;
        textWrapperBlur.innerHTML='Blur Mode on'
        executeBlur();
    },5000);
}

$(function(){
$('#toggle-blur-mode').popover({
    // title:"Something",
    container:"body",
    trigger:'manual',
    content:"<h4>Please stop god's eye to use blur filter</h4>",
    html:true,
    placement:"top"
});
})
    

blurBtn.addEventListener('click', e=>{
    if (canvas.hidden){
        blurMode();
    }else{
        localVideo.hidden=false;
        multipleCamerasButton.disabled=false;
        screenShareBtn.disabled = false;
        navigator.mediaDevices.getUserMedia(devices)
            .then(incomingStream =>{
                localVideo.srcObject = incomingStream;
                var tempLocalTracks = incomingStream.getVideoTracks();
                videoTracks = tempLocalTracks;
                broadcastingStream = incomingStream;
                console.log(incomingStream);
                if (Object.keys(peerIndex).length>0){
                    for (let x in peerIndex){
                        var sender = peerIndex[x][0].getSenders().find(function(s){
                            console.log(s);
                            return s.track.kind == tempLocalTracks[0].kind;
                        })
                        console.log('Found sender: ', sender);
                        sender.replaceTrack(tempLocalTracks[0]);
                    }
                }
            })
        canvas.hidden=true;
    }
})

function executeBlur(){
    multipleCamerasButton.disabled=true;
    screenShareBtn.disabled = true;
    canvas.height = localVideo.height;
    canvas.width = localVideo.width;
    localVideo.hidden = true;
    canvas.hidden = false;
    var tempStream = canvas.captureStream();
    var tempLocalTracks = tempStream.getVideoTracks();
    // videoTracks = tempLocalTracks;
    broadcastingStream = tempStream;
    console.log(tempLocalTracks);
    console.log(peerIndex);
    if (Object.keys(peerIndex).length>0){
        for (let x in peerIndex){
            var sender = peerIndex[x][0].getSenders().find(function(s){
                console.log(s);
                return s.track.kind == tempLocalTracks[0].kind;
            })
            console.log('Found sender: ', sender);
            sender.replaceTrack(tempLocalTracks[0]);
        }
    }
    perform(net);
}

// if(multipleCamerasButton.innerHTML == '<i class="bi bi-eye-slash-fill"></i>'){
//     $('#toggle-blur-mode').popover('show');
//     setTimeout(()=>{$('#toggle-blur-mode').popover('hide');}, 2000)
// }else{
//     if (canvas.hidden){
//         // blurMode();
//         canvas.height = localVideo.height;
//         // localVideo.width = localVideo.width*0.87;
//         canvas.width = localVideo.width;
//         localVideo.hidden = true;
//         canvas.hidden = false;
//         var tempStream = canvas.captureStream();
//         var tempLocalTracks = tempStream.getVideoTracks();
//         // videoTracks = tempLocalTracks;
//         broadcastingStream = tempStream;
//         console.log(tempLocalTracks);
//         console.log(peerIndex);
//         if (Object.keys(peerIndex).length>0){
//             for (let x in peerIndex){
//                 var sender = peerIndex[x][0].getSenders().find(function(s){
//                     console.log(s);
//                     return s.track.kind == tempLocalTracks[0].kind;
//                 })
//                 console.log('Found sender: ', sender);
//                 sender.replaceTrack(tempLocalTracks[0]);
//             }
//         }
//         perform(net);
//     }else{
//         // localVideo.style.width="100%";
//         localVideo.hidden=false;
//         navigator.mediaDevices.getUserMedia(devices)
//             .then(incomingStream =>{
//                 localVideo.srcObject = incomingStream;
//                 var tempLocalTracks = incomingStream.getVideoTracks();
//                 videoTracks = tempLocalTracks;
//                 broadcastingStream = incomingStream;
//                 console.log(incomingStream);
//                 if (Object.keys(peerIndex).length>0){
//                     for (let x in peerIndex){
//                         var sender = peerIndex[x][0].getSenders().find(function(s){
//                             console.log(s);
//                             return s.track.kind == tempLocalTracks[0].kind;
//                         })
//                         console.log('Found sender: ', sender);
//                         sender.replaceTrack(tempLocalTracks[0]);
//                     }
//                 }
//             })
//         canvas.hidden=true;
//     }
// }

// localVideo.onplaying = () => {
//     canvas.height = localVideo.videoHeight;
//     canvas.width = localVideo.videoWidth;
// };

async function perform(net) {

    while(!canvas.hidden){
        const segmentation = await net.segmentPerson(localVideo);

        const backgroundBlurAmount = 6;
        const edgeBlurAmount = 2;
        const flipHorizontal = true;
        bodyPix.drawBokehEffect(
            canvas, localVideo, segmentation, backgroundBlurAmount,
            edgeBlurAmount, flipHorizontal
        );
    }
}