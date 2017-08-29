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

var log,
	time,
	date,
	user,
	token,
	newUser,
	ref = {
		admin: ["admin", "/admin"],
		local: ["name", "/home"]
	},
	credentials,
	bcrypt = require("bcrypt"),
	crypto = require("crypto"),
	path = require("path").join,
	dir = [__dirname, "..", "database"],
	router = require("express").Router(), // eslint-disable-line new-cap
	mongoTeam = require(path(...dir, "mongoTeam")),
	mongoUsers = require(path(...dir, "mongoUsers")),
	socialCookie = { signed: true, maxAge: 300000 },
	record = require(path(...dir, "mongoRecord")).schema,
	options = { signed: true, maxAge: 86400000 }, // all cookies are signed by default and have a lifespan of one day
	developers = require(path(__dirname, "..", "package.json")).contributors
		.map(function (arg) {
			arg.forEach(function (x) { x.img = x.name.split(" ")[0]; });

			return arg;
		}),
	onForgot = function (mode, res) {
		return (error, doc) => {
			if (error || !doc) {
				res.flash("Incorrect credentials!");
			}

			res.redirect(`/forgot/${mode}`);
		};
	},
	cookieFilter = function (req, res, next) {
		if (req.signedCookies.name) {
			return res.redirect("/home");
		}

		next();
	},
	canRegister = function (req, res, next) {
		if (!process.env.NODE_ENV || (process.env.DAY === "0" && process.env.MATCH === "users")) {
			// registrations always open on localhost, and on production for the first round, if process.env.DAY is "0"
			return next();
		}

		res.redirect("/login");
	};

if (process.env.LOGENTRIES_TOKEN) {
	// eslint-disable-next-line global-require
	log = require("node-logentries").logger({ token: process.env.LOGENTRIES_TOKEN });
}

router.get("/", cookieFilter, function (req, res) {
	if (process.env.NODE_ENV && process.env.DAY === "-1") {
		time = new Date();
		// to display identical countdowns across different timezones
		time.setTime(time.getTime() + time.getTimezoneOffset() * 60000 + 19800000);
		date = {
			seconds: time.getSeconds(),
			minutes: time.getMinutes(),
			hour: time.getHours(),
			day: time.getDate(),
			month: time.getMonth() + 1,
			year: time.getFullYear()
		};

		res.render("static", { date: date });
	}
	else {
		res.render("index");
	}
});

router.get("/interest", function (req, res) {
	if (process.env.DAY === "-1" || !process.env.NODE_ENV || req.signedCookies.admin) {
		return res.render("new-interest");
	}
	else {
		res.redirect("/register");
	}
});

router.post("/interest", function (req, res, next) {
	newUser = {
		name: req.body.name,
		regno: req.body.regno,
		email: req.body.email,
		phone: req.body.phone
	};

	var onInsert = function (err) {
		if (err) {
			res.status(422);

			return next(err);
		}

		res.redirect("/interest");
	};

	mongoUsers.insert("interest", newUser, onInsert);
});

router.get("/login", cookieFilter, function (req, res) {
	res.clearCookie("team", {});
	res.clearCookie("phone", {});

	res.render("login", { csrfToken: req.csrfToken(), msg: res.flash() });
});

router.post("/login", cookieFilter, function (req, res) {
	credentials = {
		_id: req.body.team.trim().toUpperCase(),
		authStrategy: {	$in: ["local", "admin"]
		}
	};

	res.clearCookie("name", {});

	if (log) {
		log.log(`${user}received`);
	}

	var onFetch = function (err, doc) {
		if (err) {
			res.flash("Incorrect credentials!");

			return res.redirect("/login");
		}
		if (doc) {
			bcrypt.compare(req.body.password, doc.passwordHash, function (error, result) {
				if (error) {
					res.flash("An unexpected error has occurred, please re-try.");

					return res.redirect("/login");
				}
				if (result) {
					res.cookie(ref[doc.authStrategy][0], doc._id, options);
					res.redirect(ref[doc.authStrategy][1]);
				}
				else {
					res.flash("Incorrect credentials!");
					res.redirect("/login");
				}
			});
		}
		else {
			res.flash("Incorrect credentials!");
			res.redirect("/login");
		}
	};

	mongoUsers.fetchUser(credentials, onFetch);
});

router.get(/^\/forgot\/password|user$/, function (req, res) {
	res.render("forgot", { csrfToken: req.csrfToken(), mode: req.url.split("/")[2], msg: res.flash() });
});

router.post("/forgot/password", function (req, res) {
	credentials = {
		_id: req.body.team.trim().toUpperCase(),
		email: req.body.email,
		authStrategy: {	$in: ["local", "admin"]	}
	};

	crypto.randomBytes(20, function (err, buf) {
		if (err) {
			res.flash("An unexpected error has occurred, please re-try.");
			res.redirect("/forgot/password");
		}

		token = buf.toString("hex");
		mongoUsers.forgotPassword(credentials, token, req.headers.host, onForgot("password", res));
	});
});

