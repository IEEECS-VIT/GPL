/**
 * Created by Kashish Singhal <singhal2.kashish@gmail.com> on 21/8/14.
 */

var simulator = require('./simulation.js');
var mongoTeam = require('./mongoTeam.js');
var team1,team2;
function generateMatch()
{
    var matchGenerator = function(err,docs)
    {
        if(err)
        {
            throw err;
        }
        else
        {
            for( var i=0; i<docs.length;i++)
            {
                var team1_name = docs[i].team_1;
                var team2_name = docs[i].team_2;

                var onFetch1 = function(err,document)
                {
                    if(err)
                    {
                        throw err
                    }
                    else
                    {
                        team1=document;
                    }
                };
                var onFetch2 = function(err,document)
                {
                    if(err)
                    {
                        throw err
                    }
                    else
                    {
                        team2=document;
                    }
                };
                var doc1 = {
                    "_id" : team1_name
                };
                var doc2 = {
                    "_id" : team2_name
                };
                mongoTeam.getTeam(doc1,onFetch1);
                mongoTeam.getTeam(doc2,onFetch2);
                simulator.team(team1,team2);
            }
        }
    };
    simulator.todaysMatches(matchGenerator);
}
