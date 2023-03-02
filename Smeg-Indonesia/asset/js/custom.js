// MAP EMBED
  // Initialize and add the map
function initMap() {
  // The location of Uluru
  const jakarta = { lat: -6.115535975482703, lng: 106.78665291550949 };
  // The map, centered at Uluru
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: jakarta,
  });
  // The marker, positioned at Uluru
  const marker = new google.maps.Marker({
    position: jakarta,
    map: map,
  });
}
window.initMap = initMap;



$(document).ready(function () {
  var screen = 6;
  if (screen == 6) {
    $(".stk").addClass("mobiler-6");
  }
  if (screen == 5) {
    $(".stk").addClass("mobiler-5");
  }
  if (screen == 4) {
    $(".stk").addClass("mobiler-4");
  }
  if (screen == 3) {
    $(".stk").addClass("mobiler-3");
  }
  if (screen == 2) {
    $(".stk").addClass("mobiler-2");
  }
  if (screen == 1) {
    $(".stk").addClass("mobiler-1");
  }
});



$(document).ready(function () {

  $('.sticky-mo').css("opacity", "1");

  $('#opennav').click(function () {

    $('#mySidenav').removeClass("setwidthclose");
    $('#mySidenav').addClass("setwidthopen");
    // $(".btn-relative").css("position", "unset");
  });
  $('#opennavmobile').click(function () {
    $('#mySidenav').removeClass("setwidthclose");
    $('#mySidenav').addClass("setwidthopen");
    // $(".btn-relative").css("position", "unset");
  });
  $('#closenav').click(function () {
    $('#mySidenav').removeClass("setwidthopen");
    $('#mySidenav').addClass("setwidthclose");
    $(".btn-relative").css("position", "relative");
  });


});
$('.search-product').on('click', function () {
  $('.search-box').css('visibility', 'visible');
  $('#desktop-search').css('display', 'none');
});
$('.search-product-mobile .search-product').on('click', function () {
  $('form#search-mobile').submit();
});

$('#open-serach').on('click', function () {
  $(".search-product-mobile").fadeToggle();
});

function checkValue() {
  var q = $('.search-product-mobile #search-product').val();
  if (q == '') {
    return false;
  }
}



$(document).ready(function () {
  $('.cookies').addClass('activecookies');

  $('.btn-cookies').click(function () {
    $('.cookies').removeClass('activecookies');
    $('.bgcookies').fadeOut();
  })
  $('.xclose').click(function () {
    $('.cookies').removeClass('activecookies');
    $('.bgcookies').fadeOut();
  })
});



