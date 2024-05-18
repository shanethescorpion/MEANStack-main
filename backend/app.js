var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var routes = require('./routes');

var app = express();

var corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:4200"]
};

app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// api backend
app.use('/api', routes);


module.exports = app;
