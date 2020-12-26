//THINGS TO INTIALIZE GAME IN DB, FOR HOST PAGE -------------------------------------------------

//Add players to database
const writeToDatabase = (name, roomcode) => {
  // var index = 0;
  // getIndex(function(returnVal){
  //     index = returnVal;
  // });
  // alert(index);

  // var playerid = Math.random().toString(36).substr(2, 9);
  // sessionStorage["playerid"] = playerid;
  firebase
    .database()
    .ref("Players/" + 1) // + Date.now() or + playerid; Maybe IP address? 
    .set({
      name: name,
      roomcode: roomcode,
      role: "none"
    });
};

//Version for join page (use same as host when key is randomized)
//this needs to be the number of players overall in database, else it will reset every time
//Keep a running count in database?
const writeToDatabaseJoin = (name, roomcode, index) => {
  // var index = getIndex();
  // var playerid = Math.random().toString(36).substr(2, 9);
  // sessionStorage["playerid"] = playerid;
  firebase
      .database()
      .ref("Players/" + i) // + Date.now(), + playerid
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
      time: 1,
      spynum: 1,
      status: false,
      vote: false,
      winner: "unknown"
  });
};

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

//Host: update timein and spynum, pick spy and location, go to ingame page
function start(roomcode, timein, spynum) {  
    sessionStorage["time"] = timein;
    updateSpynum(spynum, roomcode);
    updateTime(timein, roomcode);
    pickSpy(4, roomcode); //numplayers
    pickLocation(numloc, roomcode); 
    // checkStart(roomcode);
    startGame(roomcode);  
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

//Write list of suspects on pre-game screen (host and join)
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

//Write list of locations in-game screen, and vote screen
function writeLocations(roomcode) {
  locref.once('value', function(snap) { 
      document.getElementById("location").innerHTML = "";        
      snap.forEach(function(child){
          if (child.val().roomcode == roomcode) { 
              document.getElementById("location").innerHTML += "<li>" + child.val().location + "</li>";
          }
      });
  });        
}

//List all suspects on in-game screen and vote screen 
function listSuspects(roomcode){
  ref.once('value', function(snap) { 
      document.getElementById("answer").innerHTML = "";  
      snap.forEach(function(child){
          if (child.val().roomcode == roomcode) { 
              document.getElementById("answer").innerHTML += "<li>" + child.val().name + "</li>";
          }
      });
  });    
}

//TODO: due to the overriding index of key names for players, this doesn't work in practical situations
//Upon start, randomly pick a spy (update role to spy)
function pickSpy(numPlayers, roomcode) {
  var pick = false;
  while (!pick){
      var i = Math.floor(Math.random() * numPlayers);
      var updateRole = ref.child(i);    
      updateRole.on('value', function(snap){
          if (snap.val().roomcode == roomcode){ //==roomcode
              updateRole.update({
                  "role":"spy"    
              }); 
              pick = true;       
          }
      });     
  }
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
        updateRole.on('value', function(snap){
          updateRole.update({
              "role":"here"    
          }); 
        });      
      }
    }
}

//Delete a location 
function deleteLocation(numloc, roomcode) {
  locref.child(roomcode+"-"+numloc).remove();
}


//Set status of game to true. This should trigger all players in room to ingame
function startGame(roomcode){
  //Host updates game status to true
  var updateStatus = gameref.child(roomcode); 
  updateStatus.on('value', function(snap){
      updateStatus.update({
          "status": true
      });
  });
}

//Listener for if the game status has been set to true
//All players go to ingame page if it has
function checkStart(roomcode) {
  var gameroomref = gameref.child(roomcode);
  gameroomref.on("child_changed", function(snap){
      window.location.replace("ingame.html");
  });
}

//Host: Update spynum
function updateSpynum(newnum, roomcode) {
  var updateSpy = gameref.child(roomcode);
  updateSpy.on('value', function(snap){
    updateSpy.update({
      "spynum": newnum
    });
  });
}

//Host: Update time 
function updateTime(newtime, roomcode) {
  var updateTime = gameref.child(roomcode);
  updateTime.on('value', function(snap){
    updateTime.update({
      "time": newtime
    });
  });
}

//Join: check if roomcode is valid
function checkRoomcode(roomcode, name, i) {
  gameref.child(roomcode).once('value', function(snapshot) {
    var exists = (snapshot.val() !== null);
    continueStart(exists, roomcode, name, i);
  });
}

//Join: finish validating, add player to db, write suspect list, add listener for game start
function continueStart(exists, roomcode, name, i) {
  if (exists) {
    writeToDatabaseJoin(name, roomcode, i);
    writeList(roomcode); //add player to db
    checkStart(roomcode); //check for game status to update 
  }else {
    alert("Invalid roomcode");
  }
}



