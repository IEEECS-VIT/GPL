//Validator

function valid() {
    // document.getElementById("button").className='button disabled';

    var team_name = document.getElementsByName('team_name').value;
    var pass = document.getElementsByName('pass').value;
    var cpass = document.getElementsByName('cpass').value;
    var email1 = document.getElementsByName('email1').value;
    var mob1 = document.getElementsByName('mob1').value;
    var manager1 = document.getElementsByName('manager1').value;
    document.getElementById('fill').style.display = 'none';
    document.getElementById('cpass').style.display = 'none';

}