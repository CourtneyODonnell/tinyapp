const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const express = require('express');
const bodyParser = require("body-parser");

const {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
  getUserById
} = require('./helpers');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['applesandbananas'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


//const objects and functions
const users = {
  'userRandomID': {
    id: "userRandomID",
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

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

//ROUTING

//main page
app.get("/", (req, res) => {
  //if user is not logged in, redirect to /login
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.session['user_id']]};
  if (!templateVars.user) {
    res.status(400).send("This feature is only accessible when logged in");
    return;
  }
  return res.render('urls_new', templateVars);
});

//new URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session['user_id']]
  };
  if (!templateVars.user) {
    return res.status(400).send("This feature is only accessible when logged in");
  } else if (req.session['user_id'] === urlDatabase[templateVars.shortURL].userID) {
    return res.render('urls_show', templateVars);
  } else {
    return res.status(400).send("This URL is not associated with your account.");
  }
});

//json of urls
app.get("/urls.json", (req, res) => {
  res.send(users);
});

//urls_index
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']],
    urls: urlsForUser(req.session['user_id'], urlDatabase)
  };
  if (templateVars.user) {
    return res.render("urls_index", templateVars);
  } else {
    return res.status(400).send("Please log in at http://localhost:8080/login to access this feature.");
  }
});

//POST /urls
app.post("/urls", (req, res) => {
  const userID = req.session['user_id'];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  console.log(`DATABASE ${urlDatabase[shortURL]}`);
  res.redirect(`/urls/${shortURL}`);
});

//:shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    return res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.statusCode = 404;
    return res.send('<h2>404 Not Found<br>This shortURL does not exist!</h2>');
  }
});


//delete shortURL
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session['user_id'] === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(400).send("You do not have permission to delete this URL");
  }
});

//update longURL
app.post('/urls/:shortURL', (req, res) => {
  console.log('request body', req.body);
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  if (req.session['user_id'] === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(400).send("You do not have permission to edit this URL");
  }
});

//POST logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});
/*** TO FIX - FUNCTIONAL REQUIREMENTS ***/
//GET /urls/:id (Minor) returns HTML with a relevant error message

/*** TO FIX - FUNCTIONAL REQUIREMENTS ***/
//GET /u/:id if URL for the given ID does not exist: (Minor) returns HTML with a relevant error message


//GET register
app.get('/register', (req, res) => {
  const registered = false;
  const templateVars = {
    user: getUserById(req.session.user_id, users),
    users,
    registered
  };
  //if user is logged in, redirect to /urls
  if (req.session.user_id) {
    res.redirect('/urls');
    return;
  }
  res.render('urls_registration', templateVars);
});

//POST registration handler
app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {
    if (!getUserByEmail(req.body.email, users)) {
      const userID = generateRandomString(5);
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.user_id = userID;
      console.log(users);
      return res.redirect('/urls');
    } else {
      res.statusCode = 400;
      return res.send('<h3>400 Bad Request<br>Input email address is already registered.</h3>');
    }
  } else {
    res.statusCode = 400;
    return res.send('<h3>400 Bad Request<br>Please fill out all required fields.</h3>');
  }
});

//GET login
app.get('/login', (req, res) => {
  let templateVars = {user: users[req.session['user_id']]};
  res.render('urls_login', templateVars);
});

//POST login handler
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
 
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.userID;
      return res.redirect('/urls');
    } else {
      res.statusCode = 403;
      return res.send('<h3>403: Forbidden<br>Password does not match</h3>');
    }
  } else {
    res.statusCode = 403;
    return res.send('<h3>403: Forbidden<br>No user account with this email address found</h3>');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});