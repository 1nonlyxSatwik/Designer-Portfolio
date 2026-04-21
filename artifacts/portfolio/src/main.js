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

  // ----- LIGHTER (Bic-style) -----
  const lighter = new THREE.Group();
  lighter.position.set(0, -0.55, 0);
  group.add(lighter);

  // Body — red rounded cylinder
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.25, metalness: 0.15, emissive: 0x220000, emissiveIntensity: 0.15 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 1.0, 48), bodyMat);
  body.position.y = 0.15;
  lighter.add(body);

  // Fluid window (slim transparent strip)
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x4a0a0a, roughness: 0.1, metalness: 0.0, transparent: true, opacity: 0.55 });
  const fluidWin = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.285, 0.5, 48, 1, true, -Math.PI/4, Math.PI/2), windowMat);
  fluidWin.position.y = -0.05;
  lighter.add(fluidWin);

  // Cap — silver/metal top
  const capMat = new THREE.MeshStandardMaterial({ color: 0xcfcfd4, roughness: 0.25, metalness: 0.95 });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.28, 0.18, 32), capMat);
  cap.position.y = 0.74;
  lighter.add(cap);

  // Inner chamber wall
  const chamberMat = new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.4, metalness: 0.7 });
  const chamberOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.16, 32, 1, true), chamberMat);
  chamberOuter.position.y = 0.92;
  lighter.add(chamberOuter);

  // Spark wheel
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0xa8a8b0, roughness: 0.55, metalness: 0.9 });
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.12, 22), wheelMat);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(-0.13, 0.95, 0);
  lighter.add(wheel);

  // Press lever (the gas release tab)
  const leverMat = new THREE.MeshStandardMaterial({ color: 0xd5d5db, roughness: 0.35, metalness: 0.85 });
  const lever = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.20), leverMat);
  lever.position.set(0.06, 0.93, 0);
  lighter.add(lever);

  // Flame (hidden until pressed) — stretched cone with emissive
  const flameMat = new THREE.MeshStandardMaterial({
    color: 0xffaa33, emissive: 0xff6600, emissiveIntensity: 1.6,
    transparent: true, opacity: 0.95, roughness: 0.4
  });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 24), flameMat);
  flame.position.y = 1.3;
  flame.scale.set(0, 0, 0);
  lighter.add(flame);

  // Inner blue flame core
  const flameCoreMat = new THREE.MeshStandardMaterial({
    color: 0x66aaff, emissive: 0x3377ff, emissiveIntensity: 1.4,
    transparent: true, opacity: 0.9
  });
  const flameCore = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.28, 16), flameCoreMat);
  flameCore.position.y = 1.2;
  flameCore.scale.set(0, 0, 0);
  lighter.add(flameCore);

  // Flame point light (warm glow)
  const flameLight = new THREE.PointLight(0xff7733, 0, 4, 2);
  flameLight.position.set(0, 1.4, 0);
  lighter.add(flameLight);

  // Hit target for raycaster
  const button = lever;

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
    // Hit any part of the lighter
    const hit = ray.intersectObjects([lever, body, cap, wheel]);
    if (hit.length) {
      isPressing = true;
      // Press the lever down
      gsap.to(lever.position, { y: 0.89, duration: 0.12, ease: 'power2.out' });
      // Ignite the flame
      gsap.to(flame.scale, { x: 1, y: 1, z: 1, duration: 0.25, ease: 'back.out(2)' });
      gsap.to(flameCore.scale, { x: 1, y: 1, z: 1, duration: 0.25, ease: 'back.out(2)' });
      gsap.to(flameLight, { intensity: 3.2, duration: 0.3 });
    }
  }
  function pointerUp() {
    if (!isPressing) return;
    isPressing = false;
    gsap.to(lever.position, { y: 0.93, duration: 0.3, ease: 'elastic.out(1,0.5)' });
    gsap.to(flame.scale, { x: 0, y: 0, z: 0, duration: 0.35, ease: 'power3.in' });
    gsap.to(flameCore.scale, { x: 0, y: 0, z: 0, duration: 0.35, ease: 'power3.in' });
    gsap.to(flameLight, { intensity: 0, duration: 0.35 });
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

    // Flame flicker while burning
    if (flame.scale.y > 0.05) {
      const flick = 0.92 + Math.sin(t * 30) * 0.05 + Math.sin(t * 47) * 0.03;
      flame.scale.x = flick;
      flame.scale.z = flick;
      flame.scale.y = 0.85 + Math.sin(t * 24) * 0.12;
      flameCore.scale.y = 0.9 + Math.sin(t * 28) * 0.1;
      flame.position.x = Math.sin(t * 18) * 0.012;
      flameLight.intensity = 2.8 + Math.sin(t * 30) * 0.6;
    }

    // parallax
    group.rotation.y += (pmx * 0.4 - group.rotation.y) * 0.04;
    group.rotation.x += (pmy * -0.4 - group.rotation.x) * 0.04;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
})();

/* =========================================
   WALLET — click to slide card out, copy phone
   ========================================= */
(function initWallet() {
  const wallet = document.getElementById('wallet');
  if (!wallet) return;
  wallet.addEventListener('click', (e) => {
    if (e.target.classList.contains('wc-copy')) return; // copy button has its own handler
    wallet.classList.toggle('is-open');
  });
  const copyBtn = wallet.querySelector('.wc-copy');
  const phone = wallet.querySelector('.wc-phone').textContent.trim();
  copyBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    try { await navigator.clipboard.writeText(phone); } catch {}
    copyBtn.classList.add('copied');
    const original = copyBtn.textContent;
    copyBtn.textContent = 'Copied';
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.textContent = original;
    }, 1400);
  });
})();

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
