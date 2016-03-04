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
try
{
    var faker = require('faker');
}
catch(err)
{
    console.error('Faker will not be loaded on production environment(s).');
}

var user = function()
{
    return {
        _id: '',
        dob: '',
        teamNo: '', // TODO: change to an array, in order to make tracking matchday information for previous rounds simpler.
        managerName: '',
        passwordHash: '',
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
        allOuts: 0,
        morale: 0.0,
        wickets: [],
        runsFor: 0,
        ballsFor: 0,
        runRates : [],
        progression: [],
        wicketsLost: 0,
        runsAgainst: 0,
        wicketsTaken: 0,
        authStrategy: '',
        ballsAgainst: 0,
        netRunRate: 0.0,
        avgRunsFor: 0.0,
        highestTotal: -1,
        avgOversFor: 0.0,
        avgRunsAgainst: 0.0,
        avgWicketsLost: 0.0,
        avgWicketsTaken: 0.0,
        avgOversAgainst: 0.0,
        lowestTotal: Number.MAX_VALUE,
        avgPartnershipRuns: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        avgPartnershipBalls: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        bestPartnershipRuns: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        worstPartnershipRuns: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        bestPartnershipBalls: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        worstPartnershipBalls: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        scoredPerOver: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        concededPerOver: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    }
};

exports.schema = user;

exports.users = function(limit, index)
{
    users = [];
    index = index || 0;

    for(i = 1; i <= limit; ++i)
    {
        temp = user();
        temp.teamNo = index + i;
        temp.authStrategy = 'local';
        temp._id = 'TEAM' + index + i;
        temp.dob = faker.date.recent();
        temp.managerName = faker.name.findName();
        temp.phone = faker.phone.phoneNumberFormat().replace(/-/g, '');
        temp.passwordHash = '$2a$10$N7zcIGhNPPsW2rGLQWCDo.4XZb8Ket.MhxijAFbCueZbPFMn/P2Zu'; // This hash is equivalent to 'gpl'
        temp.email = 'testgpluser' + (i % 8 + 1) + '@gmail.com'; // always specify a valid email address to test email functionality.

        users.push(temp);
    }

    users.push({
        _id: 'ADMIN',
        authStrategy: 'admin',
        email: 'gravitaspremierleague@gmail.com',
        passwordHash: '$2a$10$ijmjpw3BJDNp5phIKmfdAeJ.ev/pbU6tXL78JgKejyjQ58OtUodtK'   // admin@gpl
    });

    return users;
};

exports.players = function()
{
    players  = [];

    for(i = 1; i <= 16; ++i)
    {
        for(j in ref)
        {
            cost = Math.ceil(((parseInt(faker.finance.amount()) * faker.random.number()) % 1950001 + 50000) / 10000) * 10;
            temp =
            {
                _id: j + i,
                Name: faker.name.findName(),
                Type: ref[j],
                Price: cost > 999.999 ? cost / 1000 + ' M' : cost + ' K',
                Cost: cost
            };

            if(j != 'd')
            {
                if(j !== 'c')
                {
                    temp.Rating = parseInt(faker.commerce.price()) % 501 + 400;
                }
                else
                {
                    temp.Bat = parseInt(faker.commerce.price()) % 501 + 400;
                    temp.Bowl = parseInt(faker.commerce.price()) % 501 + 400;
                }

                temp.Country = faker.address.country();
                temp.SR = parseFloat((faker.commerce.price() % 53 + 8).toFixed(2));
                temp.Avg = parseFloat((faker.commerce.price() % 36 + 9).toFixed(2));
                temp.Economy = parseFloat((faker.commerce.price() % 8 + 4).toFixed(2));
                temp.Average = parseFloat((faker.commerce.price() % 41 + 10).toFixed(2));
                temp['Strike Rate'] = parseFloat((faker.commerce.price() % 91 + 70).toFixed(2));
            }
            else
            {
                temp.Rating = faker.random.number() % 12 + 4;
            }

            players.push(temp);
        }

    }

    return players;
};

exports.info =
{
    _id: 'info',
    password: 0,
    user: 0
};

exports.stats =
{
    "_id": "stats",
    "runs": 0,
    "overs": 0,
    "wickets": 0,
    "fours": 0,
    "sixes": 0,
    "high":
    {
        "total":
        {
            "team": "",
            "value": 0
        },
        "individual":
        {
            "team": "",
            "value": 0,
            "player": ""
        }
    },
    "low":
    {
        "value": 0,
        "team": ""
    },
    "orange":
    {
        "player": "",
        "runs": 0,
        "balls": 0,
        "avg": 0,
        "sr": 0,
        "team": ""
    },
    "purple":
    {
        "player": "",
        "wickets": 0,
        "balls": 0,
        "avg": 0,
        "sr": 0,
        "economy": 0,
        "team": ""
    },
    "daily":
    {
        "total":
        {
            "team": "",
            "value": 0
        },
        "individual":
        {
            "team": "",
            "value": 0,
            "player": ""
        },
        "MoM":
        {
            "id": 0,
            "points": 0,
            "team": 0
        }
    },
    "overall":
    {
        "id": "",
        "team": ""
    }
};
