/* ============================================
   GRANDSKY — Main JavaScript
   ============================================ */

(function () {
  'use strict';

  /* ---------- Fail-safe reveal bootstrap ----------
     The stylesheet only hides elements while `html.js` is present. We add that
     class here and remove it again if anything below throws, so a blocked,
     missing, or broken script can never leave the page blank. */
  const root = document.documentElement;
  const revealEverything = () => root.classList.remove('js');
  root.classList.remove('no-js');
  root.classList.add('js');
  window.addEventListener('error', revealEverything);
  window.addEventListener('unhandledrejection', revealEverything);

  /* ---------- Header + scroll progress + back-to-top ---------- */
  const header = document.getElementById('header');
  const progress = document.getElementById('scrollProgress');
  const toTop = document.getElementById('toTop');

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 40);

    if (progress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
      progress.style.width = pct + '%';
    }

    if (toTop) toTop.classList.toggle('show', y > 600);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Mobile menu toggle ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (header && !header.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      }
    });
  }

  /* ---------- Active nav link ---------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---------- Scroll reveal: auto-stagger then observe ---------- */
  const REVEAL_SELECTOR = '.fade-up, .reveal, .reveal-left, .reveal-right, .zoom-in';
  const revealEls = document.querySelectorAll(REVEAL_SELECTOR);

  // Give grouped elements a cascade delay unless one is set inline.
  const seenParents = new WeakSet();
  revealEls.forEach(el => {
    if (el.style.getPropertyValue('--d')) return;
    const parent = el.parentElement;
    if (!parent || seenParents.has(parent)) return;
    const siblings = Array.from(parent.children).filter(c => c.matches(REVEAL_SELECTOR));
    if (siblings.length > 1) {
      siblings.forEach((sib, i) => {
        if (!sib.style.getPropertyValue('--d')) {
          sib.style.setProperty('--d', (Math.min(i, 5) * 0.08).toFixed(2) + 's');
        }
      });
      seenParents.add(parent);
    }
  });

  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Hero status card bars ---------- */
  const opsCard = document.querySelector('.ops-card');
  if (opsCard && 'IntersectionObserver' in window) {
    const opsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          opsCard.classList.add('loaded');
          opsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    opsObserver.observe(opsCard);
  } else if (opsCard) {
    opsCard.classList.add('loaded');
  }

  /* ---------- FAQ accordion ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-q');
    const panel = item.querySelector('.faq-a');
    if (!btn || !panel) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close any other open item for a clean single-open accordion.
      faqItems.forEach(other => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          const otherPanel = other.querySelector('.faq-a');
          const otherBtn = other.querySelector('.faq-q');
          if (otherPanel) otherPanel.style.maxHeight = '';
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        panel.style.maxHeight = '';
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Stat counter animation ---------- */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const duration = 1800;
    const start = performance.now();
    const suffix = el.dataset.suffix || '';

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counters = document.querySelectorAll('[data-target]');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(el => counterObserver.observe(el));
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      let target = null;
      try {
        target = document.querySelector(href);
      } catch (err) {
        return;
      }
      if (target) {
        e.preventDefault();
        const offset = 84; // header height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- Thank-you countdown redirect ---------- */
  const countdownEl = document.getElementById('redirectSeconds');
  if (countdownEl) {
    let countdown = 5;
    const redirectUrl = location.pathname.replace(/thankyou\.html$/, 'index.html');
    const interval = setInterval(() => {
      countdown -= 1;
      countdownEl.textContent = String(Math.max(countdown, 0));
      if (countdown <= 0) {
        clearInterval(interval);
        window.location.replace(redirectUrl);
      }
    }, 1000);
  }

  /* ---------- Contact form (Web3Forms, hardened) ---------- */
  // Only strip markup that could ever be echoed back into the page.
  function clean(value, max) {
    return String(value == null ? '' : value).replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max || 2000);
  }
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const web3Forms = document.querySelectorAll('form[data-redirect]');
  if (web3Forms.length) {
    web3Forms.forEach((form) => {
      const loadedAt = Date.now();

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Bot trap: a hidden checkbox real users never touch, plus a speed check.
        const trap = form.querySelector('input[name="botcheck"]');
        if (trap && trap.checked) return;
        if (Date.now() - loadedAt < 1800) return;

        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;

        // Sanitise + bound every field before it leaves the browser.
        const formData = new FormData(form);
        formData.delete('botcheck');
        for (const [key, value] of formData.entries()) {
          if (typeof value === 'string') formData.set(key, clean(value, 3000));
        }
        const email = clean(formData.get('email'), 254);
        if (email && !EMAIL_RE.test(email)) {
          alert('Please enter a valid email address.');
          return;
        }
        if (!formData.has('access_key')) {
          formData.append('access_key', '777708b8-949b-42d0-9870-a28c7141ee16');
        }

        const originalMarkup = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Sending...';

        try {
          const response = await fetch(form.action || 'https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData,
            headers: { Accept: 'application/json' }
          });

          const data = await response.json().catch(() => ({}));

          if (response.ok && data.success) {
            const redirect = form.dataset.redirect || 'thankyou.html';
            window.location.href = redirect;
            return;
          }

          // Never trust remote text as markup — strip tags before showing it.
          const message = clean(data.message || 'Unable to submit the form. Please try again later.', 300)
            .replace(/[<>]/g, '');
          alert('Error: ' + message);
        } catch (error) {
          alert('Something went wrong. Please try again.');
          console.error('Web3Forms submit error', error);
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalMarkup;
        }
      });
    });
  }

  /* ---------- 5-year celebration promo (homepage only) ----------
     The card ships with `hidden`, so it appears only when JS is alive and
     working. It re-appears once every 7 days rather than nagging on every
     visit, and traps focus so keyboard users cannot tab into the page
     behind it. */
  const promo = document.getElementById('promo');
  if (promo) {
    const PROMO_KEY = 'gsPromoSeenAt';
    const REOPEN_AFTER = 7 * 24 * 60 * 60 * 1000;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastFocused = null;

    /* ---- debug helper: paste gsPromoDebug in the console to inspect state ---- */
    const showState = () => {
      console.log('gsPromoDebug:');
      console.log('  promo hidden        :', promo.hidden);
      console.log('  promo .open class   :', promo.classList.contains('open'));
      console.log('  body promo-open     :', document.body.classList.contains('promo-open'));
      console.log('  html.js            :', document.documentElement.classList.contains('js'));
      console.log('  location.search    :', location.search);
      console.log('  forceViaParam      :', forceViaParam);
      try {
        console.log('  stored gsPromoSeenAt :', localStorage.getItem(PROMO_KEY) || '(none)');
      } catch (err) {
        console.log('  localStorage        : unavailable (' + err.message + ')');
      }
    };
    window.gsPromoDebug = showState;

    const HOMEPAGE_PATH = new URL(location.href, window.location.origin).pathname.replace(/\/+$/, '');
    const isHomepage = !HOMEPAGE_PATH.endsWith('thankyou.html') && (HOMEPAGE_PATH === '' || HOMEPAGE_PATH.endsWith('index.html'));
    const forceViaParam = 'promo' in Object.fromEntries(new URLSearchParams(location.search));

    const seenRecently = () => {
      try {
        const stamp = Number(localStorage.getItem(PROMO_KEY) || 0);
        return stamp > 0 && Date.now() - stamp < REOPEN_AFTER;
      } catch (err) {
        return false; // storage blocked — show it rather than hide the milestone
      }
    };
    const    rememberDismissed = () => {
      try { localStorage.setItem(PROMO_KEY, String(Date.now())); } catch (err) { /* ignore */ }
      try { history.replaceState(null, '', location.pathname + location.search.replace(/[?&]promo=?(&|#|$)/, '$1').replace(/[?&]promo(&|#|$)/, '$1').replace(/^\?(&|$)/, '?').replace(/^&&/, '?')) } catch (err) { /* ignore */ }
    };

    const openPromo = () => {
      if (promo.classList.contains('open')) return;
      lastFocused = document.activeElement;
      promo.hidden = false;
      document.body.classList.add('promo-open');
      // Reveal on the next frame so the transition has a start state to run from.
      window.requestAnimationFrame(() => promo.classList.add('open'));
      const closeBtn = promo.querySelector('.promo-close');
      if (closeBtn) closeBtn.focus();
    };

    const closePromo = () => {
      if (!promo.classList.contains('open')) return;
      rememberDismissed();
      promo.classList.remove('open');
      document.body.classList.remove('promo-open');
      // Hand focus back to wherever it came from. If that was the page itself,
      // blur instead — otherwise focus would stay trapped on the hidden close button.
      if (lastFocused && lastFocused !== document.body && lastFocused.focus) {
        lastFocused.focus();
      } else if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
      setTimeout(() => {
        // Guard against a reopen landing mid-transition.
        if (!promo.classList.contains('open')) promo.hidden = true;
      }, 500);
    };

    promo.querySelectorAll('[data-promo-close]').forEach(el => {
      el.addEventListener('click', closePromo);
    });
    // Following a link inside the promo counts as dismissing it.
    promo.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', closePromo);
    });

    document.addEventListener('keydown', (e) => {
      if (!promo.classList.contains('open')) return;
      if (e.key === 'Escape') { closePromo(); return; }
      if (e.key !== 'Tab') return;

      // Simple focus trap across the card's controls.
      const focusables = promo.querySelectorAll('a[href], button');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    const shouldShow = isHomepage && (forceViaParam || !seenRecently());
    if (!shouldShow) {
      console.log('gsPromo: not showing (not homepage, ?promo set, or recently dismissed).');
    } else if (forceViaParam) {
      console.log('gsPromo: forcing open via ?promo on the homepage.');
      openPromo();
    } else {
      console.log('gsPromo: showing for a fresh, non-forced homepage visit.');
      setTimeout(openPromo, reduced ? 0 : 900);
    }
  }

  /* ---------- Spinner keyframes ---------- */
  const style = document.createElement('style');
  style.textContent = '.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
})();
