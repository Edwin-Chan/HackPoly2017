var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile('index.html');
});

var rooms = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10'];
var full = false;
users = [];
io.on('connection', function(socket){
    var currRoom;
    var currName;
    console.log('A user connected!');
    //check if user can be added
    socket.on('setUsername', function(data){
        console.log(data);
        if (users.indexOf(data) > -1){
            socket.emit('userExists', data + ' username is taken!');
        }
        //error if all rooms are full
        else if (full == true){
            socket.emit('fullRooms', 'All rooms are full!');
        }
        else {
            users.push(data);
            currName = data;
            for (var i = 0; i < rooms.length; i++){
                socket.join(rooms[i]);
                if (io.sockets.adapter.rooms[rooms[i]].length > 2) {
                    socket.leave(rooms[i]);
                }
                else {
                    currRoom = rooms[i];
                    if (io.nsps['/'].adapter.rooms[rooms[i]].length == 2 && i == rooms.length-1){
                        full = true;
                    }
                    console.log(currName + ' was placed in room ' + currRoom);
                    //output info to html to change its format on client-side
                    socket.emit('userSet', {username: data, room: rooms[i]});
                    break;
                }

            }
        }
    });
    //when message is asked to be sent, send message to all
    socket.on('msg', function(data){
        io.sockets.in(currRoom).emit('newmsg', data);
    });
    //disconnect user from chat room, take user out of Users array, set full to false
    socket.on('disconnect', function(){
        if (currRoom) {
            socket.leave(currRoom);
            io.sockets.in(currRoom).emit('disconnectedUser', 'The other user has left the room...close the page');
        }
        if (currName){
            users.splice(users.indexOf(currName), 1);
        }
        if (rooms.length >= 20){
            full = false;
        }
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
