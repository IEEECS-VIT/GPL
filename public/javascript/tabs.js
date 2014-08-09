var a = 0;
var b = "";
var x = 1;
function tab(a) {
    if (x == 1) {
        document.getElementById('act1').className = "tab-title";
        document.getElementById('act1').id = 'noact1';
        document.getElementById('panel1').className = 'content';
    } else if (x == 2) {
        document.getElementById('act2').className = "tab-title";
        document.getElementById('act2').id = 'noact2';
        document.getElementById('panel2').className = 'content';
    } else if (x == 3) {
        document.getElementById('act3').className = "tab-title";
        document.getElementById('act3').id = 'noact3';
        document.getElementById('panel3').className = 'content';
    } else if (x == 4) {
        document.getElementById('act4').className = "tab-title";
        document.getElementById('act4').id = 'noact4';
        document.getElementById('panel4').className = 'content';
    }


    b = a.toString();
    document.getElementById('noact' + b).id = 'act' + b;
    document.getElementById('act' + b).className = "tab-title active";


    document.getElementById('panel' + b).className = "content active";
    x = a;

}
