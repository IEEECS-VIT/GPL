/**
 * Created by user on 5/1/2015.
 */
var days=100;
var seconds = days*24*60*60;
function timePassed() {
    var minutes = Math.round((seconds-30)/60);
    var hours = Math.round((minutes-30)/60);
    days = Math.round((hours-12)/24);
    var remainingHours = hours%24;
    var remainingMinutes = minutes%60;
    var remainingSeconds = seconds % 60;
    if (remainingSeconds < 10) {
        remainingSeconds = "0" + remainingSeconds;
    }
    if(remainingMinutes<10)
    {
        remainingMinutes = "0"+remainingMinutes;
    }
    if(remainingHours<10){
        remainingHours = "0"+remainingHours;
    }
    document.getElementById('countdowndays').innerHTML = days+"<br>Days";
    document.getElementById('countdownhours').innerHTML = remainingHours+"<br>Hours";
    document.getElementById('countdownminutes').innerHTML = remainingMinutes+"<br>Min";
    document.getElementById('countdownseconds').innerHTML = remainingSeconds+"<br>Sec";
    if (seconds == 0) {
        clearInterval(countdownTimer);
        document.getElementById('countdowndays').innerHTML = "Buzz Buzz";
    } else {
        seconds--;
    }
}

var countdownTimer = setInterval('timePassed()', 1000);/**
 * Created by pc on 03-05-2015.
 */