function openNav() {
    document.getElementById("chat").style.width = "250px";
}
  
  /* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
    document.getElementById("chat").style.width = "0";
}

var displayUserScreen;

var screenShareBtn = document.getElementById('btn-share-screen');
screenShareBtn.addEventListener('click', async () =>{
    if (screenShareBtn.innerHTML == 'Share Screen'){
        if(!displayUserScreen){
            displayUserScreen = await navigator.mediaDevices.getDisplayMedia();
        }
        localVideo.srcObject = displayUserScreen;
        var screenTracks = displayUserScreen.getTracks()[0];
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
        screenShareBtn.innerHTML = 'Stop share';
    }
    else{
        if (Object.keys(peerIndex).length>0){
            for (let x in peerIndex){
                var sender = peerIndex[x][0].getSenders().find(function(s){
                    return s.track.kind === 'video';
                })
                console.log('Found sender: ', sender);
                sender.replaceTrack(stream.getVideoTracks()[0]);
            }
        }
        localVideo.srcObject = stream;
        displayUserScreen.getTracks()[0].stop();
        screenShareBtn.innerHTML = 'Share Screen'
    }
})