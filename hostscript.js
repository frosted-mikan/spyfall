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
 
 function copyclip(text) {
    var dummy = document.createElement("textarea");
    // to avoid breaking orgain page when copying more words
    // cant copy when adding below this code
    // dummy.style.display = 'none'
    document.body.appendChild(dummy);
    //Be careful if you use texarea. setAttribute('value', value), which works with "input" does not work with "textarea". – Eduard
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    // alert("Copied the text: " + text);
    
    var x = document.getElementById("copy");
    x.src = "http://127.0.0.1:5500/public/checkicon.png";
    setTimeout(function(){ 
        x.src = "http://127.0.0.1:5500/public/copyicon.png";
    }, 3000);
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

//Functions involved in Locations
var input = document.getElementById("input");
var btn = document.getElementById("btn");
var ul = document.querySelector("ul");
var li = document.querySelectorAll("li");
var selection = document.getElementById("locations_select");

//Check if anything was inputed
function getLength() {
  return input.value.length;
};

//Add one custom location to list
function createElement() {
    var len = document.getElementById("loclist").getElementsByTagName("li").length;
    if (len < 53) {
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(input.value));
        ul.appendChild(li);
        input.value = "";
        strikeThrough(li);    
    }else {
        input.placeholder = "Cannot Add More";
        input.readonly = readonly;
    }
};

//Import lists
function createElemImport1() {
    var spyfall1 = ['Airplane','Bank','Beach','Broadway Theater','Casino','Cathedral','Circus Tent','Corporate Party',
                    'Crusader Army','Day Spa','Embassy','Hospital','Hotel','Military Base','Movie Studio',
                    'Ocean Liner','Passenger Train','Pirate Ship','Polar Station','Police Station','Restaurant',
                    'School','Service Station','Space Station','Submarine','Supermarket','University'];
    for (var i = 0; i < spyfall1.length; ++i) {
        var len = document.getElementById("loclist").getElementsByTagName("li").length;
        if (len < 53){
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(spyfall1[i]));
            ul.appendChild(li);
            strikeThrough(li);        
        }else {
            break;
        }
    }
};

function createElemImport2() {
    var spyfall2 = ['Amusement Park','Art Museum','Candy Factory','Cat Show','Cemetery','Coal Mine','Construction Site',
                    'Gaming Convention','Gas Station','Harbor Docks','Ice Hockey Stadium','Jail','Jazz Club','Library',
                    'Night Club','Race Track','Retirement Home','Rock Concert','Sightseeing Bus','Stadium','Subway','The U.N.',
                    'Vineyard','Wedding','Zoo'];
    for (var i = 0; i < spyfall2.length; ++i) {
        var len = document.getElementById("loclist").getElementsByTagName("li").length;
        if (len < 53){
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(spyfall2[i]));
            ul.appendChild(li);
            strikeThrough(li);        
        }else {
            break;
        }
    }
};

//Checking which import option is chosen
function getChoice() {
    var opt = selection.options[selection.selectedIndex].value;
    if (opt == "spyfall1"){
        createElemImport1();
    }else if (opt == "spyfall2") {
        createElemImport2();
    }
};

//Processing Input
function click() {
  if (getLength() > 0) {
    createElement();
  }
};

function keyPress() {
  if (getLength() > 0 && event.which === 13) {
    createElement();
  }
};

//Cross items out
function strikeThrough(item) {
  item.addEventListener("click", function() {
    item.classList.toggle("done");
  })
};

li.forEach((e) => {strikeThrough(e); });

//Event listeners
selection.addEventListener("click", getChoice);
btn.addEventListener("click", click);
input.addEventListener("keypress", keyPress);

//Clear the list
function clearList() {
    while(ul.firstChild ){
        ul.removeChild(ul.firstChild );
    }
}


  