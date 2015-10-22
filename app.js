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

var express = require('express');
var app = express();
app.use(require('compression')());
if(!process.env.NODE_ENV)
{
    require('dotenv').load();
}

var path = require('path');
var csurf = require('csurf');
var logger = require('morgan');
var passport = require('passport');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var loggerLevel = process.env.LOGGER_LEVEL || 'dev';
var home = require(path.join(__dirname, 'routes', 'home'));
var index = require(path.join(__dirname, 'routes', 'index'));
var social = require(path.join(__dirname, 'routes', 'social'));

if (process.env.NEWRELIC_APP_NAME && process.env.NEWRELIC_LICENSE)
{
    app.locals.newrelic = require('newrelic');
}

if (process.env.LOGENTRIES_TOKEN)
{
    var log = require('node-logentries').logger({
        token: process.env.LOGENTRIES_TOKEN
    });
}

app.use(logger(loggerLevel));
app.set('title', 'GPL');
app.use(express.static(path.join(__dirname, '/public'), {maxAge : 86400000 * 30}));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.enable('trust proxy');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser(process.env.COOKIE_SECRET || 'randomsecretstring', {signed: true}));
app.use(session({secret: 'session secret key', resave: '', saveUninitialized: ''}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(csurf());
app.use('/', index);
app.use('/auth', social);
app.use('/home', home);

// catch 404 and forward to error handler
app.use(function (req, res) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('error');
});

// error handlers
// development error handler, will print stacktrace
if (app.get('env') === 'development')
{
    app.use(function (err, req, res) {
        if (log)
        {
            log.log('debug', {Error: err, Message: err.message});
        }
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            status: err.status,
            stack: err.stack
        });
    });
}

// production error handler, no stacktraces leaked to user
app.use(function (err, req, res) {
    if (log)
    {
        log.log('debug', {Error: err, Message: err.message});
    }
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        status: err.status,
        stack: ''
    });

});

module.exports = app;