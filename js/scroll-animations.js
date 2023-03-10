$(document).ready(function () {
  var scrollTop = 0;
  $(window).scroll(function () {
    scrollTop = $(window).scrollTop();
    $('.counter').html(scrollTop);

    if (scrollTop >= 50) {
      $('#global-nav').addClass('scrolled-nav');
    } else if (scrollTop < 50) {
      $('#global-nav').removeClass('scrolled-nav');
    }

  });

});


$(window).bind("mousewheel", function () {
  $("html, body").stop();
});




