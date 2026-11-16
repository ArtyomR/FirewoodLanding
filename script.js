/* ============================================================
   Дровишки — script.js
   1. Reveal-анимации при скролле (IntersectionObserver)
   2. Parallax фоновых пятен и лёгкий tilt hero-карточки
   3. Стеклянная шапка при скролле
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Reveal при скролле ---------- */

  var revealEls = document.querySelectorAll(".reveal");

  // stagger для детей контейнеров data-stagger
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    group.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.setProperty("--d", i);
    });
  });
  // data-delay — ручной порядок
  document.querySelectorAll(".reveal[data-delay]").forEach(function (el) {
    el.style.setProperty("--d", el.getAttribute("data-delay"));
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 2. Parallax ---------- */

  if (!reduceMotion) {
    var parallaxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    var heroCard = document.getElementById("heroCard");

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || window.pageYOffset;
        parallaxEls.forEach(function (el) {
          var speed = parseFloat(el.getAttribute("data-parallax")) || 0;
          el.style.transform = "translate3d(0," + (y * speed).toFixed(1) + "px,0)";
        });
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // лёгкий tilt hero-карточки за курсором (только десктоп)
    if (heroCard && window.matchMedia("(hover: hover)").matches) {
      var wrap = heroCard.closest(".hero__visual") || heroCard;
      wrap.addEventListener("mousemove", function (e) {
        var r = wrap.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
        heroCard.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
      });
      wrap.addEventListener("mouseleave", function () {
        heroCard.style.transform = "";
      });
    }
  }

  /* ---------- 3. Шапка: стекло при скролле ---------- */

  var header = document.getElementById("header");
  function headerState() {
    header.classList.toggle("is-stuck", (window.scrollY || 0) > 8);
  }
  window.addEventListener("scroll", headerState, { passive: true });
  headerState();

  /* ---------- 4. Модалка с формой заказа ---------- */

  var modal = document.getElementById("orderModal");
  if (modal) {
    var modalClose = modal.querySelector(".modal__close");
    var lastFocused = null;

    function openModal() {
      lastFocused = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      if (modalClose) modalClose.focus();
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    // Открытие по всем кнопкам с data-open-form (CTA «Зафиксировать цену», «Заказать N кубов»)
    document.querySelectorAll("[data-open-form]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
      });
    });

    // Закрытие: клик по оверлею или крестику
    modal.querySelectorAll("[data-close-form]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });

    // Закрытие по Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

  /* ---------- Год в подвале ---------- */

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
