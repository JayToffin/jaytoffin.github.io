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