var express = require('express');
var path = require('path');
var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var Admin = require('./controllers/Admin');
var Home = require('./controllers/Home');
var Blog = require('./controllers/Blog');
var Page = require('./controllers/Page');

var index = require('./routes/index');
var users = require('./routes/users');
var config = require('./config')();
var expressSession = require("express-session");
var session = expressSession({
    secret: "test",
    key: "mybgo.sid",
    resave: true,
    saveUninitialized: true
});

var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('views', path.join(__dirname, '/templates'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(session);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', index);
//app.use('/users', users);

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});*/

// development only
/*if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
*/
MongoClient.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/fastdelivery', function(err, db) {
    if(err) {
        console.log('Sorry, there is no mongo db server running.');
    } else {
        var attachDB = function(req, res, next) {
            req.db = db;
            next();
        };
        app.all('/admin*', attachDB, function(req, res, next) {
            Admin.run(req, res, next);
        });
        app.all('/blog/:id', attachDB, function(req, res, next) {
            Blog.runArticle(req, res, next);
        });
        app.all('/blog', attachDB, function(req, res, next) {
            Blog.run(req, res, next);
        });
        app.all('/services', attachDB, function(req, res, next) {
            Page.run('services', req, res, next);
        });
        app.all('/careers', attachDB, function(req, res, next) {
            Page.run('careers', req, res, next);
        });
        app.all('/contacts', attachDB, function(req, res, next) {
            Page.run('contacts', req, res, next);
        });
        app.all('/', attachDB, function(req, res, next) {
            Home.run(req, res, next);
        });
        http.createServer(app).listen(config.port, function() {
            console.log(
                'Successfully connected to mongodb://' + config.mongo.host + ':' + config.mongo.port,
                '\nExpress server listening on port ' + config.port
            );
        });
    }
});

module.exports = app;