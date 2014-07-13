var mongo = require('../mongo');
var express = require('express');
// var validator = require('validator');
var router = express.Router();
// var email_dispatch = require('emailjs'); Implement this later, when the view for forgot password is also present


router.get('/', function (req, res) {
    if (req.cookies.name) res.redirect('/home');
    else res.render('index', { });
});


router.get('/login', function (req, res) {
    if (req.cookies.name) res.redirect('/home');
    else res.render('login', { });
});


router.post('/login', function (req, res) {
    var teamName = req.body.name;
    var password = req.body.password;

    // teamName and password Validation Starts

    // validator.check()
    if (req.cookies.name) res.clearCookie('name');
    var credentials = {
        '_id': teamName,
        'password_hash': password
    };
    var onAuth = function (err, doc) {
        if (err) {
            console.log('Incorrect Credentials');
            // Make it more user friendly, output the error to the view
            res.redirect('/login');
        }
        else {
            var name = doc['_id'];
            res.cookie('name', name, {maxAge: 86400000});
            res.redirect('/home');
        }
    };
    mongo.auth(credentials, onAuth);
});


router.get('/logout', function (req, res) {
    if (req.cookies.name) {
        res.clearCookie('name');
        res.redirect('/');
    }
    else res.redirect('/');
});


router.get('/register', function (req, res) {
    if (req.cookies.name) res.redirect('/home');
    else res.render('register', { });
});

router.post('/register', function (req, res) {
    var teamName = req.body.name;
    var password = req.body.password;
    var confirmPassword = req.body.confirmpassword;
    var email = req.body.email;
    var phone = req.body.phone;
    var captcha = req.body.captcha;

    // teamName

    if ((password === confirmPassword) && captcha) // check if captcha is correct
    {
        var hashedPassword = password; // hash password first
        var newUser = {
            _id: teamName,
            password_hash: hashedPassword,
            email: email,
            phone: phone
        };
        var onInsert = function (err, docs) {
            if (err) {
                console.log('Team Name already exists');
                // Make it more user friendly, output the error to the view
                res.redirect('/register');
            }
            else {
                var name = docs[0]['_id'];
                res.cookie('name', name, {maxAge: 86400000});
                res.redirect('/home');
            }
        };
        mongo.insert(newUser, onInsert);
    }
    else {
        console.log('Captcha is wrong or Password!=Confirm Password');
        // Make it more user friendly, output the error to the view
        res.redirect('/register');
    }
});

router.get('/home', function (req, res) // page to user home
{
    if (req.cookies.name) {
        var credentials = {
            '_id': req.cookies.name
        };
        var onFetch = function (err, doc) {
            if (err) {
                res.redirect('/login');
            }
            else {
                res.render('home', {name: doc['_id']}); // Home View is not complete, must implement that
            }
        };
        mongo.fetch(credentials, onFetch);
    }
    else res.redirect('/login');
});


// Modify all the following functions to check for cookie
router.get('/prize', function (req, res) // page to view prizes
{
    res.render('prize', { });
});

router.get('/howtoplay', function (req, res) // page for how to play
{
    res.render('howtoplay', { });
});

router.get('/rules', function (req, res) // page to view rules
{
    res.render('rules&scoring', { });
});

router.get('/sponsor', function (req, res) // sponsors page
{
    res.render('sponsors', { });
});

router.get('/players', function (req, res) // page for all players, only available if no squad has been chosen
{
    res.render('stats', { });
});

router.get('/squad', function (req, res) // page to view the 16 player squad of a particular user
{
    res.render('squad', { });
});

router.get('/team', function (req, res) // view the assigned playing 11 with options to change the playing 11
{
    res.render('team', { });
});

router.get('/matchday', function (req, res) // page to view next match schedule and the opponent team
{
    res.render('matchday', { });
});

router.get('/leaderboard', function (req, res) // Leaderboard/Standings
{
    res.render('leaderboard', { });
});

router.get('/forum', function (req, res) // User Forums
{
    res.render('forum', { });
});

module.exports = router;