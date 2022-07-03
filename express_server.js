//HASH & ENCRYPTION
//replace cookie parser with cookie session
const cookieSession = require('cookie-session');
//bcryptjs
const bcrypt = require('bcryptjs');

//CONSTANTS
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
//getting ready for post requests by adding body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['applesandbananas'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




app.set("view engine", "ejs");

//CONST OBJECTS/DATABASES

//create user object
const users = {};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

//CONST HELPER FUNCTIONS

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

//email already registered helper function
const searchForEmail = (email) => {
  //for in loop to scan object
  for (const user in users) {
    //if input email is already registered in database, then...
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
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

//ROUTING

//add GET route to show the form
app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.session['user_id']]};
  //Modify so that only registered & logged in users can create new tiny URLs.
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login', templateVars);
  }
});

//add new route
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session['user_id']]
  };
  if (!templateVars.user) {
    res.status(400).send("This feature is only accessible when logged in");
  } else if (req.session['user_id'] === urlDatabase[templateVars.shortURL].userID) {
    res.render('urls_show', templateVars);
  } else {
    res.status(400).send("This URL is not associated with your account.");
  }
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.send(users);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//urls_index
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session['user_id']],
    urls: urlsForUser(req.session['user_id'])
  };
  res.render("urls_index", templateVars);
  if (templateVars.user) {
    res.render("urls_index", templateVars);
  } else {
    res.status(400).send("Please log in to access this feature.");
  }
});

//POST
//define the route that will match this POST request and handle it
app.post("/urls", (req, res) => {
  //should not display URLs unless the user is logged in. It should instead display a message or prompt suggesting that they log in or register first
  const userID = req.session['user_id'];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6); //variable for shortURL calling generateRandomString function
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${shortURL}`);
});


//redirect short URLs
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  //if longURL is truthy, redirect to
  if (longURL) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    //redirect to 404 error
    res.statusCode = 404;
    res.send('<h2>404 Not Found<br>This shortURL does not exist!</h2>');
  }
});

//Add a POST route that removes a URL resource: POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session['user_id'] === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
    //redirects to main url page
  } else {
    res.status(400).send("You do not have permission to delete this URL");
  }
});

//update longURL in database
app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  if (req.session['user_id'] === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(400).send("You do not have permission to edit this URL");
  }
});

//logout POST
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//registration GET
app.get('/register', (req, res) => {
  let templateVars = {user: users[req.session['user_id']]};
  res.render('urls_registration', templateVars);
});

//registration handler POST
app.post('/register', (req, res) => {
  //if req body email and pw truthy, then, if not in database, then...
  if (req.body.email && req.body.password) {
    if (!searchForEmail(req.body.email)) {
      const userID = generateRandomString(5);
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.user_id = userID;
      console.log(users);
      res.redirect('/urls');
    } else {
      res.statusCode = 400;
      res.send('<h3>400 Bad Request<br>Input email address is already registered.</h3>');
    }
  } else {
    res.statusCode = 400;
    res.send('<h3>400 Bad Request<br>Please fill out all required fields.</h3>');
  }
});

//LOGIN get
app.get('/login', (req, res) => {
  let templateVars = {user: users[req.session['user_id']]};
  res.render('urls_login', templateVars);
});

//login handler POST
app.post('/login', (req, res) => {
  const user = searchForEmail(req.body.email);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session('user_id', user.userID);
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.send('<h3>403: Forbidden<br>Password does not match</h3>');
    }
  } else {
    res.statusCode = 403;
    res.send('<h3>403: Forbidden<br>No user account with this email address found</h3>');
  }
});