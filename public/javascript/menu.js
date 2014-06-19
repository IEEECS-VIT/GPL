var i = 0;

function ch(i) {
    var j = i.toString() + "0";
    document.getElementById("dis").id = "nodis";
    document.getElementById("temp").id = "nottemp";
    document.getElementsByName(i.toString())[0].id = "temp";
    document.getElementsByName(j)[0].id = "dis";
}