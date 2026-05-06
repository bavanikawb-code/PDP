/* =============================================
   People's Development Plantation — main.js
   Animations · Actions · Modals · Scroll FX
   ============================================= */

/* ---------- Utility ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------- Mobile Menu ---------- */
function initMobileMenu() {
  const btn = $('[aria-label="Toggle menu"]');
  const menu = $('#mobile-menu');
  if (!btn || !menu) return;
  btn.onclick = null;

  const icon = btn.querySelector('.material-symbols-outlined');
  const menuContainer = menu.closest('header, nav') || menu.parentElement;

  function setMenu(open) {
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (icon) icon.textContent = open ? 'close' : 'menu';
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setMenu(!menu.classList.contains('open'));
  });

  document.addEventListener('click', (e) => {
    if (!menuContainer?.contains(e.target) && menu.classList.contains('open')) setMenu(false);
  });
}

/* ---------- Sticky Nav Shrink ---------- */
function initStickyNav() {
  const nav = $('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav-scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ---------- Scroll Reveal ---------- */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  $$('.reveal').forEach(el => observer.observe(el));
}

/* ---------- Counter Animation ---------- */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = target * eased;
    el.textContent = (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = $$('[data-target]');
  if (!counters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

/* ---------- Hero Slider (manual dots) ---------- */
function initHeroSlider() {
  const slides = $$('.hero-slide');
  if (!slides.length) return;

  let current = 0;
  const total = slides.length;
  const INTERVAL = 7000;

  // Build dot nav
  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'hero-dots';
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'hero-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });
  slides[0].closest('.absolute.inset-0.z-0')?.appendChild(dotsWrap);

  // Next arrow only
  const nextBtn = document.createElement('button');
  nextBtn.className = 'hero-arrow hero-arrow-next';
  nextBtn.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.addEventListener('click', () => goTo((current + 1) % total));

  const heroEl = $('header.relative');
  if (heroEl) { heroEl.appendChild(nextBtn); }

  function goTo(idx) {
    slides[current].classList.remove('active-slide');
    current = idx;
    slides[current].classList.add('active-slide');
    $$('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
    resetTimer();
  }

  // Override CSS animation with JS-driven class
  slides.forEach(s => s.style.animation = 'none');
  slides[0].classList.add('active-slide');

  let timer = setInterval(() => goTo((current + 1) % total), INTERVAL);
  function resetTimer() { clearInterval(timer); timer = setInterval(() => goTo((current + 1) % total), INTERVAL); }
}

/* ---------- Testimonial Carousel ---------- */
function initTestimonialCarousel() {
  const cards = $$('.testimonial-card');
  if (!cards.length) return;
  let current = 0;
  const [prevBtn, nextBtn] = $$('.review-btn');
  if (!prevBtn || !nextBtn) return;

  function show(idx) {
    cards.forEach((c, i) => {
      c.classList.toggle('testimonial-active', i === idx);
      c.classList.toggle('testimonial-hidden-left', i < idx);
      c.classList.toggle('testimonial-hidden-right', i > idx);
    });
  }
  prevBtn.addEventListener('click', () => { current = (current - 1 + cards.length) % cards.length; show(current); });
  nextBtn.addEventListener('click', () => { current = (current + 1) % cards.length; show(current); });
  show(0);
}

/* ---------- "Invest Now" / "Start Investment" Buttons ---------- */
function initInvestButtons() {
  $$('button').forEach(btn => {
    const txt = btn.textContent.trim().toLowerCase();
    if (txt.includes('invest') || txt.includes('start your investment')) {
      btn.addEventListener('click', () => openModal('invest-modal'));
    }
  });
}

/* ---------- "Learn More" Hero Button → About ---------- */
function initLearnMore() {
  $$('button, a').forEach(el => {
    if (el.textContent.trim().toLowerCase() === 'learn more') {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'about.html';
      });
    }
  });
}

/* ---------- Services "Learn More" card buttons ---------- */
function initServiceCards() {
  $$('.bg-primary-container').forEach(el => {
    if (el.textContent.includes('Learn More')) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => window.location.href = 'services.html');
    }
  });
}

/* ---------- Smooth Scroll for anchors ---------- */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
}

