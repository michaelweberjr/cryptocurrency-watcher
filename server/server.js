const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const { mongoURL } = JSON.parse(fs.readFileSync(path.join(__dirname, '../dist/config.json')));

const app = express();

const PORT = 3000;

mongoose.connect(mongoURL, {
    // options for the connect method to parse the URI
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // sets the name of the DB that our collections are part of
    dbName: 'cryptoWatcher'
  })
    .then(() => console.log('Connected to Mongo DB.'))
    .catch(err => console.log(err));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../index.html'));
});

app.get('/style.css', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../style.css'));
});

app.use(express.static(path.resolve(__dirname, '../dist')));

// Routers
const loginRoute = require('./routes/signup.js');
app.use('/signup', loginRoute);

const signupRoute = require('./routes/login.js');
app.use('/login', loginRoute);

app.get('/session', (req, res) => {
  res.status(200).json({tag: 2});
});

/**
 * 404 handler
 */
app.use("*", (req, res) => {
  res.status(404).send("Not Found");
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.log(err.log);
  res.status(err.status || 500).send(err.message);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

module.exports = app; 
