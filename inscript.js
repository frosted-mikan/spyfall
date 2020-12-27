//FUNCTIONS REGARDING TIMER

//Set current time (remaining time left) as global var, to timein
var currTime = 65; //temp
function setCurrTime(time) {
    currTime = time;
}

//Play/pause button
function pause(roomcode){
    if(document.getElementById("pauseid").innerHTML == "pause"){
        pauseUpdate(roomcode);
    }else {
        resumeUpdate(roomcode);
    }
}

var settime; //var for the countdown 

//Listener for if the game has been paused
function checkPause(roomcode) {
    var rootRef = firebase.database().ref();
    var gameref = rootRef.child('Games');
    var gameroomref = gameref.child(roomcode);
    gameroomref.on("child_changed", function(snap){
      if (document.getElementById("pauseid").innerHTML == "resume") { //resumed
        document.getElementById("pauseid").innerHTML = "pause";
        timer(currTime);
      }else { //paused
        document.getElementById("pauseid").innerHTML = "resume";
        clearInterval(settime);
      }
    });
}
  
//Start timer countdown
function timer(distance) { //duration is in seconds
    settime = setInterval(function() {
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


//Handling locations and suspect lists
//Cross items out (w/o deleting from db)
function strikeThrough(item) {
    item.addEventListener("click", function() {
      item.classList.toggle("done");
    })
};
  
