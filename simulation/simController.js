/**
 * Created by Kashish Singhal <singhal2.kashish@gmail.com> on 21/8/14.
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
                        simulator.team(results.team1,results.team2);

                    }
                };
                async.parallel(parallel_tasks,onFinish);

            };
           docs.forEach(simulate_match);
        }
    };
    simulator.todaysMatches(matchGenerator);
};