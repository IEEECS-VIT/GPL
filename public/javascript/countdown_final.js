/**
 * Created by Shivam Mathur on 09-05-2015.
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
const d_hour = 24,h_min = 60,m_sec = 60;
var m_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function get_time() {
    var current = new Date;
    var month = current.getMonth();
    var date = current.getDate();
    var hour = current.getHours();
    var mins = current.getMinutes();
    var sec = current.getSeconds();
    var days = 0;
    for (var i = 0; i < month; i++) {
        days += m_days[i];
    }
    return days * d_hour * h_min * m_sec + date * d_hour * h_min * m_sec + hour * h_min * m_sec + mins * m_sec + sec;

}

function countdown(){
    var time = function(){};
    var month = 9; //final month
    var date = 1; //final date
    var hour = 0;//final hour 0-23
    var mins = 0;//final minutes
    var sec = 0;//final seconds
    var days = 0; //total days left
    var temp;//To manage decimals e.g days = 100.3, above .5 decimal value results in negative deadline using Math.round()
            // Math.round(0.5) = 1 .
    for (var i = 0; i < month-1; i++) {
        days += m_days[i];
    }
    var time_deadline = days * d_hour * h_min * m_sec + date * d_hour * h_min * m_sec + hour * h_min * m_sec + mins * m_sec + sec;
    var deadline = time_deadline - get_time();
    time.deadline = deadline;
    temp = ((deadline /(d_hour * h_min * m_sec))*10)%10;
    time.days = deadline /(d_hour * h_min * m_sec) - temp/10;
    deadline -= time.days* d_hour * h_min * m_sec;
    temp = ((deadline /(h_min * m_sec))*10)%10;
    time.hour = deadline /(h_min * m_sec) - temp/10;
    deadline -= time.hour * h_min * m_sec;
    temp = ((deadline /( m_sec))*10)%10;
    time.mins = (deadline /(m_sec)) - temp/10;
    deadline -= time.mins * m_sec;
    time.sec = deadline;
    return time;
}
function start(){
    var clear = countdown.deadline;
    var d = document.getElementById('countdowndays'),
        h = document.getElementById('countdownhours'),
        m = document.getElementById('countdownminutes'),
        s = document.getElementById('countdownseconds');
    counter(d,h,m,s);
    var a = setInterval(function(){counter(d,h,m,s);},1000);
    if(clear == 0)
        clearInterval(a);
}
function counter(d,h,m,s){
    var time  = countdown();
    d.innerHTML = Math.round(time.days) +"<br>Days";
    h.innerHTML = Math.round(time.hour)+"<br>Hours";
    m.innerHTML = Math.round(time.mins)+"<br>Min";
    s.innerHTML = Math.round(time.sec)+"<br>Sec";

}