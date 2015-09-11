/**
 * Created by user on 9/11/2015.
 */
$(document).ready(function () {
    $('.accordion-section-content').hide();
    $('.accordion-section-title').on("click", function () {
        var current = $(this).attr('href');
        $(current).slideToggle();
        /*
        var h = $("#box" + player_id).css("min-height");
        if (h === '80px')
            $("#box" + player_id).animate({'min-height': '60px'});
        else
            $("#box" + player_id).animate({'min-height': '80px'});*/
    });
});
