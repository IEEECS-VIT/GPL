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
var msg = document.getElementById('msg');
var button = document.getElementById('submit');
var elem = document.getElementsByName('team')[0];

elem.addEventListener('blur', function(){
    if(this.value)
    {
        $.get('api/check/' + this.value, function(result){ // Switch to .load when custom error placeholder has been constructed
            button.disabled = !result;
            msg.style.display = result ? 'none' : 'block';
            elem.style.borderColor = result ? '' : 'red';
        });
    }
}, false);

function validator()
{
    return document.getElementById('pass').value === document.getElementById('cpass').value;
}