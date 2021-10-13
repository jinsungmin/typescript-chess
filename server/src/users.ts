const users = [];

const addUser = ( {id, name}) => {
  // JavaScript Mastery = javascriptmastery  
  
  const existingUser = users.find((user) => user.name === name);

  if(existingUser) {
    const idx = users.findIndex((user) => user.name === name);
    users[idx].id = id;
    return { existingUser };
  }

  const user = { id: id, name: name};

  users.push(user);

  return { user }
}

const removeUser = (id) => {
  let index = users.findIndex((user) => user.id === id);

  if(index !== -1) {
    return users.splice(index, 1)[0];
  } else {
    return -1;
  }
}

//const getUser = (id) => users.find((user) => user.id === id);
const getUser = (name) => users.find((user) => user.name === name);

module.exports = { addUser, removeUser, getUser, users }