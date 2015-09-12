

function toggleSidenav() {
    $("#sidenav").toggleClass("hidden-xs");
    //$("#main-content").toggleClass("col-xs-12");
    //$("#main-content").toggleClass("col-xs-7");
    $("#main-content").toggleClass("col-xs-offset-4");
}

(function () {
    $("#top-navigation").load("/html/playerNavbar.html");
})();
