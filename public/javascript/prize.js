var i = 0;
var menu = ["prize/priz.html", "prize/htw.html"];
function ch(i) {

    document.getElementById("frlnk").src = menu[i];
    document.getElementById("temp").id = "nottemp";
    document.getElementsByName(i.toString())[0].id = "temp";

}