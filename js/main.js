/* ============================================================
   Kathu Cats — main.js
   Mobile nav, sticky scroll, smooth scroll, fade-in observer
   ============================================================ */

(function () {
  'use strict';

  /* --- Mobile Nav Toggle --- */
  const nav = document.querySelector('.site-nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close nav when clicking outside
    document.addEventListener('click', function (e) {
      if (nav && !nav.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --- Sticky Nav on Scroll --- */
  if (nav) {
    function handleScroll() {
      if (window.scrollY > 10) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* --- Smooth Scroll for Anchor Links --- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* --- Intersection Observer: Fade-in --- */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.fade-in').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all fade-in elements immediately
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* --- Active Nav Link --- */
  (function setActiveNav() {
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      const linkPath = link.getAttribute('href').replace(/\/$/, '') || '/';
      if (linkPath === currentPath) {
        link.classList.add('active');
      }
    });
  })();

})();

if (typeof lucide !== 'undefined') lucide.createIcons();

/* --- Campaign Notification ---
   Shown on all pages except the home page (campaign already visible there).
   Dismissed state persists via localStorage.
------------------------------------------------------------ */
(function () {
  if (window.location.pathname === '/' || window.location.pathname === '') return;

  try {
    if (localStorage.getItem('campaignNotifDismissed') === '1') return;
  } catch (e) {}

  var notif = document.createElement('div');
  notif.className = 'campaign-notif';
  notif.id = 'campaign-notif';
  notif.setAttribute('role', 'complementary');
  notif.innerHTML =
    '<a href="/#campaigns" class="campaign-notif-link">' +
      '<span class="campaign-notif-dot"></span>' +
      'Active Campaign' +
    '</a>' +
    '<button class="campaign-notif-close" aria-label="Dismiss">&times;</button>';

  document.body.appendChild(notif);

  notif.querySelector('.campaign-notif-close').addEventListener('click', function () {
    notif.classList.add('campaign-notif--hiding');
    setTimeout(function () { notif.style.display = 'none'; }, 250);
    try { localStorage.setItem('campaignNotifDismissed', '1'); } catch (e) {}
  });
})();

/* --- Auto Image Extension Resolver ---
   Finds every <img data-auto-src="..."> and tries extensions in order
   until one loads. Supports jpg, jpeg, png, webp, avif.
------------------------------------------------------------ */
(function () {
  var EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'avif'];

  function resolveImage(img) {
    var base = img.getAttribute('data-auto-src');
    if (!base) return;

    var idx = 0;

    function tryNext() {
      if (idx >= EXTENSIONS.length) return; // no match found — image stays blank
      var ext = EXTENSIONS[idx++];
      var probe = new Image();
      probe.onload = function () {
        img.src = probe.src;
      };
      probe.onerror = tryNext;
      probe.src = base + '.' + ext;
    }

    tryNext();
  }

  document.querySelectorAll('img[data-auto-src]').forEach(resolveImage);
})();
