var ref = new Firebase('https://hackatonspel.firebaseio.com/'),
    isRegistered = false,
    $html = $('html'),
    $registerForm,
    $gameContainer,
    $gameInfo,
    $playButton,
    $queue;

$(function () {

    $registerForm   = $('div.register-form');
    $gameContainer  = $('div.game-container');
    $gameInfo       = $('div.game-info');
    $playButton     = $('button.play');
    $queue          = $('ul.queue');

    /**
     * Event handler for play button.
     */
    $html.on('click', 'button.play', function () {
        // TODO: make sure user is in the front of the queue
        setPriorityToHighest();
    });

    /**
     * Event handler for register button.
     */
    $html.on('click', 'button.register', function () {

        var $input   = $('input.user-name'),
            userName = $input.val();

        if (!isRegistered) {
            getHighestPriority(function (priority) {
                registerUser(userName, priority + 1);
            });
        } else {
            updateUser(userName);
        }

    });

    /**
     * Listener for first user in the queue.
     */
    firstUserRef().on('value', function (snapshot) {

        $gameContainer.removeClass('active');
        $playButton.attr('disabled', true);

        if (snapshot.exists()) {
            
            var currentPlayerId = getUserIdFromSnapshot(snapshot);
            var myId = getMyUserId();

            // Current player is in front of the queue.
            if (myId === currentPlayerId) {
                $gameContainer.addClass('active');
                $playButton.removeAttr('disabled');
            }
            
        }

    });

    /**
     * Listener for when the users table is updated.
     */
    usersRef().on('value', function (snapshot) {

        // Rebuild the queue ui.
        $queue.empty();
        snapshot.forEach(function (child) {

            $('<li />').html(child.val().username).appendTo($queue);

        });

    });

});

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

function setPriority(prio) {

    var myId = getMyUserId();

    userExists(myId, function () {
        userRef(myId).setPriority(prio);
    });

}

function setPriorityToHighest() {

    var myId = getMyUserId();

    userExists(myId, function () {

        getHighestPriority(function (prio) {
            userRef(myId).setPriority(prio + 1);
        });

    });

}

function getHighestPriority(callback) {

    lastUserRef().once('value', function (snapshot) {

        if (snapshot.exists()) {
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

function getUserIdFromSnapshot(snapshot) {
    return Object.keys(snapshot.val())[0];
}

function getMyUserId() {
    return ref.getAuth() ? ref.getAuth().uid : null;
}

/**
 * @param {string} userName
 * @param {int} priority
 */
function registerUser(userName, priority) {

    ref.authAnonymously(function (error, authData) {

        if (error) return error;

        // Creates a user with username and priority.
        userRef(authData.uid).setWithPriority({
            username: userName
        }, priority);

        // Listener that removes the user on its disconnection.
        userRef(authData.uid).onDisconnect().remove();

        isRegistered = true;
        
        $registerForm.hide();
        $gameContainer.show();
        $gameInfo.show();

    });

}

/**
 * @param userName
 */
function updateUser(userName) {

    if (getMyUserId()) {
        userRef(getMyUserId()).child('username').set(userName);
    }

}