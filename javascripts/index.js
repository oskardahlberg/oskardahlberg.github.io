$(function () {
  $('#app').removeClass('loading');
  $('#app').toggleClass('intro', $(window).scrollTop() == 0);
  $('#app').toggleClass('reading', $(window).scrollTop() > 0);

  $(window).on('scroll', function () {
    $('#app').toggleClass('intro', $(window).scrollTop() == 0);
    $('#app').toggleClass('reading', $(window).scrollTop() > 0);
  });

  $('a[href^="#"]').on('click', function (event) {
    event.preventDefault();
    $(this).blur();

    var id = this.hash;
    var element = $(id);
    $('html, body').stop().animate({
      scrollTop: element.length > 0 ? element.offset().top : 0
    }, 250, 'swing', function () {
      window.location.hash = id;
    });
  });
});