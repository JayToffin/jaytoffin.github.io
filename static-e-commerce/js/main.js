AOS.init({
	duration: 800,
	easing: 'slide'
});

(function ($) {

	"use strict";

	var isMobile = {
		Android: function () {
			return navigator.userAgent.match(/Android/i);
		},
		BlackBerry: function () {
			return navigator.userAgent.match(/BlackBerry/i);
		},
		iOS: function () {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
		Opera: function () {
			return navigator.userAgent.match(/Opera Mini/i);
		},
		Windows: function () {
			return navigator.userAgent.match(/IEMobile/i);
		},
		any: function () {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};


	$(window).stellar({
		responsive: true,
		parallaxBackgrounds: true,
		parallaxElements: true,
		horizontalScrolling: false,
		hideDistantElements: false,
		scrollProperty: 'scroll'
	});


	var fullHeight = function () {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function () {
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	// loader
	var loader = function () {
		setTimeout(function () {
			if ($('#ftco-loader').length > 0) {
				$('#ftco-loader').removeClass('show');
			}
		}, 1);
	};
	loader();

	// Scrollax
	$.Scrollax();

	var carousel = function () {
		$('.home-slider').owlCarousel({
			loop: true,
			autoplay: true,
			margin: 0,
			animateOut: 'fadeOut',
			animateIn: 'fadeIn',
			nav: false,
			autoplayHoverPause: false,
			items: 1,
			navText: ["<span class='ion-md-arrow-back'></span>", "<span class='ion-chevron-right'></span>"],
			responsive: {
				0: {
					items: 1
				},
				600: {
					items: 1
				},
				1000: {
					items: 1
				}
			}
		});

		$('.carousel-testimony').owlCarousel({
			center: true,
			loop: false,
			items: 1,
			margin: 30,
			stagePadding: 0,
			nav: false,
			navText: ['<span class="ion-ios-arrow-back">', '<span class="ion-ios-arrow-forward">'],
			responsive: {
				0: {
					items: 1
				},
				600: {
					items: 3
				},
				1000: {
					items: 3
				}
			}
		});

	};
	carousel();




	// scroll
	var scrollWindow = function () {
		$(window).scroll(function () {
			var $w = $(this),
				st = $w.scrollTop(),
				navbar = $('.ftco_navbar'),
				sd = $('.js-scroll-wrap');

			if (st > 150) {
				if (!navbar.hasClass('scrolled')) {
					navbar.addClass('scrolled');
				}
			}
			if (st < 150) {
				if (navbar.hasClass('scrolled')) {
					navbar.removeClass('scrolled sleep');
				}
			}
			if (st > 350) {
				if (!navbar.hasClass('awake')) {
					navbar.addClass('awake');
				}

				if (sd.length > 0) {
					sd.addClass('sleep');
				}
			}
			if (st < 350) {
				if (navbar.hasClass('awake')) {
					navbar.removeClass('awake');
					navbar.addClass('sleep');
				}
				if (sd.length > 0) {
					sd.removeClass('sleep');
				}
			}
		});
	};
	scrollWindow();


	var counter = function () {

		$('#section-counter').waypoint(function (direction) {

			if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {

				var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',')
				$('.number').each(function () {
					var $this = $(this),
						num = $this.data('number');
					console.log(num);
					$this.animateNumber({
						number: num,
						numberStep: comma_separator_number_step
					}, 7000);
				});

			}

		}, {
			offset: '95%'
		});

	}
	counter();

	var contentWayPoint = function () {
		var i = 0;
		$('.ftco-animate').waypoint(function (direction) {

			if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {

				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function () {

					$('body .ftco-animate.item-animate').each(function (k) {
						var el = $(this);
						setTimeout(function () {
							var effect = el.data('animate-effect');
							if (effect === 'fadeIn') {
								el.addClass('fadeIn ftco-animated');
							} else if (effect === 'fadeInLeft') {
								el.addClass('fadeInLeft ftco-animated');
							} else if (effect === 'fadeInRight') {
								el.addClass('fadeInRight ftco-animated');
							} else {
								el.addClass('fadeInUp ftco-animated');
							}
							el.removeClass('item-animate');
						}, k * 50, 'easeInOutExpo');
					});

				}, 100);

			}

		}, {
			offset: '95%'
		});
	};
	contentWayPoint();




	// magnific popup
	$('.image-popup').magnificPopup({
		type: 'image',
		closeOnContentClick: true,
		closeBtnInside: false,
		fixedContentPos: true,
		mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
		gallery: {
			enabled: true,
			navigateByImgClick: true,
			preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
		},
		image: {
			verticalFit: true
		},
		zoom: {
			enabled: true,
			duration: 300 // don't foget to change the duration also in CSS
		}
	});

	$('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
		disableOn: 700,
		type: 'iframe',
		mainClass: 'mfp-fade',
		removalDelay: 160,
		preloader: false,

		fixedContentPos: false
	});



	var goHere = function () {

		$('.mouse-icon').on('click', function (event) {

			event.preventDefault();

			$('html,body').animate({
				scrollTop: $('.goto-here').offset().top
			}, 500, 'easeInOutExpo');

			return false;
		});
	};
	goHere();




})(jQuery);



// Breadcrumbs
$(document).ready(function () {


	$('.first ol li a').click(function () {
		$('.first ol li a.active-1').removeClass('active-1');
		$(this).closest('a').addClass('active-1');
	});



});


// ---------- Not used in Odoo ----------
function toggleActive(self) {
	let ul = self.getElementsByTagName('ul')[0];
	if (ul.classList.contains('active')) {
		ul.classList.remove('active');
	} else {
		ul.classList.add('active');
	}
}

function setTeam(self) {
	let team = document.getElementById('current-team');
	let node = self.parentNode.firstChild;
	while (node && node.nodeType === Node.ELEMENT_NODE && node !== this) {
		node.classList.remove('has-text-weight-semibold');
		node = node.nextElementSibling || node.nextSibling;
	}
	self.classList.add('has-text-weight-semibold');
	team.innerHTML = self.innerHTML;
}


// Checkbox Asuransi show/hide
function myFunction() {
	var checkBox = document.getElementById("asuransi");
	var text = document.getElementById("text");
	if (checkBox.checked == true) {
		text.style.display = "block";
	} else {
		text.style.display = "none";
	}
}


// Dropdown pilih pengiriman
for (const dropdown of document.querySelectorAll(".select-wrapper")) {
	dropdown.addEventListener('click', function () {
		this.querySelector('.select').classList.toggle('open');
	})
}
// Click function select toggles
for (const option of document.querySelectorAll(".custom-option")) {
	option.addEventListener('click', function () {
		if (!this.classList.contains('selected')) {
			this.parentNode.querySelector('.custom-option.selected').classList.remove('selected');
			this.classList.add('selected');
			this.closest('.select').querySelector('.select__trigger span').textContent = this.textContent;
		}
	})
}
window.addEventListener('click', function (e) {
	for (const select of document.querySelectorAll('.select')) {
		if (!select.contains(e.target)) {
			select.classList.remove('open');
		}
	}
});

// ---------- End of: Not used in Odoo ----------





// -----js menu dropdown fix----- //
(function ($) {
	$('.dropdown-menu a.dropdown-toggle').on('click', function (e) {
		if (!$(this).next().hasClass('show')) {
			$(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
		}
		var $subMenu = $(this).next(".dropdown-menu");
		$subMenu.toggleClass('show');

		$(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
			$('.dropdown-submenu .show').removeClass("show");
		});

		return false;
	});
})(jQuery)
// -----END - js menu dropdown fix----- //





//----- filter collapse -----//
$(document).ready(function() {
	var list = $('ul li');
  
	if ($(list).has('ul')) {
	  //console.log('child ul');
	  list.find('ul').addClass('collapse');
	}
  
	$('li.expand').on("click", function(e) {
	  if ($(this).find('ul').hasClass('collapse')) {
		$(this).find('ul').collapse('toggle');
		$(this).toggleClass('open');
	  }
	});
  });
  //----- END - filter collapse -----//






// -----js product favorite------ //
$(document).ready(function () {

	// Specific code for the heart fill toggle
	$("#heart--liked").click(function (e) {
		$(this).toggleClass("fas").toggleClass("fas"); // Toggle the filling !
	});

	// Action when click on a link (color)
	$(".product__list__item--icons a").click(function (e) {
		e.preventDefault(); // Modified: stop link # from loading (Why using link then?)
		$(this).toggleClass("selected"); // Toggle the colored class !
	});

});
// -----END - js product favorite------ //



var close = document.getElementsByClassName("closebtn");
var i;

for (i = 0; i < close.length; i++) {
	close[i].onclick = function () {
		var div = this.parentElement;
		div.style.opacity = "0";
		setTimeout(function () {
			div.style.display = "none";
		}, 600);
	}
}




$(document).ready(function () {
	var itemsMainDiv = ('.MultiCarousel');
	var itemsDiv = ('.MultiCarousel-inner');
	var itemWidth = "";

	$('.leftLst, .rightLst').click(function () {
		var condition = $(this).hasClass("leftLst");
		if (condition)
			click(0, this);
		else
			click(1, this)
	});

	ResCarouselSize();

	$(window).resize(function () {
		ResCarouselSize();
	});

	//this function define the size of the items
	function ResCarouselSize() {
		var incno = 0;
		var dataItems = ("data-items");
		var itemClass = ('.item');
		var id = 0;
		var btnParentSb = '';
		var itemsSplit = '';
		var sampwidth = $(itemsMainDiv).width();
		var bodyWidth = $('body').width();
		$(itemsDiv).each(function () {
			id = id + 1;
			var itemNumbers = $(this).find(itemClass).length;
			btnParentSb = $(this).parent().attr(dataItems);
			itemsSplit = btnParentSb.split(',');
			$(this).parent().attr("id", "MultiCarousel" + id);


			if (bodyWidth >= 1200) {
				incno = itemsSplit[3];
				itemWidth = sampwidth / incno;
			} else if (bodyWidth >= 992) {
				incno = itemsSplit[2];
				itemWidth = sampwidth / incno;
			} else if (bodyWidth >= 768) {
				incno = itemsSplit[1];
				itemWidth = sampwidth / incno;
			} else {
				incno = itemsSplit[0];
				itemWidth = sampwidth / incno;
			}
			$(this).css({
				'transform': 'translateX(0px)',
				'width': itemWidth * itemNumbers
			});
			$(this).find(itemClass).each(function () {
				$(this).outerWidth(itemWidth);
			});

			$(".leftLst").addClass("over");
			$(".rightLst").removeClass("over");

		});
	}


	//this function used to move the items
	function ResCarousel(e, el, s) {
		var leftBtn = ('.leftLst');
		var rightBtn = ('.rightLst');
		var translateXval = '';
		var divStyle = $(el + ' ' + itemsDiv).css('transform');
		var values = divStyle.match(/-?[\d\.]+/g);
		var xds = Math.abs(values[4]);
		if (e == 0) {
			translateXval = parseInt(xds) - parseInt(itemWidth * s);
			$(el + ' ' + rightBtn).removeClass("over");

			if (translateXval <= itemWidth / 2) {
				translateXval = 0;
				$(el + ' ' + leftBtn).addClass("over");
			}
		} else if (e == 1) {
			var itemsCondition = $(el).find(itemsDiv).width() - $(el).width();
			translateXval = parseInt(xds) + parseInt(itemWidth * s);
			$(el + ' ' + leftBtn).removeClass("over");

			if (translateXval >= itemsCondition - itemWidth / 2) {
				translateXval = itemsCondition;
				$(el + ' ' + rightBtn).addClass("over");
			}
		}
		$(el + ' ' + itemsDiv).css('transform', 'translateX(' + -translateXval + 'px)');
	}

	//It is used to get some elements from btn
	function click(ell, ee) {
		var Parent = "#" + $(ee).parent().attr("id");
		var slide = $(Parent).attr("data-slide");
		ResCarousel(ell, Parent, slide);
	}

});





// -----js carousel rekomendasi, alternatif product, dll ------ //
// $('#recipeCarousel').carousel({
// 	interval: 1000
// })

// $('.carousel .carousel-item').each(function () {
// 	var minPerSlide = 3;
// 	var next = $(this).next();
// 	if (!next.length) {
// 		next = $(this).siblings(':first');
// 	}
// 	next.children(':first-child').clone().appendTo($(this));

// 	for (var i = 0; i < minPerSlide; i++) {
// 		next = next.next();
// 		if (!next.length) {
// 			next = $(this).siblings(':first');
// 		}

// 		next.children(':first-child').clone().appendTo($(this));
// 	}
// });
// -----END - js carousel rekomendasi, alternatif product, dll ------ //