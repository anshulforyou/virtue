var ml4 = {};
ml4.opacityIn = [0,1];
ml4.scaleIn = [0.2, 1];
ml4.scaleOut = 3;
ml4.durationIn = 800;
ml4.durationOut = 600;
ml4.delay = 500;

var xd = document.getElementById('ml4');
var container = document.getElementById('main-screen');

var loc = window.location;

anime.timeline({loop: false})
.add({
    targets: '.ml4 .letters-1',
    opacity: ml4.opacityIn,
    scale: ml4.scaleIn,
    duration: ml4.durationIn
}).add({
    targets: '.ml4 .letters-1',
    opacity: 0,
    scale: ml4.scaleOut,
    duration: ml4.durationOut,
    easing: "easeInExpo",
    delay: ml4.delay
}).add({
    targets: '.ml4 .letters-2',
    opacity: ml4.opacityIn,
    scale: ml4.scaleIn,
    duration: ml4.durationIn
}).add({
    targets: '.ml4 .letters-2',
    opacity: 0,
    scale: ml4.scaleOut,
    duration: ml4.durationOut,
    easing: "easeInExpo",
    delay: ml4.delay
}).add({
    targets: '.ml4 .letters-3',
    opacity: ml4.opacityIn,
    scale: ml4.scaleIn,
    duration: ml4.durationIn
}).add({
    targets: '.ml4 .letters-3',
    opacity: 0,
    scale: ml4.scaleOut,
    duration: ml4.durationOut,
    easing: "easeInExpo",
    delay: ml4.delay
}).add({
    targets: '.ml4',
    opacity: 0,
    duration: 500,
    delay: 500
});

setTimeout(()=>{
    xd.hidden=true;
    container.hidden=false;
},5000)

var modal = document.getElementById("myModal");
 
var btn = document.getElementById("invite-button");

var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

var roomsecret = JSON.parse(document.getElementById('roomname').textContent);
// console.log(roomsecret);

var invitationForm = document.getElementById('invitation-form');
invitationForm.addEventListener('submit', function(event){
    event.preventDefault();
    invitePeople();
});

function invitePeople(){
    console.log("invite people executed")
    const XHR = new XMLHttpRequest();
    var FD = new FormData(invitationForm);
    FD.append('room', roomsecret);
    for ( var pair of FD.entries()){
        console.log(pair);
    }
    var success = document.getElementById("modal-success");
    XHR.addEventListener("load", function(event){
        success.hidden = false;
        console.log(event)
    })
    XHR.addEventListener("error", function(event){
        console.log(event);
    })
    XHR.open("POST", "https://virtue.tk/room/invite");
    XHR.send(FD);
}