router.get("/reset/:token", function (req, res) {
	var onGetReset = function (err, doc) {
		if (err) {
			res.flash("That password reset link had expired, or is invalid.");
			res.redirect("/forgot/password");
		}
		else if (!doc) {
			res.redirect("/forgot/password");
		}
		else {
			res.render("reset", { csrfToken: req.csrfToken(), msg: res.flash() });
		}
	};

	mongoUsers.getReset({ resetToken: req.params.token, expire: { $gt: Date.now() } }, onGetReset);
});

router.post("/reset/:token", function (req, res) {
	if (req.body.password === req.body.confirm) {
		var onReset = function (err, doc) {
			if (err) {
				res.flash("That request failed, please re-try.");
				res.redirect(`/reset/${req.params.token}`);
			}
			else if (!doc) {
				res.redirect("/forgot/password");
			}
			else {
				res.redirect("/login");
			}
		};

		bcrypt.hash(req.body.password, 10, function (err, hash) {
			if (err) {
				res.flash("An unexpected error has occurred, and your password could not be rest. Please re-try.");
				res.redirect(`/reset/${req.params.token}`);
			}
			else {
				mongoUsers.resetPassword(req.params.token, hash, onReset);
			}
		});
	}
	else { // passwords do not match
		res.flash("Passwords do not match.");
		res.redirect(`/reset/${req.params.token}`);
	}
});

router.post("/forgot/user", function (req, res) {
	credentials = {
		phone: req.body.phone,
		email: req.body.email
	};

	mongoUsers.forgotUser(credentials, onForgot("user", res));
});

router.get("/register", cookieFilter, canRegister, function (req, res) {
	res.render("register", { msg: res.flash(), csrfToken: req.csrfToken() });
});

router.post("/register", cookieFilter, function (req, res) {
	res.clearCookie("name", {});
	res.clearCookie("admin", {});

	if (req.body.confirm === req.body.password) {
		var onInsert = function (err) {
			if (err) {
				res.flash("This team name already exists.");
				res.redirect("/register");
			}
			else {
				res.cookie("name", newUser._id, options);
				res.redirect("/home/players");
			}
		};

		newUser = record();
		newUser.dob = new Date();
		newUser.email = req.body.email;
		newUser.phone = req.body.phone;
		newUser.authStrategy = "local";
		// TODO: treat managerName / email address as _id, to allow the creation of multiple teams for one user
		newUser.managerName = req.body.managerName;
		newUser._id = req.body.team.trim().toUpperCase();

		bcrypt.hash(req.body.password, 10, function (err, hash) {
			if (err) {
				res.flash("An unexpected error occurred and your details could not be saved. Please re-try.");
				res.redirect("/register");
			}
			else {
				newUser.passwordHash = hash;
				mongoUsers.insert(process.env.MATCH, newUser, onInsert);
			}
		});
	}
	else {
		res.flash("Passwords do not match");
		res.redirect("/register");
	}
});

router.get("/logout", function (req, res) {
	res.clearCookie("team", {});
	res.clearCookie("phone", {});
	res.clearCookie("admin", {});
	res.clearCookie("name", {});
	res.clearCookie("lead", {});
	res.clearCookie("dash", {});
	res.clearCookie("stats", {});
	res.redirect("/login");
});

router.get("/admin", function (req, res) {
	if (req.signedCookies.admin || !process.env.NODE_ENV) {
		var onGetInfo = function (err, doc) {
			if (err) {
				res.redirect("/");
			}
			else if (doc) {
				res.render("admin", { info: doc });
			}
			else {
				res.redirect("/login");
			}
		};

		mongoTeam.adminInfo(onGetInfo);
	}
	else {
		res.redirect("/login");
	}
});

router.get("/social/login", cookieFilter, function (req, res) {
	res.render("social", { mode: Number(!req.signedCookies.team), type: "login", csrfToken: req.csrfToken() });
});

router.post("/social/login", cookieFilter, function (req, res) {
	res.cookie("team", req.body.team.trim().toUpperCase(), socialCookie);
	res.redirect("/social/login");
});

router.get("/social/register", cookieFilter, canRegister, function (req, res) {
	res.render("social", { mode: Number(!req.signedCookies.team), type: "register", csrfToken: req.csrfToken() });
});

router.post("/social/register", cookieFilter, function (req, res) {
	res.cookie("team", req.body.team.trim().toUpperCase(), socialCookie);
	res.cookie("phone", req.body.phone, socialCookie);
	res.redirect("/social/register");
});

router.get("/developers", function (req, res) {
	console.log(developers);
	res.render("developers", { obj: developers });
});

router.get("/simulate", function (req, res) {
	if (req.signedCookies.admin) {
/*        var onSimulate = function (err, docs)
        {
            if (err)
            {
                console.log(err);
                res.redirect('/admin');
            }
            else
            {
                res.render('results', {results: docs});
            }
        };
        mongoFeatures.simulate(onSimulate);*/
		res.redirect("/admin");
	}
	else {
		res.redirect("/login");
	}
});

router.get("/rules", function (req, res) {
	res.render("rules", { session: +!req.signedCookies.name }); // eslint-disable-line no-implicit-coercion
});

router.get("/privacy", function (req, res) {
	res.render("privacy", { session: +!req.signedCookies.name }); // eslint-disable-line no-implicit-coercion
});

router.get("/trailer", function (req, res) { // trailer page
	res.render("trailer");
});

router.get("/glance", function (req, res) {
	res.render("glance");
});

module.exports = router;
