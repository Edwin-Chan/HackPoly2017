"use strict";
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendfile('index.html');
});

var rooms = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10'];
var full = false;
var users = [];
io.on('connection', function(socket){
    var currRoom;
    var currName;
    console.log('A user connected!');
    //check if user can be added
    socket.on('setUsername', function(data){
        if (users.indexOf(data) > -1){
            socket.emit('userExists', data + ' username is taken!');
        }
        //error if all rooms are full
        else if (full == true){
            socket.emit('fullRooms', 'All rooms are full!');
        }
        else {
            users.push(data);
            console.log('There are ' + users.length + ' users right now');
            currName = data;
            //check for rooms with one person
            for (var i = 0; i < rooms.length; i++){
                if (users.length == 1){
                    socket.join(rooms[0]);
                    currRoom = rooms[0];
                    socket.emit('userSet', {username: data, room: rooms[0]});
                    io.sockets.in(currRoom).emit('greetings', 'Welcome to the chatroom, ' + data + '!');
                    console.log(currName + ' was placed in room ' + currRoom);
                    break;
                }
                socket.join(rooms[i]);
                if (io.sockets.adapter.rooms[rooms[i]].length == 2){
                    currRoom = rooms[i];
                    socket.emit('userSet', {username: data, room: rooms[i]});
                    io.sockets.in(currRoom).emit('greetings', 'Welcome to the chatroom, ' + data + '!');
                    console.log(currName + ' was placed in room ' + currRoom);
                    break;
                }
                else {
                    socket.leave(rooms[i]);
                }
                //randomly assign to a chatroom
                if (i == rooms.length - 1){
                    while (1){
                        var randInt = Math.floor(Math.random() * (9 - 0 + 1) + 0);
                        socket.join(rooms[randInt]);
                        if (io.sockets.adapter.rooms[rooms[randInt]].length == 2 || io.sockets.adapter.rooms[rooms[randInt]].length == 1){
                            currRoom = rooms[randInt];
                            socket.emit('userSet', {username: data, room: rooms[randInt]});
                            io.sockets.in(currRoom).emit('greetings', 'Welcome to the chatroom, ' + data + '!');
                            console.log(currName + ' was placed in room ' + currRoom);
                            break;
                        }
                        else {
                            socket.leave(rooms[randInt]);
                        }

                    }
                }
            }
            //check if list is full
            for (var i = 0; i < rooms.length; i++){
                socket.join(rooms[i]);
                if (io.sockets.adapter.rooms[rooms[i]].length == 1 || io.sockets.adapter.rooms[rooms[i]].length == 2){
                    full = false;
                    socket.leave(rooms[i]);
                    break;
                }
                else if (io.sockets.adapter.rooms[rooms[i]].length == 3 && i == rooms.length - 1){
                    full = true;
                    socket.leave(rooms[i]);
                    break;
                }
                else {
                    socket.leave(rooms[i]);
                }
            }
            //randomly get paired with someone else in another chatroom

            /*for (var i = 0; i < rooms.length; i++){
                //must join at first in case room hasn't been initialized yet
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
                    io.sockets.in(currRoom).emit('greetings', 'Welcome to the chatroom, ' + data + '!');
                    break;
                }

            }*/
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
        full = false;
        console.log('A user disconnected...' + users.length + ' users remaining!');
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
