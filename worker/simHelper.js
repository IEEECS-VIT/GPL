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
var j;
var hor;
var ver;
var ref =
{
    bat: 'bowl',
    bowl: 'bat'
};
var MoM =
{
    id: '',
    team: '',
    points: 0
};
var coach;
var temp = 0;
var avgRating;
var teamArray = [{}, {}];
var path = require('path').join;
var dir = [__dirname, '..', 'utils', 'commentary'];
var lbw = require(path(...dir, 'out', 'lbw'));
var cnb = require(path(...dir, 'out', 'cnb'));
var mid = require(path(...dir, 'misc', 'mid'));
var end = require(path(...dir, 'misc', 'end'));
var half = require(path(...dir, 'misc', 'half'));
var full = require(path(...dir, 'misc', 'full'));
var miss = require(path(...dir, 'misc', 'miss'));
var start = require(path(...dir, 'misc', 'start'));
var mom = require(path(...dir, 'misc', 'mom'));
var hopeless = require(path(...dir, 'misc', 'hopeless'));
var caught = require(path(...dir, 'out', 'caught'));
var bowled = require(path(...dir, 'out', 'bowled'));
var stumped = require(path(...dir, 'out', 'stumped'));
var dot = require(path(...dir, 'score', 'dot')).concat(require(path(...dir, 'score', 'dot2')));
var one = require(path(...dir, 'score', 'one')).concat(require(path(...dir, 'score', 'one2')));
var two = require(path(...dir, 'score', 'two'));
var three = require(path(...dir, 'score', 'three'));
var four = require(path(...dir, 'score', 'four'));
var six = require(path(...dir, 'score', 'six'));
var wide = require(path(...dir, 'extra', 'wide'));
var noBall = require(path(...dir, 'extra', 'noBall'));
var setTeam = function()
{
    teamArray[i].name = [];
    teamArray[i].type = [];
    teamArray[i].batAvg = [];
    teamArray[i].economy = [];
    teamArray[i].bowlAvg = [];
    teamArray[i].batRating = [];
    teamArray[i].meanRating = 0;
    teamArray[i].bowlRating = [];
    teamArray[i].avgBatRating = 0;
    teamArray[i].avgBowlRating = 0;
    teamArray[i].batStrikeRate = [];
    teamArray[i].bowlStrikeRate = [];
};
var setPlayer = function(player)
{
    teamArray[i].name.push(player.Name);
    teamArray[i].batAvg.push(player.Average);
    teamArray[i].type.push(` (${player.Type})`);
    teamArray[i].bowlAvg.push(player.Avg || 30);
    teamArray[i].economy.push(player.Economy || 10);
    teamArray[i].bowlStrikeRate.push(player.SR || 40);
    teamArray[i].batStrikeRate.push(player['Strike Rate']);
};
var defaultMoM = function(id, rating)
{
    if(rating > temp)
    {
        MoM.id = id;
        MoM.team = i;
        temp = rating;
    }
};
var normalize = function(type)
{
    teamArray[i][`${type}Rating`][j] += teamArray[i][`${type}Rating`][j] / 10 - avgRating[type];
    return (teamArray[i][`${type}Rating`][j] < 0) ? (+(coach > 0) && coach) : teamArray[i][`${type}Rating`][j];
};
var baseRate = function(player)
{
    if(player.Rating)
    {
        teamArray[i][`${player.Type}Rating`].push(player.Rating);
        teamArray[i][`${ref[player.Type]}Rating`].push(900 - player.Rating);

        defaultMoM(player._id, player.Rating);
    }
    else
    {
        teamArray[i].batRating.push(player.Bat);
        teamArray[i].bowlRating.push(player.Bowl);

        defaultMoM(player._id, player.Bat);
        defaultMoM(player._id, player.Bowl);
    }
};
var adjustRating = function()
{
    for (j = 0; j < 11; ++j)
    {
        teamArray[i].batRating[j] += normalize('bat');
        teamArray[i].bowlRating[j] += normalize('bowl');
        teamArray[i].meanRating += teamArray[i].bowlRating[j] + teamArray[i].batRating[j];
    }
};

