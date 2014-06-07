var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    var temp = "";
    res.render('Main', { title: temp });
});

router.get('/express', function (req, res) {
    // Pull from Database
    // variable
    res.render('express', { title: 'Express' });
});

module.exports = router;