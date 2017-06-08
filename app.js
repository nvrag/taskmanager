const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', function () {
    console.log('Conected to MongoDB');
});

// Check for DB errors
db.on('error', function (err) {
    console.log(err);
});

//Init App
const app = express();

// Bring in Models
let Task = require('./models/task');

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//BodyParser Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session MW
app.use(session({
    secret: 'secretWord',
    resave: true,
    saveUninitialized: true
}));

//Express Messages MW
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator MW
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global var User
app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

//Home Route
app.get('/', function (req, res) {
    res.render('index');
});

//Route Files
let tasks = require('./routes/tasks');
let users = require('./routes/users');
app.use('/tasks', tasks);
app.use('/users', users);

//Start Server
app.listen(8000, function () {
    console.log('Server started on port 8000...');
});
