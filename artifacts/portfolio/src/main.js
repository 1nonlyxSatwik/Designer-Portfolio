import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/* =========================================
   LENIS SMOOTH SCROLL
   ========================================= */
const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* =========================================
   CUSTOM CURSOR
   ========================================= */
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
let cx = mx, cy = my, dx = mx, dy = my;

window.addEventListener('mousemove', (e) => {
  mx = e.clientX; my = e.clientY;
  dx = mx; dy = my;
  cursorDot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
});

function tickCursor() {
  cx += (mx - cx) * 0.18;
  cy += (my - cy) * 0.18;
  cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
  requestAnimationFrame(tickCursor);
}
tickCursor();

document.querySelectorAll('[data-cursor="hover"]').forEach((el) => {
  el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
});

/* =========================================
   THREE.JS HERO — floating glass blocks
   ========================================= */
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  const stage = document.getElementById('hero-stage');
  if (!canvas) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.4, 5.2);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff5577, 0.7);
  rim.position.set(-3, 1, 2);
  scene.add(rim);
  const acc = new THREE.PointLight(0x6c5ce7, 1.2, 8);
  acc.position.set(0, -1, 3);
  scene.add(acc);

  // Group of objects on a base
  const group = new THREE.Group();
  scene.add(group);

  // Base plate
  const baseGeom = new THREE.CylinderGeometry(2.2, 2.2, 0.08, 64);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xeeeef2, roughness: 0.5, metalness: 0.1 });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = -0.9;
  group.add(base);

  // Red push button (the "hold the red Button")
  const btnGeom = new THREE.CylinderGeometry(0.35, 0.4, 0.25, 48);
  const btnMat = new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.35, metalness: 0.2, emissive: 0x330000, emissiveIntensity: 0.3 });
  const button = new THREE.Mesh(btnGeom, btnMat);
  button.position.set(0, -0.6, 0);
  group.add(button);

  const btnRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.03, 16, 64),
    new THREE.MeshStandardMaterial({ color: 0x222226, metalness: 0.7, roughness: 0.3 })
  );
  btnRing.rotation.x = Math.PI / 2;
  btnRing.position.set(0, -0.74, 0);
  group.add(btnRing);

  // Floating cube
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.7, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x1a1a20, roughness: 0.2, metalness: 0.6 })
  );
  cube.position.set(-1.4, 0.3, 0.2);
  cube.rotation.set(0.3, 0.5, 0.1);
  group.add(cube);

  // Floating sphere
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 64, 64),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.4 })
  );
  sphere.position.set(1.3, 0.5, 0.1);
  group.add(sphere);

  // Floating torus
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.35, 0.13, 32, 80),
    new THREE.MeshStandardMaterial({ color: 0x6c5ce7, roughness: 0.25, metalness: 0.5 })
  );
  torus.position.set(0.2, 0.95, -0.4);
  torus.rotation.set(1.1, 0.4, 0);
  group.add(torus);

  // Floating cone
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.7, 6),
    new THREE.MeshStandardMaterial({ color: 0xffc400, roughness: 0.3, metalness: 0.3 })
  );
  cone.position.set(-0.6, 0.85, -0.5);
  cone.rotation.set(0.4, 0.6, 0.2);
  group.add(cone);

  // Resize
  function resize() {
    const r = stage.getBoundingClientRect();
    const w = r.width || window.innerWidth;
    const h = r.height || window.innerHeight;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Mouse parallax
  let pmx = 0, pmy = 0;
  window.addEventListener('mousemove', (e) => {
    pmx = (e.clientX / window.innerWidth - 0.5) * 0.5;
    pmy = (e.clientY / window.innerHeight - 0.5) * 0.3;
  });

  // Press and hold red button
  let isPressing = false;
  let pressT = 0;
  canvas.style.pointerEvents = 'auto';
  const ray = new THREE.Raycaster();
  const m = new THREE.Vector2();

  function pointerDown(e) {
    const r = canvas.getBoundingClientRect();
    m.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    m.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(m, camera);
    const hit = ray.intersectObject(button);
    if (hit.length) {
      isPressing = true;
      gsap.to(button.scale, { y: 0.5, duration: 0.15, ease: 'power2.out' });
      gsap.to(button.material, { emissiveIntensity: 1.2, duration: 0.2 });
    }
  }
  function pointerUp() {
    if (!isPressing) return;
    isPressing = false;
    gsap.to(button.scale, { y: 1, duration: 0.4, ease: 'elastic.out(1,0.5)' });
    gsap.to(button.material, { emissiveIntensity: 0.3, duration: 0.5 });
    // burst
    gsap.fromTo(group.rotation, { y: group.rotation.y }, { y: group.rotation.y + Math.PI * 2, duration: 1.4, ease: 'power3.inOut' });
  }
  canvas.addEventListener('pointerdown', pointerDown);
  window.addEventListener('pointerup', pointerUp);

  // Animate
  const clock = new THREE.Clock();
  function tick() {
    const t = clock.getElapsedTime();

    cube.position.y = 0.3 + Math.sin(t * 1.2) * 0.12;
    cube.rotation.x += 0.004;
    cube.rotation.y += 0.005;

    sphere.position.y = 0.5 + Math.cos(t * 1.4) * 0.1;
    sphere.position.x = 1.3 + Math.sin(t * 0.6) * 0.06;

    torus.position.y = 0.95 + Math.sin(t * 0.9 + 1) * 0.14;
    torus.rotation.z += 0.006;
    torus.rotation.x = 1.1 + Math.sin(t * 0.5) * 0.2;

    cone.position.y = 0.85 + Math.cos(t * 1.1 + 2) * 0.12;
    cone.rotation.y += 0.01;

    if (isPressing) {
      pressT = Math.min(pressT + 0.03, 1);
    } else {
      pressT = Math.max(pressT - 0.05, 0);
    }
    group.scale.setScalar(1 + pressT * 0.1);

    // parallax
    group.rotation.y += (pmx - (group.rotation.y - Math.floor(group.rotation.y / (Math.PI*2)) * (Math.PI*2)) * 0.01) * 0.005;
    group.rotation.x += (pmy * -0.5 - group.rotation.x) * 0.04;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
})();

