  // simple "pill" radio behavior for company type
  (function () {
    var group = document.getElementById("company-type-group");
    if (!group) return;
    var buttons = Array.prototype.slice.call(
      group.querySelectorAll(".radio-pill")
    );
    var hiddenInput = document.getElementById("company-type");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-value");
        hiddenInput.value = value;

        buttons.forEach(function (b) {
          b.classList.remove("radio-pill--selected");
        });
        btn.classList.add("radio-pill--selected");
      });
    });
  })();

  // scroll reveal dengan IntersectionObserver
  (function () {
    var reveals = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      // fallback: langsung tampil
      reveals.forEach(function (el) {
        el.classList.add("visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15
    });

    reveals.forEach(function (el) {
      observer.observe(el);
    });

    // hero/header langsung visible sedikit lebih cepat
    window.addEventListener("load", function () {
      var hero = document.getElementById("hero");
      if (hero) hero.classList.add("visible");
      var header = document.querySelector("header.header");
      if (header) header.classList.add("visible");
    });
  })();
  

  // TABS INTERACTION
  (function () {
    var container = document.getElementById("info-tabs");
    if (!container) return;

    var buttons = Array.prototype.slice.call(
      container.querySelectorAll(".tab-btn")
    );
    var panels = Array.prototype.slice.call(
      container.querySelectorAll(".tab-panel")
    );

    function activateTab(targetId) {
      // toggle buttons
      buttons.forEach(function (btn) {
        var isActive = btn.getAttribute("data-tab-target") === targetId;
        btn.classList.toggle("tab-btn--active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      // toggle panels
      panels.forEach(function (panel) {
        var isActive = panel.id === targetId;
        panel.classList.toggle("tab-panel--active", isActive);
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-tab-target");
        if (!target) return;
        activateTab(target);
      });
    });
  })();


    // CODE VALIDATION INTERACTION
  (function () {
    var input = document.getElementById("code-input");
    var btn = document.getElementById("validate-btn");
    var stateEl = document.getElementById("state-message");
    var stateText = document.getElementById("state-text");
    var tsEl = document.getElementById("timestamp");
    var statusPill = document.getElementById("status-pill");

    var DEMO_CODE = "CD-ALLEGRA-2025";

    function setState(type, message) {
      stateEl.classList.remove(
        "state--idle",
        "state--validating",
        "state--success",
        "state--error"
      );
      stateEl.classList.add("state--" + type);
      stateText.innerHTML = message;
    }

    function formatTime(date) {
      var hh = String(date.getHours()).padStart(2, "0");
      var mm = String(date.getMinutes()).padStart(2, "0");
      var ss = String(date.getSeconds()).padStart(2, "0");
      return hh + ":" + mm + ":" + ss;
    }

    function handleValidate() {
      var code = (input.value || "").trim().toUpperCase();
      if (!code) {
        setState("error", "Please enter the code you received in the email.");
        tsEl.style.display = "none";
        return;
      }

      // START VALIDATING
      setState("validating", "Validating your code, please wait…");
      btn.disabled = true;
      input.disabled = true;
      statusPill.textContent = "Checking…";

      // Simulate network delay (demo)
      setTimeout(function () {
        var now = new Date();
        var timeStr = formatTime(now);

        if (code === DEMO_CODE) {
          setState(
            "success",
            "Your code is valid. (Demo) Your completion has been recorded at local time: <strong>" +
              timeStr +
              "</strong>."
          );
          tsEl.textContent =
            "Demo only: in the real system, this timestamp is stored server-side with millisecond precision.";
          tsEl.style.display = "block";
          statusPill.textContent = "Success";
        } else {
          setState(
            "error",
            "The code you entered is not valid for this demo. Try using <code>CD-ALLEGRA-2025</code>."
          );
          tsEl.style.display = "none";
          statusPill.textContent = "Live";
        }

        btn.disabled = false;
        input.disabled = false;
        input.focus();
        input.select();
      }, 800);
    }

    btn.addEventListener("click", handleValidate);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleValidate();
      }
    });
  })();
