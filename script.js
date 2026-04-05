/* ═══════════════════════════════════════════════════════════
   DECODARI – script.js
   Fonctionnalités : Navigation, Scroll, Filtres, Compteurs,
                     Formulaire, Animations
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ────────────────────────────────────────────
   UTILITAIRES
─────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ────────────────────────────────────────────
   1. ANNÉE FOOTER
─────────────────────────────────────────── */
const yearEl = qs('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ────────────────────────────────────────────
   2. HEADER SCROLL
─────────────────────────────────────────── */
const header = qs('#header');

function onScroll() {
  header?.classList.toggle('scrolled', window.scrollY > 40);
  qs('#back-to-top')?.classList.toggle('visible', window.scrollY > 400);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // init


/* ────────────────────────────────────────────
   3. NAVIGATION MOBILE (BURGER)
─────────────────────────────────────────── */
const burger   = qs('#burger');
const navMobile = qs('#nav-mobile');

burger?.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
});

// Fermer au clic sur un lien
qsa('a', navMobile).forEach(link => {
  link.addEventListener('click', () => {
    navMobile.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

// Fermer au clic en dehors
document.addEventListener('click', e => {
  if (!header.contains(e.target)) {
    navMobile.classList.remove('open');
    burger?.classList.remove('open');
    burger?.setAttribute('aria-expanded', 'false');
  }
});


/* ────────────────────────────────────────────
   4. SMOOTH SCROLL VERS L'ANCRE (header offset)
─────────────────────────────────────────── */
qsa('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = qs(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = header?.offsetHeight ?? 68;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ────────────────────────────────────────────
   5. BOUTON RETOUR EN HAUT
─────────────────────────────────────────── */
qs('#back-to-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ────────────────────────────────────────────
   6. REVEAL AU SCROLL (Intersection Observer)
─────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // délai échelonné basé sur la position dans le parent
        const siblings = qsa('.reveal', entry.target.parentElement);
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${Math.min(idx * 0.08, 0.4)}s`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
);

qsa('.reveal').forEach(el => revealObserver.observe(el));


/* ────────────────────────────────────────────
   7. COMPTEURS ANIMÉS (hero stats)
─────────────────────────────────────────── */
function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutExpo
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

qsa('[data-target]').forEach(el => counterObserver.observe(el));


/* ────────────────────────────────────────────
   8. FILTRE PRODUITS
─────────────────────────────────────────── */
const filterBtns = qsa('.filter-btn');
const productCards = qsa('.product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    // Mise à jour des boutons
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    // Animation des cartes
    productCards.forEach(card => {
      const cat = card.dataset.category;
      const show = filter === 'all' || cat === filter;

      if (show) {
        card.style.display = 'flex';
        // Forcer le reflow pour animer
        card.offsetHeight;
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        setTimeout(() => {
          if (card.style.opacity === '0') card.style.display = 'none';
        }, 280);
      }
    });
  });
});

// Appliquer le style initial sur les cartes
productCards.forEach(card => {
  card.style.transition = 'opacity .28s ease, transform .28s ease';
});


/* ────────────────────────────────────────────
   9. FORMULAIRE CONTACT
─────────────────────────────────────────── */
const form    = qs('#contact-form');
const success = qs('#form-success');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validation simple
    const requiredFields = qsa('[required]', form);
    let valid = true;

    requiredFields.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#C41E3A';
        valid = false;
      }
    });

    if (!valid) {
      // Shake léger sur le bouton
      const btn = qs('[type=submit]', form);
      btn.style.animation = 'none';
      btn.offsetHeight;
      btn.style.animation = 'shake .4s ease';
      return;
    }

    // Simuler l'envoi (à remplacer par un vrai backend ou service)
    const submitBtn = qs('[type=submit]', form);
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi…';
    submitBtn.disabled = true;

    /* ─────────────────────────────────────────────────────────
       ▼ BACKEND / INTÉGRATION :
       Remplacez ce setTimeout par un vrai appel fetch, par ex. :
       
       const formData = new FormData(form);
       await fetch('https://formspree.io/f/VOTRE_ID', {
         method: 'POST',
         body: formData,
         headers: { 'Accept': 'application/json' }
       });
       
       Ou utilisez EmailJS, Netlify Forms, etc.
    ───────────────────────────────────────────────────────── */
    await new Promise(r => setTimeout(r, 1200));

    // Succès
    form.reset();
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;

    if (success) {
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => { success.hidden = true; }, 6000);
    }
  });
}

// Animation shake pour erreur formulaire
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);


/* ────────────────────────────────────────────
   10. NAVIGATION ACTIVE AU SCROLL
─────────────────────────────────────────── */
const sections = qsa('section[id]');
const navLinks = qsa('.nav-desktop a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--red)'
            : '';
        });
      }
    });
  },
  { rootMargin: '-50% 0px -50% 0px' }
);

sections.forEach(s => sectionObserver.observe(s));


/* ────────────────────────────────────────────
   11. LAZY LOADING IMAGES (polyfill natif)
─────────────────────────────────────────── */
if ('loading' in HTMLImageElement.prototype) {
  // Le navigateur supporte nativement loading="lazy" → rien à faire
} else {
  // Fallback simple pour les anciens navigateurs
  const lazyImages = qsa('img[loading="lazy"]');
  const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        imageObserver.unobserve(img);
      }
    });
  });
  lazyImages.forEach(img => imageObserver.observe(img));
}


/* ────────────────────────────────────────────
   12. EFFETS HOVER CARTES (mouse tracking)
─────────────────────────────────────────── */
qsa('.product-card, .service-card, .testimonial-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 8;
    card.style.transform = `translateY(-6px) rotateX(${-y}deg) rotateY(${x}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform .4s ease';
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform .1s ease, box-shadow .3s ease';
  });
});


/* ────────────────────────────────────────────
   13. AFFICHAGE CONDITIONNEL WA FLOAT
       (masquer quand le formulaire est visible)
─────────────────────────────────────────── */
const waFloat = qs('#whatsapp-float');
const contactSection = qs('#contact');

if (waFloat && contactSection) {
  const waObserver = new IntersectionObserver(
    ([entry]) => {
      waFloat.style.opacity = entry.isIntersecting ? '0' : '';
      waFloat.style.pointerEvents = entry.isIntersecting ? 'none' : '';
    },
    { threshold: 0.3 }
  );
  waObserver.observe(contactSection);
}