exports.toss = ['bat.', 'bowl.'];

exports.projected =
{
    rates: ['Run rate', 0, 0, 0, 0],
    totals: ['Total', 0, 0, 0, 0]
};

exports.genArray = function(row, col)
{
    hor = (col && new Array(col)) || 0;
    ver = new Array(row);

    for(i = 0; i < row; ++i)
    {
        for(j = 0; j < col; ++j)
        {
            hor[j] = 0;
        }

        ver[i] = hor;
    }

    return ver;
};

exports.form = ['poor', 'average', 'good', 'excellent'];

exports.dismiss = [caught, bowled, lbw, cnb, stumped];

exports.bat = [process.env.BAT_AVG, process.env.BAT_STR];

exports.bowl = [process.env.BOWL_AVG, process.env.BOWL_STR, process.env.BOWL_ECO]; // increase to strengthen bowling

exports.state =
{
    true: {points: 2, state: 'win'},
    false: {points: 0, state: 'loss'}
};

exports.score =
{
    0: {prefix: 'no run', comm: dot},
    1: {prefix: '1 run', comm: one},
    2: {prefix: '2 runs', comm: two},
    3: {prefix: '3 runs', comm: three},
    4: {prefix: 'FOUR', comm: four},
    6: {prefix: 'SIX', comm: six}
};

exports.wicket = ['c', 'b', 'lbw', 'cnb', 'st'];

exports.duck =
[
    '',
    ' First ball! ',
    '',
    ' For a duck! ',
    ' For a first ball duck ',
    ' without facing a ball!  '
];

exports.key =
[
    {
        val: 'For',
        index: [0, 1]
    },
    {
        val: 'Against',
        index: [1, 0]
    }
];

exports.extra =
[
    {prefix: 'wide', comm: wide},
    {prefix: 'no ball', comm: noBall}
];

exports.milestone = [half, full];

exports.miss = [miss.half, miss.full];

exports.state = [start, end];

exports.mom = mom;

exports.hopeless = hopeless;

exports.anticipate =
{
    false: 'one hit away from a well deserving fifty. Will he make it?',
    true: 'knows there is a hundred for the taking if he can knuckle this one down....'
};

exports.status =
{
    1: 'outs',
    true: 'notouts'
};

exports.inter = [mid, end];

exports.bowlHeader = ['Bowler', 'Overs', 'Maidens', 'Wickets', 'Runs conceded', 'Economy'];

exports.batHeader = ['Runs', 'Balls', 'Strike Rate', 'Fours', 'Sixes', 'Dot balls', 'Control (%)'];

exports.rand = function (base, limit)
{
    if (limit)
    {
        return base + ((limit > base) ? rand(limit - base) : 0);
    }
    if (base)
    {
        return ((typeof(base) === 'object') ? base[rand(base.length)] : parseInt(Math.random() * 1e15, 10) % base);
    }

    return Math.random();
};

exports.checkMoM = function(MoM, temp, strike, toss)
{
    if(MoM.points < temp)
    {
        MoM = // this assignment is necessary to affect changes to the actual MoM object
        {
            id: strike,
            team: toss,
            points: Math.round(temp)
        };
    }
};

exports.make = function (team)
{
    for(i = 0; i < 2; ++i)
    {
        avgRating = {bat: 0, bowl: 0};
        setTeam();
        coach = parseInt(team[i][11].Rating, 10) || -50;

        for (j = 0; j < 11; ++j)
        {
            setPlayer(team[i][j]);
            baseRate(team[i][j]);
            avgRating.bat += teamArray[i].batRating[j];
            avgRating.bowl += teamArray[i].bowlRating[j];
        }

        avgRating.bat = avgRating.bat / 110 + coach;
        avgRating.bowl = avgRating.bowl / 110 + coach;
        adjustRating();
        teamArray[i].meanRating /= 22;
    }

    return {teams: teamArray, MoM: MoM};
};
