const videoElement = document.getElementById('local-video');
const canvas = document.getElementById('canvas');

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const blurBtn = document.getElementById('blur-btn');
const unblurBtn = document.getElementById('unblur-btn');

const ctx = canvas.getContext('2d');



blurBtn.addEventListener('click', e => {
    console.log('blur button pressed')
    videoElement.hidden = true;
    canvas.hidden = false;
    loadBodyPix();
});

unblurBtn.addEventListener('click', e => {
  blurBtn.hidden = false;
  unblurBtn.hidden = true;

  videoElement.hidden = false;
  canvas.hidden = true;
});

videoElement.onplaying = () => {
  canvas.height = videoElement.videoHeight;
  canvas.width = videoElement.videoWidth;
};

navigator.mediaDevices.getUserMedia({video: true, audio: false})
.then(stream => {
    videoElement.srcObject = stream;
    // videoElement.play();
})
.catch(err => {
    startBtn.disabled = false;
    blurBtn.disabled = true;
    stopBtn.disabled = true;
    alert(`Following error occured: ${err}`);
});

// function stopVideoStream() {
//   const stream = videoElement.srcObject;

//   stream.getTracks().forEach(track => track.stop());
//   videoElement.srcObject = null;
// }

function loadBodyPix() {
  options = {
    multiplier: 0.75,
    stride: 32,
    quantBytes: 4
  }
  bodyPix.load(options)
    .then(net => perform(net))
    .catch(err => console.log(err))
}

async function perform(net) {

  while (!canvas.hidden) {
    const segmentation = await net.segmentPerson(videoElement);
    console.log(segmentation);

    const backgroundBlurAmount = 6;
    const edgeBlurAmount = 2;
    const flipHorizontal = true;
    // console.log(canvas.height);

    bodyPix.drawBokehEffect(
      canvas, videoElement, segmentation, backgroundBlurAmount,
      edgeBlurAmount, flipHorizontal);
  }
}
