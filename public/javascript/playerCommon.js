/* off-canvas sidebar toggle */
/*
 $('[data-toggle=offcanvas]').click(function() {
 $(this).toggleClass('visible-xs text-center');
 $(this).find('i').toggleClass('glyphicon-chevron-right glyphicon-chevron-left');
 $('.row-offcanvas').toggleClass('active');
 $('#lg-menu').toggleClass('hidden-xs').toggleClass('visible-xs');
 $('#xs-menu').toggleClass('visible-xs').toggleClass('hidden-xs');
 $('#btnShow').toggle();
 });*/


function toggleSidenav() {
    $("#sidenav").toggleClass("hidden-xs");
    //$("#main-content").toggleClass("col-xs-12");
    //$("#main-content").toggleClass("col-xs-7");
    $("#main-content").toggleClass("col-xs-offset-4");
}

(function () {
    $("#top-navigation").load("/html/playerNavbar.html");
})();