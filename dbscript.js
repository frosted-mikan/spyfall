//THINGS TO INTIALIZE GAME IN DB, FOR HOST PAGE -------------------------------------------------

//Add host to database (they are always player 0)
const writeToDatabase = (name, roomcode) => {
  firebase
    .database()
    .ref("Players/" + (roomcode+"-"+0))  
    .set({
      name: name,
      roomcode: roomcode,
      role: "none"
    });
};

//Add players to database 
const writeToDatabaseJoin = (name, roomcode, index) => {
  firebase
      .database()
      .ref("Players/" + (roomcode+"-"+index)) 
      .set({
      name: name,
      roomcode: roomcode,
      role: "none"
      });
};

//Create Game in database
const createGame = (roomcode) => {
  firebase 
  .database()
  .ref("Games/" + roomcode)
  .set({
      time: 5, //timer countdown time
      status: false, //status of starting game
      vote: false, //status of if someone has voted
      winner: "unknown", //winner of the game (spy or others)
      isPaused: false, //pause time 
  });
};

//Create counter for numplayers in db
const createNumPlayers = (roomcode) => {
  firebase
  .database()
  .ref("Counters/" + roomcode)
  .set({
    numPlayers: 1 //number of players. Starts at 1 for first player who joins
  });
}

//Add locations to database
const addLocation = (location, roomcode, numloc) => {
  firebase 
  .database()
  .ref("Locations/" + (roomcode+"-"+numloc)) 
  .set({
      location: location,
      roomcode: roomcode,
      role: "none"
  });
};

//Host: update timein + spynum + game status, pick spy and location, go to ingame page
function start(roomcode, timein) {  
    pickLocation(numloc, roomcode); 
    startGame(roomcode, timein);  
    window.location.replace("ingame.html");
}

//WORKING WITH THE DATABASE -----------------------------------------------------------------------

//establishes root of db
var rootRef = firebase.database().ref();
    
//creates ref for players
var ref = rootRef.child('Players');

//creates ref for locations 
var locref = rootRef.child('Locations');

//creates ref for games
var gameref = rootRef.child('Games');

//creates ref for counters
var counterref = rootRef.child('Counters');

//Update game status, spynum and timein. This should trigger all players in room to ingame
function startGame(roomcode, newtime){
  var updateStatus = gameref.child(roomcode); 
  updateStatus.update({
    "status": true,
    "time": newtime
  });
}

//Write list of suspects on pre-game screens (host and join)
function writeList(roomcode){
    // gets values from database and changes html
    ref.on('value', function(snap) { 
        //re-initializes answer in html, so doesn't repeat
        document.getElementById("answer").innerHTML = "";
        //gets values for each element in data set   
        snap.forEach(function(child){
            if (child.val().roomcode == roomcode) { 
                document.getElementById("answer").innerHTML += "<li>" + child.val().name + "</li>";
            }
        });
    });        
}

//Helper for listSuspects
function addStrike(temp) {
  var ul = document.getElementById("answer");
  var li = document.createElement("li");
  li.appendChild(document.createTextNode(temp));
  ul.appendChild(li);
  strikeThrough(li); //inscript version
}

//List all suspects on in-game screen and vote screen 
function listSuspects(roomcode){
  ref.once('value', function(snap) { 
      document.getElementById("answer").innerHTML = "";
      snap.forEach(function(child){
          if (child.val().roomcode == roomcode) { 
              var temp = child.val().name;
              addStrike(temp);
          }
      });
  });        
}

//Write list of locations in-game screen, and vote screen
function writeLocations(roomcode) {
  var ol = document.getElementById("location");
    locref.once('value', function(snap) { 
      document.getElementById("location").innerHTML = "";        
      snap.forEach(function(child){
          if (child.val().roomcode == roomcode) { 
              var li = document.createElement("li");
              li.appendChild(document.createTextNode(child.val().location));
              ol.appendChild(li);
              strikeThrough(li);  //using the inscript version  
          }
      });
  });        
}

