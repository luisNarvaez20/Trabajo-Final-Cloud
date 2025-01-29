var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

const models = require('./app/models');

//cors
const cors = require("cors");


// Inicializar la base de datos al inicio
models.sequelize.sync()
  .then(() => {
    console.log('Base de datos conectada correctamente.');
  })
  .catch(err => {
    console.error('Error al conectar la base de datos:', err);
  });


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10',extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//permisos de cors
app.use(
  cors({ origin: "*" })
);

app.use('/', indexRouter);
app.use('/api', usersRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
