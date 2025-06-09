(function ($) {
  "use strict";

  ///////////////////////////////////////////////////////
  // Preloader
  $(".preloader").delay(800).fadeOut("slow");
  // Preloader End

  $(window).on("scroll", function () {
    if ($(window).scrollTop() > 50) {
      $("#sticky-menu").addClass("sticky-menu");
    } else {
      $("#sticky-menu").removeClass("sticky-menu");
    }
  });
  /**************************************
   *****  Set Background Image *****
   **************************************/
  if ($("[data-bg-src]").length > 0) {
    $("[data-bg-src]").each(function () {
      var src = $(this).attr("data-bg-src");
      $(this).css("background-image", "url(" + src + ")");
      $(this).removeAttr("data-bg-src").addClass("background-image");
    });
  }

  ///////////////////////////////////////////////////////
  // Sticky Menu
  $(window).on("scroll", function () {
    var scroll = $(window).scrollTop();
    if (scroll >= 20) {
      $(".quanto-menu-area").addClass("sticky");
    } else {
      $(".quanto-menu-area").removeClass("sticky");
    }
  });
  // Sticky Menu End

  // Custom Cursor
  const cursor = document.querySelector(".cursor");

  if (cursor) {
    const editCursor = (e) => {
      const { clientX: x, clientY: y } = e;
      cursor.style.left = x + "px";
      cursor.style.top = y + "px";
    };
    window.addEventListener("mousemove", editCursor);

    document.querySelectorAll("a, .cursor-pointer").forEach((item) => {
      item.addEventListener("mouseover", () => {
        cursor.classList.add("cursor-active");
      });

      item.addEventListener("mouseout", () => {
        cursor.classList.remove("cursor-active");
      });
    });
  }

  // Custom Cursor End

  // Odometer Counter
  $(".counter-item").each(function () {
    var $counterItem = $(this);
    $counterItem.isInViewport(function (status) {
      if (status === "entered") {
        $counterItem.find(".odometer").each(function () {
          var el = this;
          el.innerHTML = el.getAttribute("data-odometer-final");
        });
      }
    });
  });
  // Odometer Counter End

  // var quantoThumbnailThumbSlider = new Swiper(
  //   ".quanto-testimonial__thumb-slider",
  //   {
  //     fadeEffect: { crossFade: true },
  //     effect: "fade",
  //     loop: true,
  //     allowTouchMove: false,
  //   }
  // );

  // var testimonialInfo = new Swiper(".quanto-testimonial__content-slider", {
  //   spaceBetween: 24,
  //   slidesPerView: 1,
  //   loop: true,
  //   speed: 800,
  //   allowTouchMove: false,
  //   navigation: {
  //     nextEl: ".quanto-testimonial__next",
  //     prevEl: ".quanto-testimonial__prev",
  //   },
  //   thumbs: {
  //     swiper: quantoThumbnailThumbSlider,
  //   },
  // });

  // Check if thumbnail slider exists
  var thumbSliderElement = document.querySelector(
    ".quanto-testimonial__thumb-slider"
  );

  // Initialize content slider configuration
  var contentSliderConfig = {
    spaceBetween: 24,
    slidesPerView: 1,
    loop: true,
    speed: 800,
    navigation: {
      nextEl: ".quanto-testimonial__next",
      prevEl: ".quanto-testimonial__prev",
    },
  };

  // If thumbnail slider exists, initialize it and connect to content slider
  if (thumbSliderElement) {
    var thumbSlider = new Swiper(".quanto-testimonial__thumb-slider", {
      fadeEffect: { crossFade: true },
      effect: "fade",
      loop: true,
      allowTouchMove: false,
    });

    // Add thumbs configuration only when thumbnail slider exists
    contentSliderConfig.thumbs = { swiper: thumbSlider };
    contentSliderConfig.allowTouchMove = false;
  } else {
    // For standalone slider, enable touch
    contentSliderConfig.allowTouchMove = true;
  }

  // Initialize the content slider with the appropriate configuration
  var testimonialInfo = new Swiper(
    ".quanto-testimonial__content-slider",
    contentSliderConfig
  );

  const quantoProjectSlider = document.querySelector(".quanto-project__slider");
  const quantoProjectSliderNavigation = document.querySelector(
    ".quanto-project__slider-navigation"
  );

  if (quantoProjectSlider && quantoProjectSliderNavigation) {
    var swiper = new Swiper(quantoProjectSlider, {
      slidesPerView: 1,
      loop: true,
      spaceBetween: 15,
      navigation: {
        nextEl: quantoProjectSliderNavigation.querySelector(".next-btn"),
        prevEl: quantoProjectSliderNavigation.querySelector(".prev-btn"),
      },
      breakpoints: {
        576: {
          spaceBetween: 20,
          slidesPerView: 1.3,
        },
        768: {
          spaceBetween: 25,
          slidesPerView: 1.5,
        },
        992: {
          spaceBetween: 30,
          slidesPerView: 2,
        },
        1200: {
          spaceBetween: 40,
          slidesPerView: 2.3,
        },
      },
    });
  }

  const testimonialSlider = document.querySelector(
    ".quanto-testimonial2__slider"
  );
  if (testimonialSlider) {
    const swiper = new Swiper(testimonialSlider, {
      loop: true,
      slidesPerView: 1,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      breakpoints: {
        768: {
          slidesPerView: 1,
        },
        1200: {
          slidesPerView: 1,
        },
        1400: {
          slidesPerView: 1,
        },
      },
    });
  }

  // Marquee
  $(".marquee").each(function () {
    var $marquee = $(this);
    var $itemContainer = $marquee.find(".marquee-item-container");
    var elements = $itemContainer.find(".marquee-item").length;
    var repeatCount = elements < 5 ? 5 : elements;

    for (var i = 0; i < repeatCount; i++) {
      $itemContainer.clone().appendTo($marquee);
    }
  });

  // Marquee End

  // Register GSAP Plugins
  let device_width = window.innerWidth;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  gsap.config({
    nullTargetWarn: false,
    trialWarn: false,
  });
  // Smooth active
  if (device_width > 767) {
    if (
      document.querySelector("#has_smooth").classList.contains("has-smooth")
    ) {
      const smoother = ScrollSmoother.create({
        smooth: 0.9,
        effects: device_width < 1025 ? false : true,
        smoothTouch: 0.1,
        normalizeScroll: {
          allowNestedScroll: true,
        },
        ignoreMobileResize: true,
      });
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    // Set default GSAP configuration

    // Initialize defaults
    gsap.defaults({
      ease: "power2.out",
      duration: 0.5,
    });

    // Get all target boxes and create overlays
    const targetBoxes = document.querySelectorAll(
      ".quanto-pricing-box, .process-box"
    );

    targetBoxes.forEach((box) => {
      // Create overlay element
      const overlay = document.createElement("div");
      overlay.className = "hover-overlay";
      box.insertBefore(overlay, box.firstChild);

      // Initial setup - hide the overlay
      gsap.set(overlay, {
        autoAlpha: 0,
        y: 0,
        x: 0,
      });

      const getDirection = (box, event) => {
        const rect = box.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Calculate mouse position relative to box center
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const relativeX = mouseX - centerX;
        const relativeY = mouseY - centerY;

        // Calculate angle from center
        const angle = Math.atan2(relativeY, relativeX);
        const degrees = angle * (180 / Math.PI);

        // Determine quadrant
        if (degrees >= -45 && degrees <= 45) return "right";
        if (degrees > 45 && degrees <= 135) return "bottom";
        if (degrees > 135 || degrees <= -135) return "left";
        return "top";
      };

      const getAnimationProps = (direction, isEntering) => {
        const animProps = {
          autoAlpha: isEntering ? 1 : 0,
          x: 0,
          y: 0,
        };
        const distance = 100; // percentage to move

        switch (direction) {
          case "right":
            animProps[isEntering ? "startX" : "x"] = distance + "%";
            break;
          case "left":
            animProps[isEntering ? "startX" : "x"] = -distance + "%";
            break;
          case "bottom":
            animProps[isEntering ? "startY" : "y"] = distance + "%";
            break;
          case "top":
            animProps[isEntering ? "startY" : "y"] = -distance + "%";
            break;
        }

        return animProps;
      };

      // Mouse enter handler
      box.addEventListener("mouseenter", (e) => {
        const direction = getDirection(box, e);
        const animProps = getAnimationProps(direction, true);

        gsap.fromTo(
          overlay,
          {
            autoAlpha: 0,
            x: animProps.startX || 0,
            y: animProps.startY || 0,
          },
          {
            duration: 0.5,
            autoAlpha: 1,
            x: 0,
            y: 0,
            ease: "power2.out",
          }
        );
      });

      // Mouse leave handler
      box.addEventListener("mouseleave", (e) => {
        const direction = getDirection(box, e);
        const animProps = getAnimationProps(direction, false);

        gsap.to(overlay, {
          duration: 0.5,
          ...animProps,
          ease: "power2.in",
        });
      });
    });
  });

  // ========================== Video Control JS ===========================
  const video = document.getElementById("quanto-video-2");
  const playBtn = document.querySelector(".play-btn");

  if (video && playBtn) {
    video.pause();

    playBtn.addEventListener("click", () => {
      video.play();
      playBtn.classList.add("disabled");
      video.classList.add("pointer");
    });

    video.addEventListener("click", () => {
      if (playBtn.classList.contains("disabled")) {
        video.pause();
        playBtn.classList.remove("disabled");
        video.classList.remove("pointer");
      }
    });
  }

  // ========================== Testimonial3 Slider ===========================
  // Store dependencies in variables
  const testimonial3Element = document.querySelector(".testimonial3-slider");
  const testimonial3NextButton = document.querySelector(
    ".testimonial3-navigation > .next-btn"
  );
  const testimonial3PrevButton = document.querySelector(
    ".testimonial3-navigation > .prev-btn"
  );

  // Check if all required elements are available
  if (testimonial3Element && testimonial3NextButton && testimonial3PrevButton) {
    const testimonial3Slider = new Swiper(testimonial3Element, {
      slidesPerView: 1,
      spaceBetween: 20,
      navigation: {
        nextEl: testimonial3NextButton,
        prevEl: testimonial3PrevButton,
      },
      loop: true,
      // autoplay: {
      //   delay: 5000,
      //   disableOnInteraction: false,
      // },
    });
  }

  // ===================================
  let horizontalSection = document.querySelector(".horizontal-scroll");

  if (device_width > 1199 && horizontalSection) {
    gsap.to(horizontalSection, {
      x: () => horizontalSection.scrollWidth * -1,
      xPercent: 100,
      scrollTrigger: {
        trigger: horizontalSection,
        start: "center center",
        end: "+=3000px",
        pin: horizontalSection,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  }

  /////////////////////////////////////////////////////
  let text_animation = gsap.utils.toArray(".move-anim");

  if (text_animation) {
    text_animation.forEach((splitTextLine) => {
      var delay_value = 0.1;
      if (splitTextLine.getAttribute("data-delay")) {
        delay_value = splitTextLine.getAttribute("data-delay");
      }
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: splitTextLine,
          start: "top 85%",
          duration: 1.3,
          scrub: false,
          markers: false,
          toggleActions: "play none none none",
        },
      });

      const itemSplitted = new SplitText(splitTextLine, {
        type: "lines",
      });
      gsap.set(splitTextLine, {
        perspective: 400,
      });
      itemSplitted.split({
        type: "lines",
      });
      tl.from(itemSplitted.lines, {
        duration: 1,
        delay: delay_value,
        opacity: 0,
        rotationX: -80,
        force3D: true,
        transformOrigin: "top center -50",
        stagger: 0.1,
      });
    });
  }

  // GSAP Fade Animation
  let fadeArray_items = document.querySelectorAll(".fade-anim");
  if (fadeArray_items.length > 0) {
    const fadeArray = gsap.utils.toArray(".fade-anim");
    // gsap.set(fadeArray, {opacity:0})
    fadeArray.forEach((item, i) => {
      var fade_direction = "bottom";
      var onscroll_value = 1;
      var duration_value = 1.15;
      var fade_offset = 50;
      var delay_value = 0.15;
      var ease_value = "power2.out";

      if (item.getAttribute("data-offset")) {
        fade_offset = item.getAttribute("data-offset");
      }
      if (item.getAttribute("data-duration")) {
        duration_value = item.getAttribute("data-duration");
      }

      if (item.getAttribute("data-direction")) {
        fade_direction = item.getAttribute("data-direction");
      }
      if (item.getAttribute("data-on-scroll")) {
        onscroll_value = item.getAttribute("data-on-scroll");
      }
      if (item.getAttribute("data-delay")) {
        delay_value = item.getAttribute("data-delay");
      }
      if (item.getAttribute("data-ease")) {
        ease_value = item.getAttribute("data-ease");
      }

      let animation_settings = {
        opacity: 0,
        ease: ease_value,
        duration: duration_value,
        delay: delay_value,
      };

      if (fade_direction == "top") {
        animation_settings["y"] = -fade_offset;
      }
      if (fade_direction == "left") {
        animation_settings["x"] = -fade_offset;
      }

      if (fade_direction == "bottom") {
        animation_settings["y"] = fade_offset;
      }

      if (fade_direction == "right") {
        animation_settings["x"] = fade_offset;
      }

      if (onscroll_value == 1) {
        animation_settings["scrollTrigger"] = {
          trigger: item,
          start: "top 85%",
        };
      }
      gsap.from(item, animation_settings);
    });
  }

  // Color change two

  document.addEventListener("DOMContentLoaded", function () {
    // Create the SplitText instance
    const splitt = new SplitText(".text_invert", { type: "lines" });

    // Set initial styles for the lines
    gsap.set(splitt.lines, {
      color: "#ddd", // Initial text color
      overflow: "hidden",
    });

    // Animate each line
    splitt.lines.forEach((target) => {
      gsap.to(target, {
        color: "#000000", // Final text color (red)
        duration: 1,
        ease: "power2.out",
        backgroundPositionX: 0,
        scrollTrigger: {
          trigger: target,
          scrub: true,
          start: "top 55%",
          end: "bottom center",
        },
      });
    });
  }); // Color change two end

  // Animation Word
  let animation_word_anim_items = document.querySelectorAll(".word-anim");

  animation_word_anim_items.forEach((word_anim_item) => {
    var stagger_value = 0.04;
    var translateX_value = false;
    var translateY_value = false;
    var onscroll_value = 1;
    var data_delay = 0.1;
    var data_duration = 0.75;

    if (word_anim_item.getAttribute("data-stagger")) {
      stagger_value = word_anim_item.getAttribute("data-stagger");
    }
    if (word_anim_item.getAttribute("data-translateX")) {
      translateX_value = word_anim_item.getAttribute("data-translateX");
    }

    if (word_anim_item.getAttribute("data-translateY")) {
      translateY_value = word_anim_item.getAttribute("data-translateY");
    }

    if (word_anim_item.getAttribute("data-on-scroll")) {
      onscroll_value = word_anim_item.getAttribute("data-on-scroll");
    }
    if (word_anim_item.getAttribute("data-delay")) {
      data_delay = word_anim_item.getAttribute("data-delay");
    }
    if (word_anim_item.getAttribute("data-duration")) {
      data_duration = word_anim_item.getAttribute("data-duration");
    }

    if (onscroll_value == 1) {
      if (translateX_value && !translateY_value) {
        let split_word = new SplitText(word_anim_item, {
          type: "chars, words",
        });
        gsap.from(split_word.words, {
          duration: data_duration,
          x: translateX_value,
          autoAlpha: 0,
          stagger: stagger_value,
          delay: data_delay,
          scrollTrigger: {
            trigger: word_anim_item,
            start: "top 90%",
          },
        });
      }

      if (translateY_value && !translateX_value) {
        let split_word = new SplitText(word_anim_item, {
          type: "chars, words",
        });
        gsap.from(split_word.words, {
          duration: 1,
          delay: data_delay,
          y: translateY_value,
          autoAlpha: 0,
          stagger: stagger_value,
          scrollTrigger: {
            trigger: word_anim_item,
            start: "top 90%",
          },
        });
      }

      if (translateY_value && translateX_value) {
        let split_word = new SplitText(word_anim_item, {
          type: "chars, words",
        });
        gsap.from(split_word.words, {
          duration: 1,
          delay: data_delay,
          x: translateX_value,
          y: translateY_value,
          autoAlpha: 0,
          stagger: stagger_value,
          scrollTrigger: {
            trigger: word_anim_item,
            start: "top 90%",
          },
        });
      }

      if (!translateX_value && !translateY_value) {
        let split_word = new SplitText(word_anim_item, {
          type: "chars, words",
        });
        gsap.from(split_word.words, {
          duration: 1,
          delay: data_delay,
          x: 20,
          autoAlpha: 0,
          stagger: stagger_value,
          scrollTrigger: {
            trigger: word_anim_item,
            start: "top 85%",
          },
        });
      }
    } else {
      if (translateX_value > 0 && !translateY_value) {
        let split_word = new SplitText(word_anim_item, {
          type: "chars, words",
        });
        gsap.from(split_word.words, {
          duration: 1,
          delay: data_delay,
          x: translateX_value,
          autoAlpha: 0,
          stagger: stagger_value,
        });
      }

      if (translateY_value > 0 && !translateX_value) {
        let split_word = new SplitText(word_anim_item, {
          type: "chars, words",
        });
        gsap.from(split_word.words, {
          duration: 1,
          delay: data_delay,
          y: translateY_value,
          autoAlpha: 0,
          stagger: stagger_value,
        });
      }

      if (translateY_value > 0 && translateX_value > 0) {
        let split_word = new SplitText(word_anim_item, {
          type: "chars, words",
        });
        gsap.from(split_word.words, {
          duration: 1,
          delay: data_delay,
          x: translateX_value,
          y: translateY_value,
          autoAlpha: 0,
          stagger: stagger_value,
        });
      }

      if (!translateX_value && !translateY_value) {
        let split_word = new SplitText(word_anim_item, {
          type: "chars, words",
        });
        gsap.from(split_word.words, {
          duration: 1,
          delay: data_delay,
          x: 20,
          autoAlpha: 0,
          stagger: stagger_value,
        });
      }
    }
  });

  // Hero Video Animation
  const heroThumb = document.querySelector(".quanto-hero__thumb");

  if (heroThumb) {
    let mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const videoWrapper = heroThumb.querySelector(".video-wrapper");

      if (videoWrapper) {
        let tp_hero = gsap.timeline({
          scrollTrigger: {
            trigger: heroThumb,
            start: "top 70",
            pin: true,
            markers: false,
            scrub: 1,
            pinSpacing: true,
            end: "bottom top",
          },
        });

        tp_hero.to(videoWrapper, {
          width: "100%",
          duration: 1.5,
          ease: "power2.inOut",
        });

        return () => {
          tp_hero.kill();
        };
      }
    });
  }
  // Hero Video Animation End

  /////////////////////////////////////////////////////
  // Image Reveal Animation
  let tp_img_reveal = document.querySelectorAll(".img_reveal");

  tp_img_reveal.forEach((img_reveal) => {
    let image = img_reveal.querySelector("img");
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: img_reveal,
        start: "top 70%",
      },
    });

    tl.set(img_reveal, { autoAlpha: 1 });
    tl.from(img_reveal, 1, {
      xPercent: -100,
      ease: Power2.out,
    });
    tl.from(image, 1.5, {
      xPercent: 100,
      scale: 1.5,
      delay: -1.5,
      ease: Power2.out,
    });
  });

  let sp = gsap.matchMedia();
  sp.add("(min-width: 1200px)", () => {
    if ($(".quanto-service2-section").length > 0) {
      ScrollTrigger.create({
        trigger: ".quanto-service2-section",
        start: "top -1%",
        end: "bottom 110.5%",
        pin: ".quanto-service2-section .quanto__header",
        pinSpacing: true,
      });
    }
  });

  //  sticky of Blog Details
  gsap.to(".social-links-scroll", {
    scrollTrigger: {
      trigger: ".blog-item-details .social-links",
      start: "top-=120 top",
      end: "80% top",
      pin: true,
      pinSpacing: false,
      scrub: true,
      markers: false,
    },
  });

  // Section Jump start
  const links = document.querySelectorAll(".section-link");

  if (links && links.length > 0) {
    links.forEach((link) => {
      link.addEventListener("click", function (event) {
        event.preventDefault();

        const targetID = this.getAttribute("href");

        if (targetID === "#header") {
          gsap.to(window, {
            duration: 1.5,
            scrollTo: { y: 0 },
            ease: "power2.inOut",
          });
        } else {
          const targetSection = document.querySelector(targetID);
          if (targetSection) {
            gsap.to(window, {
              duration: 1,
              scrollTo: {
                y: targetSection,
                offsetY: 50,
              },
            });
          } else {
            console.error(`Section with ID ${targetID} does not exist.`);
          }
        }
      });
    });
  }
  // Section Jump End

  function initTeamAnimations() {
    if (window.innerWidth >= 992) {
      // Select all elements with the class .gsap-sticky
      const stickyElements = document.querySelectorAll(".gsap-sticky");

      // Loop through each element and apply the ScrollTrigger animation
      stickyElements.forEach((element) => {
        ScrollTrigger.create({
          trigger: element,
          start: "top 80px",
          end: "110% bottom",
          pin: element,
          pinSpacing: false,
          markers: false,
        });
      });
    }
  }

  // Initialize animations
  initTeamAnimations();

  function animateBackground() {
    if (document.querySelector('.hero5-bg')) {
      gsap.set('.hero5-bg', { top: '-300px', scale: 0.5 });
      gsap.to('.hero5-bg', {
        duration: 2,
        top: '0px',
        scale: 1,
        ease: 'power2.out',
        delay: 0.6
      });
    }
  }
  animateBackground();
})(jQuery);
