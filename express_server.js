const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

//getting ready for post requests by adding body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


//add GET route to show the form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//add new route
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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

//urls_index
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//POST
//define the route that will match this POST request and handle it
app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const shortURL = generateRandomString(6); //variable for shortURL calling generateRandomString function
  urlDatabase[shortURL] = req.body.longURL;
  //add url to database
  res.redirect(`/urls/${shortURL}`);
  //redirect to /urls/${shortURL}
});


//redirect short URLs
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  //if longURL is truthy, redirect to
  if (longURL) {
    res.redirect(urlDatabase[req.params.shortURL]);
  } else {
    //redirect to 404 error
    res.statusCode = 404;
    res.send('<h2>404 Not Found<br>This shortURL does not exist!</h2>');
  }
});