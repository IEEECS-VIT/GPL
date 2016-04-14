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
    "a": "bat",
    "b": "bowl",
    "c": "all",
    "d": "coach"
};
var path = require("path").join;
var helper = require(path(__dirname, "mongoHelper"));
try
{
    var faker = require("faker");
}
catch(err)
{
    console.error("Faker will not be loaded on production environment(s).");
}

var user = function()
{
    return {
        "_id": "",
        "dob": "",
        "teamNo": "", // change to an array, in order to make tracking matchday information for previous rounds simpler.
        "managerName": "",
        "passwordHash": "",
        "email": "",
        "phone": "",
        "toss": 0,
        "win": 0,
        "loss": 0,
        "form": 1,
        "tied": 0,
        "fours": 0,
        "sixes": 0,
        "team": [],
        "squad": [],
        "played": 0,
        "stats": {},
        "points": 0,
        "streak": 0,
        "overs": [],
        "ratio": 0.0,
        "surplus": 0,
        "scores": [],
        "runsFor": 0,
        "allOuts": 0,
        "wickets": [],
        "ballsFor": 0,
        "morale": 0.0,
        "wicketsFor": 0,
        "runRates": [],
        "runsAgainst": 0,
        "progression": [],
        "ballsAgainst": 0,
        "netRunRate": 0.0,
        "avgRunsFor": 0.0,
        "authStrategy": "",
        "highestTotal": -1,
        "avgOversFor": 0.0,
        "wicketsAgainst": 0,
        "avgWicketsFor": 0.0,
        "avgRunsAgainst": 0.0,
        "avgOversAgainst": 0.0,
        "avgWicketsAgainst": 0.0,
        "lowestTotal": Number.MAX_VALUE,
        "avgPartnershipRuns": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "avgPartnershipBalls": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "bestPartnershipRuns": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "worstPartnershipRuns": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "bestPartnershipBalls": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "worstPartnershipBalls": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "scoredPerOver": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        "concededPerOver": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    }
};

exports.schema = user;

exports.users = function(flag, limit, index)
{
    users = [];
    index = index || 0;

    for(i = 1; i <= limit; ++i)
    {
        temp = user();
        temp.teamNo = index + i;
        temp.authStrategy = "local";
        temp._id = "TEAM" + (index + i);
        temp.dob = faker.date.recent();
        temp.managerName = faker.name.findName();
        temp.phone = faker.phone.phoneNumberFormat().replace(/-/g, "");
        temp.passwordHash = "$2a$10$N7zcIGhNPPsW2rGLQWCDo.4XZb8Ket.MhxijAFbCueZbPFMn/P2Zu"; // This hash is equivalent to 'gpl'
        temp.email = "testgpluser" + (i % 8 + 1) + "@gmail.com"; // always specify a valid email address to test email functionality.

        users.push(temp);
    }

    if(flag)
    {
        users.push({
            "_id": "ADMIN",
            "authStrategy": "admin",
            "email": "gravitaspremierleague@gmail.com", // needed for admin password resets
            "passwordHash": "$2a$10$ijmjpw3BJDNp5phIKmfdAeJ.ev/pbU6tXL78JgKejyjQ58OtUodtK"   // admin@gpl
        });
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
            if(!ref.hasOwnProperty(j))
            {
                continue;
            }

            cost = Math.ceil(((parseInt(faker.finance.amount(), 10) * faker.random.number()) % 1950001 + 50000) / 10000) * 10;
            temp =
            {
                "_id": j + i,
                "Name": faker.name.findName(),
                "Type": ref[j],
                "Price": cost > 999.999 ? cost / 1000 + " M" : cost + " K",
                "Cost": cost * 1000
            };

            if(j !== "d")
            {
                if(j !== "c")
                {
                    temp.Rating = helper.parse("Int", 400, 900);
                }
                else
                {
                    temp.Bat = helper.parse("Int", 400, 900);
                    temp.Bowl = helper.parse("Int", 400, 900);
                }

                temp.Country = faker.address.country();
                temp.SR = helper.parse("Float", 8, 60);
                temp.Avg = helper.parse("Float", 9, 45);
                temp.Economy = helper.parse("Float", 4, 12);
                temp.Average = helper.parse("Float", 10, 50);
                temp["Strike Rate"] = helper.parse("Float", 70, 160);
            }
            else
            {
                temp.Rating = helper.parse("Int", 4, 15);
            }

            players.push(temp);
        }
    }

    return players;
};

exports.info =
{
    "_id": "info",
    "password": 0,
    "user": 0
};

exports.stats =
{
    "_id": "stats",
    "general":
    {
        "runs": 0,
        "overs": 0,
        "wickets": 0,
        "fours": 0,
        "sixes": 0
    },
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
        "runs": 0,
        "team": "",
        "player": "",
        "ballsFaced": 0,
        "bowlAverage": 0,
        "batStrikeRate": 0
    },
    "purple":
    {
        "team": "",
        "player": "",
        "wickets": 0,
        "economy": 0,
        "bowlAverage": 0,
        "ballsBowled": 0,
        "bowlStrikeRate": 0
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
