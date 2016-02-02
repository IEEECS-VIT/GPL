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
var onRetrieve = function(req, res, next)
{
    passport.authenticate(req.originalUrl.split('/')[2], function(err, user){
        if(err)
        {
            return next(err);
        }
        if(!user)
        {
            req.flash('That request failed, please re-try.');
            return res.redirect('/social/login'); // TODO: redirect to login or register based on the request origin.
        }
        else
        {
            res.cookie('name', req.signedCookies.team.trim().toUpperCase(), {maxAge: 86400000, signed: true});
            res.clearCookie('team', {});
            res.clearCookie('phone', {});
            return res.redirect('/home/players');
        }
    })(req, res, next);
};

require(path.join(__dirname, '..', 'db', 'mongo-passport')); // pass passport for configuration

router.get('/facebook', passport.authenticate('facebook', {scope: 'email'}));

/*
router.get('/twitter', passport.authenticate('twitter', {scope: 'email'}));

router.get('/twitter/callback', onRetrieve);
*/

router.get('/google', passport.authenticate('google', {
        scope:
        [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }
));

router.get(/^\/facebook|google\/callback$/, onRetrieve);

module.exports = router;