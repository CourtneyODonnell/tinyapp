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
// TO CALL: getUserByEmail(email, database);

//Generate a Random ShortURL
const generateRandomString = function(length) {
  //variable for characters
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  //variable to create random string
  let result = '';
  let charactersLength = characters.length;
  //for loop
  for (let i = 0; i < length; i++) {
    //original empty string + random characters from characters with math floor to produce whole integers
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};


const urlsForUser = (id) => {
  //returns URLs where userID is equal to the id of the currently logged-in user
  let result = {};
  for (let URLid of Object.keys(urlDatabase)) {
    if (urlDatabase[URLid].userID === id) {
      result[URLid] = urlDatabase[URLid];
    }
  }
  return result;
};



module.exports = getUserByEmail;