/* ---------- Contact Form Submit ---------- */
function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✓ Message Sent!';
      btn.style.background = '#064e3b';
      form.reset();
      setTimeout(() => { btn.textContent = 'Submit Inquiry'; btn.disabled = false; btn.style.background = ''; }, 3000);
    }, 1500);
  });
}

/* ---------- Newsletter Subscribe ---------- */
function initNewsletter() {
  $$('button').forEach(btn => {
    if (btn.textContent.trim().toLowerCase() === 'subscribe') {
      btn.addEventListener('click', () => {
        const input = btn.previousElementSibling || btn.parentElement?.querySelector('input[type="email"]');
        if (!input || !input.value || !input.value.includes('@')) {
          shakeEl(input || btn); return;
        }
        btn.textContent = '✓ Subscribed!';
        if (input) input.value = '';
        setTimeout(() => btn.textContent = 'Subscribe', 3000);
      });
    }
  });
}

function shakeEl(el) {
  if (!el) return;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}

/* ---------- Modal System ---------- */
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('modal-open');
  document.body.style.overflow = '';
}

function injectModals() {
  const modalsHTML = `
  <!-- ===== INVEST MODAL ===== -->
  <div id="invest-modal" class="pdp-modal" role="dialog" aria-modal="true" aria-labelledby="invest-title">
    <div class="pdp-modal__backdrop" onclick="closeModal('invest-modal')"></div>
    <div class="pdp-modal__box">
      <button class="pdp-modal__close" onclick="closeModal('invest-modal')" aria-label="Close">&times;</button>
      <div class="pdp-modal__icon">🌱</div>
      <h2 id="invest-title" class="pdp-modal__title">Start Your Investment Journey</h2>
      <p class="pdp-modal__body">Our investor relations team is ready to guide you through opportunities tailored to your goals. Fill in your details and we will be in touch within 24 hours.</p>
      <div class="pdp-modal__form">
        <input type="text" placeholder="Your Full Name" class="pdp-modal__input" />
        <input type="email" placeholder="Corporate Email" class="pdp-modal__input" />
        <select class="pdp-modal__input">
          <option value="">Investment Range</option>
          <option>$50,000 – $250,000</option>
          <option>$250,000 – $1,000,000</option>
          <option>$1,000,000+</option>
        </select>
        <button class="pdp-modal__submit" onclick="handleInvestSubmit(this)">Request Consultation</button>
      </div>
      <p class="pdp-modal__note">By submitting you agree to our <a href="#" onclick="event.preventDefault();closeModal('invest-modal');openModal('terms-modal')">Terms &amp; Conditions</a> and <a href="#" onclick="event.preventDefault();closeModal('invest-modal');openModal('privacy-modal')">Privacy Policy</a>.</p>
    </div>
  </div>

  <!-- ===== TERMS MODAL ===== -->
  <div id="terms-modal" class="pdp-modal" role="dialog" aria-modal="true" aria-labelledby="terms-title">
    <div class="pdp-modal__backdrop" onclick="closeModal('terms-modal')"></div>
    <div class="pdp-modal__box pdp-modal__box--legal">
      <button class="pdp-modal__close" onclick="closeModal('terms-modal')" aria-label="Close">&times;</button>
      <h2 id="terms-title" class="pdp-modal__title">Terms &amp; Conditions</h2>
      <div class="pdp-modal__scroll">
        <p class="pdp-modal__date">Last updated: May 2025</p>
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing or using any service offered by People's Development Plantation ("PDP," "we," "our," or "us"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
        <h3>2. Investment Disclaimer</h3>
        <p>All information provided on this website is for informational purposes only and does not constitute financial, legal, or investment advice. Past performance of agricultural yields is not indicative of future results. Investment in plantation ventures carries risk, including possible loss of principal.</p>
        <h3>3. Eligibility</h3>
        <p>Our investment opportunities are available only to qualified investors as defined under applicable securities law. You must be at least 18 years of age and have the legal capacity to enter into a binding agreement.</p>
        <h3>4. Intellectual Property</h3>
        <p>All content, trademarks, logos, and materials on this site are the exclusive property of People's Development Plantation. Reproduction or distribution without prior written consent is strictly prohibited.</p>
        <h3>5. Limitation of Liability</h3>
        <p>PDP shall not be liable for any indirect, incidental, or consequential damages arising from your use of this website or any investment decision made based on information contained herein.</p>
        <h3>6. Governing Law</h3>
        <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which PDP is registered, without regard to conflict of law provisions.</p>
        <h3>7. Amendments</h3>
        <p>We reserve the right to update these Terms at any time. Continued use of our services after such changes constitutes your acceptance of the new Terms.</p>
        <h3>8. Contact</h3>
        <p>For legal enquiries, please contact us at legal@peoplesdevelopment.com or visit our Contact page.</p>
      </div>
      <button class="pdp-modal__submit" onclick="closeModal('terms-modal')">I Understand</button>
    </div>
  </div>

  <!-- ===== PRIVACY MODAL ===== -->
  <div id="privacy-modal" class="pdp-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
    <div class="pdp-modal__backdrop" onclick="closeModal('privacy-modal')"></div>
    <div class="pdp-modal__box pdp-modal__box--legal">
      <button class="pdp-modal__close" onclick="closeModal('privacy-modal')" aria-label="Close">&times;</button>
      <h2 id="privacy-title" class="pdp-modal__title">Privacy Policy</h2>
      <div class="pdp-modal__scroll">
        <p class="pdp-modal__date">Last updated: May 2025</p>
        <h3>1. Information We Collect</h3>
        <p>We collect personal information you voluntarily provide (name, email, investment interest) as well as automatically collected data (IP address, browser type, pages visited) through standard web analytics tools.</p>
        <h3>2. How We Use Your Information</h3>
        <p>Your data is used to respond to enquiries, process investment applications, send updates and reports you have opted into, improve our services, and comply with legal obligations.</p>
        <h3>3. Data Sharing</h3>
        <p>We do not sell your personal data. We may share it with trusted service providers (payment processors, legal advisors, audit firms) under strict confidentiality agreements. We may disclose data if required by law.</p>
        <h3>4. Cookies</h3>
        <p>We use essential and analytics cookies to enhance your browsing experience. You may disable cookies in your browser settings, though some site functionality may be affected.</p>
        <h3>5. Data Retention</h3>
        <p>We retain personal data for as long as necessary to fulfil the purposes outlined in this policy or as required by applicable law. Investment records are retained for a minimum of seven years.</p>
        <h3>6. Your Rights</h3>
        <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict processing of your personal data. To exercise these rights, contact us at privacy@peoplesdevelopment.com.</p>
        <h3>7. Security</h3>
        <p>We implement industry-standard security measures including SSL encryption, access controls, and regular security audits. No online transmission is 100% secure; we cannot guarantee absolute security.</p>
        <h3>8. Contact</h3>
        <p>Privacy concerns may be directed to our Data Protection Officer at privacy@peoplesdevelopment.com.</p>
      </div>
      <button class="pdp-modal__submit" onclick="closeModal('privacy-modal')">I Understand</button>
    </div>
  </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = modalsHTML;
  document.body.appendChild(div);

  // Wire footer links
  $$('a[href="#"]').forEach(a => {
    const txt = a.textContent.trim().toLowerCase();
    if (txt.includes('privacy')) a.addEventListener('click', e => { e.preventDefault(); openModal('privacy-modal'); });
    else if (txt.includes('terms')) a.addEventListener('click', e => { e.preventDefault(); openModal('terms-modal'); });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      ['invest-modal','terms-modal','privacy-modal'].forEach(id => closeModal(id));
    }
  });
}

window.handleInvestSubmit = function(btn) {
  const box = btn.closest('.pdp-modal__box');
  const inputs = $$('.pdp-modal__input', box);
  const allFilled = [...inputs].every(i => i.value.trim());
  if (!allFilled) { inputs.forEach(i => { if (!i.value.trim()) shakeEl(i); }); return; }
  btn.textContent = 'Sending…';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✓ Request Received!';
    inputs.forEach(i => i.value = '');
    setTimeout(() => { btn.textContent = 'Request Consultation'; btn.disabled = false; }, 3000);
  }, 1500);
};

/* ---------- Inject modal & animation styles ---------- */
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* --- Nav scroll --- */
    nav { transition: padding 0.3s ease, box-shadow 0.3s ease; }
    .nav-scrolled { box-shadow: 0 4px 24px rgba(0,53,39,0.12) !important; }

    /* --- Reveal animation --- */
    .reveal {
      opacity: 0;
      transform: translateY(32px);
      transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1);
    }
    .reveal.visible { opacity: 1; transform: none; }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }

    /* --- Hero JS slider --- */
    .hero-slide { opacity: 0; transition: opacity 1.2s ease; }
    .hero-slide.active-slide { opacity: 1; }

    /* --- Hero dots --- */
    .hero-dots {
      position: absolute;
      bottom: 28px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 10px; z-index: 20;
    }
    .hero-dot {
      width: 10px; height: 10px; border-radius: 9999px;
      background: rgba(255,255,255,0.45); border: none; cursor: pointer;
      transition: background 0.3s ease, transform 0.3s ease;
    }
    .hero-dot.active { background: #d9ab38; transform: scale(1.3); }

    /* --- Hero arrows --- */
    .hero-arrow {
      position: absolute; top: 50%; z-index: 20;
      transform: translateY(50%);
      background: rgba(0,53,39,0.45); border: none;
      color: #fff; border-radius: 9999px;
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; backdrop-filter: blur(6px);
      transition: background 0.25s ease, transform 0.25s ease;
    }
    .hero-arrow:hover { background: #d9ab38; transform: translateY(-40%) scale(1.08); }
    .hero-arrow .material-symbols-outlined { font-size: 24px; }
    .hero-arrow-next { right: 12px; }

    /* --- Hero text animation --- */
    .hero-headline { animation: heroFadeUp 1s cubic-bezier(0.22,1,0.36,1) both; }
    .hero-sub { animation: heroFadeUp 1s 0.2s cubic-bezier(0.22,1,0.36,1) both; }
    .hero-cta { animation: heroFadeUp 1s 0.4s cubic-bezier(0.22,1,0.36,1) both; }
    @keyframes heroFadeUp {
      from { opacity:0; transform: translateY(40px); }
      to { opacity:1; transform: none; }
    }

    /* --- Shake --- */
    @keyframes shake {
      0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)}
    }
    .shake { animation: shake 0.45s ease; }

    /* --- Floating badge --- */
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    .floating-badge { animation: float 3.5s ease-in-out infinite; }

    /* --- Service cards hover --- */
    .service-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .service-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,53,39,0.12); }

    /* --- Button ripple --- */
    button { position: relative; overflow: hidden; }
    button .ripple {
      position: absolute; border-radius: 50%;
      background: rgba(255,255,255,0.35);
      transform: scale(0); animation: ripple-anim 0.55s linear;
      pointer-events: none;
    }
    @keyframes ripple-anim { to { transform: scale(4); opacity: 0; } }

    /* ===== MODALS ===== */
    .pdp-modal {
      display: none; position: fixed; inset: 0; z-index: 9999;
      align-items: center; justify-content: center;
    }
    .pdp-modal.modal-open { display: flex; }
    .pdp-modal__backdrop {
      position: absolute; inset: 0;
      background: rgba(0,30,20,0.65); backdrop-filter: blur(4px);
    }
    .pdp-modal__box {
      position: relative; z-index: 1;
      background: #fff; border-radius: 16px;
      padding: 40px 36px; max-width: 520px; width: 90%;
      box-shadow: 0 32px 80px rgba(0,53,39,0.25);
      animation: modalIn 0.4s cubic-bezier(0.22,1,0.36,1);
      max-height: 90vh; overflow-y: auto;
    }
    .pdp-modal__box--legal { max-width: 640px; }
    @keyframes modalIn {
      from { opacity:0; transform: scale(0.88) translateY(24px); }
      to { opacity:1; transform: none; }
    }
    .pdp-modal__close {
      position: absolute; top: 16px; right: 20px;
      background: none !important; border: none; font-size: 28px;
      color: #707974; cursor: pointer; line-height: 1;
      padding: 0 !important; color: #403927 !important;
    }
    .pdp-modal__icon { font-size: 48px; margin-bottom: 12px; }
    .pdp-modal__title {
      font-family: 'Manrope', sans-serif; font-size: clamp(22px,3vw,30px);
      font-weight: 700; color: #003527; margin-bottom: 12px;
    }
    .pdp-modal__body { color: #404944; line-height: 1.6; margin-bottom: 24px; font-size: 15px; }
    .pdp-modal__form { display: flex; flex-direction: column; gap: 14px; margin-bottom: 18px; }
    .pdp-modal__input {
      width: 100%; border: 1.5px solid #bfc9c3; border-radius: 8px;
      padding: 12px 16px; font-size: 15px; outline: none;
      transition: border-color 0.2s; background: #f9f9ff;
    }
    .pdp-modal__input:focus { border-color: #003527; }
    .pdp-modal__submit {
      background: #d9ab38 !important; color: #2f2300 !important;
      border: none; padding: 14px 28px; border-radius: 8px;
      font-weight: 700; font-size: 15px; cursor: pointer;
      transition: background 0.2s, transform 0.15s;
      width: 100%;
    }
    .pdp-modal__submit:hover { background: #e3b846 !important; transform: translateY(-1px); }
    .pdp-modal__note { font-size: 12px; color: #707974; text-align: center; }
    .pdp-modal__note a { color: #003527; text-decoration: underline; }
    .pdp-modal__date { font-size: 12px; color: #707974; margin-bottom: 20px; }
    .pdp-modal__scroll h3 { font-family: 'Manrope',sans-serif; font-weight: 700; color: #003527; margin: 20px 0 8px; font-size: 16px; }
    .pdp-modal__scroll p { color: #404944; font-size: 14px; line-height: 1.7; margin-bottom: 8px; }

    /* --- Sitemap section --- */
    .sitemap-section { border-top: 1px solid rgba(255,255,255,0.1); }
    .footer-inline-directory {
      border-top: 0;
      padding: 0 !important;
      width: 100%;
    }
    .sitemap-inner {
      margin-left: auto;
      margin-right: auto;
      max-width: 560px;
      width: 100%;
    }
    @media (min-width: 1024px) {
      .sitemap-inner { max-width: 1280px; }
    }
    .footer-inline-directory .sitemap-inner {
      max-width: none;
    }
    .sitemap-content {
      display: grid;
      gap: 26px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .sitemap-links {
      padding-left: 30px;
      padding-right: 30px;
    }
    @media (min-width: 640px) {
      .sitemap-links {
        padding-left: 0;
        padding-right: 0;
      }
    }
    @media (min-width: 1024px) {
      .footer-inline-directory {
        flex: 1;
        margin-top: -20px;
      }

      .sitemap-content {
        align-items: start;l
        gap: 40px;
        grid-template-columns: minmax(105px, 0.8fr) minmax(140px, 0.9fr) minmax(300px, 1.4fr);
      }
      .sitemap-section {
        padding-bottom: 28px !important;
        padding-top: 28px !important;
      }
    }
    .sitemap-col h4 { color: #d9ab38; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; margin-bottom: 8px; }
    .sitemap-col a { display: block; color: rgba(237,240,255,0.65); font-size: 13px; margin-bottom: 8px; text-decoration: none; transition: color 0.2s ease; }
    .sitemap-col a:hover { color: #d9ab38; }
    .footer-map {
      grid-column: 1 / -1;
      margin-top: 0;
    }
    .footer-map h3 {
      color: #d9ab38;
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .footer-map iframe {
      border: 0;
      border-radius: 12px;
      display: block;
      height: 170px;
      max-width: 560px;
      width: 100%;
    }
    @media (min-width: 1024px) {
      .footer-map {
        grid-column: auto;
      }
      .footer-map h3 {
        margin-top: -4px;
      }
      .footer-map iframe {
        height: 120px;
      }
    }

    /* --- Hero badge pulse --- */
    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 0 rgba(217,171,56,0.5); }
      70% { box-shadow: 0 0 0 12px rgba(217,171,56,0); }
      100% { box-shadow: 0 0 0 0 rgba(217,171,56,0); }
    }
    .pulse-badge { animation: pulse-ring 2s ease-out infinite; }
  `;
  document.head.appendChild(style);
}

