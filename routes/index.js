var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {   //homepage, option for login and signup
    res.render('Main', { });
});

router.get('/register', function (req, res) {   // page to register
    res.render('register', { });
});

router.get('/registerproceed', function (req, res) {   // page to retrieve register data - a dummy page
    res.render('register', { });
});


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

router.get('/express', function (req, res) {    //Please add comment to explain
    // Pull from Database
    // variable
    res.render('express', { title: 'Express' });
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