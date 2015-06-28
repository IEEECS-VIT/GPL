/**
 * Created by Shivam on 19-Aug-14.
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
function valid() {
    var display = "Error:\n";
    var name = document.int.name;
    var email = document.int.email;
    var mob = document.int.mob;
    var i = 0;

    if (name.value.length == 0) {
        i++;
        name.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Enter Name.\n";
    }

    if (email.value.length == 0) {
        i++;
        email.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Enter Email.\n";
    }

    if (mob.value.length < 10) {
        i++;
        mob.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Enter a valid mobile number.\n";
    }

    for (var z = 0; z < mob.value.length; z++) {
        if (isNaN(mob.value[z])) {
            i++;
            mob.style.backgroundColor = 'Yellow';
            display += i.toString() + ". Enter a valid mobile number.\n";
            break;
        }
    }

    if (display != "Error:\n") {
        confirm(display);
        return false;
    }
}