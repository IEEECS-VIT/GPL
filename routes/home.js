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

var i;
var log;
var cost;
var team;
var squad;
var stats;
var fields;
var players;
var ref =
{
    "users": 1,
    "round2": 2,
    "round3": 3
};
var credentials;
var async = require("async");
var path = require("path").join;
var dir = [__dirname, "..", "database"];
var router = require("express").Router();
var clean = function(arg)
{
	return parseInt(arg / 6, 10) + "." + (arg % 6);
};
var authenticated = function(req, res, next)
{
    if(req.signedCookies.name || req.signedCookies.admin)
    {
        return next();
    }

    res.redirect("/login");
};
var mongoTeam = require(path(...dir, "mongoTeam"));
var mongoUsers = require(path(...dir, "mongoUsers"));
var mongoFeatures = require(path(...dir, "mongoFeatures"));
var options = {"signed": true, "maxAge": 86400000}; // all cookies are signed by default and have a lifespan of one day

if (process.env.LOGENTRIES_TOKEN)
{
    log = require("node-logentries").logger({token: process.env.LOGENTRIES_TOKEN});
}

router.get("/", authenticated, function (req, res){
    credentials =
    {
        "_id": req.signedCookies.name
    };

    var onFetch = function (err, doc)
    {
        if (err)
        {
            return res.redirect("/home");
        }
        if (doc)
        {
            if (!doc.team.length)
            {
                res.redirect("/home/players");
            }
            else if(!doc.squad.length)
            {
                res.redirect("/home/team");
            }
            else
            {
                var onFinish = function (err, documents)
                {
                    if (err)
                    {
                        res.redirect("/home");
                    }
                    else
                    {
                        doc.ballsFor = clean(doc.ballsFor);
                        doc.ballsAgainst = clean(doc.ballsAgainst);
                        res.render("home", {"results": {"team": documents, "user": doc, "msg": req.flash()}});
                    }
                };

                async.map(doc.team, mongoFeatures.getPlayer, onFinish);
            }
        }
        else
        {
            res.clearCookie("name", {});
            res.redirect("/login");
        }
    };

    mongoUsers.fetchUser(credentials, onFetch);
});

router.get("/leaderboard", authenticated, function (req, res){
    if(req.signedCookies.lead && req.signedCookies.day === process.env.DAY)
    {
        return res.render("leaderboard", {"leaderboard": JSON.parse(req.signedCookies.lead)});
    }
    if (process.env.DAY > "0" || !process.env.NODE_ENV)  // if cookie exists then access the database
    {
        var onFetch = function (err, documents)
        {
            if (err)
            {
                console.error(err.message);
                req.flash("Unable to process the leaderboard at this time, please re-try");
                res.redirect("/home");
            }
            else
            {
                res.cookie("day", process.env.DAY, options);
                res.cookie("lead", JSON.stringify(documents), options);
                res.render("leaderboard", {"leaderboard": documents});
            }
        };

        mongoUsers.getLeader(req.signedCookies.name, onFetch);
    }
    else
    {
        res.redirect("/home");
    }
});

router.get("/matches", authenticated, function (req, res){ // Deprecated
    if (process.env.DAY > "0") // Initialize process.env.DAY with -1, set to zero to open registrations.
    {
        credentials =
        {
            "_id" : req.signedCookies.name
        };

	    var onErr = (err) => {
		    console.error(err.message);
		    res.flash("Error fetching match details, please retry.");
		    res.redirect("/home");
	    };
        var onMap = function (err, num)
        {
            if (err)
            {
				onErr(err);
            }
            else
            {
                var onMatches = function (error, matches)
                {
                    if (error)
                    {
                        onErr(error);
                    }
                    else
                    {
                        res.cookie("day", process.env.DAY, options);
                        res.render("matches", {"match": matches || [], "day": (process.env.DAY - 1) || 0, "round": ref[process.env.MATCH]});
                    }
                };

                mongoTeam.fetchMatches(num, onMatches);
            }
        };

        mongoTeam.map(credentials, onMap);
    }
    else
    {
        res.redirect("/home");
    }
});

