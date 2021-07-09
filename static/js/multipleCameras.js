// import { setOnTrack, video, peerIndex, username } from "./connect";


var model = undefined;

faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh).then(function(loadedModel){
    model = loadedModel;
    multipleCamerasButton.hidden = false;
})

var blurBackground = document.querySelector('.blur-background')
var textWrapperGod = document.querySelector('.gods-eye');

function godEyeAnime(e){
    blurBackground.hidden = false;
    textWrapperGod.innerHTML = textWrapperGod.textContent.replace(/\S/g, "<span class='letter' style='opacity:0'>$&</span>");

    // setTimeout(()=>{
        anime.timeline({loop: false})
        .add({
            targets: '.gods-eye .letter',
            translateY: [100,0],
            translateZ: 0,
            opacity: [0,1],
            easing: "easeOutExpo",
            duration: 1400,
            delay: (el, i) => 300 + 30 * i
        }).add({
            targets: '.gods-eye .letter',
            translateY: [0,-100],
            opacity: [1,0],
            easing: "easeInExpo",
            duration: 1200,
            delay: (el, i) => 100 + 30 * i
        });
    // },1000);
    textWrapperGod.hidden = false;
    setTimeout(()=>{
        blurBackground.hidden=true;
        textWrapperGod.hidden=true;
        textWrapperGod.innerHTML="God\'s eye on";
        // executeGodsEye();
        multipleCamerasButton.innerHTML = '<i class="bi bi-eye-slash-fill"></i>';
        enableCam(e);
    },3500);
}

var cameras = [];

function searchCameras(){
    var mediaDevices = navigator.mediaDevices.enumerateDevices();
    cameras = [];
    mediaDevices.then(function(result){
        for (let i=0;i<result.length;i++){
            // console.log(result[i]);
            if (result[i]['kind'] == "videoinput"){
                cameras.push(result[i]);
            }
        }
    })
    console.log(cameras);
}

searchCameras();

function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
}

$(function(){
$('#multiple-cameras-button').popover({
    // title:"Something",
    container:"body",
    trigger:'manual',
    content:"<h4>Please connect multiple cameras to use God's Eye</h4>",
    html:true,
    placement:"top"
});
})

function executeGodsEye(){
    multipleCamerasButton.innerHTML = '<i class="bi bi-eye-slash-fill"></i>';
    enableCam(e);
}

if (getUserMediaSupported()) {
    multipleCamerasButton.addEventListener('click',(e) =>{
        console.log('button clicked')
        console.log(multipleCamerasButton.firstChild);
        if(!canvas.hidden){
            $('#multiple-cameras-button').popover('show');
            setTimeout(()=>{$('#multiple-cameras-button').popover('hide');}, 2000)
        }else{
            if (multipleCamerasButton.innerHTML == '<i class="bi bi-eye-fill"></i>'){
                console.log('entered')
                if(cameras.length>1){
                    godEyeAnime(e);
                }else{
                    console.log('else block executed');
                    $('#multiple-cameras-button').popover('show');
                    searchCameras();
                    setTimeout(()=>{$('#multiple-cameras-button').popover('hide');}, 2000)
                }
            }else if(multipleCamerasButton.innerHTML == '<i class="bi bi-eye-slash-fill"></i>'){
                multipleCamerasButton.innerHTML = '<i class="bi bi-eye-fill"></i>';
                localVideo.srcObject = localStream;
                var localVideoTrack2 = localStream.getVideoTracks();
                videoTracks = localVideoTrack2;
                if (Object.keys(peerIndex).length>0){
                    for (let x in peerIndex){
                        var sender = peerIndex[x][0].getSenders().find(function(s){
                            return s.track.kind == localVideoTrack2[0].kind;
                        })
                        console.log('Found sender: ', sender);
                        sender.replaceTrack(localVideoTrack2[0]);
                    }
                }
            }
        }
    });
} else {
    console.warn('getUserMedia() is not supported by your browser');
}

async function createFaceDetect(label){
    var videoContainer = document.querySelector('#video-box');
    var remoteVideo = document.createElement('video');
    remoteVideo.id = label;
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.style.width = 0;
    remoteVideo.style.height = 0;
    
    var videoWrapper = document.createElement('div');
    videoWrapper.style.width = 0;
    videoContainer.appendChild(videoWrapper);
    videoWrapper.appendChild(remoteVideo);

    return remoteVideo;
}

function removeCamera(){
    for (var x =0;x<cameras.length;x++){
        var cam = document.getElementById(cameras[x]['deviceId']);
        cam.parentElement.remove();
    }
}

async function enableCam(event) {
    
    if (!model) {
      return;
    }
    for (let i=0;i<cameras.length;i++){
        videoElement = await createFaceDetect(cameras[i]['deviceId']);
        // console.log(videoElement);
        await navigator.mediaDevices.getUserMedia({
            video:{
                deviceId : {exact:cameras[i]['deviceId']}
            }
        })
        .then(function(stream){
            videoElement.srcObject = stream;
            // console.log(videoElement);
            // videoElement.addEventListener('loadeddata', main(cameras[i]['deviceId']));
            videoElement.onloadeddata = (event) =>{
                main(cameras[i]['deviceId'], i);
            };
        })
        .catch(error => {
            console.log("Error in accessing video device", error);
        });
    }
}

async function main(deviceLabel, t) {
    var videoEle = document.getElementById(deviceLabel);
    // console.log(videoEle);
    const predictions = await model.estimateFaces({
        input: videoEle
    });
  
    if (predictions.length > 0) {
  
      for (let i = 0; i < predictions.length; i++) {
        const keypoints = predictions[i].scaledMesh;
        
        // console.log("Camera: "+t);
        const nose = await addPoints(keypoints[6], keypoints[197], keypoints[195], keypoints[5], keypoints[4]);
        // console.log("Camera: "+t+" :"+nose);
        if (nose[0]>280 && nose[0]<400){
            // console.log("User is facing camera "+t);
            if(localVideo.srcObject!=videoEle.srcObject){
                localVideo.srcObject = videoEle.srcObject;
                broadcastingStream = videoEle.srcObject;
                var localVideoTrack = videoEle.srcObject.getVideoTracks();
                // console.log(peerIndex);
                videoTracks = localVideoTrack;

                if (Object.keys(peerIndex).length>0){
                    for (let x in peerIndex){
                        var sender = peerIndex[x][0].getSenders().find(function(s){
                            return s.track.kind == localVideoTrack[0].kind;
                        })
                        // console.log('Found sender: ', sender);
                        sender.replaceTrack(localVideoTrack[0]);
                    }
                }
            }
        }
      }
    }
    if (multipleCamerasButton.innerHTML == '<i class="bi bi-eye-slash-fill"></i>'){
        setTimeout(() => {main(deviceLabel, t);}, 3000)
    }else{
        removeCamera();
    }
  }

async function addPoints([x1, y1, z1], [x2, y2, z2], [x3, y3, z3], [x4, y4, z4], [x5, y5, z5]){
    const tempX = (x1+x2+x3+x4+x5)/5;
    const tempY = (y1+y2+y3+y4+y5)/5;
    const tempZ = (z1+z2+z3+z4+z5)/5;
    return [tempX,tempY,tempZ];
}