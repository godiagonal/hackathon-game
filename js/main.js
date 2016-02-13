var ref = new Firebase('https://hackatonspel.firebaseio.com/')
    , $html = $('html')
    , $button
    ;

$(function () {

    var $button = $('button.play');
    $html.on('click', 'button.play', makeMove);
    $html.on('click', 'button.register', function() {

        var $input = $('input.user-name')
            , userName = $input.val();

        getHighestPriority( function(priority) {
            registerUser(userName, priority + 1);
        });

    });

    firstUserRef().on('value', function (snapshot) {

        $button.removeClass('active').attr('disabled', true);

        if(snapshot.exists()) {
            var currentPlayerId = getUserIdFromSnapshot(snapshot);
            var myId = getMyUserId();

            if (myId === currentPlayerId) {
                $button.addClass('active').removeAttr('disabled');
            }
        }

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

        if(snapshot.exists()) {
            var lastPlayerId = getUserIdFromSnapshot(snapshot);
            userRef(lastPlayerId).once('value', function (snap) {

                callback(snap.getPriority());

            });
        } else {
            callback(0);
        }

    });

}

function userExists(id, callback) {

    usersRef().once('value', function (snapshot) {

        if (snapshot.child(id).exists())
            callback();

    });

}

function getMyUserId() {
    return ref.getAuth() ? ref.getAuth().uid : null;
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
    console.log('1');
    return ref.child('users').orderByPriority().limitToFirst(1);
}

function lastUserRef() {
    return ref.child('users').orderByPriority().limitToLast(1);
}

/**
 * @param {string} userName
 * @param {int} priority
 */
function registerUser(userName, priority) {

    if( !getMyUserId() ) {
        ref.authAnonymously(function(error, authData) {

            if(error) return error;

            // Creates a user with username and priority.
            userRef(authData.uid).setWithPriority({ username: userName }, priority );

            // Listener that removes the user on its disconnection.
            userRef(authData.uid).onDisconnect().remove();

        });
    } else {
        updateUser(userName);
    }

}

/**
 * @param userName
 */
function updateUser(userName) {

    if( getMyUserId() ) {

        userRef( getMyUserId() ).child( 'username' ).set( userName );

    }

}