/* ---------- Button Ripple Effect ---------- */
function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });
}

/* ---------- Add reveal classes to page sections ---------- */
function addRevealClasses() {
  const selectors = [
    'section > div > h2', 'section > div > p',
    'section .grid > *', 'section .flex > div',
    'section .max-w-xl', 'section .max-w-2xl',
    'section .max-w-3xl',
  ];
  let delay = 0;
  selectors.forEach(sel => {
    $$(sel).forEach((el, i) => {
      if (!el.classList.contains('reveal') && !el.closest('.pdp-modal')) {
        el.classList.add('reveal');
        if (i % 4 === 1) el.classList.add('reveal-delay-1');
        else if (i % 4 === 2) el.classList.add('reveal-delay-2');
        else if (i % 4 === 3) el.classList.add('reveal-delay-3');
      }
    });
  });
}

/* ---------- Sitemap Injection in Footer ---------- */
function injectSitemap() {
  const footer = $('footer');
  if (!footer) return;

  // Already injected guard
  if ($('.sitemap-section', footer)) return;

  const sitemap = document.createElement('div');
  sitemap.className = 'sitemap-section footer-inline-directory';
  sitemap.innerHTML = `
    <div class="sitemap-inner">
      <div class="sitemap-content sitemap-links">
        <div class="sitemap-col">
          <h4>Company</h4>
          <a href="index.html">Home</a>
          <a href="about.html">About Us</a>
          <a href="gallery.html">Gallery</a>
          <a href="contact.html">Contact</a>
        </div>
        <div class="sitemap-col">
          <h4>Connect</h4>
          <a href="contact.html">Send a Message</a>
          <a href="mailto:relations@peoplesdevelopment.com">Email Us</a>
          <a href="tel:+15558902400">+1 (555) 890-2400</a>
        </div>
        <div class="footer-map">
          <h3>Find Us</h3>
          <iframe
            title="People's Development Plantation location map"
            aria-label="Map showing Colombo 08"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            src="https://maps.google.com/maps?hl=en&amp;q=Colombo%2008&amp;z=14&amp;output=embed">
          </iframe>
        </div>
      </div>
    </div>
  `;

  // Keep these footer details in the same top row as the brand block.
  const brandSection = footer.firstElementChild;
  if (brandSection) {
    brandSection.appendChild(sitemap);
  } else {
    footer.appendChild(sitemap);
  }
}

