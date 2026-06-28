/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
const cursorEl = document.getElementById('cursor');
if (cursorEl) {
  let cx = 0, cy = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
  (function loop() {
    tx += (cx - tx) * 0.1;
    ty += (cy - ty) * 0.1;
    cursorEl.style.left = tx + 'px';
    cursorEl.style.top  = ty + 'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, button, [data-tilt], .cert-row, .stat-card, .sk-tile').forEach(el => {
    el.addEventListener('mouseenter', () => cursorEl.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorEl.classList.remove('hovering'));
  });
}

/* ============================================================
   PROGRESS BAR
   ============================================================ */
const bar = document.getElementById('progress-bar');
if (bar) {
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - innerHeight) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/* ============================================================
   NAV SCROLL + ACTIVE LINK
   ============================================================ */
const nav   = document.getElementById('nav');
const navAs = document.querySelectorAll('.nav-links a');
const secs  = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', scrollY > 20);
  let cur = '';
  secs.forEach(s => { if (scrollY >= s.offsetTop - 130) cur = s.id; });
  navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${cur}`));
}, { passive: true });

/* ============================================================
   HAMBURGER
   ============================================================ */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => mobileMenu.classList.remove('open')));
}

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); scrollTo({ top: t.offsetTop - 64, behavior: 'smooth' }); }
  });
});

/* ============================================================
   TYPEWRITER
   ============================================================ */
const roles = [
  'scalable pipelines.',
  'GenAI applications.',
  'RAG chatbots.',
  'cloud data systems.',
  'agentic AI tools.',
];
let ri = 0, ci = 0, del = false;
const typedEl = document.getElementById('typed');
if (typedEl) {
  function tick() {
    const r = roles[ri];
    typedEl.textContent = del ? r.slice(0, --ci) : r.slice(0, ++ci);
    if (!del && ci === r.length) { del = true; setTimeout(tick, 2200); return; }
    if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; }
    setTimeout(tick, del ? 40 : 70);
  }
  setTimeout(tick, 900);
}

/* ============================================================
   CONSTELLATION CANVAS
   ============================================================ */
const canvas = document.getElementById('constellation');
if (canvas) {
  const ctx = canvas.getContext('2d');
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
      this.vx = (Math.random() - .5) * .35;
      this.vy = (Math.random() - .5) * .35;
      this.r  = Math.random() * 2 + .7;
      this.a  = Math.random() * .5 + .3;
    }
    update() {
      const dx = mouse.x - this.x, dy = mouse.y - this.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 30 && d > 0) {
        const spd = 10 + Math.random() * 8;
        this.vx = -(dx / d) * spd;
        this.vy = -(dy / d) * spd;
      } else if (d < 240) {
        this.vx += (dx / d) * 0.035;
        this.vy += (dy / d) * 0.035;
      }
      this.vx *= .978; this.vy *= .978;
      this.x += this.vx; this.y += this.vy;
      if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(168,85,247,${this.a})`;
      ctx.fill();
    }
  }

  function initPts() { pts = Array.from({ length: 160 }, () => new Pt()); }

  function drawLines() {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 190) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(100,130,255,${(1 - d / 190) * .25})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
      const dx = pts[i].x - mouse.x, dy = pts[i].y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 190) {
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(168,85,247,${(1 - d / 190) * .4})`;
        ctx.lineWidth = .9;
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

  window.addEventListener('resize', () => { resize(); initPts(); }, { passive: true });
  requestAnimationFrame(() => { resize(); initPts(); animCanvas(); });
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      const delay = e.target.dataset.delay || i * 65;
      setTimeout(() => e.target.classList.add('visible'), +delay);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: .08, rootMargin: '0px 0px -28px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .sk-tile, .cert-row, .proj-card, .exp-card, .stat-card').forEach((el, i) => {
  el.dataset.delay = i * 55;
  revealObs.observe(el);
});

/* ============================================================
   3D TILT ON PROJECT CARDS
   ============================================================ */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    if (e.target.closest('a')) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    card.style.transform = `perspective(700px) rotateX(${y * -9}deg) rotateY(${x * 9}deg) translateY(-8px) scale(1.01)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) * .22;
    const y = (e.clientY - r.top  - r.height / 2) * .22;
    btn.style.transform = `translate(${x}px, ${y}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ============================================================
   MARQUEE DUPLICATE
   ============================================================ */
const marqueeEl = document.getElementById('marquee');
if (marqueeEl) marqueeEl.innerHTML += marqueeEl.innerHTML;

/* ============================================================
   TABS
   ============================================================ */
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
        setTimeout(() => el.classList.add('visible'), i * 55 + 20);
      });
    }
  });
});

/* ============================================================
   ROLE SELECTOR → DYNAMIC RESUME
   ============================================================ */
const RESUMES = {
  'GenAI_Engineer':  { file: 'assets/resumes/Hemang_GenAI_Engineer.pdf',  label: '↓ Resume · GenAI' },
  'DataEngineer':    { file: 'assets/resumes/Hemang_DataEngineer.pdf',    label: '↓ Resume · Data Eng' },
  'BackendEngineer': { file: 'assets/resumes/Hemang_BackendEngineer.pdf', label: '↓ Resume · Backend' },
};

function allResumeBtns() {
  return [
    document.getElementById('hero-resume-btn'),
    document.getElementById('nav-resume-btn'),
    document.getElementById('mobile-resume-btn'),
    document.getElementById('contact-resume-btn'),
  ].filter(Boolean);
}

function applyRole(role) {
  const r = RESUMES[role]; if (!r) return;
  allResumeBtns().forEach(btn => {
    btn.href = r.file;
    btn.setAttribute('download', 'Hemang_Lingam_Resume.pdf');
  });
  const lbl = document.getElementById('hero-resume-label');
  if (lbl) lbl.textContent = r.label;
}

document.querySelectorAll('.role-btn').forEach(btn => {
  // Extend cursor hover to role buttons
  if (cursorEl) {
    btn.addEventListener('mouseenter', () => cursorEl.classList.add('hovering'));
    btn.addEventListener('mouseleave', () => cursorEl.classList.remove('hovering'));
  }
  btn.addEventListener('click', () => {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyRole(btn.dataset.role);
  });
});

// Init default
applyRole('GenAI_Engineer');
