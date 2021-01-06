//FOR VOTE.HTML PAGE AND BEYOND: ---------------------------------------------------------

//For determining player with highest vote:
var consensus = 0; //number of equal majority votes 
var votenum = 0; //number of players who have voted already

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
var winref = rootRef.child('Winners');

//AddVote Functions: add a tally to a player
function addVote(key) {
    var newref = ref.child(key);
  newref.once("value", function(snap){
    var lasttally = snap.val().tally;
    addVoteHelper(key, lasttally);
  });
}
   
function addVoteHelper(key, lasttally) {
  var newtally = lasttally + 1;
  var newref = ref.child(key);
  newref.update({
    "tally": newtally
  });

  var roomcode = sessionStorage["code"];
  getMajority(roomcode, newtally, key);
}

//Get the current majority votes
function getMajority(roomcode, newtally, key){
  var newref = gameref.child(roomcode);
  newref.once("value", function(snap){
    var majority = snap.val().majority;
    checkVoteWinner(key, newtally, majority);
  });
}

//For determining winner of vote for spy 
function checkVoteWinner(key, newtally, majority) {
  var radios = document.getElementsByName('choices');
  var numplayers = radios.length;
  var roomcode = sessionStorage["code"];

  if (newtally > majority){

    //UPDATE MAJORITY
    var newref = gameref.child(roomcode);
    newref.update({
      "majority": newtally,
      "majplayer": key
    });
    /////////////////

    consensus = 0; //reset, as there is new majority
    // alert("trigger: "+votenum + numplayers);

    if ((votenum-1) >= numplayers){ //at this point, we're just waiting for consensus
      //TODO: check that every player has voted?
      updateVoteSpy(roomcode);
    }
  }
  if (newtally == majority){
    ++consensus; //a consensus hasn't been reached
  }
  if ((votenum-1) == numplayers && consensus == 0){ //all players have voted and consensus is reached
    //TODO: check that every player has voted?
    updateVoteSpy(roomcode);
  }
}

//when voting is done, update the vote status to get to next page
function updateVoteSpy(roomcode){
  var newref = voteref.child(roomcode);
  newref.update({
    "vote": false
  });
}

//Listener for if voting is done (for vote page)
function checkVoteDone(roomcode){
  var newref = voteref.child(roomcode);
  newref.on("child_changed", function(snap){
      getMajPlayer(roomcode);
  });
}

//Helper for listsuspectsvote: List suspects and votes they have 
function chooseSus(name, tally, key) {
  var ul = document.getElementById("answer");
  var li = document.createElement("li");
  //The input radio button
  var x = document.createElement("INPUT");
  x.setAttribute("type", "radio");
  x.name = "choices";
  x.id = name;
  x.value = key;
  x.className = "choicebuttons";
  //The name label for the button
  var y = document.createElement("LABEL");
  y.innerHTML = name;
  y.htmlFor = name;
  //The tally label for the button 
  var z = document.createElement("LABEL");
  z.innerHTML = tally;
  z.htmlFor = name;
  z.className = "tally";
  //Put them on the list
  li.appendChild(x);
  li.appendChild(y);
  li.appendChild(z);
  ul.appendChild(li);
} 

//List all suspects on vote screen
//Listens for new votes and update
function listSuspectsVote(roomcode){
  ref.on('value', function(snap) { 
    // var role = sessionStorage["role"];
    // alert("votenum: "+votenum);

    votenum++; //one more vote has been cast
    document.getElementById("answer").innerHTML = ""; //clear the list
      snap.forEach(function(child){
          if (child.val().roomcode == roomcode) { 
              var name = child.val().name;
              var key = child.key;
              var tally = child.val().tally;
              chooseSus(name, tally, key);
          }
      });
  });        
}

//Submit button for vote for spy
function submit() {
  var radios = document.getElementsByName('choices');
  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      var playerkey = radios[i].value;
      addVote(playerkey);
    }
  }
}

// -----------------------------------------------------------------------------------

//Get the majority voted player (key)
function getMajPlayer(roomcode){
  var newref = gameref.child(roomcode);
  newref.once('value', function(snap){
    var playkey = snap.val().majplayer;
    getVoteRole(playkey);
  });
}

//Get the role of the majority voted player
function getVoteRole(player){
  var newref = ref.child(player);
  newref.once('value', function(snap){
    var voterole = snap.val().role;
    finishVote(voterole);
  });
}

//Finish the vote page sequence by checking results of vote 
function finishVote(voterole){
  var self = sessionStorage["role"];
  if (voterole == "none" && self == "spy"){
    window.location.replace("win.html");
  }else if (voterole == "none" && self != "spy"){
    window.location.replace("lose.html");
  }else if (voterole == "spy" && self != "spy"){
    //pop up wait page 
    var modal = document.getElementById("myModal");
    modal.style.display = "block";  
    var textinside = document.getElementById("modaltexthere");
    textinside.innerHTML = "YOU HAVE GUESSED THE SPY...";
    var smalltext = document.getElementById("smalltext");
    smalltext.innerHTML = "...but have they discovered your location?"
    //listen for location vote
    checkWin(roomcode);
  }else if (voterole == "spy" && self == "spy"){
    window.location.replace("votespy.html");
  }
}

//FOR SPY VOTE FOR LOCATIONS PAGE-------------------------------------------

//get location chosen 
function getLoc(){
  var radios = document.getElementsByName('choices');
  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      var chosen = radios[i].value;
      getLocationVote(chosen);
    }
  }
}

//Helper for writeLocationsVote: writes out locations as input radio buttons
function choose(name, key) {
  var ul = document.getElementById("answer");
  var li = document.createElement("li");
  //The input radio button
  var x = document.createElement("INPUT");
  x.setAttribute("type", "radio");
  x.name = "choices";
  x.id = name;
  x.value = key;
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
            var key = child.key;
            choose(temp, key);
        }
    });
});        
}

//Determine if spy chose location correctly, and update winner
function getLocationVote(chosen) {
  var newref = locref.child(chosen);
  newref.once('value', function(snap){
    if (snap.val().role == "here"){
      updateWinner("spy");
    }else {
      updateWinner("non");
    }
  });
}

//update the winner in game db 
function updateWinner(winner) {
  var roomcode = sessionStorage["code"];
  var updateStatus = winref.child(roomcode); 
  updateStatus.update({
    "winner": winner
  });
}

//listener for winner 
function checkWin(roomcode) {
  var newref = winref.child(roomcode);
  newref.on("child_changed", function(snap){
    getWin(roomcode);
  });
}

//get the winner 
function getWin(roomcode){
    var newref = winref.child(roomcode);
    newref.once("value", function(snap){
        var win = snap.val().winner;
        finishGame(win);    
    });
}

//Go to appropriate win/lose screens at end
function finishGame(win){
    var role = sessionStorage["role"];
    if (win == "spy" && role == "spy"){
        window.location.replace("win.html");
    }else if (win == "spy" && role != "spy"){
        window.location.replace("lose.html");
    }else if (win == "non" && role == "spy"){
        window.location.replace("lose.html");
    }else if (win == "non" && role != "spy"){
        window.location.replace("win.html");
    }  
}
