//THINGS TO INTIALIZE GAME IN DB, FOR PREGAME PAGE -------------------------------------------------

//Add host to database (they are always player 0)
const writeToDatabase = (name, roomcode) => {
  firebase
    .database()
    .ref("Players/" + (roomcode+"-"+0))  
    .set({
      name: name,
      roomcode: roomcode,
      role: "none",
      tally: 0
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
      role: "none",
      tally: 0
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
      isPaused: false, //pause time 
      majority: 0, //the most votes 
      majplayer: roomcode+"-"+0 //player key with most votes
  });
};

//Create win status of game in db 
const createWin = (roomcode) => {
  firebase
  .database()
  .ref("Winners/" + roomcode)
  .set({
    winner: "unknown" //winner of the game (spy or non)
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

//creates ref for win status 
var winref = roofRef.child('Winners');

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

// //FOR VOTE.HTML PAGE: ---------------------------------------------------------

// //For determining player with highest vote:
// var consensus = 0; //number of equal majority votes 
// var votenum = 0; //number of players who have voted already

// //AddVote Functions: add a tally to a player
// function addVote(key) {
//   alert("enteraddvote");
//   var newref = ref.child(key);    
//   newref.once("value", function(snap){
//     var lasttally = snap.val().tally;
//     addVoteHelper(key, lasttally);
//   });
// }
// function addVoteHelper(key, lasttally) {
//   var newtally = lasttally + 1;
//   alert("newtally: " + newtally);
//   var newref = ref.child(key);
//   newref.update({
//     "tally": newtally
//   });

//   var roomcode = sessionStorage["code"];
//   getMajority(roomcode, newtally, key);
// }

// //Get the current majority votes
// function getMajority(roomcode, newtally, key){
//   alert("getmaj entered");
//   var newref = gameref.child(roomcode);
//   newref.once("value", function(snap){
//     var majority = snap.val().majority;
//     checkVoteWinner(key, newtally, majority);
//   });
// }

// //For determining winner of vote for spy 
// function checkVoteWinner(key, newtally, majority) {
//   alert("checkwinner entered");
//   var radios = document.getElementsByName('choices');
//   var numplayers = radios.length;
//   var roomcode = sessionStorage["code"];
//   alert("numplayers: " + numplayers);

//   if (newtally > majority){
//     alert("new maj");

//     //UPDATE MAJORITY
//     var newref = gameref.child(roomcode);
//     newref.update({
//       "majority": newtally,
//       "majplayer": key
//     });    
//     /////////////////

//     consensus = 0; //reset, as there is new majority

//     if ((votenum-1) >= numplayers){ //at this point, we're just waiting for consensus
//       alert("votenum >= numplayers");
//       //TODO: check that every player has voted?
//       updateVoteSpy(roomcode);
//     }
//   }
//   if (newtally == majority){
//     ++consensus; //a consensus hasn't been reached
//   }
//   if ((votenum-1) == numplayers && consensus == 0){ //all players have voted and consensus is reached
//     alert("votenum = numplayers");
//     //TODO: check that every player has voted?
//     updateVoteSpy(roomcode);
//   }
// }

// //when voting is done, update the vote status to get to next page
// function updateVoteSpy(roomcode){
//   alert("vote status updated");
//   var newref = voteref.child(roomcode);
//   newref.update({
//     "vote": false
//   });
// }

// //Listener for if voting is done (for vote page)
// function checkVoteDone(roomcode){
//   var newref = voteref.child(roomcode);
//   newref.on("child_changed", function(snap){
//       getMajPlayer(roomcode);
//   });
// }

// //Helper for listsuspectsvote: List suspects and votes they have 
// function chooseSus(name, tally, key) {
//   var ul = document.getElementById("answer");
//   var li = document.createElement("li");
//   //The input radio button
//   var x = document.createElement("INPUT");
//   x.setAttribute("type", "radio");
//   x.name = "choices";
//   x.id = name;
//   x.value = key;
//   x.className = "choicebuttons";
//   //The name label for the button
//   var y = document.createElement("LABEL");
//   y.innerHTML = name;
//   y.htmlFor = name;
//   //The tally label for the button 
//   var z = document.createElement("LABEL");
//   z.innerHTML = tally;
//   z.htmlFor = name;
//   //Put them on the list
//   li.appendChild(x);
//   li.appendChild(y);
//   li.appendChild(z);
//   ul.appendChild(li);
// } 

// //List all suspects on vote screen
// //Listens for new votes and update
// function listSuspectsVote(roomcode){
//   ref.on('value', function(snap) { 
//     alert("triggered, votenum: " + votenum);
//     votenum++; //one more player has voted
//     document.getElementById("answer").innerHTML = ""; //clear the list
//       snap.forEach(function(child){
//           if (child.val().roomcode == roomcode) { 
//               var name = child.val().name;
//               var key = child.key;
//               var tally = child.val().tally;
//               chooseSus(name, tally, key);
//           }
//       });
//   });        
// }

// //Submit button for vote for spy
// function submit() {
//   var radios = document.getElementsByName('choices');
//   for (var i = 0, length = radios.length; i < length; i++) {
//     if (radios[i].checked) {
//       var playerkey = radios[i].value;
//       addVote(playerkey);
//     }
//   }
// }

// // -----------------------------------------------------------------------------------

// //Get the majority voted player (key)
// function getMajPlayer(roomcode){
//   alert("vote done, getting maj player");
//   var newref = gameref.child(roomcode);
//   newref.once('value', function(snap){
//     var playkey = snap.val().majplayer;
//     getVoteRole(playkey);
//   });
// }

// //Get the role of the majority voted player
// function getVoteRole(player){
//   alert("get role of maj player");
//   var newref = ref.child(player);
//   newref.once('value', function(snap){
//     var voterole = snap.val().role;
//     finishVote(voterole);
//   });
// }

// //Finish the vote page sequence by checking results of vote 
// function finishVote(voterole){
//   alert("finishing vote");
//   var self = sessionStorage["role"];
//   if (voterole == "none" && self == "none"){
//     window.location.replace("win.html");
//   }else if (voterole == "none" && self == "spy"){
//     window.location.replace("lose.html");
//   }else if (voterole == "spy" && self == "none"){
//     //pop up wait page 
//     var modal = document.getElementById("myModal");
//     modal.style.display = "block";  
//     var textinside = document.getElementById("modaltexthere");
//     textinside.innerHTML = "YOU HAVE GUESSED THE SPY...";
//     var smalltext = document.getElementById("smalltext");
//     smalltext.innerHTML = "...but have they discovered your location?"
//     //listen for location vote
//     checkWin(roomcode);
//   }else if (voterole == "spy" && self == "spy"){
//     window.location.replace("votespy.html");
//   }
// }


// //FOR SPY VOTE FOR LOCATIONS PAGE-------------------------------------------

// //get location chosen 
// function getLoc(){
//   var radios = document.getElementsByName('choices');
//   for (var i = 0, length = radios.length; i < length; i++) {
//     if (radios[i].checked) {
//       var chosen = radios[i].value;
//       getLocationVote(chosen);
//     }
//   }
// }

// //Helper for writeLocationsVote: writes out locations as input radio buttons
// function choose(name, key) {
//   var ul = document.getElementById("answer");
//   var li = document.createElement("li");
//   //The input radio button
//   var x = document.createElement("INPUT");
//   x.setAttribute("type", "radio");
//   x.name = "choices";
//   x.id = name;
//   x.value = key;
//   x.className = "choicebuttons";
//   //The label for the button
//   var y = document.createElement("LABEL");
//   y.innerHTML = name;
//   y.htmlFor = name;
//   //Put them on the list
//   li.appendChild(x);
//   li.appendChild(y);
//   ul.appendChild(li);
// } 

// //For spy: List all locations on vote screen 
// function writeLocationsVote(roomcode) {
//   locref.once('value', function(snap) { 
//     snap.forEach(function(child) {
//         if (child.val().roomcode == roomcode) { 
//             var temp = child.val().location;
//             var key = child.key;
//             choose(temp, key);
//         }
//     });
// });        
// }

// //Determine if spy chose location correctly, and update winner
// function getLocationVote(chosen) {
//   var newref = locref.child(chosen);
//   newref.once('value', function(snap){
//     if (snap.val().role == "here"){
//       updateWinner("spy");
//       window.location.replace("win.html");
//     }else {
//       updateWinner("non");
//       window.location.replace("lose.html");
//     }
//   });
// }

// //update the winner in game db 
// function updateWinner(winner) {
//   var roomcode = sessionStorage["code"];
//   var updateStatus = winref.child(roomcode); 
//   updateStatus.update({
//     "winner": winner
//   });
// }

// //listener for winner 
// function checkWin(roomcode) {
//   var newref = winref.child(roomcode);
//   newref.on("child_changed", function(snap){
//     // continueDisplay(roomcode);
//     if (snap.val().winner == "spy"){
//       window.location.replace("lose.html");
//     }else {
//       window.location.replace("win.html");
//     }
//   });
// }

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