router.get("/match/:day", authenticated, function(req, res){
	if(process.env.DAY > "0" && req.params.day > "0" && req.params.day < "8")
	{
		credentials =
		{
		  "_id": req.signedCookies.name
		};

		var onErr = () => {
			res.flash("Error loading match " + req.params.day + "details.");
			res.redirect("/home");
		};
		var onMap = function (err, num)
		{
			if (err)
			{
				onErr();
			}
			else
			{
				var onMatch = function (error, match)
				{
					if (error)
					{
						onErr();
					}
					else
					{
						res.cookie("day", process.env.DAY, options);
						res.render("match", {"match": match || {}, "day": (process.env.DAY - 1) || 0, "round": ref[process.env.MATCH]});
					}
				};

				mongoFeatures.match(req.params.day, num, onMatch);
			}
		};

		mongoTeam.map(credentials, onMap);
	}
	else
	{
	  res.redirect("/home");
	}
});

router.post("/getsquad", authenticated, function (req, res) {
    credentials =
    {
        "_id": req.signedCookies.name
    };
    squad = [];

    for (i = 1; i < 12; ++i)
    {
        squad.push(req.body["p" + i]);
    }

    var onFetch = function (err)
    {
        if (err)
        {
            res.flash("That request encountered an error, please re-try.");
        }

        res.redirect("/home");
    };

    mongoUsers.updateMatchSquad(credentials, squad, onFetch);
});

router.post("/players", function (req, res){
    stats = {};
    players = [];
    fields =
    {
        "Cost": 1
    };
    cost = 1e7; // 10 million
    credentials =
    {
        "_id": req.signedCookies.name
    };

    for (i = 1; i < 17; ++i)
    {
        players.push(req.body["p" + i]);
    }

    var onUpdate = function (err)
    {
        if (err)
        {
            res.flash("Your squad was not updated, please re-try.");
            res.redirect("/home/players");
        }
        else
        {
            res.redirect("/home/team");
        }
    };

    var getCost = function (id, callback)
    {
        if (id < "d")
        {
            stats[id] = {};
            stats[id].MoM = 0;
            stats[id].form = 0;
            stats[id].morale = 0;
            stats[id].points = 0;
            stats[id].fatigue = 0;
            stats[id].matches = 0;
            stats[id].catches = 0;

            if (!(id > "b" && id < "c"))
            {
                stats[id].outs = 0;
                stats[id].high = -1;
                stats[id].fours = 0;
                stats[id].sixes = 0;
                stats[id].recent = [];
                stats[id].notouts = 0;
                stats[id].runsScored = 0;
                stats[id].ballsFaced = 0;
                stats[id].batAverage = 0.0;
                stats[id].batStrikeRate = 0.0;
                stats[id].low = Number.MAX_VALUE;
            }
            if (id > "b")
            {
                stats[id].wickets = 0;
                stats[id].economy = 0.0;
                stats[id].ballsBowled = 0;
                stats[id].runsConceded = 0;
                stats[id].bowlAverage = 0.0;
                stats[id].bowlStrikeRate = 0.0;
            }
        }

        mongoFeatures.getPlayer(id, fields, callback);
    };

    var onFinish = function (err, documents)
    {
        if (err)
        {
            res.flash("Error creating team record.");
            res.redirect("/home");
        }
        else
        {
            var reduction = function(arg, callback)
            {
                cost -= parseInt(arg.Cost, 10);
                callback();
            };
            var onReduce = function(err)
            {
                if(err)
                {
                    res.flash("An unexpected error occurred, please re-try.");
                    return res.redirect("/players");
                }
                if(cost < 0)
                {
                    res.flash("Cost exceeded!");
                    return res.redirect("/home/players");
                }

                mongoUsers.updateUserTeam(credentials, players, stats, cost, onUpdate);
            };

            async.each(documents, reduction, onReduce);
        }
    };

    async.map(players, getCost, onFinish);
});

