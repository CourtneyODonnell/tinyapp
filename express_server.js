const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const getUserByEmail = require('./helpers');
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;
const users = {};

app.set("view engine", "ejs");
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['applesandbananas'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//const objects and functions
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
const urlsForUser = (id) => {
  let result = {};
  for (let URLid of Object.keys(urlDatabase)) {
    if (urlDatabase[URLid].userID === id) {
      result[URLid] = urlDatabase[URLid];
    }
  }
  return result;
};

//ROUTING

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
    res.status(400).send("This feature is only accessible when logged in");
  } else if (req.session['user_id'] === urlDatabase[templateVars.shortURL].userID) {
    res.render('urls_show', templateVars);
  } else {
    res.status(400).send("This URL is not associated with your account.");
  }
});

//main page greeting
app.get("/", (req, res) => {
  res.send("Hello!");
});

//json of urls
app.get("/urls.json", (req, res) => {
  res.send(users);
});

//hello world page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//urls_index
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session['user_id']],
    urls: urlsForUser(req.session['user_id'])
  };
  if (templateVars.user) {
    res.render("urls_index", templateVars);
  } else {
    res.status(400).send("Please log in at http://localhost:8080/login to access this feature.");
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
  res.redirect(`/urls/${shortURL}`);
});


//:shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.statusCode = 404;
    res.send('<h2>404 Not Found<br>This shortURL does not exist!</h2>');
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

//GET register
app.get('/register', (req, res) => {
  let templateVars = {user: users[req.session['user_id']]};
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