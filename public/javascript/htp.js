var i = 0;
var menu = ["htp/Abt.html", "htp/Createteam.html", "htp/SelXI.html", "htp/EP.html", "htp/MS.html", "htp/League.html", "htp/Win.html", "htp/FAQ.html"];
function ch(i) {

    document.getElementById("frlnk").src = menu[i];
    document.getElementById("temp").id = "nottemp";
    document.getElementsByName(i.toString())[0].id = "temp";

}