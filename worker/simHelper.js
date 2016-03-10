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
var temp = 0;
var teamArray = [{}, {}];
var path = require('path').join;
var dir = [__dirname, '..', 'utils', 'commentary'];
var lbw = require(path(...dir, 'out', 'lbw'));
var cnb = require(path(...dir, 'out', 'cnb'));
var mid = require(path(...dir, 'misc', 'mid'));
var end = require(path(...dir, 'misc', 'end'));
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

var defaultMoM = function(id, rating)
{
    if(rating > temp)
    {
        MoM.id = id;
        MoM.team = i;
        temp = rating;
    }
};

exports.dismiss = [caught, bowled, lbw, cnb, stumped];

exports.bat = [process.env.BAT_AVG, process.env.BAT_STR];

exports.bowl = [process.env.BOWL_AVG, process.env.BOWL_STR, process.env.BOWL_ECO]; // increase to strengthen bowling

exports.ref =
[
    {
        points: 2,
        state: 'win'
    },
    {
        points: 0,
        state: 'loss'
    }
];

exports.scoreRef =
{
    0: {prefix: 'no run', comm: dot},
    1: {prefix: '1 run', comm: one},
    2: {prefix: '2 runs', comm: two},
    3: {prefix: '3 runs', comm: three},
    4: {prefix: 'FOUR', comm: four},
    6: {prefix: 'SIX', comm: six}
};

exports.wicketRef = ['c', 'b', 'lbw', 'cnb', 'st'];

exports.extraRef =
[
    {
        prefix: 'wide',
        comm: wide
    },
    {
        prefix: 'no ball',
        comm: noBall
    }
];

exports.inter = [mid, end];

exports.rand = function (base, limit)
{
    if (limit)
    {
        return base + ((limit > base) ? rand(limit - base) : 0);
    }
    else if (base)
    {
        return ((typeof(base) === 'object') ? base[rand(base.length)] : parseInt(Math.random() * 1000000000000000, 10) % base);
    }
    else
    {
        return Math.random();
    }
};

exports.checkMoM = function(MoM, temp, strike, toss)
{
    if(MoM.points < temp)
    {
        MoM =
        {
            id: strike,
            team: toss,
            points: Math.round(temp)
        };
    }
};

exports.Make = function (team)
{
    for(i = 0; i < 2; ++i)
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
        teamArray[i].coachRating = team[11].Rating || -50;

        for (j = 0; j < 11; ++j)
        {
            teamArray[i].name.push(team[i][j].Name);
            teamArray[i].batAvg.push(team[i][j].Average);
            teamArray[i].type.push(` (${team[i][j].Type})`);
            teamArray[i].bowlAvg.push(team[i][j].Avg || 30);
            teamArray[i].economy.push(team[i][j].Economy || 10);
            teamArray[i].bowlStrikeRate.push(team[i][j].SR || 40);
            teamArray[i].batStrikeRate.push(team[i][j]['Strike Rate']);

            if(team[i][j].Rating)
            {
                teamArray[i][`${team[i][j].Type}Rating`] = team[i][j].Rating;
                teamArray[i][`${ref[team[i][j].Type]}Rating`] = 900 - team[i][j].Rating;

                defaultMoM(team[i][j]._id, team[i][j].Rating);
            }
            else
            {
                teamArray[i].batRating.push(team[i][j].Bat);
                teamArray[i].bowlRating.push(team[i][j].Bowl);

                defaultMoM(team[i][j]._id, team[i][j].Bat);
                defaultMoM(team[i][j]._id, team[i][j].Bowl);
            }

            teamArray[i].avgBatRating += teamArray[i].batRating[j];
            teamArray[i].avgBowlRating += teamArray[i].bowlRating[j];
        }

        for (j = 0; j < 11; ++j)
        {
            teamArray[i].batRating[j] += parseFloat(teamArray[i].batRating[j]) / (10) - parseFloat(teamArray[i].avgBatRating) / (110) + parseInt(teamArray[i].coachRating, 10);
            teamArray[i].bowlRating[j] += parseFloat(teamArray[i].bowlRating[j]) / (10) - parseFloat(teamArray[i].avgBowlRating) / (110) + parseInt(teamArray[i].coachRating, 10);
            teamArray[i].batRating[j] = (teamArray[i].batRating[j] < 0) ? ((teamArray[i].coachRating < 0) ? (0) : (teamArray[i].coachRating)) : (teamArray[i].batRating[j]);
            teamArray[i].bowlRating[j] = (teamArray[i].bowlRating[j] < 0) ? ((teamArray[i].coachRating < 0) ? (0) : (teamArray[i].coachRating)) : (teamArray[i].bowlRating[j]);
            teamArray[i].meanRating += teamArray[i].bowlRating[j] + teamArray[i].batRating[j];
        }

        teamArray[i].meanRating /= 22;
        delete teamArray[i].avgBatRating;
        delete teamArray[i].avgBowlRating;
    }

    return {
        teams: teamArray,
        MoM: MoM
    };
};