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

console.time('Request');
console.time('Data stitching');
console.time('DOM construction');
console.time('Commentary compilation');
console.time('File updation');

var temp;
var index;
var data = '';
var flag = false;
var fs = require('fs');
var path = require('path');
var http = require('http');
var async = require('async');
var scrape = require('cheerio').load;
var consolidated =
{
    'no run': '',
    '1 run': '',
    '2 runs': '',
    '3 runs': '',
    'FOUR': '',
    'SIX': '',
    'wide': '',
    'no ball': '',
    'cnb': '',
    'lbw': '',
    'caught': '',
    'bowled': '',
    'stumped': '',
    'runout': ''
};
var ref = ['FOUR', 'SIX', 'OUT'];
var opts = ['batsman', 'batter', 'striker'];
var fun = ['wide'];
var files =
{
    wide: path.join(__dirname, 'extra', 'wide'), 'no ball': path.join(__dirname, 'extra', 'freehit'),
    bowled: path.join(__dirname, 'out', 'bowled'), caught: path.join(__dirname, 'out', 'caught'), cnb: path.join(__dirname, 'out', 'cnb'),
    lbw: path.join(__dirname, 'out', 'lbw'), runout: path.join(__dirname, 'out', 'runout'), stumped: path.join(__dirname, 'out', 'stumped'),
    'no run': path.join(__dirname, 'score', 'dot2'), one: path.join(__dirname, 'score', 'one2'), two: path.join(__dirname, 'score', 'two'),
    three: path.join(__dirname, 'score', 'three'), FOUR: path.join(__dirname, 'score', 'four'), SIX: path.join(__dirname, 'score', 'six')
};

var rand = function()
{
    return opts[parseInt((Math.random() * 1000000000000000) % 3)];
};

http.get('http://www.espncricinfo.com/australia-v-india-2015-16/engine/match/895817.html?innings=1;view=commentary', // needs work
function (res) {
    console.timeEnd('Request');
    res.on('data',(chunk) => {data += chunk;});

    res.on('end', () => {
        console.timeEnd('Data stitching');
/*
        var commentary = require('cheerio').load(data, {ignoreWhitespace: true})
        ('.commentary-text').children('p').toArray().map((arg) => ([arg.children[0].data, ((arg.children[0].next || {}).children || [{}])[0].data || '', ((arg.children[0].next || {}).next || {}).data || '']));
*/
        var commentary = scrape(data, {ignoreWhitespace: true})('.commentary-text').children('p').toArray();
        console.timeEnd('DOM construction');
        async.each(commentary, (arg, callback) => {
            arg = arg.children;

            switch(arg.length)
            {
                case 1:
                    if (flag)
                    {
                        arg = arg[0].children[0].data;

                        if(arg.indexOf(' c ') > -1)
                        {
                            arg = ['caught'];
                        }
                        else if(arg.indexOf(' b ') > -1)
                        {
                            arg = ['bowled'];
                        }
                        else if(arg.indexOf(' lbw ') > -1)
                        {
                            arg = ['lbw'];
                        }
                        else if(arg.indexOf(' runout ') > -1)
                        {
                            arg = ['runout'];
                        }
                        else if(arg.indexOf(' st ') > -1)
                        {
                            arg = ['stumped'];
                        }
                        else if(arg.indexOf(' cnb ') > -1)
                        {
                            arg = ['cnb'];
                        }

                        arg.push(temp);
                    }
                    else
                    {
                        arg = (arg[0].data || '').replace(/\s$/, '.');
                        index = arg.split(', ');
                        temp = index[0].split(' to ');
                        index[1] = index[1].replace(/^\d?\s?wides?$/, 'wide');
                        index[1] = index[1].replace(/^\d?\s?no balls?$/, 'no ball');
                        arg = [index[1], index.slice(2).join(', ').replace(temp[0], 'the bowler').replace(temp[1], 'the ' + rand())];
                    }

                    break;

                case 3:
                    temp = arg[0].data;
                    temp = temp.slice(0, -2);
                    temp = temp.split(' to ');

                    if(ref.indexOf(arg[1].children[0].data) < 0)
                    {
                        arg[2] = arg[2].data;
                        arg[2].replace(/\s$/, '.');
                        arg[1] = arg[1].children[0].data;
                        temp.splice(1, 1, temp[1].split(', '));
                        temp[0] = [temp[0], temp[1].shift()];
                        arg[2] = arg[2].replace(temp[0][0], 'the bowler');
                        arg[2] = arg[2].replace(temp[0][1], 'the ' + rand());
                        arg = [temp[1][0], arg[1] + arg[2]];
                    }
                    else
                    {
                        arg[1] = arg[1].children[0].data;
                        arg[2] = arg[2].data.slice(2);
                        arg[2].replace(/\s$/, '.');
                        arg[2].replace(temp[0], 'the bowler');
                        arg[2].replace(temp[1], 'the ' + rand());
                        arg = [arg[1], arg[2]];
                        flag = (arg[0] === 'OUT');
                    }

                    break;
            }

            if(flag)
            {
                if(arg[0] !== 'OUT')
                {
                    consolidated[arg[0]] += ',\t\t"' + arg[1] + '"\n';
                    flag = false;
                }
                else
                {
                    temp = arg[1];
                }
            }
            else
            {
                consolidated[arg[0]] += ',\t\t"' + arg[1] + '"\n';
            }

            callback(null);
        }, (err) => {
            if(err)
            {
                console.error(err.message);
            }
            else
            {
                console.timeEnd('Commentary compilation');
                console.log(consolidated);
                async.each(fun, (arg, callback) => {
                        if(consolidated[arg])
                        {
                            fs.appendFile(files[arg] + '.js', '\r' + consolidated[arg] + '\t];', callback); // TODO: fix file append bug.
                        }
                    }, (err) => {
                    if(err)
                    {
                        console.error(err.message);
                    }
                    else
                    {
                        console.timeEnd('File updation');
                    }
                });
            }
        });
    });
});