var t;
    var start = $('#video-carousel-example').find('.carousel-item.active').attr('data-interval');
    t = setTimeout("$('#video-carousel-example').carousel({interval: 1000});", start - 1000);

    $('#video-carousel-example').on('slid.bs.carousel', function () {
      $(".video-fluid").prop('muted', true);
      $(".video-fluid").attr('data-muted', 'true');
      var text = "<i class='fa fa-volume-off' aria-hidden='true'> </i> OFF";
      $(".button-muted").html(text);
      clearTimeout(t);
      var duration = $(this).find('.carousel-item.active').attr('data-interval');

      $('#video-carousel-example').carousel('pause');
      t = setTimeout("$('#video-carousel-example').carousel();", duration - 1000);
    })

    var t;
    var start = $('#mobile-carousel').find('.carousel-item.active').attr('data-interval');
    t = setTimeout("$('#mobile-carousel').carousel({interval: 1000});", start - 1000);

    $('#mobile-carousel').on('slid.bs.carousel', function () {
      clearTimeout(t);
      var duration = $(this).find('.carousel-item.active').attr('data-interval');

      $('#mobile-carousel').carousel('pause');
      t = setTimeout("$('#mobile-carousel').carousel();", duration - 1000);
    })

    $('.carousel-control-next').on('click', function () {
      clearTimeout(t);
    });

    $('.carousel-control-prev').on('click', function () {
      clearTimeout(t);
    });


    $("#landdingpage .close").click(function () {
      $.ajax({
        type: "POST",
        url: "http://www.smeg.co.th/home/setlannding"
      }).done(function (msg) {});
    });

    $(document).ready(function () {

      if ($('#session_landding').val() == 1 && $('#status_landding').val() == 1) {
        $('#landdingpage').modal('show');
      }

      // sectwo
      $('#sectwo').carousel({
        interval: 3000
      });
      $("#sectwo").swiperight(function () {
        $(this).carousel('prev');
      });
      $("#sectwo").swipeleft(function () {
        $(this).carousel('next');
      });

      // slidenews
      $('#slidenews').carousel({
        interval: 3000
      });
      $("#slidenews").swiperight(function () {
        $(this).carousel('prev');
      });
      $("#slidenews").swipeleft(function () {
        $(this).carousel('next');
      });
      // secsix
      $('#secsix').carousel({
        interval: 3000
      });
      $("#secsix").swiperight(function () {
        $(this).carousel('prev');
      });
      $("#secsix").swipeleft(function () {
        $(this).carousel('next');
      });

      // btnscrolldown
      $('.btnscrolldown').click(function () {
        $('html, body').animate({
          scrollTop: $("div#sectwo").offset().top
        }, 1000)
      });
    });

    function volum(id) {
      var muted = $("#video-background-" + id).attr('data-muted');

      if (muted == "true") {
        $("#video-background-" + id).prop('muted', false);
        $("#video-background-" + id).attr('data-muted', 'false');
        var text = "<i class='fa fa-volume-up' aria-hidden='true'> </i> ON";
        $("#mute-" + id).html(text);
      } else {
        $("#video-background-" + id).prop('muted', true);
        $("#video-background-" + id).attr('data-muted', 'true');
        var text = "<i class='fa fa-volume-off' aria-hidden='true'> </i> OFF";
        $("#mute-" + id).html(text);
      }
    }




    $(function () {
      var urisegone = $('[name=urisegone]').val();
      if (urisegone == "whatinstore") {
        $('#hamone').addClass('hamone');
        $('#cen').addClass('cen');
        $('#hamthree').addClass('hamthree');
      }
      $(document).scroll(function () {
        var ii = 0;
        var $nav = $(".navbar-fixed-top");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());

        var urisegone = $('[name=urisegone]').val();
        if ($(this).scrollTop() > $nav.height()) {
          $('#langna').removeClass('langer');
          $('path,circle').removeClass('st0');
          $('path,circle').addClass('st1');
          if (urisegone == "whatinstore") {
            $('#hamone').removeClass('hamone');
            $('#cen').removeClass('cen');
            $('#hamthree').removeClass('hamthree');
          }
        } else {
          $('#langna').addClass('langer');
          $('path,circle').removeClass('st1');
          $('path,circle').addClass('st0');
          if (urisegone == "whatinstore") {
            $('#hamone').addClass('hamone');
            $('#cen').addClass('cen');
            $('#hamthree').addClass('hamthree');
          }
        }



      });
    });

    $(document).ready(function () {
      //http://www.smeg.co.th/feature/Espressocoffeemachine/17

      $('.detail').slick({
        dots: true,
        infinite: false,
        speed: 300,
        slidesToShow: 4,
        slidesToScroll: 4,
        responsive: [{
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3,
              infinite: true,
              dots: true
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1
            }
          }
        ]
      });

      $('.responsive').not('.slick-initialized').slick({
        dots: false,
        infinite: true,
        speed: 300,
        slidesToShow: 6,
        slidesToScroll: 6,
        arrows: true,
        centerMode: false,
        rows: 1
      });

      $('.responsive2').not('.slick-initialized').slick({
        dots: false,
        infinite: true,
        speed: 300,
        slidesToShow: 2,
        slidesToScroll: 2,
        arrows: true,
        centerMode: false,
        rows: 2
      });


      $('#nav-icon1').click(function () {
        $(this).toggleClass('open');
      });
    });

    $('input[name=stayemail]').change(function () {
      $('#check').empty();
      var rs = emailValidate($(this).val());

      if (rs) {
        $.ajax({
            method: "POST",
            url: "http://www.smeg.co.th/home/collectdata",
            data: {
              email: $(this).val()
            }
          })
          .done(function (val) {

            if (val == 200) {
              $('input[name=stayemail]').val('');
              $('#check').html("<p id='valid'>SUCCESSFULLY</p>");
            } else if (val == 400) {
              $('#check').html("<p id='invalid'>ALREADY REGISTER</p>");
            } else {
              $('#check').html("<p id='invalid'>ERROR</p>");
            }
          });
      } else {
        $('#check').html("<p id='invalid'>INVALID</p>");
      }



    });

    function emailValidate(email) {
      var check = "" + email;
      if ((check.search('@') >= 0) && (check.search(/\./) >= 0))
        if (check.search('@') < check.split('@')[1].search(/\./) + check.search('@')) return true;
        else return false;
      else return false;
    }

    //    function openNav() {
    //        document.getElementById("mySidenav").style.width = "450px";
    //    }
    //    function closeNav() {
    //        document.getElementById("mySidenav").style.width = "0";
    //    }