const express = require("express");
const path = require("path");
const fs = require("fs");
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
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../index.html'));
});

app.get('/style.css', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../style.css'));
});

app.get('/favicon.ico', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../stocks.png'));
});

app.get('/dist/bundle.js', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../dist/bundle.js'));
});

//app.use(express.static(path.join(__dirname, '../dist')));

// Routers
const loginRoute = require('./routes/login.js');
app.use('/login', loginRoute);

const logoutRoute = require('./routes/logout.js');
app.use('/logout', logoutRoute);

const signupRoute = require('./routes/signup.js');
app.use('/signup', signupRoute);

const sessionRoute = require('./routes/session.js');
app.use('/session', sessionRoute);

const watcherRoute = require('./routes/watcher');
app.use('/watcher', watcherRoute);

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
