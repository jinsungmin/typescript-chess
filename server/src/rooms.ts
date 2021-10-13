const rooms = [];

const createRoom = () => {
  rooms.push({id: rooms.length, user: []});

  return rooms[rooms.length - 1];
}

const pushUserToRoom = (name, room) => {
  room.user.push({name:name, id: ''});
}

const removeUserInRoom = (name) => {
  for(let i = 0; i< rooms.length; i++) {
    for(let j = 0; j < rooms[i].name.length; j++) {
      if(name === rooms[i].name[j]) {
        rooms[i].name.splice(j, 1);
        rooms[i].id.splice(j, 1);

        return rooms[i];
      }
    }
  }
  return -1;
}

const getUserInRoom = (roomID, userID) => {
  const index = rooms[roomID].user.findIndex((obj) => obj.id === userID);

  return rooms[roomID].user[index].name;
}

const getUserForSend = (roomID, username) => {
  const index = rooms[roomID].user.findIndex((obj) => obj.name === username);

  return rooms[roomID].user[index].id;
}

const pushID = (roomID, username, id) => {
  const index = rooms[roomID].user.findIndex((obj) => obj.name === username);

  rooms[roomID].user[index].id = id;

  //console.log('123:', rooms[roomID]);

  let count = 0;
  for(let i = 0; i< rooms[roomID].user.length; i++) {
    if(rooms[roomID].user[i].id) {
      count++;
    }
  }
  return count;
}

const leaveRoom = (roomID, id) => {
  const index = rooms[roomID].user.findIndex((obj) => obj.id === id);

  //rooms[roomID].user[index].id = null;
  rooms[roomID].user.splice(index, 1)[0];
  
}

const removeRoom = (roomID) => {
  if(roomID !== -1) {
    rooms.splice(roomID, 1)[0];
  }
}

const getRoom = (id) => {
  const index = rooms.findIndex((room) => room.id = id);

  return rooms[index];
}

const getIndex = (id) => {
  for(let i = 0; i< rooms.length; i++) {
    for(let j = 0; j < rooms[i].id.length; j++) {
      if(id === rooms[i].id[j])
        return j;
    }
  }
}

//const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { removeRoom, leaveRoom, getRoom, getIndex,removeUserInRoom, createRoom, pushUserToRoom, pushID, getUserForSend, getUserInRoom, rooms }