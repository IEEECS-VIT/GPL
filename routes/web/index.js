/*
 *  GraVITas Premier League
 *  Copyright (C) 2014  IEEE Computer Society - VIT Student Chapter <ieeecs@vit.ac.in>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var bcrypt = require('bcrypt');
var express = require('express');
var path = require('path');
var router = express.Router();

var mongoInterest = require(path.join(__dirname, '..', '..', 'db', 'mongo-interest'));
var mongoUsers = require(path.join(__dirname, '..', '..', 'db', 'mongo-users'));
var mongoTeam = require(path.join(__dirname, '..', '..', 'db', 'mongo-team'));
var mongoMatches = require(path.join(__dirname,'..','..','db','mongo-matches'));

router.get('/', function (req, res)
{
    if (req.signedCookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('index', { });
    }
});



router.post('/login', function (req, res)
{
    var teamName = req.body.team_name;
    var password = req.body.password;
    if (req.signedCookies.name) res.clearCookie('name', { });
    var credentials = {
        '_id': teamName
    };
    var onFetch = function (err, doc)
    {
        if (err)
        {
            console.log('MongoDB Down');
            // Make it more user friendly, output the error to the view
            res.redirect('/');
        }
        else if (doc)
        {
            if (bcrypt.compareSync(password, doc['password_hash']))
            {
                res.cookie('name', doc['_id'], {maxAge: 86400000, signed: true});
                res.redirect('/home');
            }
            else
            {
                console.log('Incorrect Credentials');
                res.redirect('/');
            }
        }
        else
        {
            console.log('No user exists');
            // Make it more user friendly, output the error to the view
            res.redirect('/');
        }
    };
    mongoUsers.fetch(credentials, onFetch);
});

router.get('/forgot', function (req, res) //forgot password page
{
    res.render('forgot', { });
});

router.post('/forgot', function (req, res)
{
    var name = req.body.team_name;
    var email = req.body.email;

    var credentials = {
        '_id': name,
        '_email': email
    };
    var onFetch = function (err, doc)
    {
        if (err)
        {
            res.redirect('/');
        }
        else if (doc)
        {
            if (doc['email'] === credentials['email'] && doc['_id'] === credentials['_id'])
            {
                // email dispatcher
            }
            else
            {
                // wrong
            }
        }
        else
        {
            res.render('forgot', {Message: "No record"});
        }
    };
    mongoUsers.forgotPassword(credentials, onFetch);
});

router.get('/register', function (req, res)
{
    if (req.signedCookies.name)
    {
        res.redirect('/home');
    }
    else
    {
        res.render('register', { });
    }
});

router.post('/register', function (req, res)
{
    var teamName = req.body.team_name;
    var password = req.body.password;
    var confirmPassword = req.body.confirm_password;
    var managerName = req.body.manager_name;
    var email = req.body.email;
    var phone = req.body.phone;

    if (password === confirmPassword)
    {
        var salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(password, salt);
        var newUser = {
            _id: teamName,
            password_hash: hashedPassword,
            manager_name: managerName,
            email: email,
            phone: phone,
            squad:[],
            team:[],
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
                res.cookie('name', name, {maxAge: 86400000, signed: true});
                res.redirect('/home');
            }
        };
        mongoUsers.insert(newUser, onInsert);
    }
    else
    {
        res.redirect('/register');
    }
});

router.get('/logout', function (req, res)
{
    if (req.signedCookies.name)
    {
        res.clearCookie('name', { });
        res.redirect('/');
    }
    else
    {
        res.redirect('/');
    }
});

router.get('/interest', function (req, res)
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
    mongoInterest.insert(newUser, onInsert);
});

router.get('/developers', function (req, res) // developers page
{
    res.render('developers', { });
});

router.get('/prize', function (req, res) // page to view prizes
{
    res.render('prize', { });
});

router.get('/rules', function (req, res)
{
    res.render('rules', { });
});

router.get('/sponsors', function (req, res) // sponsors page
{
    res.render('sponsors', { });
});

router.get('/trailer', function (req, res) // trailer page
{
    res.render('trailer', { });
});

module.exports = router;