/*
router.get('/sponsors', function (req, res){
    res.render('sponsors');
});
*/

router.get(/\/prizes?/, function (req, res){ // page to view prizes
    res.render("prizes");
});

router.get("/players", authenticated, function (req, res, next){ // page for all players, only available if no squad has been chosen
    credentials =
    {
        "_id": req.signedCookies.name
    };

    var onFetchUser = function (err, document)
    {
        if (err)
        {
            res.status(422);
            return next(err);
        }
        if (document.team.length)
        {
            res.redirect("/home" + document.squad.length ? "" : "/team");
        }
        else
        {
            var onFetch = function (err, documents)
            {
                if (err)
                {
                    res.status(422);
                    return next(err);
                }

                var map = function(arg, asyncCallback)
                {
                    arg.active = false; // on the team formation page, all players are not selected by default
                    arg.image = ("https://res.cloudinary.com/gpl/players/" + arg.Type + "/" + arg._id + ".jpg");
                    asyncCallback(null, arg);
                };

                var onMap = function(err, result)
                {
                    if(err)
                    {
                        res.status(422);
                        return next(err);
                    }

                    res.render("players", {"Players": result, "csrfToken": req.csrfToken(), "msg": res.flash()});
                };

                async.map(documents, map, onMap);
            };

            mongoFeatures.fetchPlayers(onFetch);
        }
    };

    mongoUsers.fetchUser(credentials, onFetchUser);
});

router.get("/team", authenticated, function (req, res, next){ // view the assigned playing 11 with options to change the playing 11
    credentials =
    {
        "_id": req.signedCookies.name
    };

    var getTeam = function (err, documents)
    {
        if (err)
        {
            res.status(422);
            return next(err);
        }

        res.render("team", {"Squad": documents, "csrfToken": req.csrfToken()});
    };

    mongoTeam.getTeam(credentials, getTeam);
});

router.get("/stats", authenticated, function (req, res, next){
    if(req.signedCookies.stats && req.signedCookies.day === process.env.DAY)
    {
        res.render("stats", {"stats": JSON.parse(req.signedCookies.stats)});
    }
    else if (process.env.DAY > "0")
    {
        var onGetStats = function (err, doc)
        {
            if (err)
            {
                res.status(422);
                return next(err);
            }

            doc.general.overs = clean(doc.general.overs);
            res.cookie("day", process.env.DAY, options);
            res.cookie("stats", JSON.stringify(doc), options);
            res.render("stats", {"stats": doc});
        };

        mongoFeatures.getStats(onGetStats);
    }
    else
    {
        res.redirect("/home");
    }
});

router.get("/feature", authenticated, function (req, res){
    res.render("feature", {"csrfToken": req.csrfToken()});
});

router.post("/feature", authenticated, function (req, res, next){
    var onInsert = function (err)
    {
        if (err)
        {
            res.status(422);
            return next(err);
        }

        res.redirect("/home");
    };

    mongoUsers.insert("features", {"user": req.signedCookies.name, "features": req.body.feature}, onInsert);
});

router.get("/dashboard", authenticated, function (req, res, next){
    if(req.signedCookies.dash && req.signedCookies.day === process.env.DAY)
    {
        res.render("dashboard", {"result": JSON.parse(req.signedCookies.dash)});
    }
    else if (process.env.DAY > "0")
    {
        credentials =
        {
            "_id": req.signedCookies.name
        };

        var onFind = function (err, doc)
        {
            if (err)
            {
                res.status(422);
                return next(err);
            }

            res.cookie("day", process.env.DAY, options);
            res.cookie("dash", JSON.stringify(doc), options);
            res.render("dashboard", {"result": doc});
        };

        mongoTeam.dashboard(credentials, onFind);
    }
    else
    {
        res.redirect("/home");
    }
});

router.get("/settings", authenticated, function(req, res){
    res.render("settings", {"csrfToken": req.csrfToken()});
});

module.exports = router;
