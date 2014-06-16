var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('Main', { });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.get('/login', function(req, res) {
    res.render('login', { });
});

router.get('/prize', function(req, res) {
    res.render('prize', { });
});

router.get('/howtoplay', function(req, res) {
    res.render('howtoplay', { });
});

router.get('/rules', function(req, res) {
    res.render('rules&scoring', { });
});

router.get('/sponsor', function(req, res) {
    res.render('sponsors', { });
});

router.get('/players', function(req, res) {
    res.render('stats', { });
});

router.get('/express', function (req, res) {
    // Pull from Database
    // variable
    res.render('express', { title: 'Express' });
});

module.exports = router;