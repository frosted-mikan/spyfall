//FUNCTIONS REGARDING TIMER

var isPaused = false; //pause has to happen to all timers for every player
// var currTime = timein;
var currTime = 65; //temp
//Play/pause button
function pause(){
    if(document.getElementById("pauseid").innerHTML == "pause"){
        isPaused = true;
        document.getElementById("pauseid").innerHTML = "resume";
    }else {
        isPaused = false;
        document.getElementById("pauseid").innerHTML = "pause";
        countdown();
    }
}
//Handle the countdown timer
function countdown() {
    if(currTime != 0){
        timer(currTime);
    }else {
        window.location.replace("vote.html")
    }
}
//Start timer countdown
function timer(distance) { //duration is in seconds
    var settime = setInterval(function() {
        if (isPaused) { 
            clearInterval(settime);
            return;
        }
        var min = parseInt(distance / 60, 10);
        var sec = parseInt(distance % 60, 10);    
        min = min < 10 ? "0" + min : min;
        sec = sec < 10 ? "0" + sec : sec;

        document.getElementById("timerr").innerHTML = min + ":" + sec;
        --distance;
        currTime = distance;
        if (distance == 0){
            clearInterval(settime);
            window.location.replace("vote.html")
        }

    }, 1000);
}

//timer starts when the ingame page loads 
document.getElementById("timerr").addEventListener("load", timer(65));

//Toggle Identity Image 
function changeImage(){
    if (document.getElementById("icon").src == "http://127.0.0.1:5500/public/hidden.png"){
        // window.alert(document.getElementById("icon").src);
        document.getElementById("icon").src = "http://127.0.0.1:5500/public/spyicon.png";
    }else {
        // window.alert(document.getElementById("icon").src);
        document.getElementById("icon").src = "http://127.0.0.1:5500/public/hidden.png";
    }
}
