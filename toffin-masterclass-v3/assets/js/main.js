
(function(module, exports) {

var _Swiper;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Timer Plugin Start  http://hilios.github.io/jQuery.countdown/
$('#clock').countdown('2050/10/10', function (event) {
  $('#days').html(event.strftime('%D'));
  $('#hours').html(event.strftime('%H'));
  $('#minutes').html(event.strftime('%M'));
  $('#seconds').html(event.strftime('%S'));
});
$('[data-countdown]').each(function () {
  var $this = $(this),
      finalDate = $(this).data('countdown');
  $this.countdown(finalDate, function (event) {
    $this.html(event.strftime('%H : %M : %S'));
  });
}); // Timer Plugin End  http://hilios.github.io/jQuery.countdown/
// Tilt.js Plugin Start  https://gijsroge.github.io/tilt.js/

$('.img-tilt').tilt({
  maxTilt: 5,
  glare: true,
  maxGlare: .5
}); // Tilt.js Plugin End  https://gijsroge.github.io/tilt.js/
// Owl-carousel Plugin Start  https://owlcarousel2.github.io/OwlCarousel2/

$('#live-auctions').owlCarousel({
  loop: false,
  margin: 24,
  dots: false,
  autoplay: false,
  nav: true,
  navText: ["<img src='/assets/img/svg/ArrowRight.svg'>", "<img src='/assets/img/svg/ArrowLeft.svg'>"],
  responsive: {
    0: {
      items: 1,
      nav: false,
      dots: true
    },
    575: {
      items: 2
    },
    992: {
      items: 3
    },
    1300: {
      items: 4
    }
  }
});
$('#inner-page-1').owlCarousel({
  loop: false,
  margin: 24,
  dots: false,
  autoplay: false,
  nav: true,
  navText: ["<img src='/assets/img/svg/ArrowRight.svg'>", "<img src='/assets/img/svg/ArrowLeft.svg'>"],
  responsive: {
    0: {
      items: 1,
      nav: false,
      dots: true
    },
    575: {
      items: 2
    },
    992: {
      items: 3
    },
    1300: {
      items: 4
    }
  }
});
$('#inner-page-2').owlCarousel({
  loop: false,
  margin: 24,
  dots: false,
  autoplay: false,
  nav: true,
  navText: ["<img src='/assets/img/svg/ArrowRight.svg'>", "<img src='/assets/img/svg/ArrowLeft.svg'>"],
  responsive: {
    0: {
      items: 1,
      nav: false,
      dots: true
    },
    575: {
      items: 2
    },
    992: {
      items: 3
    },
    1300: {
      items: 4
    }
  }
});
$('#popular-artwork').owlCarousel({
  loop: false,
  margin: 24,
  dots: false,
  autoplay: false,
  nav: true,
  navText: ["<img src='/assets/img/svg/ArrowRight.svg'>", "<img src='/assets/img/svg/ArrowLeft.svg'>"],
  responsive: {
    0: {
      items: 1,
      nav: false,
      dots: true
    },
    575: {
      items: 1
    },
    768: {
      items: 1
    },
    992: {
      items: 2
    },
    1100: {
      items: 2
    },
    1200: {
      items: 3
    }
  }
});
$('#popular-collection-home2').owlCarousel({
  loop: false,
  margin: 24,
  dots: false,
  autoplay: false,
  nav: true,
  navText: ["<img src='/assets/img/svg/ArrowRight.svg'>", "<img src='/assets/img/svg/ArrowLeft.svg'>"],
  responsive: {
    0: {
      items: 1,
      nav: false,
      dots: true
    },
    575: {
      items: 2
    },
    768: {
      items: 2
    },
    992: {
      items: 3
    },
    1000: {
      items: 3
    },
    1200: {
      items: 4
    }
  }
});
$('#hero5-carousel').owlCarousel({
  loop: true,
  margin: 24,
  dots: false,
  autoplay: true,
  autoWidth: true,
  navText: ["<img src='/assets/img/svg/ArrowRightWhite.svg'>", "<img src='/assets/img/svg/ArrowLeftWhite.svg'>"],
  responsive: {
    0: {
      center: true,
      nav: false
    },
    420: {
      center: true,
      nav: true
    },
    992: {
      center: false,
      rtl: true,
      nav: true
    }
  }
}); // Owl-carousel Plugin Start  https://owlcarousel2.github.io/OwlCarousel2/
// Site Lodaer https://usablica.github.io/progress.js/

progressJs().setOptions({
  overlayMode: true,
  theme: 'blueOverlay'
}).start().autoIncrease(4, 500);

if (window.attachEvent) {
  window.attachEvent('onload', function () {
    progressJs().end();
  });
} else {
  if (window.onload) {
    var curronload = window.onload;

    var newonload = function newonload() {
      curronload();
      progressJs().end();
    };

    window.onload = newonload;
  } else {
    window.onload = function () {
      progressJs().end();
    };
  }
}

$(window).on('load', function () {
  $('.loader').fadeOut();
}); // Site Lodaer https://usablica.github.io/progress.js/
// clicks

$(document).ready(function () {
  $(".unlock").click(function () {
    $('.unlock-input-otr').toggleClass("input-active");
  });
});
$(document).ready(function () {
  $(function () {
    // create an empty variable
    var selectedClass = ""; // call function when item is clicked

    $(".nav-item").click(function () {
      // assigns class to selected item
      selectedClass = $(this).attr("data-rel"); // fades out all portfolio items

      $(".portfolio li").fadeOut(0); // fades in selected category

      $(".portfolio li." + selectedClass).delay(0).fadeIn(0);
    });
  });
  $(document).ready(function () {
    $(".nav-item").click(function () {
      $(".nav-item").removeClass("active");
      $(this).addClass("active");
    });
  });
});
$(document).ready(function () {
  $(".heart-icon").click(function () {
    $(this).toggleClass("selected");
  });
});
$(document).ready(function () {
  $(".burger-icon").click(function () {
    $(".modal-content-custom").addClass("active");
  });
  $(".icon-close").click(function () {
    $(".modal-content-custom").removeClass("active");
  });
  $(".burger-icon").click(function () {
    $(".overlay-content-otr").addClass("active-overlay-content-otr");
  });
  $(".icon-close").click(function () {
    $(".overlay-content-otr").removeClass("active-overlay-content-otr");
  });
});
$(document).ready(function () {
  $(".burger-icon").click(function () {
    $(".modal-content-custom").addClass("active");
  });
  $(".icon-close").click(function () {
    $(".modal-content-custom").removeClass("active");
  });
  $(".burger-icon").click(function () {
    $(".overlay-content-otr-dark").addClass("active-overlay-content-otr");
  });
  $(".icon-close").click(function () {
    $(".overlay-content-otr-dark").removeClass("active-overlay-content-otr");
  });
});
$(document).ready(function () {
  $(".language-a").click(function () {
    $(".drop-ul").toggleClass("block");
  });
});
$(document).ready(function () {
  $(".icon-share").click(function () {
    $(".share-hover").toggleClass("block-3");
  });
});
$(document).ready(function () {
  $(".click-open3").click(function () {
    $(".click-event3").toggleClass("displayblock");
    $(".click-event2").removeClass("displayblock");
    $(".click-event1").removeClass("displayblock");
  });
  $(".click-open2").click(function () {
    $(".click-event2").toggleClass("displayblock");
    $(".click-event3").removeClass("displayblock");
    $(".click-event1").removeClass("displayblock");
  });
  $(".click-open1").click(function () {
    $(".click-event1").toggleClass("displayblock");
    $(".click-event2").removeClass("displayblock");
    $(".click-event3").removeClass("displayblock");
  });
  $(".burger-click").click(function () {
    $(".click-event1").removeClass("displayblock");
    $(".click-event2").removeClass("displayblock");
    $(".click-event3").removeClass("displayblock");
  });
});
$(document).ready(function () {
  $(".btn-1").click(function () {
    $(".filter-1").toggleClass("filter-active");
  });
  $(".btn-2").click(function () {
    $(".filter-2").toggleClass("filter-active");
  });
  $(".btn-3").click(function () {
    $(".filter-3").toggleClass("filter-active");
  });
  $(".btn-4").click(function () {
    $(".filter-4").toggleClass("filter-active");
  });
  $(".btn-5").click(function () {
    $(".filter-5").toggleClass("filter-active");
  });
  $(".btn-6").click(function () {
    $(".filter-6").toggleClass("filter-active");
  });
  $(".btn-7").click(function () {
    $(".filter-7").toggleClass("filter-active");
  });
  $(".btn-8").click(function () {
    $(".filter-8").toggleClass("filter-active");
  });
  $(".btn-9").click(function () {
    $(".filter-9").toggleClass("filter-active");
  });
  $(".clear-filter").click(function () {
    $(".button").removeClass("filter-active");
  });
});
$(document).ready(function () {
  $(".box-2").click(function () {
    $(".box-2").toggleClass("active-border");
    $(".box-3").removeClass("active-border");
    $(".box-4").removeClass("active-border");
  });
  $(".box-3").click(function () {
    $(".box-3").toggleClass("active-border");
    $(".box-2").removeClass("active-border");
    $(".box-4").removeClass("active-border");
  });
  $(".box-4").click(function () {
    $(".box-4").toggleClass("active-border");
    $(".box-3").removeClass("active-border");
    $(".box-2").removeClass("active-border");
  });
});
$(document).ready(function () {
  $(".home").click(function () {
    $(".drop-1").slideToggle(400);
  });
  $(".explore").click(function () {
    $(".drop-2").slideToggle(400);
  });
  $(".pages").click(function () {
    $(".drop-3").slideToggle(400);
  });
  $(".other-pages").click(function () {
    $(".drop-4").slideToggle(400);
  });
  $(".community").click(function () {
    $(".drop-5").slideToggle(400);
  });
  $(".nav-a").click(function () {
    $(".nav-a").removeClass("active-nav");
    $(this).addClass("active-nav");
  });
}); // clicks
// Tabs Start Here

$('.tab-link').click(function () {
  var tabID = $(this).attr('data-tab');
  $(this).addClass('active').siblings().removeClass('active');
  $('#tab-' + tabID).addClass('active').siblings().removeClass('active');
});
$('.tab-link-work').click(function () {
  var tabID = $(this).attr('data-tab');
  $(this).addClass('active').siblings().removeClass('active');
  $('#tab-' + tabID).addClass('active').siblings().removeClass('active');
}); // Tabs End Here
// Select Start Here

$('select').each(function () {
  var $this = $(this),
      numberOfOptions = $(this).children('option').length;
  $this.addClass('select-hidden');
  $this.wrap('<div class="select"></div>');
  $this.after('<div class="select-styled"></div>');
  var $styledSelect = $this.next('div.select-styled');
  $styledSelect.text($this.children('option').eq(0).text());
  var $list = $('<ul />', {
    'class': 'select-options'
  }).insertAfter($styledSelect);

  for (var i = 0; i < numberOfOptions; i++) {
    $('<li />', {
      text: $this.children('option').eq(i).text(),
      rel: $this.children('option').eq(i).val()
    }).appendTo($list);
  }

  var $listItems = $list.children('li');
  $styledSelect.click(function (e) {
    e.stopPropagation();
    $('div.select-styled.active').not(this).each(function () {
      $(this).removeClass('active').next('ul.select-options').hide();
    });
    $(this).toggleClass('active').next('ul.select-options').toggle();
  });
  $listItems.click(function (e) {
    e.stopPropagation();
    $styledSelect.text($(this).text()).removeClass('active');
    $this.val($(this).attr('rel'));
    $list.hide(); //console.log($this.val());
  });
  $(document).click(function () {
    $styledSelect.removeClass('active');
    $list.hide();
  });
}); // Select End Here
// Swiper One Hero Start here

var swiper = new Swiper("#Swiper1", (_Swiper = {
  spaceBetween: 24,
  loop: true,
  autoplay: true,
  speed: 1000,
  slidesPerView: 3
}, _defineProperty(_Swiper, "autoplay", {
  delay: 1000,
  disableOnInteraction: false,
  stopOnLast: false
}), _defineProperty(_Swiper, "breakpoints", {
  0: {
    slidesPerView: 1
  },
  575: {
    slidesPerView: 2
  },
  768: {
    slidesPerView: 2
  },
  992: {
    slidesPerView: 3
  }
}), _Swiper)); // // Swiper One Hero end here
// // Swiper four Hero Start here

var swiper4 = new Swiper("#swiper4", _defineProperty({
  effect: "cards",
  grabCursor: true,
  loop: true,
  autoplay: true
}, "autoplay", {
  delay: 1000,
  disableOnInteraction: false,
  stopOnLast: false
})); // // Swiper four Hero end here
// // Swiper five Hero Start here

var swiper5 = new Swiper("#hero4-slide2", {
  spaceBetween: 24,
  slidesPerView: 3,
  freeMode: true,
  watchSlidesProgress: true
});
var swiper6 = new Swiper("#hero4-slide1", {
  spaceBetween: 24,
  thumbs: {
    swiper: swiper5
  }
}); // Swiper five Hero end here

});


