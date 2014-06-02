var i =0;
var menu = ["RS/Scom.html","RS/Score.html","RS/ChngSqd.html"];
function ch(i)
{

document.getElementById("frlnk").src = menu[i];
document.getElementById("temp").id = "nottemp";
document.getElementsByName(i.toString())[0].id = "temp";

}