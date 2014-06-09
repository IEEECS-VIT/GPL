var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    var temp = "";
    res.render('Main', { title: temp });
});
router.get('/register', function(req, res) {
    var temp = "";
    res.render('register', { title: temp });
});
router.get('/login', function(req, res) {
    var temp = "";
    res.render('login', { title: temp });
});
router.get('/prize', function(req, res) {
    var temp = "";
    res.render('prize', { title: temp });
});
router.get('/howtoplay', function(req, res) {
    var temp = "";
    res.render('howtoplay', { title: temp });
});
router.get('/rules', function(req, res) {
    var temp = "";
    res.render('rules&scoring', { title: temp });
});
router.get('/sponsor', function(req, res) {
    var temp = "";
    res.render('sponsors', { title: temp });
});
router.get('/players', function(req, res) {
    var temp = "";
    res.render('stats', { title: temp });
});


router.get('/express', function (req, res) {
    // Pull from Database
    // variable
    res.render('express', { title: 'Express' });
});

module.exports = router;