var ref = new Firebase('https://hackatonspel.firebaseio.com/')
    , $html = $('html')
    , $button;

$(function () {
    
    $html.on('click', '#btn-master', makeMove);
    $button = $('#btn-master');

    firstUserRef().on('value', function (snapshot) {

        var currentPlayerId = getUserIdFromSnapshot(snapshot);
        var myId = getMyUserId();

        if (myId === currentPlayerId) {
            $button.addClass('active').removeAttr('disabled');
        }
        else {
            $button.removeClass('active').attr('disabled', true);
        }

        console.log('Current: ' + currentPlayerId);
        console.log('Me: ' + myId);

    });
    
});

function setPriority(prio) {

    var myId = getMyUserId();

    userExists(myId, function () {
        userRef(myId).setPriority(prio);
    });

}

function makeMove() {
    setPriorityToHighest();
}

function setPriorityToHighest() {

    var myId = getMyUserId();

    userExists(myId, function () {

        console.log('YAY, I exist!');

        getHighestPriority(function (prio) {

            console.log('Highest prio: ' + prio);

            userRef(myId).setPriority(prio + 1);

        });

    });

}

function getHighestPriority(callback) {

    lastUserRef().once('value', function (snapshot) {

        var lastPlayerId = getUserIdFromSnapshot(snapshot);

        userRef(lastPlayerId).once('value', function (snap) {

            callback(snap.getPriority());

        });

    });

}

function userExists(id, callback) {

    usersRef().once('value', function (snapshot) {

        if (snapshot.child(id).exists())
            callback();

    });

}

function getMyUserId() {
    return ref.getAuth().uid;
}

function getUserIdFromSnapshot(snapshot) {
    return Object.keys(snapshot.val())[0];
}





function userRef(id) {
    return ref.child('users/' + id);
}

function usersRef() {
    return ref.child('users');
}

function firstUserRef() {
    return ref.child('users').orderByPriority().limitToFirst(1);
}

function lastUserRef() {
    return ref.child('users').orderByPriority().limitToLast(1);
}

