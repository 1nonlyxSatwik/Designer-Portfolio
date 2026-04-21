import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ============ THREE.JS BACKGROUND ============ */
(function initWebGL() {
  const canvas = document.getElementById('bg-canvas');

  // Test WebGL availability gracefully
  try {
    const test = document.createElement('canvas').getContext('webgl2')
      || document.createElement('canvas').getContext('webgl');
    if (!test) throw new Error('no-webgl');
  } catch (_) {
    // Fallback: subtle CSS gradient backdrop
    canvas.style.background =
      'radial-gradient(ellipse at 30% 30%, rgba(255,61,119,0.18), transparent 50%),' +
      'radial-gradient(ellipse at 70% 70%, rgba(108,92,231,0.22), transparent 55%),' +
      '#0B0B0F';
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    });
  } catch (err) {
    canvas.style.background =
      'radial-gradient(ellipse at 30% 30%, rgba(255,61,119,0.18), transparent 50%),' +
      'radial-gradient(ellipse at 70% 70%, rgba(108,92,231,0.22), transparent 55%),' +
      '#0B0B0F';
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0B0B0F, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0B0B0F, 5, 18);

  const camera = new THREE.PerspectiveCamera(
    50, window.innerWidth / window.innerHeight, 0.1, 100
  );
  camera.position.z = 8;

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  const pinkLight = new THREE.PointLight(0xFF3D77, 2.4, 30);
  pinkLight.position.set(-6, 4, 4);
  scene.add(pinkLight);

  const purpleLight = new THREE.PointLight(0x6C5CE7, 2.4, 30);
  purpleLight.position.set(6, -3, 4);
  scene.add(purpleLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
  keyLight.position.set(2, 4, 5);
  scene.add(keyLight);

  // Blobs (low-poly icospheres for soft look)
  const group = new THREE.Group();
  scene.add(group);

  const blobConfigs = [
    { size: 1.6, x: -3.5, y: 1.0,  z: 0,    color: 0xFF3D77, metal: 0.2, rough: 0.35 },
    { size: 1.2, x:  3.2, y: -0.8, z: -1,   color: 0x6C5CE7, metal: 0.3, rough: 0.3  },
    { size: 0.9, x:  1.0, y: 2.0,  z: -2,   color: 0xffffff, metal: 0.1, rough: 0.5  },
    { size: 1.1, x: -2.0, y: -1.8, z: -1.5, color: 0x6C5CE7, metal: 0.25, rough: 0.4 },
    { size: 0.7, x:  4.0, y: 1.6,  z: -2.5, color: 0xFF3D77, metal: 0.2, rough: 0.45 },
  ];

  const blobs = blobConfigs.map((cfg) => {
    const geo = new THREE.IcosahedronGeometry(cfg.size, 2);
    const mat = new THREE.MeshStandardMaterial({
      color: cfg.color,
      metalness: cfg.metal,
      roughness: cfg.rough,
      flatShading: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cfg.x, cfg.y, cfg.z);
    mesh.userData = {
      baseY: cfg.y,
      floatSpeed: 0.4 + Math.random() * 0.5,
      floatAmp: 0.25 + Math.random() * 0.3,
      rotSpeedX: (Math.random() - 0.5) * 0.15,
      rotSpeedY: (Math.random() - 0.5) * 0.2,
      phase: Math.random() * Math.PI * 2,
    };
    group.add(mesh);
    return mesh;
  });

  // Mouse parallax
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Scroll-driven camera
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    // Smooth mouse easing
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    // Parallax camera
    camera.position.x = mouse.x * 0.6;
    camera.position.y = -mouse.y * 0.4 - scrollY * 0.0008;
    camera.lookAt(0, 0, 0);

    blobs.forEach((b) => {
      const u = b.userData;
      b.rotation.x += u.rotSpeedX * 0.01;
      b.rotation.y += u.rotSpeedY * 0.01;
      b.position.y = u.baseY + Math.sin(t * u.floatSpeed + u.phase) * u.floatAmp;
    });

    group.rotation.y = mouse.x * 0.08;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ============ CUSTOM CURSOR ============ */
(function initCursor() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursor-dot');

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const target = { x: pos.x, y: pos.y };

  window.addEventListener('mousemove', (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
    gsap.to(dot, { x: target.x, y: target.y, duration: 0.05, ease: 'power3.out' });
  });

  gsap.ticker.add(() => {
    pos.x += (target.x - pos.x) * 0.18;
    pos.y += (target.y - pos.y) * 0.18;
    cursor.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
  });

  document.querySelectorAll('[data-cursor="hover"], a, button').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
})();

/* ============ NAV SCROLL STATE ============ */
(function initNav() {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }, { passive: true });
})();

/* ============ GSAP ENTRANCE & SCROLL REVEALS ============ */
(function initAnimations() {
  // Hero entrance
  const heroEls = document.querySelectorAll('.hero .reveal');
  gsap.to(heroEls, {
    opacity: 1,
    y: 0,
    duration: 1.1,
    ease: 'power3.out',
    stagger: 0.12,
    delay: 0.3,
  });

  // Scroll reveals for everything else
  document.querySelectorAll('.reveal:not(.hero .reveal)').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });
})();

/* ============ TILT EFFECT FOR CARDS ============ */
(function initTilt() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  document.querySelectorAll('.tilt').forEach((el) => {
    const damp = 8;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const rx = ((y / r.height) - 0.5) * -damp;
      const ry = ((x / r.width) - 0.5) * damp;
      gsap.to(el, {
        rotationX: rx,
        rotationY: ry,
        transformPerspective: 800,
        duration: 0.5,
        ease: 'power2.out',
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.7, ease: 'power3.out' });
    });
  });
})();
