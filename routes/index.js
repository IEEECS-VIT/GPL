var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    var temp = "";
    res.render('index', { title: temp });
});

router.get('/how', function (req, res) {
    // Pull from Database
    // variable
    res.render('index', { title: 'Express' });
});

module.exports = router;