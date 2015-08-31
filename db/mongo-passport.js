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
var twitter = require('passport-twitter').Strategy;
var facebook = require('passport-facebook').Strategy;
var google = require('passport-google-oauth').OAuth2Strategy;
var record = require(path.join(__dirname, 'mongo-record.js'));
var MongoUsers = require(path.join(__dirname, 'mongo-users.js'));
var domain = 'http://' + ((process.env.NODE_ENV) ? 'gravitaspremierleague.com' : 'localhost:3000') + '/auth/';

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
    MongoUsers.get(id, done);
});

passport.use(new facebook({
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_KEY,
        callbackURL: domain + 'facebook/callback',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function (req, token, refreshToken, profile, done) {
        process.nextTick(function () {
            if (!req.signedCookies.name)
            {
                MongoUsers.fetch({'_id': req.signedCookies.team}, function (err, user) {
                    if (err || user.authStrategy != 'facebook')
                    {
                        return done(err);
                    }
                    if (user)
                    {
                        return done(null, user); // user found, return that user
                    }
                    else // if there is no user, create them
                    {
                        var onGetCount = function (err, number)
                        {
                            if (err)
                            {
                                console.log(err.message);
                            }
                            else
                            {
                                var newUser = record;
                                newUser._id = req.signedCookies.team;
                                newUser.token = token;
                                newUser.profile = profile.id;
                                newUser.authStrategy = 'facebook';
                                newUser.team_no = parseInt(number) + 1;
                                newUser.email = req.signedCookies.email;
                                newUser.phone = req.signedCookies.phone;
                                newUser.manager_name = profile.name.givenName + ' ' + profile.name.familyName;
                                MongoUsers.save(newUser, function (err, newUser) {
                                    if (err)
                                    {
                                        return done(err);
                                    }
                                    return done(null, newUser);
                                });
                            }
                        };
                        MongoUsers.getCount(onGetCount);
                    }
                });
            }
            else
            {
                var user = req.user; // pull the user out of the session
                user._id = req.signedCookies.name;
                user.token = token;
                user.profile = profile.id;
                user.email = req.signedCookies.email;
                user.phone = req.signedCookies.phone;
                user.manager_name = profile.name.givenName + ' ' + profile.name.familyName;
                MongoUsers.save(user, function (err) {
                    if (err)
                    {
                        return done(err);
                    }
                    return done(null, user);
                });
            }
        });
    }));

passport.use(new twitter({
        consumerKey: process.env.TWITTER_ID,
        consumerSecret: process.env.TWITTER_KEY,
        callbackURL: domain + 'twitter/callback',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function (req, token, tokenSecret, profile, done) {
        process.nextTick(function () {
            if (!req.signedCookies.name) {
                MongoUsers.fetch({'_id': req.signedCookies.team}, function (err, user) {
                    if (err || user.authStrategy != 'twitter')
                    {
                        return done(err);
                    }
                    if (user)
                    {
                        return done(null, user); // user found, return that user
                    }
                    else
                    {
                        var newUser = record;
                        newUser._id = req.signedCookies.team;
                        newUser.token = token;
                        newUser.authStrategy = 'twitter';
                        newUser.profile = profile.id;
                        newUser.team_no = parseInt(number) + 1;
                        newUser.manager_name = profile.displayName;
                        newUser.phone = req.signedCookies.phone;
                        newUser.email = req.signedCookies.email;
                        MongoUsers.save(newUser, function (err) {
                            if (err)
                            {
                                return done(err);
                            }
                            return done(null, newUser);
                        });
                    }
                });
            }
            else
            {
                var user = req.user; // pull the user out of the session
                user._id = req.signedCookies.team;
                user.token = token;
                user.profile = profile.id;
                user.manager_name = profile.displayName;
                user.email = req.signedCookies.email;
                user.phone = req.signedCookies.phone;
                MongoUsers.save(user, function (err) {
                    if (err)
                    {
                        return done(err);
                    }
                    return done(null, user);
                });
            }
        });
    }));

passport.use(new google({
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_KEY,
        callbackURL: domain + 'google/callback',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function (req, token, refreshToken, profile, done) {
        process.nextTick(function () {
            if (!req.signedCookies.name)
            {
                MongoUsers.fetch({'_id': req.signedCookies.team}, function (err, user) {
                    if (err || user.authStrategy != 'google')
                    {
                        return done(err);
                    }
                    if (user)
                    {
                        return done(null, user);
                    }
                    else
                    {
                        var newUser = record;
                        newUser._id = req.signedCookies.team;
                        newUser.token = token;
                        newUser.authStrategy = 'google';
                        newUser.profile = profile.id;
                        newUser.manager_name = profile.displayName;
                        newUser.phone = req.signedCookies.phone;
                        newUser.email = req.signedCookies.email;
                        MongoUsers.save(newUser, function (err) {
                            if (err)
                            {
                                return done(err);
                            }
                            return done(null, newUser);
                        });
                    }
                });
            }
            else
            {
                var user = req.user; // pull the user out of the session
                user._id = req.signedCookies.team;
                user.token = token;
                user.profile = profile.id;
                user.manager_name = profile.displayName;
                user.email = req.signedCookies.email;
                user.phone = req.signedCookies.phone;
                MongoUsers.save(user, function (err) {
                    if (err)
                    {
                        return done(err);
                    }
                    return done(null, user);
                });
            }
        });
    }));