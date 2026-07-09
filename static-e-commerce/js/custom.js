// Flash Sale Countdown (uses existing file, improved: 1s tick, supports Hari, auto-hide Hari when 0)
(function () {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const pad2 = (n) => String(Math.max(0, n)).padStart(2, "0");

  // Prefer end time from the Flash Sale markup: <div class="fs-countdown" data-end="...">
  // If not present, fallback to "today 23:59:59" local time.
  function resolveEndTime() {
    const cd = document.querySelector(".fs-countdown");
    const endAttr = cd ? cd.getAttribute("data-end") : null;

    if (endAttr) {
      const t = new Date(endAttr).getTime();
      if (!Number.isNaN(t)) return t;
    }

    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0);
    return end.getTime();
  }

  // Elements (Flash Sale IDs)
  const elDays = document.getElementById("fsDays");
  const elHours = document.getElementById("fsHours");
  const elMinutes = document.getElementById("fsMinutes");
  const elSeconds = document.getElementById("fsSeconds");

  // Optional: if you still have old IDs somewhere, we support them too
  const legacyHours = document.getElementById("hours");
  const legacyMinutes = document.getElementById("minutes");
  const legacySeconds = document.getElementById("seconds");

  // Optional container elements (for hiding "Hari" group)
  const cdWrap = document.querySelector(".fs-countdown");
  const daysGroup = elDays ? elDays.closest(".fs-count") : null;

  let endTime = resolveEndTime();

  function render(msLeft) {
    const totalSec = Math.floor(msLeft / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    // Flash Sale IDs
    if (elDays) elDays.textContent = pad2(days);
    if (elHours) elHours.textContent = pad2(hours);
    if (elMinutes) elMinutes.textContent = pad2(minutes);
    if (elSeconds) elSeconds.textContent = pad2(seconds);

    // Hide "Hari" group when 0 (Tokopedia/Shopee style)
    if (daysGroup) {
      daysGroup.style.display = days > 0 ? "" : "none";
    }

    // Legacy IDs (hours/minutes/seconds only)
    if (legacyHours) legacyHours.innerText = hours + (days * 24); // roll days into hours for legacy mode
    if (legacyMinutes) legacyMinutes.innerText = minutes;
    if (legacySeconds) legacySeconds.innerText = seconds;
  }

  function markEnded() {
    // If you have special UI on end, toggle a class
    if (cdWrap) cdWrap.classList.add("fs-countdown--ended");

    // If older "upselling" content exists, keep compatibility
    const countdown = document.getElementById("countdown");
    const content = document.getElementById("content");
    if (countdown) countdown.style.display = "none";
    if (content) content.style.display = "block";
  }

  function tick() {
    const now = Date.now();
    let diff = endTime - now;

    if (diff <= 0) {
      render(0);
      markEnded();

      // Auto-reset: next day 23:59:59
      const n = new Date();
      const next = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 23, 59, 59, 0);
      endTime = next.getTime();
      if (cdWrap) cdWrap.classList.remove("fs-countdown--ended");
      return;
    }

    render(diff);
  }

  // Initial render
  tick();
  // Update once per second (NOT 0ms)
  setInterval(tick, 1000);
}());

// Filter points datepicker
var date = new Date();
var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
$('#point-date, #datePicker')
  .datepicker({
    dateFormat: 'dd/mm/yy'
  })
  .datepicker('setDate', null)
  .attr('placeholder', 'dd/mm/yyyy');


  // Flash Sale slider
  var fsSwiper = new Swiper('.swiper-container-flashsale', {
    slidesPerView: 5,
    spaceBetween: 14,
    slidesPerGroup: 1,
    speed: 450,
    navigation: {
      nextEl: '.fs-swiper-next',
      prevEl: '.fs-swiper-prev',
    },
    breakpoints: {
      300:  { slidesPerView: 1.2, spaceBetween: 10, slidesPerGroup: 1 },
      576:  { slidesPerView: 2.2, spaceBetween: 12, slidesPerGroup: 2 },
      768:  { slidesPerView: 3,   spaceBetween: 12, slidesPerGroup: 3 },
      992:  { slidesPerView: 4,   spaceBetween: 14, slidesPerGroup: 1 },
      1200: { slidesPerView: 5,   spaceBetween: 14, slidesPerGroup: 1 }
    }
  });

