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

blurBtn.addEventListener('click', e=>{
    if (canvas.hidden){
        // localVideo.width = 0;
        localVideo.hidden = true;
        // localVideo.play = true;
        canvas.hidden = false;
        // loadBodyPix();
        var tempStream = canvas.captureStream();
        var tempLocalTracks = tempStream.getVideoTracks()[0];
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
        const flipHorizontal = true;
        // console.log(canvas.height);

        bodyPix.drawBokehEffect(
            canvas, localVideo, segmentation, backgroundBlurAmount,
            edgeBlurAmount, flipHorizontal
        );
    }
}