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



module.exports = getUserByEmail;