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

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var newrelic;
var log;
var index = require(path.join(__dirname, 'routes', 'index'));
var home = require(path.join(__dirname, 'routes', 'home'));
var app = express();
var loggerLevel = process.env.LOGGER_LEVEL || 'dev';

if (process.env.NEWRELIC_APP_NAME && process.env.NEWRELIC_LICENSE)
{
    newrelic = require('newrelic');
}

if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}

if (newrelic)
{
    app.locals.newrelic = newrelic;
}

app.use(logger(loggerLevel));
app.set('title', 'GPL');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.enable('trust proxy');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser(process.env.COOKIE_SECRET || 'randomsecretstring', {signed: true}));
app.use('/', index);
app.use('/home', home);

// catch 404 and forward to error handler
app.use(function (req, res, next)
        {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

// error handlers
// development error handler, will print stacktrace
if (app.get('env') === 'development')
{
    app.use(function (err, req, res, next)
            {
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
app.use(function (err, req, res, next)
        {
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