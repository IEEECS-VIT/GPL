/**
 * Created by user on 9/11/2015.
 */
$(document).ready(function () {
    $('.accordion-section-content').hide();
    $('.accordion-section-title').on("click", function () {
        var current = $(this).attr('href');
        $(current).slideToggle();
        var player_id = current.substr(1);
        var h = $("#box" + player_id).css("height");
        if (h === '80px')
            $("#box" + player_id).animate({'height': '60px'});
        else
            $("#box" + player_id).animate({'height': '80px'});
    });
});
