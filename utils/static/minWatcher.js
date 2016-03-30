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

console.time('watch');

if(process.env.NODE_ENV)
{
    throw 'This task may not be performed on production environments.';
}

var fs = require('fs');
var line = require('os').EOL;
var dir = [__dirname, '..', '..', '.idea'];
var path = require('path').join;
var scopeData;
fs.createReadStream('watcherTasks.xml').pipe(fs.createWriteStream(path(...dir, 'watcherTasks.xml')));

fs.readFile(path(...dir, '.name'), function(err, data){
    if(err)
    {
        throw err;
    }
    scopeData =
    `  <component name="NameScopedManager">${line}` +
    `    <scope name="Public JS" pattern="file[${data}]:public/javascripts//*&amp;&amp;!file[${data}]:public/javascripts/min//*" />${line}` +
    `    <scope name="Public CSS" pattern="file[${data}]:public/stylesheets//*&amp;&amp;!file[${data}]:public/stylesheets/min//*" />${line}` +
    `  </component>${line}` +
    '</project>';

    fs.stat(path(...dir, 'workspace.xml'), function(error, res){
        if(error)
        {
            throw error;
        }

        fs.createWriteStream(path(__dirname, ...dir, 'workspace.xml'), {flags: 'r+', start: res.size - 10 - line.length}).end(scopeData);
        console.timeEnd('mark');
    });
});
