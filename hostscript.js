//Generate Random Room Code
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
 
//Copy to Clipboard
function copyclip() {
    /* Get the text field */
    var copyText = document.getElementById("myInput");
  
    /* Select the text field */
    copyText.select();
    // copyText.setSelectionRange(0, 99999); /* For mobile devices */
  
    /* Copy the text inside the text field */
    document.execCommand("copy");
  
    /* Alert the copied text */
    alert("Copied the text: " + copyText.value);
  }

//Set Timer
// var myVar;
var countDownSeconds;

function getTime(){
    document.getElementById("userInput").innerHTML = countDownSeconds;
    return countDownSeconds;
}
// function startTime(){ 
//     myVar = setInterval(start, 1000);
//     var timer = document.getElementById("userInput");
//     document.getElementById("timerr").innerHTML = timer.value;
//     countDownSeconds = timer.value;
// } 

// function start(){
//     countDownSeconds--;
//     document.getElementById("timerr").innerHTML = countDownSeconds;
//     if (countDownSeconds == -1){
//       stop();
//       document.getElementById("timerr").innerHTML = "0";  
//     }
// }

// function stop(){
//     clearInterval(myVar);
// }    

function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}

window.onload = function () {
    var min = 60*5;
    // var min = 60*countDownSeconds;
    display = document.querySelector('#timerr');
    startTimer(min, display);
};

//addminutes
// function startTimer(duration, display) {
//     var timer = duration, minutes, seconds;
//     setInterval(function () {
//         minutes = parseInt(timer / 60, 10);
//         seconds = parseInt(timer % 60, 10);

//         minutes = minutes < 10 ? "0" + minutes : minutes;
//         seconds = seconds < 10 ? "0" + seconds : seconds;

//         display.textContent = minutes + ":" + seconds;

//         if (--timer < 0) {
//             timer = duration;
//         }
//     }, 1000);
// }

// window.onload = function () {
//     var fiveMinutes = 60 * 5,
//         display = document.querySelector('#time');
//     startTimer(fiveMinutes, display);
// };

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