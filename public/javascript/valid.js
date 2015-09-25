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
function validator() {
    var display = "Error:\n";
    var team_name = document.signin.team_name;
    var pass = document.signin.password;
    var cpass = document.signin.confirm_password;
    var email1 = document.signin.email;
    var mob1 = document.signin.phone;
    var manager1 = document.signin.manager_name;

    var i = 0;
    if (team_name.value.length == 0)
    {
        i++;
        team_name.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Enter Team Name.\n";
    }
    else if (team_name.value.length > 25)
    {
        i++;
        team_name.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Team Name is too long. Maximum 25 Character.\n";
    }
    if (pass.value.length == 0)
    {
        i++;
        pass.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Enter Password.\n";
    }
    if (pass.value.length < 8 && pass.value.length != 0)
    {
        i++;
        display += i.toString() + ". Password too short. Minimum 8 characters.\n";
    }
    if (cpass.value.length == 0)
    {
        i++;
        cpass.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Enter Confirm Password.\n";
    }
    if (email1.value.length == 0)
    {
        i++;
        email1.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Enter Email 1.\n";
    }
    if (mob1.value.length == 0)
    {
        i++;
        mob1.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Please enter a mobile number.\n";
    }
    if (manager1.value.length == 0)
    {
        i++;
        manager1.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Enter Manager name.\n";
    }
    if (pass.value != cpass.value)
    {
        i++;
        pass.style.backgroundColor = 'Yellow';
        cpass.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Passwords do not match.\n";
    }
    for (var z = 0; z < mob1.value.length; z++)
    {
        if (isNaN(mob1.value[z]))
        {
            i++;
            mob1.style.backgroundColor = 'Yellow';
            display += i.toString() + ". Enter a valid mobile number.\n";
            break;
        }
    }

    if (display != "Error:\n")
    {
        confirm(display);
        return false;
    }
    else
    {
        document.getElementById("reg").action = "/register";
        document.getElementById("reg").method = "post";
        document.getElementById("reg").submit();
    }
}