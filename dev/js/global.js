'use strict';

$(function() {

  $('.modal').modal({
    starting_top: '15%',
    ending_top: '15%'
  });

  $('.page-scroll').click(function(e) {
    e.preventDefault();
    $('.button-collapse').sideNav('hide');
    var toName = $(this).attr('href');
    $.scrollTo($(toName), 800, {offset: -70});
  });

  $('.side-nav-hide').click(function() {
    $('.button-collapse').sideNav('hide');
  });

});
