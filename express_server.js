const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Generate a Random ShortURL
const generateRandomString = function() {
  //variable for characters
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  //variable to create random string
  let randomString = '';
  //conditional if length < 6
  if (randomString.length < 6) {
    //original empty string + random characters from characters with math floor to produce whole integers
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }

  return randomString;
  
};

//getting ready for post requests by adding body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


//add GET route to show the form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//add new route
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };  res.render("urls_show", templateVars);
  res.render('urls_show', templateVars);
  //adding shorturl route
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//define the route that will match this POST request and handle it
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  res.redirect(longURL);
});