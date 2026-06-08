/**
 * OFA Espresso — single classic script (no ES modules).
 *
 * Bundled as a plain <script> so the site works even when opened directly
 * from disk (file://), where the browser's CORS policy blocks ES module
 * imports. Sections: nav, scroll reveal, gallery.
 */
(function () {
  "use strict";

  /* ===================== NAV ===================== */
  function initNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle("solid", window.scrollY > 40);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ===================== SCROLL SPY ===================== */
  // Highlight the nav link whose section is currently in view.
  function initScrollSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll(".nav .links a")
    );
    if (!links.length || !("IntersectionObserver" in window)) return;

    // Map each link to its target section element.
    var pairs = links
      .map(function (a) {
        var id = (a.getAttribute("href") || "").replace("#", "");
        var sec = id && document.getElementById(id);
        return sec ? { link: a, sec: sec } : null;
      })
      .filter(Boolean);
    if (!pairs.length) return;

    function setActive(link) {
      links.forEach(function (a) {
        a.classList.toggle("active", a === link);
      });
    }

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var match = pairs.filter(function (p) {
            return p.sec === en.target;
          })[0];
          if (match) setActive(match.link);
        });
      },
      // Trigger when a section crosses the upper third of the viewport.
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    pairs.forEach(function (p) {
      spy.observe(p.sec);
    });

    // The footer (#contact) is short and never crosses the middle band, so
    // activate its link explicitly once the page is scrolled to the bottom.
    var contactLink = links.filter(function (a) {
      return (a.getAttribute("href") || "") === "#contact";
    })[0];
    if (contactLink) {
      var onBottom = function () {
        var atBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 2;
        if (atBottom) setActive(contactLink);
      };
      window.addEventListener("scroll", onBottom, { passive: true });
      onBottom();
    }
  }

  /* ===================== SCROLL REVEAL ===================== */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-dec"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";

    if (reduce) {
      el.textContent = target.toFixed(dec) + suffix;
      return;
    }

    var dur = 1200;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(dec) + suffix;
    }

    requestAnimationFrame(step);
  }

  function initReveal() {
    var fades = document.querySelectorAll(".fu");
    var counters = document.querySelectorAll("[data-count]");

    // No motion / no IO support → leave content as-is (visible by default).
    if (reduce || !("IntersectionObserver" in window)) {
      counters.forEach(runCount);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          en.target.querySelectorAll("[data-count]").forEach(runCount);
          if (en.target.hasAttribute("data-count")) runCount(en.target);
          io.unobserve(en.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    // Arm (hide) each element only now that JS is confirmed running, then
    // reveal on scroll. If this script never runs, elements stay visible.
    fades.forEach(function (el) {
      el.classList.add("armed");
      io.observe(el);
    });
  }

  /* ===================== GALLERY ===================== */
  var SETS = {
    model1: [
      ["assets/images/model1/copper.png", "Copper finish · 3/4"],
      ["assets/images/model1/front.png", "Bespoke Orange · front"],
      ["assets/images/model1/side.png", "Cool-Touch group · side"],
      ["assets/images/model1/top.png", "Perforated top · vista"],
      ["assets/images/model1/detail.png", "Twist for coffee · detail"],
    ],
    leggera: [
      ["assets/images/leggera/3q.png", "Notturno · 3/4"],
      ["assets/images/leggera/front.png", "Front · group & controls"],
      ["assets/images/leggera/group.png", "Cool-Touch group · detail"],
      ["assets/images/leggera/grigio.png", "Grigio Astrale · profile"],
      ["assets/images/leggera/argilla.png", "Argilla · corner detail"],
    ],
  };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function initGallery() {
    var stage = document.getElementById("gstage");
    var thumbs = document.getElementById("gthumbs");
    var cap = document.getElementById("gcap");
    var count = document.getElementById("gcount");
    var toggle = document.getElementById("gtoggle");
    if (!stage) return;

    var setKey = "model1";
    var idx = 0;
    var slides = [];

    function render() {
      slides.forEach(function (s, i) {
        s.classList.toggle("on", i === idx);
      });
      thumbs.querySelectorAll(".gthumb").forEach(function (t, i) {
        t.classList.toggle("on", i === idx);
      });
      cap.textContent = SETS[setKey][idx][1];
      count.textContent = pad(idx + 1) + " / " + pad(SETS[setKey].length);
    }

    function go(i) {
      var n = SETS[setKey].length;
      idx = (i + n) % n;
      render();
    }

    function build() {
      stage.querySelectorAll(".gslide").forEach(function (s) {
        s.remove();
      });
      thumbs.innerHTML = "";
      slides = [];

      SETS[setKey].forEach(function (entry, i) {
        var src = entry[0];
        var label = entry[1];

        var fig = document.createElement("div");
        fig.className = "gslide" + (i === 0 ? " on" : "");
        var img = document.createElement("img");
        img.src = src;
        img.alt = label;
        img.draggable = false;
        fig.appendChild(img);
        stage.insertBefore(fig, cap);
        slides.push(fig);

        var th = document.createElement("button");
        th.className = "gthumb" + (i === 0 ? " on" : "");
        th.type = "button";
        th.setAttribute("aria-label", label);
        var ti = document.createElement("img");
        ti.src = src;
        ti.alt = "";
        ti.draggable = false;
        th.appendChild(ti);
        th.addEventListener("click", function () {
          go(i);
        });
        thumbs.appendChild(th);
      });

      idx = 0;
      render();
    }

    // Arrows
    document.getElementById("gnext").addEventListener("click", function () {
      go(idx + 1);
    });
    document.getElementById("gprev").addEventListener("click", function () {
      go(idx - 1);
    });

    // Keyboard (when stage focused)
    stage.tabIndex = 0;
    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(idx + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(idx - 1);
      }
    });

    // Swipe
    var sx = 0;
    var sy = 0;
    var drag = false;
    var decided = false;
    var horiz = false;

    stage.addEventListener("pointerdown", function (e) {
      drag = true;
      decided = false;
      horiz = false;
      sx = e.clientX;
      sy = e.clientY;
    });
    window.addEventListener(
      "pointermove",
      function (e) {
        if (!drag) return;
        var dx = e.clientX - sx;
        var dy = e.clientY - sy;
        if (!decided) {
          if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
            decided = true;
            horiz = Math.abs(dx) > Math.abs(dy);
          } else return;
        }
        if (horiz) e.preventDefault();
      },
      { passive: false }
    );
    window.addEventListener("pointerup", function (e) {
      if (!drag) return;
      drag = false;
      if (!horiz) return;
      var dx = e.clientX - sx;
      if (dx <= -40) go(idx + 1);
      else if (dx >= 40) go(idx - 1);
    });

    // Model toggle
    toggle.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var key = btn.getAttribute("data-set");
      if (key === setKey) return;
      setKey = key;
      toggle.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("on", b === btn);
      });
      build();
    });

    build();
  }

  /* ===================== BOOT ===================== */
  function setYear() {
    var el = document.getElementById("foot-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function init() {
    initNav();
    initScrollSpy();
    initReveal();
    initGallery();
    setYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