/* ---------- Hero section enhancements ---------- */
function enhanceHero() {
  const h1 = $('header h1');
  const heroP = $('header p');
  const heroDiv = $('header .flex.flex-col');
  if (h1) h1.classList.add('hero-headline');
  if (heroP) heroP.classList.add('hero-sub');
  if (heroDiv) heroDiv.classList.add('hero-cta');

  // Add animated stats bar to hero
  const heroContent = $('header .relative.z-10 > div');
  if (!heroContent) return;
  const stats = document.createElement('div');
  stats.className = 'hero-stats flex gap-6 sm:gap-10 mt-8 sm:mt-12';
  stats.innerHTML = `
    <div class="text-on-primary">
      <div class="text-2xl sm:text-3xl font-bold text-[#d9ab38]" data-target="15" data-suffix="+">15+</div>
      <div class="text-xs sm:text-sm opacity-75 mt-1">Years Experience</div>
    </div>
    <div class="text-on-primary">
      <div class="text-2xl sm:text-3xl font-bold text-[#d9ab38]" data-target="98" data-suffix="%">98%</div>
      <div class="text-xs sm:text-sm opacity-75 mt-1">Carbon Verified</div>
    </div>
    <div class="text-on-primary">
      <div class="text-2xl sm:text-3xl font-bold text-[#d9ab38]" data-target="500" data-suffix="+">500+</div>
      <div class="text-xs sm:text-sm opacity-75 mt-1">Investors</div>
    </div>
  `;
  heroContent.querySelector('.flex.flex-col')?.after(stats);
}

/* ---------- Service card clickability ---------- */
function initServiceLinks() {
  $$('.lg\\:col-span-4, .lg\\:col-span-8, .sm\\:col-span-2').forEach(card => {
    if (!card.closest('nav') && !card.querySelector('a')) {
      card.style.cursor = 'pointer';
      card.classList.add('service-card');
      card.addEventListener('click', () => window.location.href = 'services.html');
    }
  });
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  injectModals();
  injectSitemap();
  initMobileMenu();
  initStickyNav();
  enhanceHero();
  initHeroSlider();
  addRevealClasses();
  initScrollReveal();
  initCounters();
  initRipple();
  initLearnMore();
  initInvestButtons();
  initServiceCards();
  initServiceLinks();
  initSmoothScroll();
  initContactForm();
  initNewsletter();
});
