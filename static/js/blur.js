const blurBtn = document.getElementById('toggle-blur-mode');
const canvas = document.getElementById('blur-canvas');

// const ctx = canvas.getContext('2d');

options = {
    //   architecture:'ResNet50',
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
        // localVideo.hidden = true;
        localVideo.style.display = 'None';
        localVideo.play = true;
        canvas.hidden = false;
        // loadBodyPix();
        navigator.mediaDevices.getUserMedia(devices)
            .then(incomingStream => {
                localVideo.srcObject = incomingStream;
                localVideo.onloadeddata = (event) =>{
                    perform(net);
                }
            })
        // perform(net);

    }else{
        localVideo.hidden=false;
        canvas.hidden=true;
    }
})

localVideo.onplaying = () => {
    canvas.height = localVideo.videoHeight;
    canvas.width = localVideo.videoWidth;
};

// function loadBodyPix() {
//     options = {
//     //   architecture:'ResNet50',
//       multiplier: 0.75,
//       stride: 32,
//       quantBytes: 4
//     }
//     bodyPix.load(options)
//       .then(net => {
        // navigator.mediaDevices.getUserMedia(devices)
        //     .then(incomingStream => {
        //         localVideo.srcObject = incomingStream;
        //         localVideo.onloadeddata = (event) =>{
        //             perform(net);
        //         }
        //     })
            
//       })
//       .catch(err => console.log(err))
// }

async function perform(net) {

    while(!canvas.hidden){
        const segmentation = await net.segmentPerson(localVideo);
        console.log(segmentation);

        const backgroundBlurAmount = 6;
        const edgeBlurAmount = 2;
        const flipHorizontal = true;
        // console.log(canvas.height);

        await bodyPix.drawBokehEffect(
            canvas, localVideo, segmentation, backgroundBlurAmount,
            edgeBlurAmount, flipHorizontal
        );
    }
}