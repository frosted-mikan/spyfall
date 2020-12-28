//SUMMON THE MODAL
// Get the modal
var modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close_host")[0];

// When the user loads page, open the modal
window.onload = function() {
  modal.style.display = "block";
}


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

//Click to copy to clipboard
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

//Functions for spinbuttons for setting timer
function scrollUp(){
    var min = document.getElementById("userInput").innerHTML;
    var nummin = parseInt(min.charAt(1));
    if (min.charAt(0) != "0"){
        var tens = parseInt(min.charAt(0));
        nummin = (tens*10)+nummin;
    }
    if(nummin < 60){
        var newmin = nummin - (-1); 
        if (newmin < 10){
            document.getElementById("userInput").innerHTML ="0" + newmin + ":00";    
        }else {
            document.getElementById("userInput").innerHTML = newmin + ":00";    
        }
        return newmin; //get user input time    
    }else {
        return 60;
    }
}

function scrollDown(){
    var min = document.getElementById("userInput").innerHTML;
    var nummin = parseInt(min.charAt(1));
    if (min.charAt(0) != "0"){
        var tens = parseInt(min.charAt(0));
        nummin = (tens*10)+nummin;
    }
    if(nummin > 1) {
        var newmin = nummin - 1;
        if (newmin < 10){
            document.getElementById("userInput").innerHTML ="0" + newmin + ":00";    
        }else {
            document.getElementById("userInput").innerHTML = newmin + ":00";    
        }
        return newmin; //get user input time    
    }
    return 1;
}


//FUNCTIONS INVOLVED IN LOCATIONS
var input = document.getElementById("input");
var btn = document.getElementById("btn");
var ul = document.querySelector("ol");
var li = document.querySelectorAll("li");
var selection = document.getElementById("locations_select");
var numloc = 1; //number of locations 
sessionStorage["numItems"] = numloc; //store initial

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
        var location = input.value;
        input.value = "";
        strikeThrough(li);    
        var roomcode = sessionStorage["code"];
        addLocation(location, roomcode, numloc); //add location to database
        ++numloc;
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
            var roomcode = sessionStorage["code"];
            addLocation(spyfall1[i], roomcode, numloc); //add location to database       
            ++numloc;
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
            var roomcode = sessionStorage["code"];
            addLocation(spyfall2[i], roomcode, numloc); //add location to database   
            ++numloc;      
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
    clearLocAll(); //clear from db
    while(ul.firstChild){
        ul.removeChild(ul.firstChild);
    }
}

//Clear unwanted locations from db
//Returns array of indices of wanted locations
function clearLocUnwanted() {
    var roomcode = sessionStorage["code"];
    var ul = document.getElementById("loclist");
    var items = ul.getElementsByTagName("li");
    var wantloc = [];
    for (var i = 0; i < items.length; ++i) {
        if (items[i].classList.contains("done")){
            deleteLocation(i, roomcode);
        }else {
            wantloc.push(i);
        }
    }
    return wantloc;
}

//Clear all locations (in room) from db - for host page clear button
function clearLocAll() {
    var roomcode = sessionStorage["code"];
    var ul = document.getElementById("loclist");
    var items = ul.getElementsByTagName("li");
    for (var i = 0; i < items.length; ++i) {
        deleteLocation(i, roomcode);
    }
    numloc = 0; //reset numloc
}



