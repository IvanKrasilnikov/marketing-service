// .to-home
visibleToTop();

$(document).scroll(function() {
  visibleToTop()
});

function visibleToTop() {
  if (window.pageYOffset > document.documentElement.clientHeight) {
    $('.to-home').fadeIn(400);
  } else {
    $('.to-home').fadeOut(400);
  }
}

$('#toHome').click(function() {
  $('html, body').animate({scrollTop: 0}, 800);
});
