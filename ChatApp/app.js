var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendfile('index.html');
});

users = [];
io.on('connection', function(socket){
    console.log('A user connected!');
    socket.on('setUsername', function(data){
        console.log(data);
        if (users.indexOf(data) > -1){
            socket.emit('userExists', data + ' username is taken!');
        }
        else {
            users.push(data);
            socket.emit('userSet', {username: data});
        }
    });
    socket.on('msg', function(data){
        io.sockets.emit('newmsg', data);
    });
});













/*ROOMS
var roomno = 1;
io.on('connection', function(socket){
    if(io.nsps['/'].adapter.rooms["room-" + roomno] && io.nsps['/'].adapter.rooms["room-" + roomno].length > 1){
        roomno++;
    }
    socket.join("room-" + roomno);

    io.sockets.in("room-" + roomno).emit('connectToRoom', "You are in room no. " + roomno);
});
*/

/*CUSTOM NAMESPACES
var nsp = io.of('/my-namespace');
nsp.on('connection', function(socket){
    console.log('someone connected');
    nsp.emit('hi', 'Hello everyone!');
});*/


/*CONNECTING MULTIPLE CLIENTS
 var clients = 0;
io.on('connection', function(socket){
    clients++;
    socket.emit('newClientConnect', {description: 'Hey welcome!'});
    socket.broadcast.emit('newClientConnect', {description: clients + ' clients connected'});
    socket.on('disconnect', function(){
        clients--;
        socket.broadcast.emit('newClientConnect', {description: clients + ' clients connected'});
    });
});*/

http.listen(3000, function(){
    console.log('listening on *:3000');
});