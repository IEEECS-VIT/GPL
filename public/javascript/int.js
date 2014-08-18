/**
 * Created by Shivam on 19-Aug-14.
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