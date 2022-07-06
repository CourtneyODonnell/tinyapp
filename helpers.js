const getUserByEmail = function(email, database) {
  // lookup magic...
  //for in loop to scan object
  for (const user in database) {
    //if input email is already registered in database, then...
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

//function to generate random characters based on given length parameter
const generateRandomString = function(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = '';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

//returns URLs where userID is equal to the id of the currently logged-in user
const urlsForUser = (id, database) => {
  let result = {};
  for (let URLid of Object.keys(database)) {
    if (database[URLid].userID === id) {
      result[URLid] = database[URLid];
    }
  }
  return result;
};

module.exports = getUserByEmail;
module.exports = generateRandomString;
module.exports = urlsForUser;