//Get the numPlayers from game to add new player to db 
function addPlayer(roomcode, name) {
  var newref = counterref.child(roomcode);
  newref.once("value", function(snap){
    var index = snap.val().numPlayers;
    writeToDatabaseJoin(name, roomcode, index);
    updateNumPlayers(index, roomcode);
  });
}

//Update numPlayers when new player is added
function updateNumPlayers(previndex, roomcode) {
  var updateStatus = counterref.child(roomcode); 
  var newindex = previndex + 1;
  updateStatus.update({
    "numPlayers": newindex
  });
}

//Get numPlayers for picking spy
function pickSpy(roomcode, spynum, timein) {
  var newref = counterref.child(roomcode);
  newref.once("value", function(snap){
    var index = snap.val().numPlayers;
    pickSpyNext(index, roomcode, spynum, timein);
  });
}

//Upon start, randomly pick a spy (update role to spy)
function pickSpyNext(numPlay, roomcode, spynum, timein) {
  //Check that there is enough players 
  if (numPlay < 3) {
    alert("Not enough players");
    return;
  }

  var i = Math.floor(Math.random() * numPlay);
  var updateRole = ref.child(roomcode+"-"+i);
  updateRole.update({
    "role":"spy"
  });    

  if (spynum == 2){
    var j = Math.floor(Math.random() * numPlay);
    while(j == i) {
      var j = Math.floor(Math.random() * numPlay);
    }
    var updateRoleAgain = ref.child(roomcode+"-"+j);
    updateRoleAgain.update({
      "role":"spy"
    });      
  }

  //Start the game after spy has been picked
  start(roomcode, timein);
}

//Upon start, randomly pick a location (update role to here)
function pickLocation(numloc, roomcode) {
    var wantloc = clearLocUnwanted(); //clear the unwanted locations from db, get wanted locations
    var pick = false;
    while(!pick){
      var i = Math.floor(Math.random() * numloc);
      if (wantloc.includes(i)){
        pick = true;
        var updateRole = locref.child(roomcode+"-"+i);    
        updateRole.update({
            "role":"here"    
        }); 
      }
    }       
}

//Delete a location 
function deleteLocation(numloc, roomcode) {
  locref.child(roomcode+"-"+numloc).remove();
}

//Listener for if the game status has been set to true
//All players go to ingame page if it has
function checkStart(roomcode) {
  var gameroomref = gameref.child(roomcode);
  gameroomref.on("child_changed", function(snap){
      window.location.replace("ingame.html");
  });
}

//Join: check if roomcode is valid
function checkRoomcode(roomcode, name) {
  gameref.child(roomcode).once('value', function(snapshot) {
    var exists = (snapshot.val() !== null);
    continueStart(exists, roomcode, name);
  });
}

//Join: finish validating, add player to db, write suspect list, listen for game start
function continueStart(exists, roomcode, name) {
  if (exists) {
    // writeToDatabaseJoin(name, roomcode, i);
    addPlayer(roomcode, name);
    writeList(roomcode); //write list of players to screen
    checkStart(roomcode); //check for game status to update 
  }else {
    alert("Invalid roomcode");
  }
}

//FUNCTIONS REGARDING TIMER -----------------------------------------------------------------
//Get the time from db
function getTime(roomcode) {
  gameref.child(roomcode).once('value', function(snapshot) {
    var time = snapshot.val().time;
    timer(time*60); //start timer countdown
    setCurrTime(time);
  });
}

//Pause the game: set isPaused to true
//isPaused child in game db networks all players
//all players keep track of their own currTime
function pauseUpdate(roomcode) {
  var updateStatus = gameref.child(roomcode); 
  updateStatus.update({
    "isPaused": true
  });
}

//Resume the game: set isPaused to false
function resumeUpdate(roomcode) {
  var updateStatus = gameref.child(roomcode); 
  updateStatus.update({
    "isPaused": false
  });
}