/* =========================================
   RAIL ACTIVE STATE + SECTION SCROLL
   ========================================= */
document.querySelectorAll('.rail-btn[data-section]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.section);
    if (target) lenis.scrollTo(target, { offset: -40 });
  });
});

const sections = ['#hero','#about','#work','#case','#why','#apart','#contact'];
ScrollTrigger.create({
  trigger: 'body',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate(self) {
    const scrollY = window.scrollY + window.innerHeight * 0.3;
    let activeIdx = 0;
    sections.forEach((sel, i) => {
      const el = document.querySelector(sel);
      if (el && el.offsetTop <= scrollY) activeIdx = i;
    });
    document.querySelectorAll('.rail-btn').forEach((b) => b.classList.remove('rail-active'));
    const all = document.querySelectorAll('.rail-btn');
    if (all[activeIdx + 0]) all[activeIdx].classList.add('rail-active');
  }
});

/* =========================================
   CASE STUDY CAROUSEL
   ========================================= */
(function initCarousel() {
  const track = document.getElementById('case-track');
  if (!track) return;
  const slides = track.querySelectorAll('.case-slide');
  const dots = document.querySelectorAll('.case-dots .dot');
  let idx = 0;

  function go(i) {
    idx = (i + slides.length) % slides.length;
    track.scrollTo({ left: idx * track.clientWidth, behavior: 'smooth' });
    dots.forEach((d, j) => d.classList.toggle('active', j === idx));
  }
  document.querySelector('.case-prev').addEventListener('click', () => go(idx - 1));
  document.querySelector('.case-next').addEventListener('click', () => go(idx + 1));
  dots.forEach((d, j) => d.addEventListener('click', () => go(j)));

  let auto = setInterval(() => go(idx + 1), 6000);
  track.addEventListener('mouseenter', () => clearInterval(auto));
  track.addEventListener('mouseleave', () => { auto = setInterval(() => go(idx + 1), 6000); });
})();

