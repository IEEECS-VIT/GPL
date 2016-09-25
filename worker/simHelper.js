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

if (!process.env.NODE_ENV) {
	require("dotenv").load(); // eslint-disable-line global-require
}

var i,
	j,
	hor,
	ver,
	coach,
	ref = { // property inversion helper object
		bat: "bowl",
		bowl: "bat"
	},
	MoM = {
		id: "",
		team: "",
		points: 0
	},
	temp = 0,
	avgRating,
	teamArray = [{}, {}],
	path = require("path").join,
	dir = [__dirname, "..", "utils", "commentary"],
	lbw = require(path(...dir, "out", "lbw")),
	cnb = require(path(...dir, "out", "cnb")),
	mid = require(path(...dir, "misc", "mid")),
	end = require(path(...dir, "misc", "end")),
	half = require(path(...dir, "misc", "half")),
	full = require(path(...dir, "misc", "full")),
	miss = require(path(...dir, "misc", "miss")),
	start = require(path(...dir, "misc", "start")),
	mom = require(path(...dir, "misc", "mom")),
	hopeless = require(path(...dir, "misc", "hopeless")),
	caught = require(path(...dir, "out", "caught")),
	bowled = require(path(...dir, "out", "bowled")),
	stumped = require(path(...dir, "out", "stumped")),
	dot = require(path(...dir, "score", "dot")).concat(require(path(...dir, "score", "dot2"))),
	one = require(path(...dir, "score", "one")).concat(require(path(...dir, "score", "one2"))),
	two = require(path(...dir, "score", "two")),
	three = require(path(...dir, "score", "three")),
	four = require(path(...dir, "score", "four")),
	six = require(path(...dir, "score", "six")),
	wide = require(path(...dir, "extra", "wide")),
	noBall = require(path(...dir, "extra", "noBall")),
	setTeam = function () { // sets blank templates for team-wise properties.
		teamArray[i].name = [];
		teamArray[i].type = [];
		teamArray[i].batAverage = [];
		teamArray[i].economy = [];
		teamArray[i].bowlAverage = [];
		teamArray[i].batRating = [];
		teamArray[i].meanRating = 0;
		teamArray[i].bowlRating = [];
		teamArray[i].avgBatRating = 0;
		teamArray[i].avgBowlRating = 0;
		teamArray[i].batStrikeRate = [];
		teamArray[i].bowlStrikeRate = [];
	},
	setPlayer = function (player) { // method to set generic properties for each player in the squad
		teamArray[i].name.push(player.Name);
		teamArray[i].batAverage.push(player.Average);
		teamArray[i].type.push(` (${player.Type})`);
		teamArray[i].bowlAverage.push(player.Avg || 30);
		teamArray[i].economy.push(player.Economy || 10);
		teamArray[i].bowlStrikeRate.push(player.SR || 40);
		teamArray[i].batStrikeRate.push(player["Strike Rate"]);
	},
     // method to identify the highest rated player among both squads, to be used as a default man of the match.
	defaultMoM = function (id, rating) {
		if (rating > temp) {
			MoM.id = id;
			MoM.team = i;
			temp = rating;
		}
	},
	normalize = function (type) {
		teamArray[i][`${type}Rating`][j] += teamArray[i][`${type}Rating`][j] / 10 - avgRating[type];

		return teamArray[i][`${type}Rating`][j] < 0 ? Number(coach > 0) && coach : teamArray[i][`${type}Rating`][j];
	},
	baseRate = function (player) { // method to allot a base rating to each non-coach player
		if (player.Rating && player.Type !== "all") {
			teamArray[i][`${player.Type}Rating`].push(player.Rating);
			teamArray[i][`${ref[player.Type]}Rating`].push(900 - player.Rating);

			defaultMoM(player._id, player.Rating); // eslint-disable-line no-underscore-dangle
		}
		else {
			teamArray[i].batRating.push(player.Bat);
			teamArray[i].bowlRating.push(player.Bowl);

			defaultMoM(player._id, player.Bat); // eslint-disable-line no-underscore-dangle
			defaultMoM(player._id, player.Bowl); // eslint-disable-line no-underscore-dangle
		}
	},
	adjustRating = function () { // rating adjustment routine, for squad dependant player performance
		for (j = 0; j < 11; ++j) {
			teamArray[i].batRating[j] += normalize("bat");
			teamArray[i].bowlRating[j] += normalize("bowl");
			teamArray[i].meanRating += teamArray[i].bowlRating[j] + teamArray[i].batRating[j];
		}
	},
	pseudoRandom = function (base, limit) {
		if (limit) {
			return base + (limit > base) * pseudoRandom(limit - base);
		}
		if (base) {
			return typeof base === "object"
                ? base[pseudoRandom(base.length)]
                : parseInt(Math.random() * 1e15, 10) % base;
		}

		return Math.random();
	};

exports.toss = ["bat.", "bowl."]; // toss helper strings

exports.projected = { // skeletal object for projected score structure
	rates: ["Run rate", 0, 0, 0, 0],
	totals: ["Total", 0, 0, 0, 0]
};

