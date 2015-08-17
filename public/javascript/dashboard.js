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

Chart.defaults.global.responsive = true;


var line = $("#line-chart").get(0).getContext("2d");

var line_data = {
    labels: ["1", "2", "3", "4", "5", "6", "7"],
    datasets: [
        {
            label: "Run rate Scored",
            fillColor: "rgba(7, 51, 58,0.2)",
            strokeColor: "transparent",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [16.5, 15.9, 18.0, 18.1, 15.6, 15.5, 14.0]
        },
        {
            label: "Run rate given",
            fillColor: "rgba(19,131,148,0.2)",
            strokeColor: "transparent",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: [21.8, 14.8, 14.0, 11.9, 18.6, 12.7, 19.0]
        }
    ]
};


var myLineChart = new Chart(line).Line(line_data, {scaleShowGridLines: false});


var bar = $("#bar-chart").get(0).getContext("2d");

var bar_data = {
    labels: ["1", "2", "3", "4", "5", "6", "7"],
    datasets: [
        {
            label: "Runs scored",
            fillColor: "rgba(7, 51, 58,0.2)",
            strokeColor: "transparent",
            highlightFill: "rgba(220,220,220,1)",
            highlightStroke: "transparent",
            data: [165, 159, 180, 181, 156, 155, 140]
        },
        {
            label: "Runs given",
            fillColor: "rgba(19,131,148,0.2)",
            strokeColor: "transparent",
            highlightFill: "rgba(151,187,205,1)",
            highlightStroke: "transparent",
            data: [128, 248, 140, 319, 286, 217, 190]
        }
    ]
};

var myBarChart = new Chart(bar).Bar(bar_data, {scaleShowGridLines: false});


var winloss = $("#win-loss").get(0).getContext("2d");

var winloss_data = {
    labels: ["1", "2", "3", "4", "5", "6", "7"],
    datasets: [
        {
            label: "Points",
            fillColor: "rgba(19,131,148,0.2)",
            strokeColor: "transparent",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [1, 2, 2, 2.5, 2.5, 3.5, 4]
        }
    ]
};


var myLineChart2 = new Chart(winloss).Line(winloss_data, {bezierCurveTension: 0, scaleShowGridLines: false});


var pie = $("#pie-chart").get(0).getContext("2d");

var pie_data = [
    {
        value: 38,
        color: "rgba(7, 51, 58,0.2)",
        highlight: "rgba(7, 51, 58,0.5)",
        label: "Fours"
    },
    {
        value: 25,
        color: "rgba(19,131,148,0.2)",
        highlight: "rgba(19,131,148,0.5)",
        label: "Sixes"
    }
];

var myPieChart = new Chart(pie).Pie(pie_data);


function toggleSidenav() {
    $("#sidenav").toggleClass("hidden-xs");
    //$("#main-content").toggleClass("col-xs-12");
    //$("#main-content").toggleClass("col-xs-7");
    $("#main-content").toggleClass("col-xs-offset-4");
}






