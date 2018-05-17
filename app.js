var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var path = require('path');
var ejs = require('ejs');
var https = require('https');
var http = require('http');
var fs = require('fs');
//同步读取密钥和签名证书
var options = {
    key:fs.readFileSync('./server.key'),
    cert:fs.readFileSync('./server.crt')
}

passport.use(new Strategy({
  clientID: '1666337873401250',
  clientSecret: '2a1a343842f17d7d0fb3ea4590064205',
  callbackURL: 'https://localhost:3001/auth/facebook/callback'
}, function(accessToken, refreshToken, profile, cb) {
  console.log('********* accessToken', accessToken);
  console.log('********* refreshToken', refreshToken);
  console.log('********* profile', profile);
  return cb(null, profile);
}));

passport.use(new GoogleStrategy({
  clientID: '82604517847-tvd0vhjq067a7is19ouii8ubdk2nsj0b.apps.googleusercontent.com',
  clientSecret: 'ezLPfWMAXiSk_a0--Kln39rS',
  callbackURL: 'http://localhost:3000/auth/google/callback'
}, function(accessToken, refreshToken, profile, cb) {
  console.log('********* accessToken', accessToken);
  console.log('********* refreshToken', refreshToken);
  console.log('********* profile', profile);
  return cb(null, profile);
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

var app = express();
var httpsServer = https.createServer(options,app);
var httpServer = http.createServer(app);
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
// 引入 路由模块
// var router = require('./routes/index');
// app.use('/', router);
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });
app.set('views', path.join(__dirname,'views'));

app.set('view engine' , 'ejs'); //设置模板引擎为ejs
app.engine('.html' , ejs.__express);

app.use( express.static(path.join(__dirname, 'public')) );
httpsServer.listen(3001);
httpServer.listen(3000);
