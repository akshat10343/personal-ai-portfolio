const COLORS = ["#8b5cf6", "#22d3ee", "#34d399", "#fbbf24", "#eef1f8"];

/**
 * A small celebratory burst at screen coordinates. Creates its own canvas,
 * animates ~1.2s, cleans up after itself. No-op under reduced motion.
 */
export function confettiBurst(x: number, y: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:80";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const parts = Array.from({ length: 55 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 7;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 3 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      spin: Math.random() * Math.PI,
      spinV: (Math.random() - 0.5) * 0.4,
    };
  });

  const start = performance.now();
  const DURATION = 1200;

  function frame(t: number) {
    const elapsed = t - start;
    if (elapsed > DURATION || !ctx) {
      canvas.remove();
      return;
    }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const fade = 1 - elapsed / DURATION;
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22;
      p.vx *= 0.985;
      p.spin += p.spinV;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin);
      ctx.globalAlpha = fade;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
