/* ============================================================
   VELOCE — interactivity
   Progress · nav · scrollspy · reveal · counters · gauge ·
   filters · swatches · quotes · lightbox · form · toast
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var scrollY = window.scrollY || window.pageYOffset;

  /* ---------- helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ============================================================
     LOADER — speed 0→100 (accelerating), then reveal page
     ============================================================ */
  var loader = document.getElementById("loader");
  var loaderNum = document.getElementById("loaderNum");
  var loaderBar = document.getElementById("loaderBar");
  var loaderCar = document.getElementById("loaderCar");

  function driveCar(pct) {
    if (!loaderCar) return;
    var road = loaderCar.parentNode;
    var maxX = ((road ? road.clientWidth : 280) - loaderCar.offsetWidth) || 0;
    var x = Math.max(0, Math.round(maxX * (pct / 100)));
    loaderCar.style.transform = "translate(" + x + "px, -50%)";
  }

  function runLoader() {
    if (!loader) return;
    if (prefersReduced) { loader.classList.add("is-done"); document.body.classList.add("is-loaded"); return; }

    document.body.style.overflow = "hidden";
    var n = 0;
    var start = performance.now();
    var DURATION = 1400;
    // ease-in curve: starts slow, ends fast (rev metre spooling up)
    function easeOut(p) { return 1 - Math.pow(1 - p, 2.6); }

    function tick(now) {
      var p = Math.min(1, (now - start) / DURATION);
      var pct = Math.round(easeOut(p) * 100);
      if (loaderNum) loaderNum.textContent = pct;
      if (loaderBar) loaderBar.style.width = pct + "%";
      driveCar(pct);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(function () {
          loader.classList.add("is-done");
          document.body.classList.add("is-loaded");
          document.body.style.overflow = "";
        }, 220);
      }
    }
    requestAnimationFrame(tick);
  }
  runLoader();

  /* ============================================================
     CUSTOM CURSOR (fine pointers only)
     ============================================================ */
  var cursor = document.getElementById("cursor");
  if (cursor && window.matchMedia("(pointer:fine)").matches && !prefersReduced) {
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    var rx = cx, ry = cy; // ring position (lerped)
    var raf = null;

    document.addEventListener("mousemove", function (e) {
      cx = e.clientX;
      cy = e.clientY;
      cursor.classList.add("is-on");
      var dot = $(".cursor__dot", cursor);
      if (dot) dot.style.transform = "translate(" + (cx) + "px," + (cy) + "px) translate(-50%,-50%)";
      if (!raf) {
        raf = requestAnimationFrame(function loop() {
          rx += (cx - rx) * 0.18;
          ry += (cy - ry) * 0.18;
          var ring = $(".cursor__ring", cursor);
          if (ring) ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
          if (Math.abs(cx - rx) > 0.4 || Math.abs(cy - ry) > 0.4) {
            raf = requestAnimationFrame(loop);
          } else {
            raf = null;
          }
        });
      }
    });

    document.addEventListener("mousedown", function () { cursor.classList.add("is-pressed"); });
    document.addEventListener("mouseup", function () { cursor.classList.remove("is-pressed"); });

    // grow ring over links, buttons, and card-interactive things
    $$("a, button, .model-card, .gallery-item, .chip, [role='button'], input, select, textarea").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cursor.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { cursor.classList.remove("is-hover"); });
    });
  }

  /* ============================================================
     FOOTER SUBSCRIBE (simple no-backend showcase)
     ============================================================ */
  var footerForm = document.getElementById("footerForm");
  if (footerForm) {
    footerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var em = footerForm.querySelector("#footerEmail");
      var note = footerForm.querySelector(".footer__form-note");
      if (!em || !em.value || em.value.indexOf("@") < 0) {
        if (note) note.textContent = "Please enter a valid email address.";
        return;
      }
      footerForm.querySelector("button").textContent = "Welcome on board ✓";
      if (note) { note.textContent = "You're in. Watch your inbox for allocations."; note.classList.add("is-success"); }
    });
  }

  /* ============================================================
     SCROLL PROGRESS BAR + NAV STATE
     ============================================================ */
  var progressBar = document.getElementById("progressBar");
  var siteNav = document.getElementById("siteNav");
  var toTopBtn = document.getElementById("toTop");

  function onScroll() {
    scrollY = window.scrollY || window.pageYOffset;

    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (scrollY / max) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";

    if (siteNav) siteNav.classList.toggle("is-scrolled", scrollY > 40);
    if (toTopBtn) toTopBtn.hidden = scrollY < 600;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ============================================================
     NAV: active link (scrollspy)
     ============================================================ */
  function spy() {
    var links = $$(".nav__link");
    var ids = links.map(function (l) { return l.getAttribute("href").slice(1); });
    var current = ids[0];

    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) current = id;
    });

    links.forEach(function (l) {
      var on = l.getAttribute("href").slice(1) === current;
      l.classList.toggle("is-active", on);
    });
  }

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  var burger = document.getElementById("navBurger");
  var mobileMenu = document.getElementById("mobileMenu");

  function setMenu(open) {
    if (!burger || !mobileMenu) return;
    burger.setAttribute("aria-expanded", String(open));
    if (open) {
      mobileMenu.hidden = false;
      document.body.style.overflow = "hidden";
    } else {
      mobileMenu.hidden = true;
      document.body.style.overflow = "";
    }
  }

  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
    $$("a", mobileMenu).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mobileMenu.hidden) setMenu(false);
    });
  }

  /* ============================================================
     REVEAL-ON-SCROLL (IntersectionObserver)
     ============================================================ */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    reveals.forEach(function (el, i) {
      // stagger reveals that appear together via data-reveal
      var n = parseInt(el.getAttribute("data-reveal"), 10) || (i % 3);
      el.style.setProperty("--reveal-delay", n * 90 + "ms");
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ============================================================
     COUNTERS (hero stats)
     ============================================================ */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
    var dur = 1600;
    var start = null;

    if (prefersReduced) { el.textContent = target.toFixed(decimals); return; }

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(step);
  }

  var counters = $$(".stat__value[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ============================================================
     SPEC BARS (featured)
     ============================================================ */
  var specFills = $$(".spec-bars__fill[data-width]");
  if ("IntersectionObserver" in window && specFills.length) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.getAttribute("data-width") + "%";
          sio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    specFills.forEach(function (f) { sio.observe(f); });
  }

  /* ============================================================
     GAUGE + NEEDLE (performance)
     ============================================================ */
  var gaugeArc = $(".gauge__arc");
  var gaugeNeedle = $(".gauge__needle line");
  if (gaugeArc) {
    var gio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          gaugeArc.style.strokeDashoffset = "129";     // ~270° sweep, bottom gap clear
          if (gaugeNeedle) gaugeNeedle.style.transform = "rotate(270deg)";
          gio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    gio.observe(gaugeArc.closest(".perf-card") || gaugeArc);
  }

  /* ============================================================
     MODEL FILTER CHIPS
     ============================================================ */
  var chips = $$(".chip");
  var cards = $$(".model-card");
  if (chips.length) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");

        var f = chip.getAttribute("data-filter");
        cards.forEach(function (card) {
          var match = f === "all" || card.getAttribute("data-category") === f;
          card.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  /* ============================================================
     QUOTES SLIDER (editorial panel + arrows + live progress)
     ============================================================ */
  var dots = $$(".quote-dot");
  var quotes = $$(".quote");
  var quotePrev = document.getElementById("quotePrev");
  var quoteNext = document.getElementById("quoteNext");
  var quoteCount = document.getElementById("quoteCount");
  var quoteBar = document.getElementById("quoteBar");
  var pressCard = $(".press-card");
  var curQuote = 0;
  var quoteTimer = null;

  function runBar() {
    if (!quoteBar || prefersReduced) return;
    quoteBar.classList.remove("run");
    void quoteBar.offsetWidth;
    quoteBar.classList.add("run");
  }

  function showQuote(i) {
    if (!quotes.length) return;
    curQuote = (i + quotes.length) % quotes.length;
    quotes.forEach(function (q, idx) { q.classList.toggle("is-active", idx === curQuote); });
    dots.forEach(function (d, idx) { d.classList.toggle("is-active", idx === curQuote); });
    if (quoteCount) quoteCount.textContent = String(curQuote + 1).padStart(2, "0");
    runBar();
  }

  function nextQuote() { showQuote(curQuote + 1); restartQuoteTimer(); }
  function prevQuote() { showQuote(curQuote - 1); restartQuoteTimer(); }

  function restartQuoteTimer() {
    if (quoteTimer) clearInterval(quoteTimer);
    if (prefersReduced) return;
    quoteTimer = setInterval(nextQuote, 6500);
  }

  if (dots.length && quotes.length) {
    dots.forEach(function (d) {
      d.addEventListener("click", function () {
        showQuote(parseInt(d.getAttribute("data-slide"), 10));
        restartQuoteTimer();
      });
    });
    if (quoteNext) quoteNext.addEventListener("click", nextQuote);
    if (quotePrev) quotePrev.addEventListener("click", prevQuote);
    showQuote(0);

    if (pressCard && !prefersReduced) {
      pressCard.addEventListener("mouseenter", function () {
        if (quoteTimer) clearInterval(quoteTimer);
        pressCard.classList.add("is-paused");
      });
      pressCard.addEventListener("mouseleave", function () {
        pressCard.classList.remove("is-paused");
        restartQuoteTimer();
      });
    }
    restartQuoteTimer();
  }

  /* ============================================================
     GALLERY LIGHTBOX
     ============================================================ */
  var lightbox = document.getElementById("lightbox");
  var lightboxArt = document.getElementById("lightboxArt");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(item) {
    if (!lightbox || !item) return;
    var art = $(".gallery-item__art", item);
    lightboxArt.innerHTML = "";
    if (art) {
      var img = $("img", art);
      if (img) {
        var clone = img.cloneNode(false);
        clone.removeAttribute("srcset");
        clone.removeAttribute("sizes");
        clone.setAttribute("src", img.getAttribute("src").replace(/w=\d+/, "w=1600"));
        lightboxArt.appendChild(clone);
      }
    }
    lightboxCaption.textContent = item.getAttribute("data-caption") || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  $$(".gallery-item").forEach(function (item) {
    item.addEventListener("click", function () { openLightbox(item); });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
  });
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  /* ============================================================
     BACK TO TOP
     ============================================================ */
  if (toTopBtn) {
    toTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* ============================================================
     TEST DRIVE FORM
     ============================================================ */
  var form = document.getElementById("driveForm");
  var submitBtn = document.getElementById("submitBtn");
  var formAria = document.getElementById("formAria");
  var toast = document.getElementById("toast");
  var toastTimer = null;

  function setError(field, msg) {
    var wrap = field.closest(".field");
    if (!wrap) return;
    wrap.classList.toggle("is-error", !!msg);
    var p = $(".field__error", wrap);
    if (p) p.textContent = msg || "";
    return !!msg;
  }

  function validators(field) {
    var val = (field.value || "").trim();
    if (field.required && !val) return "This field is required.";
    if (field.type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      return "Please enter a valid email address.";
    }
    if (field.tagName === "SELECT" && !val) return "Please choose a model.";
    return "";
  }

  function focusFirstInvalid() {
    $$("input, select, textarea", form).some(function (f) {
      if (f.closest(".field").classList.contains("is-error")) { f.focus(); return true; }
      return false;
    });
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 3800);
  }

  if (form) {
    // clear errors on input
    $$("input, select, textarea", form).forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.closest(".field").classList.contains("is-error")) setError(field, "");
      });
      field.addEventListener("blur", function () {
        if (field.value.trim() || field.required) setError(field, validators(field));
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = null;
      $$("input, select, textarea", form).forEach(function (field) {
        var err = validators(field);
        if (setError(field, err) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        showToast("Please fix the highlighted fields.");
        return;
      }

      // simulate submit
      if (submitBtn) {
        submitBtn.classList.add("is-loading");
        submitBtn.textContent = "Sending…";
      }

      var name = ($("#f-name") && $("#f-name").value) || "";
      var model = ($("#f-model") && $("#f-model").value) || "";
      setTimeout(function () {
        if (submitBtn) {
          submitBtn.classList.remove("is-loading");
          submitBtn.textContent = "Request Booking";
        }
        form.reset();
        if (formAria) {
          formAria.textContent = "Request received — our team will contact you within 24 hours.";
          formAria.classList.add("is-success");
        }
        showToast(name + " — " + model + " test drive requested.");
      }, 900);
    });
  }

  /* ============================================================
     HERO CAROUSEL — auto-slide every 2s, dots, 3D live-tilt
     ============================================================ */
  var stage = document.getElementById("heroStage");
  var heroSlides = $$(".hero-slide", stage);
  var heroDots = $$(".hero-dot");
  var heroCar = $(".hero-car");
  var heroIndex = 0;
  var heroTimer = null;
  var HERODELAY = 5000;

  function setHeroSlide(i) {
    if (!heroSlides.length) return;
    heroIndex = (i + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (s, idx) {
      s.classList.toggle("is-active", idx === heroIndex);
    });
    heroDots.forEach(function (d, idx) {
      d.classList.toggle("is-active", idx === heroIndex);
    });

    // sync hero model name + count indicator
    var heroModel = document.getElementById("heroModel");
    var heroCount = document.getElementById("heroCount");
    var activeSlide = heroSlides[heroIndex];
    if (activeSlide && heroModel) {
      var m = activeSlide.getAttribute("data-model");
      if (m) heroModel.textContent = m;
    }
    if (heroCount) {
      var num = heroCount.querySelector("b");
      var total = heroSlides.length;
      if (num) num.textContent = String(heroIndex + 1).padStart(2, "0");
    }

    // sync the static hero stats strip to the active car
    var active = heroSlides[heroIndex];
    if (active) {
      var statVals = $$(".hero__stats .stat__value");
      var map = [
        ["data-hp", 0],
        ["data-accel", 1],
        ["data-top", 2],
        ["data-torque", 3]
      ];
      map.forEach(function (m) {
        var val = active.getAttribute(m[0]);
        var el = statVals[m[1]];
        if (val !== null && el) {
          el.dataset.count = val;
          el.textContent = val;
        }
      });
      $$(".hero__stats .stat").forEach(function (s, idx) {
        var suffix = idx === 1 ? "s" : "";
        var el = statVals[idx];
        if (el) el.dataset.suffix = suffix;
      });
    }
  }

  function restartHeroTimer() {
    if (heroTimer) clearInterval(heroTimer);
    if (prefersReduced) return;
    heroTimer = setInterval(function () {
      setHeroSlide(heroIndex + 1);
    }, HERODELAY);
  }

  if (heroSlides.length) {
    heroDots.forEach(function (d) {
      d.addEventListener("click", function () {
        setHeroSlide(parseInt(d.getAttribute("data-slide"), 10));
        restartHeroTimer();
      });
    });
    restartHeroTimer();
  }

  /* 3D tilt on pointer move (skip on touch / reduced motion) */
  if (heroCar && stage && !prefersReduced && window.matchMedia("(pointer:fine)").matches) {
    heroCar.classList.add("is-tilting");
    stage.addEventListener("pointermove", function (e) {
      var rect = stage.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      heroCar.style.setProperty("--tilt-y", (px * -7).toFixed(2) + "deg");
      heroCar.style.setProperty("--tilt-x", (py * 5).toFixed(2) + "deg");
      heroCar.classList.remove("on-exit");
    });
    stage.addEventListener("pointerleave", function () {
      heroCar.classList.add("on-exit");
      heroCar.style.setProperty("--tilt-y", "0deg");
      heroCar.style.setProperty("--tilt-x", "0deg");
    });
  }

  /* ============================================================
     PARALLAX + SCROLLSPY on scroll (rAF-throttled)
     ============================================================ */
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      spy();
      onScroll();
      ticking = false;
    });
  }, { passive: true });

  spy();
})();