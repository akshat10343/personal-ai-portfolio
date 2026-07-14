import { useEffect, useRef } from "react";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type Anomaly = {
  node: number;
  age: number;
};

const LINK_DIST = 130;
const ANOMALY_LIFE = 90; // frames
const ANOMALY_CHANCE = 0.006; // per frame
const CURSOR_DIST = 150;
const MAX_SPEED = 0.9;

type NetworkGraphProps = {
  className?: string;
  /** When true, nodes link to and gently flee from the cursor. */
  interactive?: boolean;
  /** Keep dark-theme colors even in light mode (for dark-island panels). */
  forceDark?: boolean;
};

/**
 * A drifting network of nodes and links — every few seconds one node
 * "trips the detector" and pulses red before being cleared. A quiet nod
 * to intrusion detection. Renders a static frame under reduced motion.
 */
export function NetworkGraph({
  className,
  interactive = false,
  forceDark = false,
}: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let nodes: Node[] = [];
    let anomalies: Anomaly[] = [];
    let raf = 0;
    let width = 0;
    let height = 0;
    const cursor = { x: -9999, y: -9999, active: false };

    function seed() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(64, Math.max(24, Math.floor((width * height) / 16000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }));
      anomalies = [];
    }

    function step() {
      ctx!.clearRect(0, 0, width, height);

      for (const n of nodes) {
        // Nodes shy away from the cursor, like traffic around a probe.
        if (cursor.active) {
          const dx = n.x - cursor.x;
          const dy = n.y - cursor.y;
          const d = Math.hypot(dx, dy);
          if (d > 0.001 && d < CURSOR_DIST) {
            const f = (1 - d / CURSOR_DIST) * 0.045;
            n.vx += (dx / d) * f;
            n.vy += (dy / d) * f;
          }
        }
        const speed = Math.hypot(n.vx, n.vy);
        if (speed > MAX_SPEED) {
          n.vx = (n.vx / speed) * MAX_SPEED;
          n.vy = (n.vy / speed) * MAX_SPEED;
        }

        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      if (Math.random() < ANOMALY_CHANCE && anomalies.length < 2) {
        anomalies.push({ node: Math.floor(Math.random() * nodes.length), age: 0 });
      }
      anomalies = anomalies.filter((a) => (a.age += 1) < ANOMALY_LIFE);

      draw();
      raf = requestAnimationFrame(step);
    }

    function draw() {
      // Colors follow the theme (checked per frame — cheap, and instantly
      // correct when the user toggles), unless this instance is forced dark.
      const light =
        !forceDark && document.documentElement.dataset.theme === "light";
      const linkRGB = light ? "91, 33, 182" : "139, 92, 246";
      const nodeRGB = light ? "14, 116, 144" : "34, 211, 238";
      const alertRGB = light ? "185, 28, 28" : "248, 113, 113";

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d > LINK_DIST) continue;
          const alpha = (1 - d / LINK_DIST) * (light ? 0.3 : 0.22);
          ctx!.strokeStyle = `rgba(${linkRGB}, ${alpha})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(nodes[i].x, nodes[i].y);
          ctx!.lineTo(nodes[j].x, nodes[j].y);
          ctx!.stroke();
        }
      }

      // cursor probe: cyan links to whatever it gets close to
      if (cursor.active) {
        for (const n of nodes) {
          const d = Math.hypot(n.x - cursor.x, n.y - cursor.y);
          if (d > CURSOR_DIST) continue;
          const alpha = (1 - d / CURSOR_DIST) * 0.4;
          ctx!.strokeStyle = `rgba(${nodeRGB}, ${alpha})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(cursor.x, cursor.y);
          ctx!.lineTo(n.x, n.y);
          ctx!.stroke();
        }
        ctx!.fillStyle = `rgba(${nodeRGB}, 0.75)`;
        ctx!.beginPath();
        ctx!.arc(cursor.x, cursor.y, 2.4, 0, Math.PI * 2);
        ctx!.fill();
      }

      // nodes
      for (const n of nodes) {
        ctx!.fillStyle = `rgba(${nodeRGB}, ${light ? 0.6 : 0.5})`;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx!.fill();
      }

      // anomalies: red pulse + expanding detection ring
      for (const a of anomalies) {
        const n = nodes[a.node];
        const t = a.age / ANOMALY_LIFE;
        ctx!.fillStyle = `rgba(${alertRGB}, ${0.9 * (1 - t)})`;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 2.6, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.strokeStyle = `rgba(${alertRGB}, ${0.55 * (1 - t)})`;
        ctx!.lineWidth = 1.2;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 4 + t * 26, 0, Math.PI * 2);
        ctx!.stroke();
      }
    }

    seed();
    if (reduce) {
      draw(); // single static frame
    } else {
      raf = requestAnimationFrame(step);
    }

    const onResize = () => {
      seed();
      if (reduce) draw();
    };
    window.addEventListener("resize", onResize);

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas!.getBoundingClientRect();
      cursor.x = e.clientX - rect.left;
      cursor.y = e.clientY - rect.top;
      cursor.active =
        cursor.x >= 0 && cursor.x <= width && cursor.y >= 0 && cursor.y <= height;
    };
    const trackCursor =
      interactive && !reduce && window.matchMedia("(pointer: fine)").matches;
    if (trackCursor) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (trackCursor) window.removeEventListener("pointermove", onPointerMove);
    };
  }, [interactive]);

  return (
    <div aria-hidden className={className}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
