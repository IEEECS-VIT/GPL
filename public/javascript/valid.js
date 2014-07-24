//Validator

function valid() {
    // document.getElementById("button").className='button disabled';

    var team_name = document.forms['signup']['team_name'].value;
    var pass = document.forms['signup']['pass'].value;
    var cpass = document.forms['signup']['cpass'].value;
    var email1 = document.forms['signup']['email1'].value;
    var mob1 = document.forms['signup']['mob1'].value;
    var manager1 = document.forms['signup']['manager1'].value;
    if (team_name.length != 0 || pass.length != 0 || cpass.length != 0 || email1.length != 0 || mob1.length != 0 || manager1.length != 0) {
        document.getElementById('button').className = 'button';
    }
}