exports.genArray = function (row, col) { // method to return an array / matrix of zeros, of the specified dimension(s)
	hor = (col && new Array(col)) || 0;
	ver = new Array(row);

	for (i = 0; i < row; ++i) {
		for (j = 0; j < col; ++j) {
			hor[j] = 0;
		}

		ver[i] = hor;
	}

	return ver;
};

exports.extremes = ["best", "worst"]; // partnership characteristic updation keys

exports.form = ["poor", "average", "good", "excellent"]; // unused presently

exports.dismiss = [caught, bowled, lbw, cnb, stumped]; // dismissal mode commentary

exports.bat = [process.env.BAT_AVG, process.env.BAT_STR]; // DECREASE to strengthen batting

exports.bowl = [process.env.BOWL_AVG, process.env.BOWL_STR, process.env.BOWL_ECO]; // INCREASE to strengthen bowling

exports.result = { // reference object for determining actions to be performed in case of a win / loss.
	true: {
		points: 2,
		state: "win"
	},
	false: {
		points: 0,
		state: "loss"
	}
};

exports.score = { // scoring commentary
	0: {
		prefix: "no run",
		comm: dot
	},
	1: {
		prefix: "1 run",
		comm: one
	},
	2: {
		prefix: "2 runs",
		comm: two
	},
	3: {
		prefix: "3 runs",
		comm: three
	},
	4: {
		prefix: "FOUR",
		comm: four
	},
	6: {
		prefix: "SIX",
		comm: six
	}
};

exports.wicket = ["c", "b", "lbw", "cnb", "st"]; // commentary prefixes for dismissal scenarios.

exports.duck = // different kinds of possible ducks
[
	"",
	" First ball! ",
	"",
	" For a duck! ",
	" For a first ball duck ",
	" without facing a ball!  "
];

exports.key = // reference object to determine the updation of for / against team statistics
[
	{
		val: "For",
		index: [0, 1]
	},
	{
		val: "Against",
		index: [1, 0]
	}
];

exports.extra = // reference object for extra commentary handles
[
	{
		prefix: "wide",
		comm: wide
	},
	{
		prefix: "no ball",
		comm: noBall
	}
];

exports.milestone = [half, full]; // commentary to acknowledge a batsman"s fifty / century

exports.miss = [miss.half, miss.full]; // commentary for situations where a batsman misses out on a fifty / century.

exports.state = [start, end]; // special pre-match and post-match commentary

exports.mom = mom; // man of the match commentary

exports.hopeless = hopeless; // commentary for situations where the required run rate exceeds 36

exports.anticipate = // commentary for batsman milestone anticipation
{
	false: "one hit away from a well deserving fifty. Will he make it?",
	true: "knows there is a hundred for the taking if he can knuckle this one down...."
};

exports.status = // reference object to help determine whether a batsman was dismissed or not.
{
	1: "outs",
	true: "notouts"
};

exports.inter = [mid, end]; // inter-innings commentary

exports.bowlHeader = ["Bowler", "Overs", "Maidens", "Wickets", "Runs conceded", "Economy"];

exports.batHeader = ["Runs", "Balls", "Strike Rate", "Fours", "Sixes", "Dot balls", "Control (%)"];

exports.winMode = { false: "higher run rate", true: "fewer wickets lost" };

exports.rand = function (base, limit) { // pseudo random generator
	return pseudoRandom(base, limit);
};

exports.checkMoM = function (player, benchmark, strike, toss) { // check for man of the match conditions
	if (player.points < benchmark) {
		player = { // this assignment is necessary to affect changes to the actual MoM object
			id: strike,
			team: toss,
			points: Math.round(benchmark)
		};
	}
};

exports.make = function (team) { // team object constructor
    // ensure points of MoM are zero initially
    // so that MoM checks are not affected by previous matches
	temp = 0;
	for (i = 0; i < 2; ++i) {
		avgRating = { bat: 0, bowl: 0 };
		setTeam();
		coach = parseInt(team[i][11].Rating, 10) || -50;

		for (j = 0; j < 11; ++j) {
			setPlayer(team[i][j]);
			baseRate(team[i][j]);
			avgRating.bat += teamArray[i].batRating[j];
			avgRating.bowl += teamArray[i].bowlRating[j];
		}

		avgRating.bat = avgRating.bat / 110 + coach;
		avgRating.bowl = avgRating.bowl / 110 + coach;
		teamArray[i].avgBatRating = avgRating.bat;
		teamArray[i].avgBowlRating = avgRating.bowl;
		adjustRating();
		teamArray[i].meanRating /= 22;
	}

	return {
		teams: teamArray,
		MoM: MoM
	};
};

exports.scale = function (a, b, factor, pre) { // helps avoid parseFloat((a/b).toFixed(2)) type repetition
	return parseFloat((a * (factor || 1) / (b || 1)).toFixed(pre || 2));
};

// finds the index of the smallest element in two element arrays, largest if mode is set to 1
exports.decide = function (arg, mode) {
	return Number((arg[1] < arg[0]) ^ mode);
};