/* =========================================
   INTERACTABLE ZONE — DRAGGABLE STICKERS
   ========================================= */
(function initDraggable() {
  const items = document.querySelectorAll('.drag-item');
  let zTop = 10;

  items.forEach((el) => {
    let sx = 0, sy = 0, ox = 0, oy = 0;
    let dragging = false;

    // capture initial position from CSS vars
    const style = getComputedStyle(el);
    let curX = parseFloat(style.left) || 0;
    let curY = parseFloat(style.top) || 0;
    el.style.left = curX + 'px';
    el.style.top = curY + 'px';

    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      dragging = true;
      el.style.zIndex = ++zTop;
      sx = e.clientX; sy = e.clientY;
      ox = parseFloat(el.style.left); oy = parseFloat(el.style.top);
      el.setPointerCapture(e.pointerId);
      gsap.to(el, { scale: 1.04, duration: 0.2 });
    });
    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dxp = e.clientX - sx;
      const dyp = e.clientY - sy;
      el.style.left = (ox + dxp) + 'px';
      el.style.top = (oy + dyp) + 'px';
    });
    el.addEventListener('pointerup', (e) => {
      dragging = false;
      gsap.to(el, { scale: 1, duration: 0.3, ease: 'power2.out' });
    });
    el.addEventListener('pointercancel', () => { dragging = false; });
  });
})();

/* =========================================
   BIO TOGGLE: FULL YAP <-> TL;DR
   ========================================= */
(function initBio() {
  const tabs = document.querySelectorAll('.bio-tab');
  const bio = document.querySelector('.bio');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.dataset.bio;
      if (mode === 'tldr') bio.classList.add('tldr');
      else bio.classList.remove('tldr');
    });
  });
})();

/* =========================================
   WHY I DESIGN — pill switching
   ========================================= */
(function initWhy() {
  const pills = document.querySelectorAll('.why-pill');
  pills.forEach((p) => {
    p.addEventListener('click', () => {
      pills.forEach((q) => q.classList.remove('active'));
      p.classList.add('active');
      gsap.fromTo('.why-portrait', { scale: 0.96, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' });
    });
  });
})();

/* =========================================
   SCROLL REVEALS
   ========================================= */
gsap.utils.toArray('.tile').forEach((el, i) => {
  gsap.fromTo(el,
    { y: 60, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      delay: (i % 4) * 0.06
    });
});

gsap.utils.toArray('.case-slide, .why-modal, .disc, .folder, .imessage, .wallet, .exp-board').forEach((el) => {
  gsap.fromTo(el,
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' } });
});

gsap.utils.toArray('.bio-content p').forEach((el, i) => {
  gsap.fromTo(el,
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      delay: i * 0.05 });
});

// Hero word + tip entrance
gsap.from('.hero-wordmark', { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out' });
gsap.from('.hero-tip', { y: -10, opacity: 0, duration: 1, ease: 'power2.out', delay: 0.3 });

// Sidebar entrance
gsap.from('.sidebar > *', { x: -20, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 });
gsap.from('.rail', { x: -20, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.4 });
gsap.from('.resume-btn', { y: -10, opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.5 });

// Signature parallax
gsap.to('.signature', {
  y: -40,
  scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true }
});

// Big bg text parallax
gsap.utils.toArray('.exp-bg, .apart-bg, .interact-bg-text').forEach((el) => {
  gsap.to(el, {
    x: -80,
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
  });
});

console.log('[portfolio] booted');
