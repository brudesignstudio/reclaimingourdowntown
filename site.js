/* Reclaiming Our Downtown · shared behavior */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav: pill on scroll, hide on scroll down ---------- */
  var nav = document.getElementById('nav');
  if (nav) {
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      nav.classList.toggle('scrolled', y > 60);
      if (y > 380 && y > lastY + 6) nav.classList.add('hidden');
      else if (y < lastY - 6 || y < 380) nav.classList.remove('hidden');
      lastY = y;
    }, { passive: true });
  }

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('navToggle');
  var menu = document.getElementById('navLinks');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { revealIO.observe(el); });

  /* ---------- headlines render statically (no word-split animation) ----------
     Keeping the heading text intact (rather than splitting it into per-word
     spans) means the gradient accent words paint reliably on mobile too. */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    el.classList.add('in');
  });

  /* ---------- gentle parallax on [data-plx] ---------- */
  var plx = [];
  document.querySelectorAll('[data-plx]').forEach(function (el) {
    plx.push({ el: el, speed: parseFloat(el.dataset.plx) || 0 });
  });
  if (plx.length && !reducedMotion) {
    var ticking = false;
    var updatePlx = function () {
      ticking = false;
      var mid = window.innerHeight / 2;
      plx.forEach(function (p) {
        var r = p.el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > window.innerHeight + 80) return;
        var offset = (r.top + r.height / 2 - mid) * p.speed;
        p.el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updatePlx); }
    }, { passive: true });
    updatePlx();
  }

  /* ---------- count up / count down ---------- */
  var countIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var down = el.dataset.countDown != null;
      var from = down ? parseFloat(el.dataset.countDown) : 0;
      var to = down ? 0 : parseFloat(el.dataset.count);
      var prefix = el.dataset.prefix || '';
      var suffix = el.dataset.suffix || '';
      var dur = 1700;
      var start = performance.now();
      var render = function (v) {
        // drop the unit (e.g. "M") once the number lands on zero
        el.textContent = prefix + v.toLocaleString() + (v === 0 ? '' : suffix);
      };
      (function step(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var v = Math.round(from + (to - from) * eased);
        render(v);
        if (p < 1) requestAnimationFrame(step);
        else render(to);
      })(start);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count], [data-count-down]').forEach(function (el) { countIO.observe(el); });

  /* ---------- ticker: duplicate content for a seamless loop ---------- */
  document.querySelectorAll('.ticker-track').forEach(function (track) {
    var set = track.querySelector('.ticker-set');
    if (set) {
      var clone = set.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }
  });

  /* ---------- accordions (.vrow / .faq-item) ----------
     Hover opens them via CSS; click/tap toggles a sticky .open
     state so touch devices and keyboards work too. */
  function wireAccordion(itemSel, btnSel) {
    document.querySelectorAll(itemSel).forEach(function (item) {
      var btn = item.querySelector(btnSel);
      if (!btn) return;
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  }
  wireAccordion('.vrow', '.vrow-btn');
  wireAccordion('.faq-item', '.faq-q');

  /* ---------- hero artwork view toggle (sketch / day / night) ---------- */
  var viewToggle = document.getElementById('viewToggle');
  if (viewToggle) {
    var artStageEl = document.querySelector('.art-stage');
    var arts = document.querySelectorAll('.art-stage .art');
    var setView = function (view) {
      arts.forEach(function (img) {
        img.classList.toggle('show', img.dataset.view === view);
      });
      if (artStageEl) artStageEl.dataset.view = view;
    };
    var selected = viewToggle.querySelector('button[aria-selected="true"]');
    if (selected) setView(selected.dataset.view);
    viewToggle.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        viewToggle.querySelectorAll('button').forEach(function (b) {
          b.setAttribute('aria-selected', 'false');
        });
        btn.setAttribute('aria-selected', 'true');
        setView(btn.dataset.view);
      });
    });
  }

  /* ---------- autoplay videos: respect reduced-motion ---------- */
  if (reducedMotion) {
    document.querySelectorAll('.plan-video video, .join-bg').forEach(function (vid) {
      vid.removeAttribute('autoplay');
      vid.removeAttribute('loop');
      vid.autoplay = false;
      vid.loop = false;
      vid.pause();
    });
  }

  /* ---------- draggable rails (news cards) ---------- */
  document.querySelectorAll('.rail').forEach(function (rail) {
    var isDown = false, moved = false, startX = 0, startScroll = 0;
    rail.addEventListener('pointerdown', function (e) {
      isDown = true; moved = false;
      startX = e.clientX; startScroll = rail.scrollLeft;
      rail.classList.add('dragging');
    });
    rail.addEventListener('pointermove', function (e) {
      if (!isDown) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) {
        moved = true;
        rail.setPointerCapture(e.pointerId);
        rail.scrollLeft = startScroll - dx;
      }
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
      rail.addEventListener(evt, function () {
        isDown = false;
        rail.classList.remove('dragging');
      });
    });
    // swallow the click that follows a drag so links don't fire
    rail.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  });

  /* ---------- join form + math captcha ---------- */
  var form = document.getElementById('joinForm');
  if (form) {
    var qEl = document.getElementById('captchaQ');
    var err = document.getElementById('captchaErr');
    var ok = document.getElementById('formOk');
    var capIn = document.getElementById('f-captcha');
    var sum = 0;
    var newCaptcha = function () {
      var a = Math.floor(Math.random() * 8) + 1;
      var b = Math.floor(Math.random() * 8) + 1;
      sum = a + b;
      qEl.textContent = a + ' + ' + b;
    };
    newCaptcha();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (parseInt(capIn.value, 10) !== sum) {
        err.textContent = 'Please answer the spam check question correctly.';
        err.classList.add('show');
        newCaptcha(); capIn.value = ''; capIn.focus();
        return;
      }
      err.classList.remove('show'); err.textContent = '';
      var name = (form.querySelector('[name=name]').value.trim().split(' ')[0]) || 'friend';
      ok.textContent = 'Thanks, ' + name + ', you are on the list.';
      form.reset(); newCaptcha();
    });
  }

  /* ---------- welcome modal ----------
     Opens once per session, right after the visitor scrolls past the
     looping hero video. Fully dismissable: close button, backdrop, Esc,
     or either action button. Focus is trapped while open and restored on
     close, so it works for keyboard and screen-reader users. */
  var modal = document.getElementById('welcomeModal');
  // trigger just after the looping hero video scrolls out of view
  var heroVideo = document.querySelector('.hero .video-frame') || document.getElementById('top');
  if (modal && heroVideo) {
    var card = modal.querySelector('.modal-card');
    var lastFocused = null;
    var seen = false;
    try { seen = sessionStorage.getItem('rodWelcomeSeen') === '1'; } catch (e) {}

    var focusablesIn = function (el) {
      return Array.prototype.filter.call(
        el.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        function (n) { return n.offsetParent !== null || n === document.activeElement; }
      );
    };

    var onKeydown = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
      if (e.key !== 'Tab') return;
      var f = focusablesIn(card);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    var openModal = function () {
      if (seen) return;
      seen = true;
      try { sessionStorage.setItem('rodWelcomeSeen', '1'); } catch (e) {}
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      document.addEventListener('keydown', onKeydown);
      var closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) closeBtn.focus();
    };

    function closeModal() {
      if (modal.hidden) return;
      modal.hidden = true;
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onKeydown);
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', function () { closeModal(); });
    });

    if (!seen) {
      var onScrollCheck = function () {
        // open once the looping video has scrolled up out of view
        if (heroVideo.getBoundingClientRect().bottom < 0) {
          window.removeEventListener('scroll', onScrollCheck);
          openModal();
        }
      };
      window.addEventListener('scroll', onScrollCheck, { passive: true });
      onScrollCheck();
    }
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
