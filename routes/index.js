var express = require('express');
var express_session = require('express-session');
//var database = require('../database');
var http = require('http');
var querystring = require('querystring');
var router = express.Router();
var util = require('util');
var fs = require('fs');
var url = require('url');
var AM = require('account-manager.js');
var EM = require('email-dispatcher.js');
var connect = require('connect');


connect().use(connect.cookieParser());
connect().use(connect.session({ secret: 'keyboard cat', key: 'sid', cookie: { secure: true }}))


/* GET home page. */
router.get('/', function (req, res) { // Login page, attempting auto-login
// check if the user's credentials are saved in a cookie //
    if (req.cookies.user == undefined || req.cookies.pass == undefined) {
        res.redirect('/login');
    } else {
        // attempt automatic login //
        AM.autoLogin(req.cookies.user, req.cookies.pass, function (o) {
            if (o != null) {
                req.session.user = o;
                res.redirect('/home');
            } else {
                res.redirect('/login');
            }
        });
    }
});


router.get('/login', function (req, res) {      // page to login

    res.render('login', { });
});

router.post('/login', function (req, res) {

    var user = req.param('user');
    var pass = req.param('pass');

    console.log(user);
    console.log(pass);
    AM.manualLogin(user, pass, function (e, o) {
        if (!o) {
            res.send(e, 400);
        } else {
            req.session.name = o;
            if (req.param('remember-me') == 'true') {
                res.cookie('user', o.user, { maxAge: 900000 });
                res.cookie('pass', o.pass, { maxAge: 900000 });
            }
            res.send(o, 200);
        }
    });

})


router.get('/register', function (req, res) {   // page to register
    res.render('register', { });
});
router.post('/register', function (req, res) {
    AM.addNewAccount({
        user: req.param('name'),
        pass: req.param('password'),

        email: req.param('email'),
        phone: req.param('phone')
    }, function (e) {
        if (e) {
            res.send(e, 400);
        } else {
            res.send('ok', 200);
        }
    });
});



router.get('/prize', function (req, res) {       //// page to view prizes
    res.render('prize', { });
});


router.get('/howtoplay', function (req, res) {   // page to view prizes
    res.render('howtoplay', { });
});


router.get('/rules', function (req, res) {       // page to view rules
    res.render('rules&scoring', { });
});


router.get('/sponsor', function (req, res) {     // sponsors page
    res.render('sponsors', { });
});


router.get('/players', function (req, res) {     // page for all players, only available if he has no squad
    res.render('stats', { });
});


router.get('/squad', function (req, res) {      // page to view the 16 player squad of a particular user
    res.render('squad', { });
});


router.get('/team', function (req, res) {      // view the assigned playing 11 with options to change the playing 11
    res.render('team', { });
});


router.get('/matchday', function (req, res) {      // page to view his next match schedule and the opponent team
    res.render('matchday', { });
});


router.get('/leaderboard', function (req, res) {      // view the standings of his league
    res.render('leaderboard', { });
});


router.get('/forum', function (req, res) {      // page to login
    res.render('forum', { });
});

module.exports = router;