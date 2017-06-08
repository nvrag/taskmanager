const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model
let User = require('../models/user');

//Registration
router.post('/register', function (req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    req.checkBody('name', 'Name can\'t be empty').notEmpty();
    req.checkBody('email', 'email can\'t be empty').notEmpty();
    req.checkBody('email', 'email is not valid').isEmail();
    req.checkBody('username', 'Username can\'t be empty').notEmpty();
    req.checkBody('password', 'Password can\'t be empty').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    let errors = req.validationErrors();

    if(errors){
        res.render('register', {
            errors:errors
        });
    } else {
        let newUser = new User({
            name:name,
            email:email,
            username:username,
            password:password
        });

        bcrypt.genSalt(10, function (err, salt){
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                if(err){
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save(function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    } else {
                        req.flash('success', 'You are now registered');
                        res.redirect('/users/login');
                    }
                });
            });
        });
    }
});

//Login form
router.get('/login', function (req, res) {
    res.render('login');
});

// login
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: 'users/login',
        failureFlash: true
    })(req, res, next);
});

//Logout
router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success','You are logged out');
    res.redirect('/users/login');
});


//User Router
router.get('/register', function (req, res) {
    res.render('register');
});

module.exports = router;
