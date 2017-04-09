$(document).ready(function() {

    var socket = io('/');
    var sessionId;
    var room = '123';
    // add new user to server
    socket.on('connect', () => {
        sessionId = socket.io.engine.id;
        socket.emit('new user', { id: sessionId, name: $('#name').val() });
        // join room on connection
        socket.emit('room', {name: $('#name').val(), room:room});
    })
    socket.on('room message', (data) => {
            console.log(data);
        })
        // updates participants list for clients
    socket.on('update participants', (data) => {
        //Helper function to update the participants' list
        function updateParticipants(participants) {
            $('#participants').html('');
            for (var i = 0; i < participants.length; i++) {
                $('#participants').prepend(`<li id='${participants[i].id}'>
                ${participants[i].name} ${participants[i].id === sessionId ? '(You)' : ''}
                </li>`);
            }
        }
        updateParticipants(data.participants);
    })

    // pass name change to server
    function nameFocusOut() {
        var name = $('#name').val();
        socket.emit('name change', { id: sessionId, name: name });
    }
    $('#name').on('focusout', nameFocusOut);

    // pass msg to server    
    $('form').submit(function() {
        socket.emit('send message', { sessionId, name: $('#name').val(), msg: $('#m').val() });
        $('#m').val('');
        return false; // same as .preventDefault()
    });

    // Event when new msg is posted
    socket.on('send message', (data) => {
        $('#messages').append($('<li>').html(`${data.sessionId === sessionId ? 'You': data.name} <b>:</b> ${data.msg}`));
    });

    // User is typing
    $('#m').on('focus', () => {
            socket.emit('typing', $('#name').val());
        })
        // Display users typing
    socket.on('display typing', (name) => {
        console.log(`${name} is typing`);
    })
});
