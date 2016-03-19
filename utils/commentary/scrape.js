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

var dump;
var temp;
var index;
var data = '';
var flag = false;
var fs = require('fs');
var http = require('http');
var async = require('async');
var path = require('path').join;
var scrape = require('cheerio').load;
var commentary =
{
    'no run': {content: '', file: path(__dirname, 'score', 'dot2')},
    '1 run': {content: '', file: path(__dirname, 'score', 'one2')},
    '2 runs': {content: '', file: path(__dirname, 'score', 'two')},
    '3 runs': {content: '', file: path(__dirname, 'score', 'three')},
    'FOUR': {content: '', file: path(__dirname, 'score', 'four')},
    'SIX': {content: '', file: path(__dirname, 'score', 'six')},
    'wide': {content: '', file: path(__dirname, 'extra', 'wide')},
    'no ball': {content: '', file: path(__dirname, 'extra', 'freehit')},
    'cnb': {content: '', file: path(__dirname, 'out', 'cnb')},
    'lbw': {content: '', file: path(__dirname, 'out', 'lbw')},
    'caught': {content: '', file: path(__dirname, 'out', 'caught')},
    'bowled': {content: '', file: path(__dirname, 'out', 'bowled')},
    'stumped': {content: '', file: path(__dirname, 'out', 'stumped')},
    'runout': {content: '', file: path(__dirname, 'out', 'runout')}
};
var fun = ['wide'];
var ref = ['FOUR', 'SIX', 'OUT'];
var opts = ['batsman', 'batter', 'striker'];

var rand = function()
{
    return opts[parseInt((Math.random() * 1000000000000000) % 3, 10)];
};
var genericHandler = function(arg)
{
    arg = (arg[0].data || '').replace(/\s$/, '.');
    index = arg.split(', ');
    temp = index[0].split(' to ');
    index[1] = index[1].replace(/^\d?\s?wides?$/, 'wide');
    index[1] = index[1].replace(/^\d?\s?no balls?$/, 'no ball');
    return [
        index[1],
        index.slice(2).join(', ').replace(temp[0], 'the bowler').replace(temp[1], `the ${rand()}`)
    ];
};
var dismissalHandler = function(arg)
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
    return arg;
};
var specialHandler = function(arg)
{
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

    return arg;
};
var processRef =
{
    1:
    {
        true: dismissalHandler,
        false: genericHandler
    },
    3:
    {
        false: specialHandler
    }
};
var processor = function(arg, callback)
{
    arg = processRef[arg.children.length][flag](arg.children);

    if(flag)
    {
        if(arg[0] !== 'OUT')
        {
            commentary[arg[0]].content += '\t\t"' + arg[1] + '",\n';
            flag = false;
        }
        else
        {
            temp = arg[1];
        }
    }
    else if(commentary[arg[0]])
    {
        commentary[arg[0]].content += '\t\t"' + arg[1] + '",\n';
    }

    callback(null);
};
var updateFile = function(arg, callback)
{
    if(commentary[arg].content)
    {
        fs.appendFile(commentary[arg].file + '.js', commentary[arg].content + '\t];', callback); // fix file append bug.
    }
};
var onFinish = function(err)
{
    if(err)
    {
        throw err;
    }

    console.timeEnd('File updation');
};
var onCompile = function(err)
{
    if(err)
    {
        throw err;
    }

    console.timeEnd('Commentary compilation');
    async.each(fun, updateFile, onFinish);
};
var onStitch = function()
{
    console.timeEnd('Data stitching');
    dump = scrape(data, {ignoreWhitespace: true})('.commentary-text').children('p').toArray();
    console.timeEnd('DOM construction');
    async.each(dump, processor, onCompile);
};

http.get('http://www.espncricinfo.com/australia-v-india-2015-16/engine/match/895817.html?innings=1;view=commentary', // needs work
(res) => {
    console.timeEnd('Request');
    res.on('data',(chunk) => {data += chunk;});

    res.on('end', onStitch);
});
