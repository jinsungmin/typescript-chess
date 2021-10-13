import { app } from './app';
import * as http from 'http';
import * as mongoose from 'mongoose';

const PORT = 8080;
const MONGO_URI = 'mongodb://localhost:27017/chess';
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

server.listen(PORT);

const { reflectGameResult } = require('./routes/middlewares.ts');
const { addUser, removeUser, getUser, users } = require('./users');
const { removeRoom, getRoom, getIndex, removeUserInRoom, createRoom, pushUserToRoom, pushID, getUserForSend, leaveRoom, getUserInRoom, rooms } = require('./rooms');

io.on('connection', (socket) => {
	socket.on('login', (name, callback) => {
    console.log('login-user:', name);
    let exist = 0;
    for(let i = 0; i< users.length; i++) {
      if(name === users[i].name) {
        exist++;
      }
    }
    if(exist === 0) {
      const {error, user } = addUser({id: socket.id, name: name});
      console.log('We have a new connection.');
      if(error) return callback(error);
    } else {
      const {error, user } = addUser({id: socket.id, name});
      if(error) return callback(error);
    }

    console.log('users:',users);
    console.log('total user count:', users.length);
    socket.emit('sendRoom', {rooms: rooms});
    socket.emit('sendUser', {users: users});
	})
	
	socket.on('getRoomList', () => {
		console.log('usersss:', users);
		if (users.length !== 0) {
      socket.emit('sendRoom', { users: users });
    }
		/*
		for(let i = 0; i< users.length; i++) {
			io.to(user.room).emit('message', { user: user.name, text: message});
		}
		*/
  });

  socket.on('requestMatch', ({fromUser, toUser, confirm}, callback) => {
    try {
      console.log('request Match');
      if(confirm === 'send') {
        io.to(getUser(toUser).id).emit('request', {fromUser: fromUser, confirm: 'receive'});
      } else if(confirm === 'receive'){
        const room = createRoom();

        pushUserToRoom(fromUser, room);
        pushUserToRoom(toUser, room);

        console.log('create room:', room);
        console.log('existed rooms:', rooms);

        io.to(getUser(toUser).id).emit('request', {fromUser: fromUser, confirm: 'start', roomID: room.id});
        io.to(getUser(fromUser).id).emit('request', {fromUser: toUser, confirm: 'start', roomID: room.id});

      }
    } catch (error) {
      return callback(error);
    }
  });

  socket.on('moveObject', ({roomID, username, data, turn}, callback) => {
    
    io.to(getUserForSend(roomID, username)).emit('loadMove', {roomID: roomID, username: username, data: data, turn: turn+1});
  })

  socket.on('gameSet', ({roomID, winner, opponent}, callback) => {
    const user = getUserInRoom(roomID, socket.id);

    if(winner) {
      // 승수 추가
      console.log('winner:', user);
      reflectGameResult(user, true);
    } else {
      console.log('loser:', user);
      reflectGameResult(user, false);
    }

    if(opponent) {
      console.log('winner:', opponent);
      reflectGameResult(opponent, true);
      io.to(getUserForSend(roomID, opponent)).emit('breakOut', {roomID: roomID });
    }
  })

  socket.on('roomConnect', ({roomID, username}, callback) => {
    const count = pushID(roomID, username, socket.id);

    socket.join('room' + roomID);

    console.log('count:', count);

    if(count === 2) {
      io.to('room' + roomID).emit('match', {roomID: roomID});
    }
  })

  socket.on('selectColor', ({roomID, username}) => {
    const room = getRoom(roomID);

    var rand = Math.floor(Math.random() * 1);

    if(rand) {
      io.to('room' + roomID).emit('setColor', {black: room.user[1].name, white: room.user[0].name, roomID: roomID})
    } else {
      io.to('room' + roomID).emit('setColor', {black: room.user[0].name, white: room.user[1].name, roomID: roomID})
    }
  })

  socket.on('removeRoom', ({roomID}) => {
    leaveRoom(roomID, socket.id);

    console.log('length:', rooms[roomID].user.length)
    if(!rooms[roomID].user.length) {
      removeRoom(roomID);
      console.log('Room', roomID, 'removed!');
    }
  })
  
  socket.on('disconnect', () => {
    console.log('disconnected!');

    const user = removeUser(socket.id);
    if(user !== -1) {
      socket.emit('sendUser', {users: users});
    }
  })
});

server.on('listening', async () => {
	console.info(`listening on port ${PORT}`);
	mongoose.connect(MONGO_URI, { useNewUrlParser: true, useFindAndModify: false });
	mongoose.connection.on('open', () => {
		console.info('Connected to Mongo.');
	});
	mongoose.connection.on('error', (err: any) => {
		console.error(err);
	});
});