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
var days = 100;
var seconds = days * 24 * 60 * 60;
function timePassed()
{
    var minutes = Math.round((seconds - 30) / 60);
    var hours = Math.round((minutes - 30) / 60);
    days = Math.round((hours - 12) / 24);
    var remainingHours = hours % 24;
    var remainingMinutes = minutes % 60;
    var remainingSeconds = seconds % 60;

    if (remainingSeconds < 10)
    {
        remainingSeconds = "0" + remainingSeconds;
    }

    if (remainingMinutes < 10)
    {
        remainingMinutes = "0" + remainingMinutes;
    }

    if (remainingHours < 10)
    {
        remainingHours = "0" + remainingHours;
    }

    document.getElementById('countdowndays').innerHTML = days + "<br>Days";
    document.getElementById('countdownhours').innerHTML = remainingHours + "<br>Hours";
    document.getElementById('countdownminutes').innerHTML = remainingMinutes + "<br>Min";
    document.getElementById('countdownseconds').innerHTML = remainingSeconds + "<br>Sec";

    if (seconds == 0)
    {
        clearInterval(countdownTimer);
        document.getElementById('countdowndays').innerHTML = "Buzz Buzz";
    }
    else
    {
        --seconds;
    }
}

var countdownTimer = setInterval('timePassed()', 1000);