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
var temp;
var teams = [];
var schema =
{
    _id: '',
    dob: '',
    team_no: '', // TODO: change to an array, in order to make tracking matchday information for previous rounds simpler.
    manager_name: '',
    password_hash: '',
    email: '',
    phone: '',
    toss: 0,
    win: 0,
    loss: 0,
    form: 1,
    tied: 0,
    fours: 0,
    sixes: 0,
    team: [],
    squad: [],
    played: 0,
    stats: {},
    points: 0,
    streak: 0,
    overs: [],
    ratio: 0.0,
    surplus: 0,
    scores: [],
    all_outs: 0,
    morale: 0.0,
    wickets: [],
    runs_for: 0,
    balls_for: 0,
    run_rates : [],
    progression: [],
    wickets_lost: 0,
    runs_against: 0,
    wickets_taken: 0,
    authStrategy: '',
    balls_against: 0,
    net_run_rate: 0.0,
    avg_runs_for: 0.0,
    highest_total: -1,
    avg_overs_for: 0.0,
    avg_runs_against: 0.0,
    avg_wickets_lost: 0.0,
    avg_wickets_taken: 0.0,
    avg_overs_against: 0.0,
    lowest_total: Number.MAX_VALUE,
    avg_partnership_runs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    avg_partnership_balls: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    best_partnership_runs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    worst_partnership_runs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    best_partnership_balls: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    worst_partnership_balls: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    scored_per_over: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    conceded_per_over: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
};

exports.seed = function(limit)
{
    for(i = 0; i < limit; ++i)
    {
        temp = schema;

        teams.push(temp);
    }

    return 1;
};

module.exports = schema;
