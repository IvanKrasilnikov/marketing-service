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

/*** NEXT BLOCK ***/

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// *** ES6 ***
"use strict";

},{}]},{},[1]);

/*** NEXT BLOCK ***/

// .side-nav
$('.button-collapse').sideNav();

/*** NEXT BLOCK ***/

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
