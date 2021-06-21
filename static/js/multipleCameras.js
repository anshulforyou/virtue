// import { setOnTrack, video, peerIndex, username } from "./connect";

const demosSection = document.getElementById('demos');
var multipleCamerasButton = document.querySelector('#multiple-cameras-button')
var model = undefined;

faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh).then(function(loadedModel){
    model = loadedModel;
    demosSection.classList.remove('invisible');
})

var mediaDevices = navigator.mediaDevices.enumerateDevices();
var cameras = [];
mediaDevices.then(function(result){
    for (let i=0;i<result.length;i++){
        // console.log(devices[i]);
        if (result[i]['kind'] == "videoinput"){
            cameras.push(result[i]);
        }
    }
})

console.log(cameras);

function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
}

if (getUserMediaSupported()) {
    multipleCamerasButton.addEventListener('click', enableCam);
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
    
    var videoWrapper = document.createElement('div');
    videoContainer.appendChild(videoWrapper);
    videoWrapper.appendChild(remoteVideo);

    return remoteVideo;
}

async function enableCam(event) {
    
    if (!model) {
      return;
    }
    
    // Hide the button once clicked.
    event.target.classList.add('removed');  
    
    for (let i=0;i<cameras.length;i++){
        videoElement = await createFaceDetect(cameras[i]['deviceId']);
        console.log(videoElement);
        await navigator.mediaDevices.getUserMedia({
            video:{
                deviceId : {exact:cameras[i]['deviceId']}
            }
        })
        .then(function(stream){
            videoElement.srcObject = stream;
            console.log(videoElement);
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

    const predictions = await model.estimateFaces({
        input: videoEle
    });
  
    if (predictions.length > 0) {
  
      for (let i = 0; i < predictions.length; i++) {
        const keypoints = predictions[i].scaledMesh;
        
        console.log("Camera: "+t);
        const nose = await addPoints(keypoints[6], keypoints[197], keypoints[195], keypoints[5], keypoints[4]);
        console.log("Camera: "+t+" :"+nose);
        if (nose[0]>280 && nose[0]<400){
            console.log("User is facing camera "+t);
            video.srcObject = videoEle.srcObject;
            var localVideoTrack = videoEle.srcObject.getVideoTracks()[0];
            console.log(peerIndex);

            if (Object.keys(peerIndex).length>0){
                for (let x in peerIndex){
                    var sender = peerIndex[x][0].getSenders().find(function(s){
                        return s.track.kind == localVideoTrack.kind;
                    })
                    console.log('Found sender: ', sender);
                    sender.replaceTrack(localVideoTrack);
                    // setOnTrack(peerIndex[x][0], video);
                    // peerIndex[x][0].replaceTrack(localVideoTrack);
                    // console.log(peerIndex[x]);
                }
            }
            // for (let j =1; j<cameras.length;j++){
            //     if (cameras[j]['deviceId']!=deviceLabel){
            //         var temp = document.getElementById(cameras[j]['deviceId']);
            //         console.log(video);
            //         video.srcObject = temp.srcObject;
            //         console.log(video);
            //         // setOnTrack(peerIndex[username][0], video);
            //         // temp.style.width = 0;
            //     }
            // }
            // videoEle.style.width = "calc(100% - 20px)";
        }
      }
    }
    setTimeout(() => {main(deviceLabel, t);}, 5000)
  }

async function addPoints([x1, y1, z1], [x2, y2, z2], [x3, y3, z3], [x4, y4, z4], [x5, y5, z5]){
    const tempX = (x1+x2+x3+x4+x5)/5;
    const tempY = (y1+y2+y3+y4+y5)/5;
    const tempZ = (z1+z2+z3+z4+z5)/5;
    return [tempX,tempY,tempZ];
}