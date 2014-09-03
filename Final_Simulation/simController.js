/*
 *  GraVITas Premier League
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

var async = require('async');
var path = require('path');

var mongoTeam = require(path.join(__dirname, '..', 'db', 'mongo-team'));
var mongoUser = require(path.join(__dirname, '..', 'db', 'mongo-users'));
var simulator = require(path.join(__dirname, 'simulation'));

var log;
if (process.env.LOGENTRIES_TOKEN)
{
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}

var matchGenerator = function (err, docs)
{
    if (err)
    {
        console.log(err.message);
    }
    else
    {

        var simulate_match = function (elt, i, arr)
        {

            var parallel_tasks = {};
            var doc1 = {
                "team_no": parseInt(elt.Team_1)
            };
            var doc2 = {
                "team_no": parseInt(elt.Team_2)
            };
            console.log(doc1);

            parallel_tasks.team1 = function (asyncCallback)
            {
                mongoTeam.getSquad(doc1, asyncCallback);
                //console.log("Parallel Task1");

            };


            parallel_tasks.team2 = function (asyncCallback)
            {
                mongoTeam.getSquad(doc2, asyncCallback);
                //console.log("Parallel Task2");

            };
            parallel_tasks.user1 = function (asyncCallback)
            {
                mongoUser.fetchUser(doc2, asyncCallback);
                //console.log("Parallel Task3");

            };
            parallel_tasks.user2 = function (asyncCallback)
            {
                mongoUser.fetchUser(doc2, asyncCallback);
                //console.log("Parallel Task4");

            };
            var onFinish = function (err, results)
            {
                if (err)
                {
                    console.log(err.message);
                }
                else
                {

                    /*  for(i=0;i<12;i++)
                     {
                     console.log("Team 1:"+ results.team1[i].Name);
                     }
                     for(i=0;i<12;i++)
                     {
                     console.log("Team 2:"+ results.team2[i].Name);
                     }

                     console.log("Player 1:" + results.user1.manager_name);
                     console.log("Player 2:" + results.user2.manager_name);*/
                    simulator.team(elt, results.team1, results.team2, results.user1, results.user2);

                }
            };
            async.parallel(parallel_tasks, onFinish);

        };

        docs.forEach(simulate_match);
    }
};
console.log("Fetch Matches for Today");
simulator.todaysMatches(matchGenerator);

