var i =0;
var menu = ["Media/bat.html","Media/bowl.html","Media/all.html","Media/coaches.html"];
function ch(i)
{

document.getElementById("frlnk").src = menu[i];
document.getElementById("temp").id = "nottemp";
document.getElementsByName(i.toString())[0].id = "temp";

}