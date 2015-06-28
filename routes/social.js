/*
 *  GraVITas Premier League <gravitaspremierleague@gmail.com>
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

var path = require('path');
var passport = require('passport');
var router = require('express').Router();
var setCookie = function (req, res, next) {
    res.cookie('name', req.user, {maxAge: 86400000, signed: true});
    next();
};
require(path.join(__dirname, '..', 'db', 'mongo-passport.js')); // pass passport for configuration

// normal routes ===============================================================
// LOGOUT ==============================
/*router.get('/logout', function(req, res) { TODO: uncomment here
 res.clearCookie('name');
 req.logout();
 res.redirect('/');
 });*/

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

// facebook -------------------------------
// send to facebook to do the authentication
router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback', setCookie, passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

// twitter --------------------------------
// send to twitter to do the authentication
router.get('/auth/twitter', passport.authenticate('twitter', {scope: 'email'}));

// handle the callback after twitter has authenticated the user
router.get('/auth/twitter/callback', setCookie, passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

// google ---------------------------------
// send to google to do the authentication
router.get('/auth/google', passport.authenticate('google', {
    scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
}));

// the callback after google has authenticated the user
router.get('/auth/google/callback', setCookie, passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

module.exports = router;