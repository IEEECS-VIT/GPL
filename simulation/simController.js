/**
 * Created by Kashish Singhal <singhal2.kashish@gmail.com> on 21/8/14.
 */
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
var simulator = require('./simulation.js');
var mongoTeam = require('../mongoTeam.js');
var async = require('async');


exports.generateMatch = function()
{
    var matchGenerator = function(err,docs)
    {
        if (err)
        {
            console.log(err.message);
        }
        else
        {
            var simulate_match = function(elt, i, arr)
            {
                var parallel_tasks = {};
                var doc1 = {
                    "_id" : elt.Team_1
                };
                var doc2 = {
                    "_id" : elt.Team_2
                };

                parallel_tasks.team1 = function(asyncCallback)
                {
                    mongoTeam.getTeam(doc1, asyncCallback);

                };


                parallel_tasks.team2 = function(asyncCallback)
                {
                    mongoTeam.getTeam(doc2, asyncCallback);

                };
                var onFinish = function(err,results)
                {
                    if(err)
                    {
                        // Add Response
                    }
                    else
                    {
                        simulator.team(elt, results.team1,results.team2);

                    }
                };
                async.parallel(parallel_tasks,onFinish);

            };
           docs.forEach(simulate_match);
        }
    };
    simulator.todaysMatches(matchGenerator);
};