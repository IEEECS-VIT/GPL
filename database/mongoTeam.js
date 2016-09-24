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

var i,
	slice = {
		_id: 0,
		fours: 1,
		sixes: 1,
		runRates: 1,
		progression: 1,
		scoredPerOver: 1,
		concededPerOver: 1
	},
	async = require("async"),
	match = process.env.MATCH,
	path = require("path").join,
	helper = require(path(__dirname, "mongoHelper")),
	mongoUsers = require(path(__dirname, "mongoUsers")),
	mongoFeatures = require(path(__dirname, "mongoFeatures"));

exports.getTeam = function (doc, callback) {
	var onFetch = function (err, document) {
		if (err) {
			return callback(err, null);
		}
		if (!document.team.length) {
			return callback(null, []);
		}

		async.map(document.team, mongoFeatures.getPlayer, callback);
	};

	db.collection(match).find(doc).limit(1).next(onFetch);
};

exports.getSquad = function (team, callback) {
	var coach,
		onFinish = function (err, documents) {
			if (err) {
				throw err;
			}

			var onGetCoach = function (error, doc) {
				if (error) {
					return callback(error, null);
				}

				documents.push(doc);

				return callback(null, documents);
			};

			mongoFeatures.getPlayer(coach, onGetCoach);
		},
		onFetch = function (err, document) {
			if (err) {
				return callback(err, null);
			}
			if (!document || !document.team.length) {
				return callback(null, []);
			}

			coach = document.team.find((arg) => arg > "d");
			async.map(document.squad, mongoFeatures.getPlayer, onFinish);
		};

	db.collection(match).find(team).limit(1).next(onFetch);
};

exports.dashboard = function (doc, callback) {
	db.collection(match).find(doc, slice).limit(1).next(callback);
};

exports.map = function (team, callback) {
	var onFind = function (err, doc) {
		if (err) {
			return callback(err);
		}

		return callback(null, doc.teamNo);
	};

	helper.getData(team, { teamNo: 1 }, onFind);
    // db.collection(match).find(doc, {teamNo: 1}).limit(1).next(onFind);
};

exports.shortlist = function (callback) { // add email notification for shortlisted team owners.
	var onShortList = function (err, docs) {
		if (err) {
			return callback(err);
		}

		i = 0;
		async.map(docs, function (arg, asyncCallback) {
			arg.teamNo = ++i;
			asyncCallback();
		}, function (error, result) {
			if (error) {
				return callback(err);
			}

			db.collection(helper.shortlistRef[match].out).insertMany(result, callback);
		});
	};

	db.collection(match).aggregate([{
		$sort: {
			points: -1,
			netRunRate: -1,
			win: -1,
			loss: 1
		}
	},
	{
		$limit: helper.shortlistRef[match].limit
	}
    ], onShortList);
};

exports.adminInfo = function (callback) {
	var onParallel = function (err, result) {
			if (err) {
				return callback(err);
			}

			delete result.database.ok;
			delete result.database.extentFreeList;
			result.database.fileSize = helper.scale(result.database.fileSize, "MB");
			result.database.dataSize = helper.scale(result.database.dataSize, "MB");
			result.database.storageSize = helper.scale(result.database.storageSize, "MB");
			result.database.indexSize = helper.scale(result.database.indexSize, "KB");
			result.database.avgObjSize = helper.scale(result.database.avgObjSize, "KB");
			result.database.version = `${result.database.dataFileVersion.major}.${result.database.dataFileVersion.minor}`;
			delete result.database.dataFileVersion;

			return callback(null, result);
		},
		adminParallelTasks = {
			interest: function (asyncCallback) {
				mongoUsers.getCount("interest", {}, asyncCallback);
			},
			total: function (asyncCallback) {
				mongoUsers.getCount({ authStrategy: { $ne: "admin" } }, asyncCallback);
			},
			facebook: function (asyncCallback) {
				mongoUsers.getCount({ authStrategy: "facebook" }, asyncCallback);
			},
			google: function (asyncCallback) {
				mongoUsers.getCount({ authStrategy: "google" }, asyncCallback);
			},
			twitter: function (asyncCallback) {
				mongoUsers.getCount({ authStrategy: "twitter" }, asyncCallback);
			},
			local: function (asyncCallback) {
				mongoUsers.getCount({ authStrategy: "local" }, asyncCallback);
			},
			emptySquad: function (asyncCallback) {
				mongoUsers.getCount({ squad: [] }, asyncCallback);
			},
			emptyTeam: function (asyncCallback) {
				mongoUsers.getCount({ team: [] }, asyncCallback);
			},
			features: function (asyncCallback) {
				mongoFeatures.notify(asyncCallback);
			},
			forgot: function (asyncCallback) {
				mongoFeatures.forgotCount({ password: 0 }, asyncCallback);
			},
			database: function (asyncCallback) {
				mongoFeatures.adminStats(asyncCallback);
			}
		};

	async.parallel(adminParallelTasks, onParallel);
};

exports.fetchMatches = function (team, callback) { // deprecated, as match details are to be fetched one at a time
	var parallelTasks = Array.apply(null, Array(7)).map((_, index) => {
		return (asyncCallback) => { mongoFeatures.match(index + 1, team, asyncCallback); };
	});

	async.parallel(parallelTasks, callback);
};

exports.opponent = function (day, team, callback) {
	var filter = {
			$or:
			[
				{ Team_1: team }, {	Team_2: team } // eslint-disable-line camelcase
			]
		},
		onFind = function (err, doc) {
			if (err) {
				return callback(err);
			}

			return callback(null, team === doc.Team_1 ? doc.Team_2 : doc.Team_1);
		};

	db.collection(`matchday${day}`).find(filter).limit(1).next(onFind);
};

exports.team = function (team, callback) {
	var onTeam = function (err, doc) {
		if (err) {
			return callback(err);
		}

		var onGet = function (error, results) {
			if (error) {
				return callback(error);
			}

			doc.team = results.sort();

			return callback(null, doc);
		};

		async.map(doc.team, mongoFeatures.getPlayer, onGet);
	};

	helper.getData(team, { team: 1 }, onTeam);
};
