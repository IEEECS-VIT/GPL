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

if (!process.env.NODE_ENV)
{
	require("dotenv").load(); // eslint-disable-line global-require
}

var log,
	error,
	status,
	newrelic,
	csurf = require("csurf")(),
	path = require("path").join,
	each = require("async").each,
	helmet = require("helmet")(),
	express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	json = bodyParser.json(),
	compression = require("compression")(),
	passport = require("passport").initialize(),
	raven = require("raven").middleware.express,
	url = bodyParser.urlencoded({ extended: true }),
	api = require(path(__dirname, "routes", "api")),
	home = require(path(__dirname, "routes", "home")),
	index = require(path(__dirname, "routes", "index")),
	social = require(path(__dirname, "routes", "social")),
	errorHandler = raven.errorHandler(process.env.SENTRY_DSN),
	requestHandler = raven.requestHandler(process.env.SENTRY_DSN),
	logger = require("morgan")(process.env.LOGGER_LEVEL || "dev"),
	stat = express.static(path(__dirname, "/public"), { maxAge: 86400000 * 30 }),
	favicon = require("serve-favicon")(path(__dirname, "public", "images", "favicon.ico")),
	cookieParser = require("cookie-parser")(process.env.COOKIE_SECRET || "randomsecretstring", { signed: true }),
	session = require("express-session")({
		resave: "",
		saveUninitialized: "",
		secret: process.env.SESSION_SECRET || "session secret key"
	}),

	flash = function (req, res, next) {
		if (!req.session.flash)
        {
			req.session.flash = [];
		}

		res.flash = function (content)
        {
			if (content)
            {
				req.session.flash.push(content);
			}
			else
            {
				return req.session.flash.pop();
			}
		};

		next();
	};

if (process.env.NEWRELIC_APP_NAME && process.env.NEWRELIC_LICENSE)
{
	app.locals.newrelic = require(path(__dirname, "utils", "misc", "newrelic")); // eslint-disable-line global-require
}

if (process.env.LOGENTRIES_TOKEN)
{
     // eslint-disable-next-line global-require
	log = require("node-logentries").logger({ token: process.env.LOGENTRIES_TOKEN });
}

if (newrelic)
{
	app.locals.newrelic = newrelic;
}

app.use(function (req, res, next) {
	each([compression, helmet, requestHandler, logger, stat, favicon, json, url, session, passport],
        function (middleware, callback) {
            middleware(req, res, callback);
},
    next);
});
app.set("title", "GPL");
// view engine setup
app.set("views", path(__dirname, "views"));
app.set("view engine", "ejs");
app.enable("trust proxy");
app.use(function (req, res, next) {
	each([cookieParser, flash, csurf], function (middleware, callback) {
		middleware(req, res, callback);
	}, next);
});
app.use("/", index);
app.use("/auth", social);
app.use("/home", home);
app.use("/api", api);

// catch 404 and forward to error handler
app.use(function (req, res) {
	res.flash("That page does not exist... yet.");
	res.redirect(`/${req.signedCookies.name}` ? "home" : ""); // session context based handling
});

if (process.env.NODE_ENV) // use Sentry only on production environments
{
	app.use(errorHandler);
}

// error handler
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) { // the last argument is necessary to distinguish this callback as the
	if (log)                             // application"s error handler.
    {
		log.log("debug", { Error: err, Message: err.message });
	}

	status = err.status || 500;

	res.status(status);
	res.clearCookie("team", {});
	res.clearCookie("phone", {});

	if (err.code === "EBADCSRFTOKEN")
    {
		res.redirect(req.headers.referer);
	}
	else
    {
		error =
		{
			status: status
		};

		if (process.env.NODE_ENV)
        {
			error.message = "";
			error.stack = "";
		}
		else
        {
			error.message = err.message;
			error.stack = err.stack;
		}

		res.render("error", error);
	}
});

module.exports = app;
