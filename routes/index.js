var express = require('express');
//var database = require('../database');
var http = require('http');
var querystring = require('querystring');
var router = express.Router();
var util = require('util');
var fs = require('fs');
var url = require('url');
/* GET home page. */
router.get('/', function (req, res) {   //homepage, option for login and signup
    res.render('Main', { });
});

router.get('/register', function (req, res) {   // page to register
    res.render('register', { });
});
/*
 router.get('/registerproceed', function (req, res) {   // page to retrieve register data - a dummy page
    var server = http.createServer(function (req, res) {

        var url_parts = url.parse(req.url, true);
        console.log(url_parts);

        if (url_parts.pathname == '/register')
            getData(res, url_parts);
        // res.render('register', { });
    });
});
function getData(res, url_parts) {
    var uname = url_parts.query.name;
    var password = url_parts.query.password;
    var confpassword = url_parts.query.confirm;
    console.log(uname);
    console.log(password);
    console.log(confpassword);
}
 Must be rewritten
 */
router.get('/login', function (req, res) {      // page to login
    res.render('login', { });
});

router.get('/login', function (req, res) {      // page to retrieve login data - a dummy page
    res.render('login', { });
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