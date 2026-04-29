class Pixel {
  constructor(canvas, context, x, y, color, speed, delay) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = (Math.random() * 0.8 + 0.1) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = Math.random() * (this.maxSizeInteger - this.minSize) + this.minSize;
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size);
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }
    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    } else {
      this.size -= 0.1;
    }
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }
    if (this.isReverse) {
      this.size -= this.speed;
    } else {
      this.size += this.speed;
    }
  }
}

function getEffectiveSpeed(value, reducedMotion) {
  const min = 0;
  const max = 100;
  const throttle = 0.001;
  const parsed = parseInt(value, 10);

  if (parsed <= min || reducedMotion) {
    return min;
  } else if (parsed >= max) {
    return max * throttle;
  } else {
    return parsed * throttle;
  }
}

const VARIANTS = {
  default: {
    gap: 5,
    speed: 35,
    colors: '#f8fafc,#f1f5f9,#cbd5e1'
  },
  pink: {
    gap: 6,
    speed: 80,
    colors: '#fecdd3,#fda4af,#e11d48'
  }
};

export function initPixelCard(container, variantName = 'default') {
  const canvas = document.createElement('canvas');
  canvas.className = 'pixel-canvas';
  container.prepend(canvas);

  let pixels = [];
  let animationFrame = null;
  let timePrevious = performance.now();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const variantCfg = VARIANTS[variantName] || VARIANTS.default;
  const gap = variantCfg.gap;
  const speed = variantCfg.speed;
  const colors = variantCfg.colors;

  const setupPixels = () => {
    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const colorsArray = colors.split(',');
    const pxs = [];
    for (let x = 0; x < width; x += parseInt(gap, 10)) {
      for (let y = 0; y < height; y += parseInt(gap, 10)) {
        const color = colorsArray[Math.floor(Math.random() * colorsArray.length)];
        const dx = x - width / 2;
        const dy = y - height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delay = reducedMotion ? 0 : distance;
        pxs.push(new Pixel(canvas, ctx, x, y, color, getEffectiveSpeed(speed, reducedMotion), delay));
      }
    }
    pixels = pxs;
  };

  const doAnimate = fnName => {
    animationFrame = requestAnimationFrame(() => doAnimate(fnName));
    const timeNow = performance.now();
    const timePassed = timeNow - timePrevious;
    const timeInterval = 1000 / 60;

    if (timePassed < timeInterval) return;
    timePrevious = timeNow - (timePassed % timeInterval);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let allIdle = true;
    for (let i = 0; i < pixels.length; i++) {
      const pixel = pixels[i];
      pixel[fnName]();
      if (!pixel.isIdle) {
        allIdle = false;
      }
    }
    if (allIdle) {
      cancelAnimationFrame(animationFrame);
    }
  };

  const handleAnimation = name => {
    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(() => doAnimate(name));
  };

  container.addEventListener('mouseenter', () => handleAnimation('appear'));
  container.addEventListener('mouseleave', () => handleAnimation('disappear'));

  setupPixels();
  
  const observer = new ResizeObserver(() => {
    setupPixels();
  });
  observer.observe(container);

  return () => {
    observer.disconnect();
    cancelAnimationFrame(animationFrame);
  };
}
