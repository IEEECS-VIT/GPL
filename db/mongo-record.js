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
var cost;
var temp;
var users;
var players;
var ref =
{
    a: 'bat',
    b: 'bowl',
    c: 'all',
    d: 'coach'
};
var faker = require('faker');

var user = function()
{
    return {
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
    }
};

exports.schema = user;

exports.users = function(limit)
{
    users = [];

    for(i = 1; i <= limit; ++i)
    {
        temp = user();
        temp._id = 'TEAM' + i;
        temp.authStrategy = 'local';
        temp.dob = faker.date.recent();
        temp.manager_name = faker.name.findName();
        temp.phone = faker.phone.phoneNumberFormat().replace(/-/g, '');
        temp.password_hash = '$2a$10$N7zcIGhNPPsW2rGLQWCDo.4XZb8Ket.MhxijAFbCueZbPFMn/P2Zu';
        temp.email = 'testgpluser' + (i % 8 + 1) + '@gmail.com'; // always specify a valid email address to test email functionality.
        // The above hash is equivalent to 'gpl'
        users.push(temp);
    }

    return users;
};

exports.players = function()
{
    players  = [];

    for(i = 1; i <= 16; ++i)
    {
        for(j in ref)
        {
            cost = Math.ceil(((parseInt(faker.finance.amount()) * faker.random.number()) % 1950001 + 50000) / 10000) * 10000;
            temp =
            {
                _id: j + i,
                Name: faker.name.findName(),
                Type: ref[j],
                Price: cost > 999999 ? cost / 1000000 + ' M' : cost / 1000 + ' K',
                Cost: cost
            };

            if(j != 'd')
            {
                if(j != 'c')
                {
                    temp.Rating = parseInt(faker.commerce.price()) % 501 + 400;
                }
                else
                {
                    temp.Bat = parseInt(faker.commerce.price()) % 501 + 400;
                    temp.Bowl = parseInt(faker.commerce.price()) % 501 + 400;
                }

                temp.Country = faker.address.country();
                temp.Average = parseFloat((faker.commerce.price() % 41 + 10).toFixed(2));
                temp['Strike Rate'] = parseFloat((faker.commerce.price() % 91 + 70).toFixed(2));
                temp.Avg = parseFloat((faker.commerce.price() % 36 + 9).toFixed(2));
                temp.SR = parseFloat((faker.commerce.price() % 53 + 8).toFixed(2));
                temp.Economy = parseFloat((faker.commerce.price() % 8 + 4).toFixed(2));
            }

            players.push(temp);
        }

    }

    return players;
};
