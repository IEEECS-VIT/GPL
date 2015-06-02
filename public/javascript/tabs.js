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
var a = 0;
var b = "";
var x = 1;
function tab(a)
{
    if (x == 1)
    {
        document.getElementById('act1').className = "tab-title";
        document.getElementById('act1').id = 'noact1';
        document.getElementById('panel1').className = 'content';
    }
    else if (x == 2)
    {
        document.getElementById('act2').className = "tab-title";
        document.getElementById('act2').id = 'noact2';
        document.getElementById('panel2').className = 'content';
    }
    else if (x == 3)
    {
        document.getElementById('act3').className = "tab-title";
        document.getElementById('act3').id = 'noact3';
        document.getElementById('panel3').className = 'content';
    }
    else if (x == 4)
    {
        document.getElementById('act4').className = "tab-title";
        document.getElementById('act4').id = 'noact4';
        document.getElementById('panel4').className = 'content';
    }

    b = a.toString();
    document.getElementById('noact' + b).id = 'act' + b;
    document.getElementById('act' + b).className = "tab-title active";
    document.getElementById('panel' + b).className = "content active";
    x = a;
}
