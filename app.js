var createError = require('http-errors');
var express = require('express');
//var fs = require("fs-extra");
var path = require('path');
var flash = require('express-flash')
var session = require('express-session');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var projectsRouter = require('./routes/projects');
var apiRouter = require('./routes/api');
var licenseRouter = require('./routes/license');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/project_build', express.static(path.join(__dirname, 'projects')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://simulanis.co.in:3000"); // update to match the domain you will make the request from
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ 
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    //cookie: { maxAge: 60000 }
}))
app.use(flash())
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.locals.login_username = req.session.login_username;
  res.locals.login_id = req.session.login_id;
  res.locals.login_email = req.session.login_email;
  res.locals.login_user_type = req.session.login_user_type;
  res.locals.login_image = req.session.login_image;
  res.locals.login_license_id = req.session.login_license_id;
  // console.log("lice"+res.locals.login_license_id)
  next();
});



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);
app.use('/api', apiRouter);
app.use('/licenses', licenseRouter);
//For swagger
app.use("/", express.static(__dirname + "/swaggerDocs/dist"));
app.use("/apiDocs/", express.static(__dirname + "/swaggerDocs/dist"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


//mongodb Connection
// var db = null // global variable to hold the connection
// const MongoClient = require('mongodb').MongoClient;
// MongoClient.connect('mongodb://localhost:27017/', function(err, client) {
//     if(err) { console.error(err) }
//     db = client.db('npcl') // once connected, assign the connection to the global variable
// })

// var test = 'Harshita';

// console.log(test);


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


/*const PORT=8080; 

fs.readFile('./index.html', function (err, html) {

    if (err) throw err;    

    http.createServer(function(request, response) {  
        response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
        response.end();  
    }).listen(PORT);
});*/

module.exports = app;



