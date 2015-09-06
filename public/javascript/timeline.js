$(document).ready(function () {
    $(".timeline").hide();
    $("#head1").on("click", function () {
        $("#timeline1").slideToggle(500);
        $("#timeline2").hide(500);
    });
    $("#head2").on("click", function () {
        $("#timeline2").slideToggle(500);
        $("#timeline1").hide(500);
    })
});
