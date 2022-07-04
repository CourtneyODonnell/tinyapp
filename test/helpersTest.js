const { assert } = require('chai');

const getUserByEmail = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user2@example.com", testUsers);
    // Write your assert statement here
    assert.equal(user, testUsers.user2RandomID);
  });

  it('should return undefinted when looking for a non-existent email', function() {
    const user = getUserByEmail("1111111111111@example.com", testUsers);
    assert.equal(user, undefined);
  });
 
});