// Menutup bottom sheet saat ukuran layar berubah ke mode desktop
window.addEventListener('resize', function() {
    if (window.innerWidth >= 992) {
        if (typeof closeAllBottomSheets === 'function') {
            closeAllBottomSheets();
        }
    }
});
// Navigation Search Input Logic
function initNavSearch() {
    document.querySelectorAll('.js-nav-search-input').forEach(function(input) {
        input.addEventListener('focus', function() {
            if(this.parentElement) this.parentElement.classList.add('show');
            if(this.nextElementSibling) this.nextElementSibling.classList.add('show');
        });

        input.addEventListener('blur', function() {
            setTimeout(() => {
                if(this.parentElement) this.parentElement.classList.remove('show');
                if(this.nextElementSibling) this.nextElementSibling.classList.remove('show');
            }, 150);
        });

        input.addEventListener('keyup', function() {
            const targetPrefix = this.getAttribute('data-search-target');
            
            const suffix = targetPrefix === 'mobile' ? '-mobile' : '';
            const elProduct = document.getElementById('search-keyword-product' + suffix);
            const elCategory = document.getElementById('search-keyword-category' + suffix);
            const elBrand = document.getElementById('search-keyword-brand' + suffix);
            
            if (elProduct) elProduct.innerHTML = this.value;
            if (elCategory) elCategory.innerHTML = this.value;
            if (elBrand) elBrand.innerHTML = this.value;
            
            if (this.value.trim() !== '') {
                if(this.parentElement) this.parentElement.classList.add('show');
                if(this.nextElementSibling) this.nextElementSibling.classList.add('show');
            } else {
                if(this.parentElement) this.parentElement.classList.remove('show');
                if(this.nextElementSibling) this.nextElementSibling.classList.remove('show');
            }
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavSearch);
} else {
    initNavSearch();
}


/* ===========================
   INLINE SCRIPTS FROM HTML
   =========================== */
		document.querySelectorAll('.swiper-container-product-upsell').forEach(function (el) {
			new Swiper(el, {
				slidesPerView: 1,
				navigation: {
					nextEl: el.parentElement.querySelector('.swiper-button-next'),
					prevEl: el.parentElement.querySelector('.swiper-button-prev')
				},
				breakpoints: {
					300: {
						slidesPerView: 2,
						spaceBetween: 5
					},
					768: {
						slidesPerView: 3,
						spaceBetween: 10
					},
					1024: {
						slidesPerView: 4,
						spaceBetween: 10
					}
				}
			});
		});
		document.querySelectorAll('.swiper-container').forEach(function (el) {
			new Swiper(el, {
				slidesPerView: 1,
				navigation: {
					nextEl: el.closest('section').querySelector('.swiper-button-next'),
					prevEl: el.closest('section').querySelector('.swiper-button-prev')
				},
				breakpoints: {
					300: {
						slidesPerView: 3,
						spaceBetween: 5
					},
					768: {
						slidesPerView: 4,
						spaceBetween: 10
					},
					992: {
						slidesPerView: 6,
						spaceBetween: 10
					},
					1200: {
						slidesPerView: 7,
						spaceBetween: 10
					}
				}
			});
		});
		document.querySelectorAll('.swiper-container-product').forEach(function (el) {
			new Swiper(el, {
				slidesPerView: 1,
				navigation: {
					nextEl: el.closest('section').querySelector('.swiper-button-next'),
					prevEl: el.closest('section').querySelector('.swiper-button-prev')
				},
				breakpoints: {
					300: {
						slidesPerView: 2,
						spaceBetween: 5
					},
					768: {
						slidesPerView: 3,
						spaceBetween: 5
					},
					992: {
						slidesPerView: 4,
						spaceBetween: 10
					},
					1200: {
						slidesPerView: 5,
						spaceBetween: 10
					}
				}
			});
		});
		document.querySelectorAll('.swiper-container-kelebihan').forEach(function (el) {
			new Swiper(el, {
				slidesPerView: 1,
				navigation: {
					nextEl: el.closest('section').querySelector('.swiper-button-next'),
					prevEl: el.closest('section').querySelector('.swiper-button-prev')
				},
				breakpoints: {
					300: {
						slidesPerView: 2,
						spaceBetween: 5
					},
					768: {
						slidesPerView: 2,
						spaceBetween: 5
					},
					992: {
						slidesPerView: 3,
						spaceBetween: 10
					},
					1200: {
						slidesPerView: 4,
						spaceBetween: 10
					}
				}
			});
		});
		function openNav() {
			document.getElementById("mySidenav1").style.width = "250px";
		}

		function closeNav() {
			document.getElementById("mySidenav1").style.width = "0";
		}
		// Toggle chat widget show/hide
		document.getElementById('chat-toggle').onclick = function () {
			var widget = document.getElementById('chat-widget');
			if (widget.style.display === 'block') {
				widget.style.display = 'none';
			} else {
				widget.style.display = 'block';
			}
		};

		// Tombol close di header widget
		function toggleChat() {
			document.getElementById('chat-widget').style.display = 'none';
		}
		document.addEventListener('click', function (event) {
			const toggle = event.target.closest('[data-mobile-submenu]');
			if (!toggle) return;

			event.preventDefault();
			const submenuId = toggle.getAttribute('data-mobile-submenu');
			const submenu = document.getElementById(submenuId);
			if (!submenu) return;

			const expanded = toggle.getAttribute('aria-expanded') === 'true';
			toggle.setAttribute('aria-expanded', String(!expanded));
			submenu.hidden = expanded;
		});
		function initMegaMenu() {
			const megaButtons = document.querySelectorAll('.marketplace-mega__main');
			const megaPanels = document.querySelectorAll('.marketplace-mega__panel');

			megaButtons.forEach(function (button) {
				button.addEventListener('mouseenter', function () {
					const targetId = button.getAttribute('data-mega-target');

					megaButtons.forEach(function (btn) {
						btn.classList.remove('is-active');
					});

					megaPanels.forEach(function (panel) {
						panel.classList.remove('is-active');
					});

					button.classList.add('is-active');
					const targetPanel = document.getElementById(targetId);
					if (targetPanel) {
						targetPanel.classList.add('is-active');
					}
				});
			});
		}

		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', initMegaMenu);
		} else {
			initMegaMenu();
		}

// Modern Mobile Search Bottom Sheet Logic
function initMobileSearchOverlay() {
    const btnOpen = document.getElementById('btn-open-mobile-search');
    const input = document.getElementById('mobile-search-input');
    const filterPills = document.querySelectorAll('.search-filter-pill');
    const resultItems = document.querySelectorAll('#mobile-search-results li');
    
    if (!input) return;

    if (btnOpen) {
        btnOpen.addEventListener('click', function() {
            setTimeout(() => {
                if (input) input.focus();
            }, 100);
        });
    }

    // Handle typing
    input.addEventListener('input', function() {
        const val = this.value;
        const textProduct = document.getElementById('ms-text-product');
        const textCategory = document.getElementById('ms-text-category');
        const textBrand = document.getElementById('ms-text-brand');
        
        if (textProduct) textProduct.innerText = val;
        if (textCategory) textCategory.innerText = val;
        if (textBrand) textBrand.innerText = val;
    });

    // Handle pills
    filterPills.forEach(pill => {
        pill.addEventListener('click', function() {
            // Remove active from all pills
            filterPills.forEach(p => p.classList.remove('is-active'));
            this.classList.add('is-active');
            
            const selectedFilter = this.getAttribute('data-filter');
            
            resultItems.forEach(item => {
                if (item.getAttribute('data-result-type') === selectedFilter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Initialize initial state
    if (filterPills.length > 0) {
        filterPills[0].click();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileSearchOverlay);
} else {
    initMobileSearchOverlay();
}





/* Bottom Sheet Interactivity */
let menuSheetToggle = $(".btn-open-menu-sheet");
let menuSheet = $("#bottom-sheet-menu");
let sheetBg = $(".side-menu-bg");
let allSheets = $(".mobile-bottom-sheet");

function openBottomSheet(sheet) {
	$("body").addClass("overflow-hidden");
	sheet.addClass("is-active");
	sheetBg.fadeIn(300);
}

function closeAllBottomSheets() {
	$("body").removeClass("overflow-hidden");
	allSheets.removeClass("is-active");
	sheetBg.fadeOut(200);
}

if (menuSheetToggle.length) {
	menuSheetToggle.on("click", function () {
		openBottomSheet(menuSheet);
	});
}

$(".close-bottom-sheet, .side-menu-bg").on("click", function () {
	closeAllBottomSheets();
});

$(document).keyup(e => {
	if (e.keyCode === 27) { // escape key maps to keycode `27`
		closeAllBottomSheets();
	}
});