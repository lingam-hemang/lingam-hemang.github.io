/* ============================================
   CURSOR
   ============================================ */
const cursorEl = document.getElementById('cursor');
let cx = 0, cy = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });

(function loop() {
  tx += (cx - tx) * 0.1;
  ty += (cy - ty) * 0.1;
  cursorEl.style.left = tx + 'px';
  cursorEl.style.top  = ty + 'px';
  requestAnimationFrame(loop);
})();

document.querySelectorAll('a, button, [data-tilt], .cert-row').forEach(el => {
  el.addEventListener('mouseenter', () => cursorEl.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursorEl.classList.remove('hovering'));
});

/* ============================================
   PROGRESS BAR
   ============================================ */
const bar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  bar.style.width = (window.scrollY / (document.body.scrollHeight - innerHeight) * 100) + '%';
});

/* ============================================
   NAV SCROLL + ACTIVE
   ============================================ */
const nav   = document.getElementById('nav');
const navAs = document.querySelectorAll('.nav-links a');
const secs  = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 20);
  let cur = '';
  secs.forEach(s => { if (scrollY >= s.offsetTop - 120) cur = s.id; });
  navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${cur}`));
});

/* ============================================
   HAMBURGER
   ============================================ */
document.getElementById('hamburger').addEventListener('click', () =>
  document.getElementById('mobileMenu').classList.toggle('open'));
document.querySelectorAll('.mobile-menu a').forEach(a =>
  a.addEventListener('click', () => document.getElementById('mobileMenu').classList.remove('open')));

/* ============================================
   SMOOTH SCROLL
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); scrollTo({ top: t.offsetTop - 66, behavior: 'smooth' }); }
  });
});

/* ============================================
   TYPED ANIMATION
   ============================================ */
const roles = ['scalable pipelines.', 'GenAI applications.', 'cloud systems.', 'data platforms.', 'RAG chatbots.'];
let ri = 0, ci = 0, del = false;
const typedEl = document.getElementById('typed');

function tick() {
  const r = roles[ri];
  typedEl.textContent = del ? r.slice(0, --ci) : r.slice(0, ++ci);
  if (!del && ci === r.length) { del = true; setTimeout(tick, 2400); return; }
  if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; }
  setTimeout(tick, del ? 42 : 72);
}
setTimeout(tick, 1000);

/* ============================================
   CONSTELLATION + MOUSE ATTRACTION
   FIX: use hero element dimensions so canvas
        fills the entire hero section
   ============================================ */
const canvas = document.getElementById('constellation');
const ctx    = canvas.getContext('2d');
let W, H, pts = [];
let mouse = { x: -9999, y: -9999 };

document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

function resize() {
  const hero = document.getElementById('hero');
  W = canvas.width  = hero.offsetWidth;
  H = canvas.height = hero.offsetHeight;
}

class Pt {
  constructor() { this.reset(true); }
  reset(init) {
    this.x  = Math.random() * W;
    this.y  = init ? Math.random() * H : (Math.random() > .5 ? -5 : H + 5);
    this.vx = (Math.random() - .5) * .4;
    this.vy = (Math.random() - .5) * .4;
    this.r  = Math.random() * 2.2 + .8;
    this.a  = Math.random() * .55 + .35;
  }
  update() {
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d < 28 && d > 0) {
      // Set velocity directly so particle rockets to canvas edge
      const speed = 11 + Math.random() * 9;
      this.vx = -(dx / d) * speed;
      this.vy = -(dy / d) * speed;
    } else if (d < 260) {
      // Stronger attraction so more particles gather before exploding
      this.vx += (dx / d) * 0.038;
      this.vy += (dy / d) * 0.038;
    }
    this.vx *= .979;  // lighter damping so burst travels further
    this.vy *= .979;
    this.x  += this.vx;
    this.y  += this.vy;
    if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset(false);
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(168,85,247,${this.a})`;
    ctx.fill();
  }
}

function initPts() { pts = Array.from({ length: 180 }, () => new Pt()); }

function drawLines() {
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 200) {
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = `rgba(120,140,255,${(1 - d / 200) * .28})`;
        ctx.lineWidth = .7;
        ctx.stroke();
      }
    }
    // Line to mouse
    const dx = pts[i].x - mouse.x, dy = pts[i].y - mouse.y;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d < 200) {
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.strokeStyle = `rgba(168,85,247,${(1 - d / 200) * .45})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

function animCanvas() {
  ctx.clearRect(0, 0, W, H);
  pts.forEach(p => { p.update(); p.draw(); });
  drawLines();
  requestAnimationFrame(animCanvas);
}

window.addEventListener('resize', () => { resize(); initPts(); });
// Defer first resize to next paint so hero.offsetHeight is fully computed
requestAnimationFrame(() => { resize(); initPts(); animCanvas(); });

/* ============================================
   ANIMATED COUNTERS (v2-style)
   ============================================ */
function animateStats(container) {
  container.querySelectorAll('[data-target]').forEach(el => {
    const target  = parseFloat(el.dataset.target);
    const decimal = el.dataset.decimal || '';
    let curr = 0;
    const t = setInterval(() => {
      curr = Math.min(curr + target / 80, target);
      el.textContent = Math.floor(curr) + decimal;
      if (curr >= target) clearInterval(t);
    }, 18);
  });
}

const statsEl = document.querySelector('.hero-stats');
if (statsEl) {
  const statsObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { animateStats(statsEl); statsObs.disconnect(); }
  }, { threshold: .5 });
  statsObs.observe(statsEl);
}

/* ============================================
   SCROLL REVEAL + STAGGER
   ============================================ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      const delay = e.target.dataset.delay || i * 70;
      setTimeout(() => e.target.classList.add('visible'), delay);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: .08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .sk-tile, .cert-row, .proj-card, .exp-card').forEach((el, i) => {
  el.dataset.delay = i * 60;
  revealObs.observe(el);
});

/* ============================================
   3D TILT ON PROJECT CARDS
   ============================================ */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    // Don't apply tilt transform when hovering over interactive children
    if (e.target.closest('a')) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    card.style.transform = `perspective(700px) rotateX(${y * -10}deg) rotateY(${x * 10}deg) translateY(-8px) scale(1.01)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ============================================
   MAGNETIC BUTTONS
   ============================================ */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) * .25;
    const y = (e.clientY - r.top  - r.height / 2) * .25;
    btn.style.transform = `translate(${x}px, ${y}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ============================================
   MARQUEE DUPLICATE (seamless loop)
   ============================================ */
const marqueeEl = document.getElementById('marquee');
if (marqueeEl) {
  marqueeEl.innerHTML += marqueeEl.innerHTML;
}

/* ============================================
   TABS
   ============================================ */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('tab-' + tab.dataset.tab);
    if (panel) {
      panel.classList.add('active');
      panel.querySelectorAll('.reveal, .cert-row').forEach((el, i) => {
        el.classList.remove('visible');
        setTimeout(() => el.classList.add('visible'), i * 60 + 20);
      });
    }
  });
});

/* ============================================
   HERO NAME GLITCH ON HOVER
   ============================================ */
const nameEl = document.querySelector('.hero-name');
if (nameEl) {
  nameEl.addEventListener('mouseenter', () => nameEl.classList.add('glitch'));
  nameEl.addEventListener('animationend', () => nameEl.classList.remove('glitch'));
}