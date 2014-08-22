var mongo_users = require('../mongoUsers');
var express = require('express');
// var validator = require('validator');
var router = express.Router();
var mongo_players = require('../mongoPlayer');
var mongo_squad = require('../mongoSquad');
var mongo_team = require('../mongoTeam');
var mongo_interest = require('../db/mongo-interest');
// var email_dispatch = require('emailjs'); Implement this later, when the view for forgot password is also present


router.get('/', function (req, res)
{
    if (req.cookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('index', { });
    }
});


router.get('/login', function (req, res)
{
    if (req.cookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('login', { });
    }
});


router.post('/login', function (req, res)
{
    var teamName = req.body.name;
    var password = req.body.password;

    // teamName and password Validation Starts

    // validator.check()
    if (req.cookies.name) res.clearCookie('name');
    var credentials = {
        '_id': teamName,
        'password_hash': password
    };
    var onAuth = function (err, doc)
    {
        if (err)
        {
            console.log('Incorrect Credentials');
            // Make it more user friendly, output the error to the view
            res.redirect('/login');
        }
        else
        {
            var name = doc['_id'];
            res.cookie('name', name, {maxAge: 86400000});
            res.redirect('/home');
        }
    };
    mongo_users.auth(credentials, onAuth);
});


router.get('/logout', function (req, res)
{
    if (req.cookies.name)
    {
        res.clearCookie('name');
        res.redirect('/');
    }
    else
    {
        res.redirect('/');
    }
});


router.get('/register', function (req, res)
{
    if (req.cookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('register', { });
    }
});
router.get('/interest', function (req, res) // page to view prizes
{
    res.render('interest', { });
});

router.get('/home', function (req, res)
{
    if (req.cookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('home', { });
    }
});

router.get('/rules', function (req, res)
{
    if (req.cookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('rules', { });
    }
});
router.get('/forgot', function (req, res)
{
    if (req.cookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('forgot', { });
    }
});
router.get('/reset', function (req, res)
{
    if (req.cookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('reset', { });
    }
});
router.get('/matches', function (req, res)
{
    if (req.cookies.name)
    {

        res.render('matches', { });
    }
    else
    {
        res.redirect('/');
    }
});
router.post('/register', function (req, res)
{
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
            phone: phone,
            win: 0,
            played: 0,
            points: 0,
            runs_for: 0,
            runs_against: 0,
            balls_for: 0,
            balls_against: 0,
            net_run_rate: 0.0,
            opponents: [] // store opponent team names here, reference for potential clashes
        };
        var onInsert = function (err, docs)
        {
            if (err)
            {
                console.log('Team Name already exists');
                // Make it more user friendly, output the error to the view
                res.redirect('/register');
            }
            else
            {
                var name = docs[0]['_id'];
                res.cookie('name', name, {maxAge: 86400000});
                res.redirect('/home');
            }
        };
        mongo_users.insert(newUser, onInsert);
    }
    else
    {
        console.log('Captcha is wrong or Password!=Confirm Password');
        // Make it more user friendly, output the error to the view
        res.redirect('/register');
    }
});

router.get('/home', function (req, res) // page to user home
{
    if (req.cookies.name)
    {
        var credentials = {
            '_id': req.cookies.name
        };
        var onFetch = function (err, doc)
        {
            if (err)
            {
                res.redirect('/login');
            }
            else
            {
                res.render('home', {name: doc['_id']}); // Home View is not complete, must implement that
            }
        };
        mongo_users.fetch(credentials, onFetch);
    }
    else
    {
        res.redirect('/login');
    }
});


// Modify all the following functions to check for cookie
router.get('/prize', function (req, res) // page to view prizes
{
    res.render('prize', { });
});


router.get('/forgot', function (req, res) //forgot password page
{
    res.render('forgot', { });
});
router.post('/forgot',function(req,res)
{
    var name=req.body.team_name;
    var email=req.body.email_id;

    var doc = {
        '_id':name,
        '_email':email
    };
    var onFetch = function(err,doc)
    {
        if(err)
        {
            res.render('error');
        }
        else if(doc)
        {
            // email dispatcher
        }
        else
        {
            res.render('forgot',{Message:"No record"});
        }

    };
    mongo_users.forgotPassword(doc,onFetch);
});

router.get('/sponsors', function (req, res) // sponsors page
{
    res.render('sponsors', { });
});

router.get('/trailer', function (req, res) // trailer page
{
    res.render('trailer', { });
});
router.get('/developers', function (req, res) // developers page
{
    res.render('developers', { });
});
router.get('/players', function (req, res) // page for all players, only available if no squad has been chosen
{
    var onFetch = function (err, documents)
    {
        if (err)
        {
            res.redirect('/home');
        }
        else
        {
            res.render('players', {
                Players: documents
            });
        }

    };
    mongo_players.fetchPlayers(onFetch);
});


router.get('/squad', function (req, res) // page to view the 16 player squad of a particular user
{
    if (req.cookies.name)                           // if cookies exists then access the database
    {
        var teamName = req.cookies.name;
        var credentials =                           // creating a temporary variable to store cookies
        {
            '_id': teamName                             //  because kashish bhaya told to use '_id' only
        };

        var getSquad = function (err, documents)
        {
            if (err)
            {
                res.redirect('/home');
            }
            else
            {
                res.render('/squad', {Squad: documents});
            }

        };
        mongo_squad.fetchSquad(credentials, getSquad);
    }
    else
    {                                                  // if cookies does not exists then it will go to login page
        res.render('/login', { });
    }
});

router.get('/team', function (req, res) // view the assigned playing 11 with options to change the playing 11
{
    if (req.cookies.name)                           // if cookies exists then access the database
    {
        var teamName = req.cookies.name;
        var credentials =
        {
            '_id': teamName
        };

        var getTeam = function (err, documents)
        {
            if (err)
            {
                res.redirect('/home');
            }
            else
            {
                res.render('team', {Team: documents});
            }

        };
        mongo_team.getTeam(credentials, getTeam);
    }
    else                                                        // if cookies does not exists , go to login page
    {
        res.render('/login', { });
    }
});

router.get('/matchday', function (req, res) // page to view next match schedule and the opponent team
{
    res.render('matchday', { });
});

router.get('/leaderboard', function (req, res) // Leaderboard/Standings
{
    if (req.cookies.name)                           // if cookies exists then access the database
    {
        var teamname = req.cookies.name;
        var doc =
        {
            "_id": teamname
        };
        var onFetch = function (err, documents)
        {
            if (err)
            {

            }
            else
            {
                res.render("leaderboard", { leaderboard: documents});
            }
        };
        mongo_users.getleader(doc, onFetch);

    }
    else
    {
        res.redirect("/");
    }


});

router.get('/forum', function (req, res) // User Forums
{
    res.render('forum', { });
});

router.get('/interest', function (req, res) // interest form
{
    res.render('interest', { });
});

router.post('/interest', function (req, res) // interest form
{
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var newUser = {
        name: name,
        email: email,
        phone: phone
    };
    var onInsert = function (err, docs)
    {
        res.redirect('/interest');
    };
    mongo_interest.insert(newUser, onInsert);
});

router.get('/reset', function (req, res) // interest form
{
    res.render('reset', { });
});

module.exports = router;