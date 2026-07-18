import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import type { CSSProperties } from "react";
import { LogoMark, techLogos } from "../ui/TechLogos";

const BASE_SPEED = 2.6; // % of half-row per second

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/**
 * Infinite ticker band that reacts to scrolling: it speeds up with your
 * scroll velocity, skews slightly, and reverses direction when you scroll
 * back up. Two identical copies slide by 50% for a seamless loop.
 * Sits still under reduced motion.
 */
export function Marquee() {
  const reduce = useReducedMotion();
  const row = [...techLogos, ...techLogos];

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], {
    clamp: false,
  });
  const skewX = useTransform(smoothVelocity, [-1200, 1200], [3.5, -3.5]);
  const direction = useRef(-1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const vf = velocityFactor.get();
    if (vf < 0) direction.current = 1;
    else if (vf > 0) direction.current = -1;

    let moveBy = direction.current * BASE_SPEED * (delta / 1000);
    moveBy += moveBy * Math.abs(vf);
    baseX.set(wrap(-50, 0, baseX.get() + moveBy));
  });

  const x = useTransform(baseX, (v) => `${v}%`);

  return (
    <div
      aria-hidden
      className="relative overflow-hidden border-y border-line bg-bright/[0.02] py-3.5 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
    >
      <motion.div
        style={reduce ? undefined : { x, skewX }}
        className="flex w-max"
      >
        {row.map((logo, i) => (
          <span
            key={i}
            style={{ "--brand": `#${logo.hex}` } as CSSProperties}
            className="flex items-center whitespace-nowrap"
          >
            <span className="flex items-center gap-2.5 px-6 font-mono text-xs tracking-[0.2em] text-body/50 uppercase transition-colors duration-300 hover:text-(--brand)">
              <LogoMark logo={logo} />
              {logo.title}
            </span>
            <span className="text-accent/50">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
