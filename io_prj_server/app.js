var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const sql = require('mssql');
var routes = require('./routes')

var db_cfg = require('./config/db_cfg.json');
var jwt_cfg = require('./config/jwt_cfg.json');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// database connection
const dbPool = new sql.ConnectionPool(db_cfg)
dbPool.connect().then(pool => {
  app.locals.db = pool;
  console.log('Connected to SQL Server')
}).catch(err => {
  console.log('Database Connection Failed! Error: ', err)
})

// user authentication middleware
const user_auth = function (req, res, next) {
  const token = req.cookies.jwt_access_token;
  req.user = null;
  if (token) {
    jwt.verify(token, jwt_cfg.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded;
      }
    });
  }
  next();
}
app.use(user_auth);

// main routes
routes(app)

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
