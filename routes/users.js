var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res) {
    res.send('respond with a resource');
});

router.get('/help', function (req, res) {
    res.send('Help');
});

module.exports = router;