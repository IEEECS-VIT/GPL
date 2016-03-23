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

if(!process.env.NODE_ENV)
{
    require('dotenv').load();
}

var log;
var error;
var status;
var newrelic;
var csurf = require('csurf')();
var path = require('path').join;
var each = require('async').each;
var helmet = require('helmet')();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var json = bodyParser.json();
var compression = require('compression')();
var passport = require('passport').initialize();
var raven = require('raven').middleware.express;
var url = bodyParser.urlencoded({extended: true});
var api = require(path(__dirname, 'routes', 'api'));
var home = require(path(__dirname, 'routes', 'home'));
var index = require(path(__dirname, 'routes', 'index'));
var social = require(path(__dirname, 'routes', 'social'));
var errorHandler = raven.errorHandler(process.env.SENTRY_DSN);
var requestHandler = raven.requestHandler(process.env.SENTRY_DSN);
var logger = require('morgan')(process.env.LOGGER_LEVEL || 'dev');
var stat = express.static(path(__dirname, '/public'), {maxAge: 86400000 * 30});
var favicon = require('serve-favicon')(path(__dirname, 'public', 'images', 'favicon.ico'));
var session = require('express-session')({secret: 'session secret key', resave: '', saveUninitialized: ''});
var cookieParser = require('cookie-parser')(process.env.COOKIE_SECRET || 'randomsecretstring', {signed: true});

var flash = function(req, res, next)
{
    if(!req.session.flash)
    {
        req.session.flash = [];
    }

    req.flash = function(content)
    {
        if(content)
        {
            this.session.flash.push(content);
        }
        else
        {
            return this.session.flash.pop();
        }
    };

    next();
};

if (process.env.NEWRELIC_APP_NAME && process.env.NEWRELIC_LICENSE)
{
    app.locals.newrelic = require(path(__dirname, 'utils', 'misc', 'newrelic'));
}

if (process.env.LOGENTRIES_TOKEN)
{
    log = require('node-logentries').logger({token: process.env.LOGENTRIES_TOKEN});
}

if (newrelic)
{
    app.locals.newrelic = newrelic;
}

app.use(function(req, res, next){
    each([compression, helmet, requestHandler, logger, stat, favicon, json, url, session, passport],
        function(middleware, callback){
            middleware(req, res, callback);
        },
    next);
});
app.set('title', 'GPL');
// view engine setup
app.set('views', path(__dirname, 'views'));
app.set('view engine', 'ejs');
app.enable('trust proxy');
app.use(function(req, res, next){
    each([cookieParser, flash, csurf], function(middleware, callback){
        middleware(req, res, callback);
    }, next);
});
app.use('/', index);
app.use('/auth', social);
app.use('/home', home);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function (req, res) {
    res.redirect('/');
});

if(process.env.NODE_ENV)
{
    app.use(errorHandler);
}

// error handlers
app.use(function (err, req, res, next) {
    if (log)
    {
        log.log('debug', {Error: err, Message: err.message});
    }

    status = err.status || 500;

    res.status(status);
    res.clearCookie('team', {});
    res.clearCookie('phone', {});

    if(err.code === 'EBADCSRFTOKEN')
    {
        res.redirect(req.headers.referer);
    }
    else
    {
        error =
        {
            status: status
        };

        if(process.env.NODE_ENV)
        {
            error.message = '';
            error.stack =  '';
        }
        else
        {
            error.message = err.message;
            error.stack =  err.stack;
        }

        res.render('error', error);
    }
});

module.exports = app;
