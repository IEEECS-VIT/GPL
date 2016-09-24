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

var simData,
	async = require("async"),
	path = require("path").join,
	days = [1, 2, 3, 4, 5, 6, 7],
	simulate = require(path(__dirname, "simulation")).simulate;

exports.onGetRating = function (userDoc, asyncCallback) {
	return (err, results) => {
		if (err) {
			throw err;
		}

		userDoc.ratings = results;
		asyncCallback(err, userDoc);
	};
};

exports.getAllMatches = function (day, callback) {
	if (days.indexOf(day) === -1) {
		throw new Error("Invalid Day");
	}

	global.database.collection(`matchday${day}`).find().toArray(callback);
};

exports.teamParallelTasks = function (getTeamDetails, matchDoc) {
	return {
		team1: function (asyncCallback) { getTeamDetails({ teamNo: matchDoc.Team_1 }, asyncCallback); },
		team2: function (asyncCallback) { getTeamDetails({ teamNo: matchDoc.Team_2 }, asyncCallback); }
	};
};

exports.userParallelTasks = function (newData, updateUser, updateMatch) {
	return [
		function (asyncCallback) { updateUser(newData.team1, asyncCallback); },
		function (asyncCallback) { updateUser(newData.team2, asyncCallback); },
		function (asyncCallback) { updateMatch(newData.match, asyncCallback); }
	];
};

exports.generalStats = function (general, newUserDoc, day) {
	return {
		sixes: general.sixes + newUserDoc.s || 0,
		fours: general.fours + newUserDoc.f || 0,
		runs: general.runs + newUserDoc.scores[day - 1] || 0,
		overs: general.overs + newUserDoc.overs[day - 1] || 0,
		wickets: general.wickets + newUserDoc.wickets[day - 1] || 0
	};
};

exports.total = function (newUserDoc, mode) {
	return {
		team: newUserDoc._id, // eslint-disable-line no-underscore-dangle
		value: newUserDoc[`${mode}estTotal`]
	};
};

exports.dailyTotal = function (newUserDoc, day) {
	return {
		team: newUserDoc._id, // eslint-disable-line no-underscore-dangle
		value: newUserDoc.scores[day - 1]
	};
};

exports.dailyHigh = function (newUserDoc, i, day) {
	return {
		team: newUserDoc._id, // eslint-disable-line no-underscore-dangle
		player: newUserDoc.names[i] || "",
		value: newUserDoc.stats[newUserDoc.squad[i]].recent[day - 1]
	};
};

exports.overallHigh = function (newUserDoc, i) {
	return {
		team: newUserDoc._id, // eslint-disable-line no-underscore-dangle
		player: newUserDoc.names[i] || "",
		value: newUserDoc.stats[newUserDoc.squad[i]].high
	};
};

exports.purpleCap = function (i, newUserDoc) {
	return {
		team: newUserDoc._id, // eslint-disable-line no-underscore-dangle
		player: newUserDoc.names[i] || "",
		economy: newUserDoc.stats[newUserDoc.squad[i]].economy,
		wickets: newUserDoc.stats[newUserDoc.squad[i]].wickets,
		bowlAverage: newUserDoc.stats[newUserDoc.squad[i]].bowlAverage,
		ballsBowled: newUserDoc.stats[newUserDoc.squad[i]].ballsBowled,
		runsConceded: newUserDoc.stats[newUserDoc.squad[i]].runsConceded,
		bowlStrikeRate: newUserDoc.stats[newUserDoc.squad[i]].bowlStrikeRate
	};
};

exports.orangeCap = function (i, newUserDoc) {
	return {
		team: newUserDoc._id, // eslint-disable-line no-underscore-dangle
		player: newUserDoc.names[i] || "",
		high: newUserDoc.stats[newUserDoc.squad[i]].high,
		runsScored: newUserDoc.stats[newUserDoc.squad[i]].runsScored,
		ballsFaced: newUserDoc.stats[newUserDoc.squad[i]].ballsFaced,
		batAverage: newUserDoc.stats[newUserDoc.squad[i]].batAverage,
		batStrikeRate: newUserDoc.stats[newUserDoc.squad[i]].batStrikeRate
	};
};

exports.makeData = function (results, matchDoc) {
	return {
		team: [results.team1, results.team2],
		match: matchDoc
	};
};

exports.getEachRating = function (elt, subCallback) {
	global.database.collection("players").find({ _id: elt }).limit(1).next(subCallback);
};

exports.onTeamDetails = function (matchDoc, updateData) {
	return (err, results) => {
		if (err) {
			throw err;
		}

		simData = {
			team: [results.team1, results.team2],
			match: matchDoc
		};

		simulate(simData, updateData);
	};
};

exports.onUpdate = function (results, masterCallback) {
	return (err) => {
		if (err) {
			throw err;
		}

		masterCallback(null, results);
	};
};

exports.forAllMatches = function (forEachMatch, onFinish) {
	return (err, docs) => {
		if (err) {
			throw err;
		}

		async.map(docs, forEachMatch, onFinish);
	};
};
