var express = require('express');
var router = express.Router();
var mongoose =require('mongoose');
var User = require('../models/user');

//GET /profile
router.get('/profile', function(req, res, next){
  if(! req.session.userId){
    var err = new Error("Nu esti autorizat");
    err.status = 403;
    return next(err);
  }
  User.findById(req.session.userId)
      .exec(function(error, user){
        if(error){
          return next(error);
        }else {
          return res.render('profile', {title: 'Profile', name:user.name, favorite:user.favoriteBook});
          
        }
      })
})

//GET /login
router.get('/login', function(req, res, next){
  return res.render('login', {title:'Log In'});
});

router.post('/login', function(req, res, next){
  if(req.body.email && req.body.password){
    User.authenticate(req.body.email, req.body.password, function(error, user){
      if(error|| !user){
        var err = new Error('Date gresite');
        err.status = 400;
        return next(err);
      } else{
        req.session.userId =user._id;
        return res.redirect('/profile');
      }
    })
  }else {
    var err = new Error('Date gresite');
    err.status = 400;
    return next(err);
  } 
});
//GET /register

router.get('/register', function(req, res, next){
  return res.render('register',{title: 'Sign Up'});
})

//mongoDB connection
mongoose.connect("mongodb://localhost:27017/bookworm");

var db = mongoose.connection;
//mongo error
db.on('error', console.error.bind(console, 'connection'));

//POST /register
router.post('/register', function(req, res, next){
  if(req.body.email &&
    req.body.name &&
    req.body.favoriteBook &&
    req.body.password &&
    req.body.confirmPassword){
      
      // confirm that user typed same pass
      if(req.body.password !==req.body.confirmPassword){
        var err = new Error('Password do not match.');
        err.status = 400;
        return next(err);
      }
      
      //create object with form input
      var userData = {
        email: req.body.email,
        name: req.body.name,
        favoriteBook: req.body.favoriteBook,
        password: req.body.password
      };

      // user schema's 'create' to insert document into Mongo
      User.create(userData, function (error, user){
        if(error){
          return next(error);
        }else {
          req.session.userId =user._id;
          return res.redirect('/profile');
        }
      });

    }else{
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
})

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

module.exports = router;
