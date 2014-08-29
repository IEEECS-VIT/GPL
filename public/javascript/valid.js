function validator() {
    var display = "Error:\n";
    var team_name = document.signin.team_name;
    var pass = document.signin.pass;
    var cpass = document.signin.cpass;
    var email1 = document.signin.email1;
    var mob1 = document.signin.mob1;
    var manager1 = document.signin.manager1;

    var i = 0;
    if (team_name.value.length == 0/*||pass.value.length == 0|| cpass.value.length==0||email1.value.length==0||mob1.value.length==0||manager1.value.length==0*/) {
        i++;
        team_name.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Enter Team Name.\n";
    }
    if (pass.value.length == 0) {
        i++;
        pass.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Enter Password.\n";
    }
    if (pass.value.length < 8 && pass.value.length != 0) {
        i++;
        display += i.toString() + ". Password too short.\n";
    }
    if (cpass.value.length == 0) {
        i++;
        cpass.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Enter Confirm Password.\n";
    }
    if (email1.value.length == 0) {
        i++;
        email1.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Enter Email 1.\n";
    }
    if (mob1.value.length == 0) {
        i++;
        mob1.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Please enter a mobile number.\n";
    }
    if (manager1.value.length == 0) {
        i++;
        manager1.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Enter Manager name.\n";
    }
    if (pass.value != cpass.value) {
        i++;
        pass.style.backgroundColor = 'Yellow';
        cpass.style.backgroundColor = 'Yellow';
        display += i.toString() + ". Password and confirm password do not match.\n";
    }
    for (var z = 0; z < mob1.value.length; z++) {
        if (isNaN(mob1.value[z])) {
            i++;
            mob1.style.backgroundColor = 'Yellow';
            display += i.toString() + ". Enter a valid mobile number.\n";
            break;
        }
    }


    if (display.localeCompare("Error:\n") == 0) {
        document.getElementById("reg").action = "/register";
        document.getElementById("reg").method = "post";

        document.getElementById("reg").submit();


    } else {
        alert(display);
        return false;

    }

}
