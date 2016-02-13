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

var user;
var path = require('path').join;
var passport = require('passport');
var callback = function(req, token, refresh, profile, done)
{
    process.nextTick(function(){
        mongoUsers.fetchUser({'_id': req.signedCookies.team}, function (err, doc) {
            if (err)
            {
                return done(err);
            }
            if (doc && doc.authStrategy === profile.provider && profile.id === doc.profile)
            {
                return done(null, doc); // user found, return that user
            }
            else if(req.signedCookies.phone && (!process.env.NODE_ENV || (process.env.DAY === '0' && process.env.MATCH === 'users' && process.env.LIVE === '1'))) // if there is no user, create them
            {
                user = new record();
                user.token = token;
                user.dob = new Date();
                delete user.password_hash;
                user.profile = profile.id;
                user._id = req.signedCookies.team;
                user.authStrategy = profile.provider;
                user.phone = req.signedCookies.phone;
                user.email = profile.emails[0].value;
                user.manager_name = profile.displayName; // TODO: Use email as the primary key, possibly have _id as a compound instance instead of a regular string.

                mongoUsers.insert(process.env.MATCH, user, done);
            }
            else
            {
                return done(err);
            }
        });
    });
};
var ref =
{
    undefined : 'http://localhost:3000/auth/',
    'dev' : 'http://gpl-dev.herokuapp.com/auth/',
    'production' : 'http://gravitaspremierleague.com/auth/'
};
//var twitter = require('passport-twitter').Strategy;
var facebook = require('passport-facebook').Strategy;
var mongoUsers = require(path(__dirname, 'mongo-users.js'));
var google = require('passport-google-oauth').OAuth2Strategy;
var record = require(path(__dirname, 'mongo-record.js')).schema;

passport.use(new facebook({
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_KEY,
        callbackURL: ref[process.env.NODE_ENV] + 'facebook/callback',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    callback
));

passport.use(new google({
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_KEY,
        callbackURL: ref[process.env.NODE_ENV] + 'google/callback',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    callback
));

/*
passport.use(new twitter({
        consumerKey: process.env.TWITTER_ID,
        consumerSecret: process.env.TWITTER_KEY,
        callbackURL: ref[process.env.NODE_ENV] + 'twitter/callback',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    callback
));
*/
