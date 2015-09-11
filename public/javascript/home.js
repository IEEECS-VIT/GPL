/**
 * Created by user on 9/11/2015.
 */
$(document).ready(function(){
   $('.accordion-section-content').hide();
    var current= $('.player-name.accordion-section-title').attr('href');
    $('.accordion-section-title ').on("click",function(){
        $(".accordion-section-content").slideToggle();
        var h= $(".player").css("height");
        if(h=='80px')
            $(".player").animate({'height':'60px'});
        else
            $(".player").animate({'height':'80px'});
    });
});
