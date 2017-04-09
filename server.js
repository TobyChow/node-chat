var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var io = require('socket.io')(http);

// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });

//Stored as objects: {id:'sessionID', name:'participantName'}
var participants = [];

/****Server Stuff*****************************************************/
//Set IP address
app.set('ipaddr', '127.0.0.1');

//Set port
app.set('port', 3000);

//Set 'views' folder
// app.set('views', __dirname + '/views');

//Set view engine
// app.set('view engine', 'jade');


//Specify static content location
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

//Tell server to support JSON request
app.use(bodyParser.json());

//Routing
app.get('/', (req, res) => {
    //Render 'index' view
    res.sendFile(__dirname + '/public/views/index.html');
})

app.get('/private', (req, res) => {
    res.sendFile(__dirname + '/public/views/private.html');
})

app.get('/other', (req, res) => {
    res.sendFile(__dirname + '/public/views/other.html');
})

io.on('connection', function(socket) {
    socket.on('new user', function(data) {
            participants.push(data); // updates database with new user
            io.emit('update participants', { participants: participants }); // emit updated database
        })
        // Pass new messages to clients
    socket.on('send message', function(data) {
            socket.emit('test', 'you sent a msg');
            io.emit('send message', data);
        })
        // show users typing
    socket.on('typing', function(name) {
            socket.broadcast.emit('display typing', name);
        })
        // Find sessionId and change its name
    socket.on('name change', function(data) {
            participants.map((user, index, arr) => {
                if (user.id === data.id) {
                    return user.name = data.name;
                }
            });
            // pass name update to clients
            io.emit('update participants', { participants: participants });
        })
        // remove user from participants array
    socket.on('disconnect', function() {
        var disconnectedUser = participants.find(() => {
            return socket.id.name
        });
        participants = participants.filter((user) => {
            return (user.id !== socket.id);
        });
        io.emit('update participants', { participants: participants });
    });
    // join room
    socket.on('room', function(data) {
        socket.join(data.room);
        socket.in('123').emit('room message', `${data.name} has joined the room`);
    })
});

//Start the http server at port and IP defined before
http.listen(app.get("port"), app.get("ipaddr"), function() {
    console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});
