/* Portfolio Website Script
   Supports:
   - loading animation
   - theme toggle (dark/light)
   - typing effect
   - animated counters
   - scroll reveal animations
   - project filtering
   - certificate modal popup
   - back-to-top button
   - smooth anchor scrolling
   - contact form validation
*/

document.addEventListener('DOMContentLoaded', () => {
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // -----------------------------
  // Loader
  // -----------------------------
  const loader = qs('#page-loader');
  const markLoaded = () => document.body.classList.add('is-loaded');
  window.addEventListener('load', markLoaded);
  setTimeout(markLoaded, 2000);

  // -----------------------------
  // Theme toggle
  // -----------------------------
  const darkModeToggle = qs('#dark-mode-toggle');
  const darkModeIcon = qs('#dark-mode-icon');
  const prefersDarkScheme = window.matchMedia?.('(prefers-color-scheme: dark)');
  const currentTheme = localStorage.getItem('theme');

  const applyIcon = (isDark) => {
    if (!darkModeIcon) return;
    darkModeIcon.classList.toggle('fa-moon', !isDark);
    darkModeIcon.classList.toggle('fa-sun', isDark);
  };

  const initialDark = currentTheme === 'dark' || (!currentTheme && prefersDarkScheme?.matches);
  if (initialDark) document.documentElement.classList.add('dark');
  applyIcon(initialDark);

  darkModeToggle?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    applyIcon(isDark);
  });

  // -----------------------------
  // Scroll progress bar
  // -----------------------------
  const scrollProgress = qs('#scroll-progress');
  const updateProgress = () => {
    if (!scrollProgress) return;
    const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  // -----------------------------
  // Mobile menu toggle
  // -----------------------------
  const mobileMenuButton = qs('#mobile-menu-button');
  const mobileMenu = qs('#mobile-menu');

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    qsa('#mobile-menu a[href^="#"]', mobileMenu).forEach((link) => {
      link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }

  // -----------------------------
  // Smooth anchor scrolling (offset for sticky header)
  // -----------------------------
  const headerOffset = 78;
  qsa('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;

      const target = qs(href);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // -----------------------------
  // Reveal animations
  // -----------------------------
  const revealEls = qsa('[data-reveal]');
  if (revealEls.length && !prefersReducedMotion) {
    const revealObs = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) en.target.classList.add('is-visible');
        }),
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => revealObs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // -----------------------------
  // Back to top button
  // -----------------------------
  const backToTop = qs('#backToTop');
  if (backToTop) {
    const toggleBackToTop = () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 600);
    };
    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // -----------------------------
  // Animated counters
  // -----------------------------
  const counterEls = qsa('[data-count]');
  const animateCount = (el) => {
    const rawTarget = el.getAttribute('data-count') ?? '0';
    const target = Number(rawTarget);
    if (!Number.isFinite(target)) return;

    if (prefersReducedMotion) {
      el.textContent = String(target);
      return;
    }

    const duration = 900;
    const start = performance.now();
    const from = 0;

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = Math.floor(from + (target - from) * t);
      el.textContent = String(v);
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (counterEls.length && !prefersReducedMotion) {
    const counterObs = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target;
          if (el.dataset.animated === '1') return;
          el.dataset.animated = '1';
          animateCount(el);
        }),
      { threshold: 0.35 }
    );
    counterEls.forEach((el) => counterObs.observe(el));
  } else {
    counterEls.forEach((el) => animateCount(el));
  }

  // -----------------------------
  // Typing effect
  // -----------------------------
  const typingEl = qs('.typing');
  if (typingEl) {
    const roleTexts = ['Full Stack Developer | IT Engineering Student', 'Building AI-powered Web Experiences'];

    if (prefersReducedMotion) {
      typingEl.textContent = roleTexts[0];
    } else {
      let textIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const tick = () => {
        const current = roleTexts[textIndex] || roleTexts[0];

        if (!deleting) {
          typingEl.textContent = current.slice(0, charIndex + 1);
          charIndex++;
          if (charIndex >= current.length) {
            deleting = true;
            setTimeout(tick, 900);
            return;
          }
        } else {
          typingEl.textContent = current.slice(0, charIndex - 1);
          charIndex--;
          if (charIndex <= 0) {
            deleting = false;
            textIndex = (textIndex + 1) % roleTexts.length;
          }
        }

        setTimeout(tick, deleting ? 35 : 55);
      };

      tick();
    }
  }

  // -----------------------------
  // Project filtering
  // -----------------------------
  const filterBtns = qsa('[data-filter]');
  const projectCards = qsa('[data-project]');

  const applyFilter = (filter) => {
    projectCards.forEach((card) => {
      const tags = (card.getAttribute('data-tags') || '').toLowerCase();
      const match =
        filter === 'all' ||
        (filter === 'frontend' && tags.includes('frontend')) ||
        (filter === 'fullstack' && tags.includes('fullstack')) ||
        (filter === 'javascript' && tags.includes('javascript'));

      card.classList.toggle('is-hidden', !match);
    });
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  applyFilter('all');

  // -----------------------------
  // Certification modal
  // -----------------------------
  const modal = qs('#cert-modal');
  const modalImg = qs('#cert-modal-image');
  const modalTitle = qs('#cert-modal-title');
  const closeBtn = qs('#cert-modal-close');

  const openModal = (title, src) => {
    if (!modal) return;
    if (modalTitle) modalTitle.textContent = title || 'Certification Preview';
    if (modalImg) modalImg.src = src || '';
    modal.hidden = false;
  };

  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
  };

  qsa('[data-cert-src]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-cert-title') || 'Certification Preview';
      const src = btn.getAttribute('data-cert-src');
      openModal(title, src);
    });
  });

  closeBtn?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    const el = e.target;
    if (el && el.hasAttribute && el.hasAttribute('data-modal-close')) closeModal();
    if (el && el.classList && el.classList.contains('modal__backdrop')) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // -----------------------------
  // Contact form validation
  // -----------------------------
  const contactForm = qs('#contact-form');
  const successEl = qs('#contact-success');

  const setError = (fieldId, message) => {
    const input = qs(`#${CSS.escape(fieldId)}`);
    const err = qs(`[data-error-for="${CSS.escape(fieldId)}"]`);
    if (err) err.textContent = message || '';
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  };

  const clearErrors = () => {
    ['name', 'email', 'subject', 'message'].forEach((id) => setError(id, ''));
  };

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (successEl) successEl.classList.add('hidden');

      clearErrors();

      const name = qs('#name')?.value?.trim() || '';
      const email = qs('#email')?.value?.trim() || '';
      const subject = qs('#subject')?.value?.trim() || '';
      const message = qs('#message')?.value?.trim() || '';

      let ok = true;

      if (name.length < 2) {
        ok = false;
        setError('name', 'Please enter your name (min 2 chars).');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        ok = false;
        setError('email', 'Please enter a valid email.');
      }

      if (subject.length < 3) {
        ok = false;
        setError('subject', 'Please enter a subject (min 3 chars).');
      }

      if (message.length < 10) {
        ok = false;
        setError('message', 'Message should be at least 10 characters.');
      }

      if (!ok) return;

      // Static site: show success UI
      if (successEl) {
        successEl.textContent = 'Message sent successfully! I will get back to you soon.';
        successEl.classList.remove('hidden');
      }

      contactForm.reset();
    });
  }
});
