function openNav() {
    document.getElementById("chat").style.width = "250px";
}
  
  /* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
    document.getElementById("chat").style.width = "0";
}

var displayUserScreen;
var screenFlag = false;
var screenShareBtn = document.getElementById('btn-share-screen');
screenShareBtn.addEventListener('click', async () =>{
    if (!screenFlag){
        // if(!displayUserScreen){
        displayUserScreen = await navigator.mediaDevices.getDisplayMedia();
        localVideo.srcObject = displayUserScreen;
        var screenTracks = displayUserScreen.getTracks()[0];
        screenFlag = true;
        console.log(screenFlag);
        console.log(screenTracks);
        if (Object.keys(peerIndex).length>0){
            for (let x in peerIndex){
                var sender = peerIndex[x][0].getSenders().find(function(s){
                    return s.track.kind === 'video';
                })
                console.log('Found sender: ', sender);
                sender.replaceTrack(screenTracks);
            }
        }
        localVideo.style.transform = "initial";
        // screenShareBtn.innerHTML = 'Stop share';
    }
    else{
        screenFlag = false;
        console.log(screenFlag);
        localVideo.style.removeProperty('transform');
        localVideo.style.transform = "scaleX(-1);"
        if (Object.keys(peerIndex).length>0){
            for (let x in peerIndex){
                var sender = peerIndex[x][0].getSenders().find(function(s){
                    return s.track.kind === 'video';
                })
                console.log('Found sender: ', sender);
                sender.replaceTrack(localStream.getVideoTracks()[0]);
            }
        }
        localVideo.srcObject = localStream;
        displayUserScreen.getTracks()[0].stop();
        screenShareBtn.innerHTML = '<i class="bi bi-display-fill"></i>'
    }
})