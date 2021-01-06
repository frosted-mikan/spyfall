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

//----------------------------------------------------------------------

//Restart the game, keeping same locations and players
function restart(roomcode){
    sessionStorage["restart"] = true;

    if(sessionStorage["playerkey"] == 0){

        //clear "here" location 
        var hereloc = locref.child(sessionStorage["lochere"]);
        hereloc.update({
            "role": "none"
        });

        //remove all the players
        var numplay = sessionStorage["numplayers"];
        for (var i = 0; i < numplay; ++i) {
            deletePlayers(i, roomcode);
        }

        //Go back to host screen (**same roomcode??**)
        window.location.replace("host.html");
    }else {
        //Go back to join screen (**same roomcode??**)
        window.location.replace("joingame.html");
    }
}

//Helper to delete players
function deletePlayers(index, roomcode){
    ref.child(roomcode+"-"+index).remove();
}
  