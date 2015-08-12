$("#navbar").load("/html/navbar.html");
$("#footer").load("/html/footer.html");

$(document).ready(function () {

 	sticky_nav = function() {


    var calculated_offset = 0;
        calculated_offset = $('#navbar').offset().top;


    console.log(calculated_offset);
    $('#navbar').affix({
        offset: { top: calculated_offset }
    });
	}
	sticky_nav();
	$(window).on('resize', function(){

	$('#navbar').data('bs.affix').options.offset = $('#navbar').offset().top;
	});

});