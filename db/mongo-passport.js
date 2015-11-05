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
var callback;
var path = require('path');
var onSave = function(err)
{
    if(err)
    {
        return callback(err);
    }

    return callback(null, user);
};
var ref =
{
    'production' : 'http://gravitaspremierleague.com/auth/',
    'dev' : 'http://gpl-dev.herokuapp.com/auth/',
    undefined : 'http://localhost:3000/auth/'
};
var passport = require('passport');
//var twitter = require('passport-twitter').Strategy;
var facebook = require('passport-facebook').Strategy;
var google = require('passport-google-oauth').OAuth2Strategy;
var record = require(path.join(__dirname, 'mongo-record.js'));
var mongoUsers = require(path.join(__dirname, 'mongo-users.js'));

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
    mongoUsers.fetchUser({'_id' : id}, done);
});

passport.use(new facebook({
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_KEY,
        callbackURL: ref[process.env.NODE_ENV] + 'facebook/callback',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function (req, token, refreshToken, profile, done) {
        callback = done;

        process.nextTick(function () {
            mongoUsers.fetchUser({'_id': req.signedCookies.team}, function (err, doc) {
                if (err)
                {
                    return done(err);
                }
                if (doc && doc.authStrategy === 'facebook' && profile.id === doc.profile)
                {
                    return done(null, doc); // user found, return that user
                }
                else if(req.signedCookies.phone)// if there is no user, create them
                {
                    var onGetCount = function (err, number)
                    {
                        if (err)
                        {
                            return done(err);
                        }
                        else
                        {
                            user = record;
                            user.dob = new Date();
                            delete user.password_hash;
                            user._id = req.signedCookies.team;
                            user.token = token;
                            user.profile = profile.id;
                            user.authStrategy = profile.provider;
                            user.team_no = parseInt(number) + 1;
                            user.email = profile.emails[0].value;
                            user.phone = req.signedCookies.phone;
                            user.manager_name = profile.name.givenName + ' ' + profile.name.familyName;

                            mongoUsers.save(user, onSave);
                        }
                    };

                    mongoUsers.getCount({authStrategy : {$ne : 'admin'}}, onGetCount);
                }
                else
                {
                    return done(err);
                }
            });
        });
    }));


passport.use(new google({
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_KEY,
        callbackURL: ref[process.env.NODE_ENV] + 'google/callback',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function (req, token, refreshToken, profile, done) {
        callback = done;

        process.nextTick(function () {
            mongoUsers.fetchUser({'_id': req.signedCookies.team}, function (err, doc) {
                if (err)
                {
                    return done(err);
                }
                if (doc && doc.authStrategy === 'google' && profile.id === doc.profile)
                {
                    return done(null, doc);
                }
                else if(req.signedCookies.phone)
                {
                    var onGetCount = function (err, number)
                    {
                        if (err)
                        {
                            return done(err);
                        }
                        else
                        {
                            user = record;
                            user.dob = new Date();
                            delete user.password_hash;
                            user._id = req.signedCookies.team;
                            user.token = token;
                            user.authStrategy = profile.provider;
                            user.profile = profile.id;
                            user.team_no = parseInt(number) + 1;
                            user.manager_name = profile.displayName;
                            user.phone = req.signedCookies.phone;
                            user.email = profile.emails[0].value;

                            mongoUsers.save(user, onSave);
                        }
                    };

                    mongoUsers.getCount({authStrategy : {$ne : 'admin'}}, onGetCount);
                }
                else
                {
                    return done(err);
                }
            });
        });
    }));

/*
passport.use(new twitter({
        consumerKey: process.env.TWITTER_ID,
        consumerSecret: process.env.TWITTER_KEY,
        callbackURL: ref[process.env.NODE_ENV] + 'twitter/callback',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function (req, token, tokenSecret, profile, done) {
        callback = done;
        console.log(profile._json.status.entities.urls[0].indices, profile._json.status.entities.urls[1].indices); console.log(profile._json.entities.url.urls[0].indices);
        process.nextTick(function () {
            mongoUsers.fetchUser({'_id': req.signedCookies.team}, function (err, doc) {
                if (err)
                {
                    return done(err);
                }
                if (doc && doc.authStrategy === 'twitter' && profile.id === doc.profile)
                {
                    return done(null, doc); // user found, return that user
                }
                else if(req.signedCookies.email && req.signedCookies.phone)
                {
                    var onGetCount = function (err, number)
                    {
                        if (err)
                        {
                            return done(err);
                        }
                        else
                        {
                            user = record;
                            user.dob = new Date();
                            delete user.password_hash;
                            user._id = req.signedCookies.team;
                            user.token = token;
                            user.authStrategy = 'twitter';
                            user.profile = profile.id;
                            user.team_no = parseInt(number) + 1;
                            user.manager_name = profile.displayName;
                            user.phone = req.signedCookies.phone;
                            user.email = req.signedCookies.email;

                            mongoUsers.save(user, onSave);
                        }
                    };

                    mongoUsers.getCount({authStrategy : {$ne : 'admin'}}, onGetCount);
                }
                else
                {
                    return done(err);
                }
            });
        });
    }));
*/