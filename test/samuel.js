var ref = new Firebase('https://hackatonspel.firebaseio.com/');

$(function () {
    $('#btn-master').click(makeMove);
});

firstUserRef().on('value', function (snapshot) {

    var currentPlayerId = getUserIdFromSnapshot(snapshot);
    var myId = ref.getAuth().uid;

    $('#btn-master').removeClass('active');
    $('#btn-master').attr('disabled', true);

    if (myId === currentPlayerId) {
        $('#btn-master').addClass('active');
        $('#btn-master').removeAttr('disabled');
    }

    console.log('Current: ' + currentPlayerId);
    console.log('Me: ' + myId);

});

function setPlayer(id, prio) {

    usersRef().once('value', function (snapshot) {

        if (snapshot.child(id).exists())
            userRef(id).setPriority(prio);

    });

}

function setPriorityToLast() {

    lastUserRef().once('value', function (snapshot) {

        var lastPlayerId = getUserIdFromSnapshot(snapshot);

        userRef(lastPlayerId).once('value', function (snap) {

            var myId = ref.getAuth().uid;

            userRef(myId).setPriority(snap.getPriority() + 1);

        });

    });
    
}

function makeMove() {

    setPriorityToLast();

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