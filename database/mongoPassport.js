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

var key;
var user;
var path = require('path').join;
var passport = require('passport');
var callback = function(req, token, refresh, profile, done)
{
    process.nextTick(function(){
        mongoUsers.fetchUser({_id: req.signedCookies.team}, function (err, doc) {
            if (err)
            {
                return done(err);
            }
            if (doc && doc.authStrategy === profile.provider && profile.id === doc.profile)
            {
                return done(null, doc); // user found, return that user
            }
            if(req.signedCookies.phone && (!process.env.NODE_ENV || (process.env.DAY === '0' && process.env.MATCH === 'users'))) // if there is no user, create one
            {
                user = record();
                user.token = token;
                user.dob = new Date();
                delete user.passwordHash;
                user.profile = profile.id;
                user._id = req.signedCookies.team;
                user.authStrategy = profile.provider;
                user.phone = req.signedCookies.phone;
                user.email = profile.emails[0].value;

                mongoUsers.insert(process.env.MATCH, user, done);
            }
            else
            {
                done(err);
            }
        });
    });
};
var ref =
{
    undefined: 'http://localhost:3000/auth/',
    'dev': 'http://gpl-dev.herokuapp.com/auth/',
    'production': 'http://gravitaspremierleague.com/auth/'
};
var facebook = require('passport-facebook').Strategy;
var mongoUsers = require(path(__dirname, 'mongoUsers'));
var google = require('passport-google-oauth').OAuth2Strategy;
var record = require(path(__dirname, 'mongoRecord')).schema;
var strategies =
{
    GOOGLE: google,
    FACEBOOK: facebook
};

for(key in strategies)
{
    if(!strategies.hasOwnProperty(key))
    {
        continue;
    }

    passport.use(new strategies[key]({
            enableProof: true, // thwarts man in the middle attacks
            passReqToCallback: true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
            clientID: process.env[`${key}_ID`],
            clientSecret: process.env[`${key}_KEY`],
            profileFields: ['id', 'email', 'displayName'],
            callbackURL: ref[process.env.NODE_ENV] + key.toLowerCase() + '/callback'
        },
        callback
    ));
}
