//THINGS TO INTIALIZE GAME IN DB, FOR PREGAME PAGE -------------------------------------------------

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
  sessionStorage["playerkey"] = index;
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

//Create vote status of game in db
const createVote = (roomcode) => {
  firebase
  .database()
  .ref("Votes/" + roomcode)
  .set({
    vote: false 
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
  //Host stores numLoc before start of game?
  // sessionStorage["numItems"] = numLoc;

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

//creates ref for votes
var voteref = rootRef.child('Votes');

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

//List all suspects on in-game screen
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

//Write list of locations in-game screen
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
    addPlayer(roomcode, name); //add player to db
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
//---------------------------------------------------------------------------------------------

//FUNCTIONS FOR GETTING ROLE/LOCATION IN GAME--------------------------------------------------

//Get role of player from db
function getRole(roomcode, playerkey) {
  var playref = ref.child(roomcode+"-"+playerkey);
  playref.once("value", function(snap){
    var role = snap.val().role;
    getRoleHelper(roomcode, role);
  });
}

//Helper for getRole; passes info 
function getRoleHelper(roomcode, role) {
  if (role == "spy"){
    sessionStorage["role"] = "spy";
  }else {
    getLocation(roomcode);
  }
}

//Get location that all non-spy players are at for in-game
function getLocation(roomcode) {
  locref.once('value', function(snap) { 
      snap.forEach(function(child){
          if (child.val().roomcode == roomcode && child.val().role == "here") { 
              sessionStorage["role"] = child.val().location;
          }
      });
  });        
}

//---------------------------------------------------------------------------------------------

//FUNCTIONS REGARDING VOTING--------------------------------------------------

//Updates vote status of game to true
function goVote(roomcode) {
  var newref = voteref.child(roomcode);
  newref.update({
    "vote": true
  });
}

//Listener for if vote was pressed (in ingame)
function checkVote(roomcode) {
  var newref = voteref.child(roomcode);
  newref.on("child_changed", function(snap){
      window.location.replace("vote.html");
  });
}

//Set the titles of the page accordingly
function setTitles(roomcode, role) {
  if (role == "spy"){
    document.getElementById("votetitle").innerHTML = "where are you?";
    document.getElementById("listitle").innerHTML = "locations: ";
    writeLocationsVote(roomcode);
  }else {
    document.getElementById("votetitle").innerHTML = "who is the spy?";
    document.getElementById("listitle").innerHTML = "suspects: ";
    listSuspectsVote(roomcode);
  }
}

//Helper for listSuspectsVote and writeLocationsVote: writes out locations/suspects as input radio buttons
function choose(name) {
  var ul = document.getElementById("answer");
  var li = document.createElement("li");
  //The input radio button
  var x = document.createElement("INPUT");
  x.setAttribute("type", "radio");
  x.name = "choices";
  x.id = name;
  x.value = name;
  x.className = "choicebuttons";
  //The label for the button
  var y = document.createElement("LABEL");
  y.innerHTML = name;
  y.htmlFor = name;
  //Put them on the list
  li.appendChild(x);
  li.appendChild(y);
  ul.appendChild(li);
} 

//For spy: List all locations on vote screen 
function writeLocationsVote(roomcode) {
  locref.once('value', function(snap) { 
    snap.forEach(function(child) {
        if (child.val().roomcode == roomcode) { 
            var temp = child.val().location;
            choose(temp);
        }
    });
});        
}

//For non-spies: List all suspects on vote screen
function listSuspectsVote(roomcode){
  ref.once('value', function(snap) { 
      snap.forEach(function(child){
          if (child.val().roomcode == roomcode) { 
              var temp = child.val().name;
              choose(temp);
          }
      });
  });        
}

//The submit button - get which option was selected
function submit(roomcode) {
  var self = sessionStorage["role"];
  if (self == "spy"){
    getLocationVote(roomcode);
  }else {
    getSpy(roomcode);
  }
}

//Get location for spy's vote
function getLocationVote(roomcode) {
  locref.once('value', function(snap) { 
      snap.forEach(function(child){
          if (child.val().roomcode == roomcode && child.val().role == "here") { 
            var lochere = child.val().location;
            checkRight(lochere);
          }
      });
  });        
}

//Get spy for non-spy's vote
function getSpy(roomcode) {
  ref.once('value', function(snap) { 
      snap.forEach(function(child){
          if (child.val().roomcode == roomcode && child.val().role == "spy") { 
            var spyhere = child.val().name;
            checkRight(spyhere);
          }
      });
  });        
}

//Check if location or suspect was correct 
function checkRight(choice) {
  var radios = document.getElementsByName('choices');
  var role = sessionStorage["role"];
  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      if (radios[i].value == choice){
        if (role == "spy"){
          updateWinner("spy");
        }else {
          updateWinner("not");
        }
        break;
      }else {
        if (role == "spy"){
          updateWinner("not");
        }else {
          updateWinner("spy");
        }
        break;
      }
    }
  }
}

//update the winner in game db 
function updateWinner(winner) {
  var updateStatus = gameref.child(roomcode); 
  updateStatus.update({
    "winner": winner
  });
}

//listener for winner 
function checkWin(roomcode) {
  var gameroomref = gameref.child(roomcode);
  gameroomref.on("child_changed", function(snap){
    continueDisplay(roomcode);
  });
}

//Get the win results
function continueDisplay(roomcode) {
  var newref = gameref.child(roomcode);
  newref.once("value", function(snap){
    var winner = snap.val().winner;
    displayResult(winner);
  });
}

//display results for everyone 
function displayResult(winner) {
  var self = sessionStorage["role"];
  if (self == "spy" && winner == "spy"){
    var modal = document.getElementById("myModal");
    modal.style.display = "block";  
    var textinside = document.getElementById("modaltexthere");
    textinside.innerHTML = "MISSION ACCOMPLISHED!";
  }else if (self !="spy" && winner == "not"){
    var modal = document.getElementById("myModal");
    modal.style.display = "block";  
    var textinside = document.getElementById("modaltexthere");
    textinside.innerHTML = "MISSION ACCOMPLISHED!";
  }else {
    var modal = document.getElementById("myModal");
    modal.style.display = "block";  
    var textinside = document.getElementById("modaltexthere");
    textinside.innerHTML = "MISSION FAILED";
  }
}

//----------------------------------------------------------------------------------------
//Deleting the Game (only host can do this)-----------------------------------------------
//TODO: THE SEQUENCE OF DELETES ARE ASYNC AND NEED TO BE CHAINED TOGETHER TO EXECUTE PROPERLY IN ORDER

//Places where game is deleted: (redirect to index afterwards)
//(1) Host: back button
function hostDelete(roomcode){
  deleteAll(roomcode);
  window.location.replace("index.html");
}

//(2) Ingame: end button
//(3) Vote: exit buttons in main content and modal


//Delete a location 
function deleteLocation(numloc, roomcode) {
  locref.child(roomcode+"-"+numloc).remove();
}

//Clear all locations in room
function clearLocationsAll(numitems, roomcode) {
  // alert("locationdelete: "+numitems);
  for (var i = 0; i < numitems; ++i) {
      deleteLocation(i, roomcode);
  }
}

//Delete a player
function deletePlayer(index, roomcode){
  ref.child(roomcode+"-"+index).remove();
}

//Get number of players
//(note: do this before deleting counter!)
function getNumPlayers(roomcode){
  var newref = counterref.child(roomcode);
  newref.once("value", function(snap){
    var index = snap.val().numPlayers;
    clearPlayersAll(roomcode, index);
  });
}

//Clear all players in room 
function clearPlayersAll(roomcode, index) {
  for (var i = 0; i < index; ++i) {
      deletePlayer(i, roomcode);
  }
}

//Delete game 
function deleteGame(roomcode) {
  gameref.child(roomcode).remove();
}

//Delete counter
function deleteCounter(roomcode) {
  counterref.child(roomcode).remove();
}

//Delete vote
function deleteVote(roomcode) {
  voteref.child(roomcode).remove();
}

//Delete All 
function deleteAll(roomcode) {
  clearLocationsAll(numloc, roomcode);
  getNumPlayers(roomcode);
  deleteGame(roomcode);
  deleteCounter(roomcode);
  deleteVote(roomcode);
}

