/* ============================================================
   FunEnglish Kids – Main JS (nav, scroll, game tabs)
   ============================================================ */

(function () {
  /* ---- Mobile nav toggle ---- */
  var toggle = document.getElementById('navToggle');
  var navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });
  }

  /* ---- Active nav link on scroll ---- */
  var sections = ['hero', 'alphabet', 'vocabulary', 'games'];
  var navAnchors = document.querySelectorAll('.nav-link[data-section]');

  function onScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var active  = sections[0];
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top + window.pageYOffset - 120 <= scrollY) {
        active = id;
      }
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle('active', a.dataset.section === active);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Game tab switching ---- */
  var gameSelector = document.querySelector('.game-selector');
  var gamePanels   = document.querySelectorAll('.game-panel');

  if (gameSelector) {
    gameSelector.addEventListener('click', function (e) {
      var tab = e.target.closest('.game-tab');
      if (!tab) return;

      document.querySelectorAll('.game-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      var target = tab.dataset.game;
      gamePanels.forEach(function (panel) {
        panel.classList.toggle('active', panel.id === 'game-' + target);
      });
    });
  }

  /* ---- Scroll-reveal fade-in for sections ---- */
  function revealOnScroll() {
    var cards = document.querySelectorAll('.letter-card, .vocab-card, .section-header');
    cards.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        el.style.opacity = '1';
      }
    });
  }
  window.addEventListener('scroll', revealOnScroll, { passive: true });
  revealOnScroll();
})();
