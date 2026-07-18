import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

function Word({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.22, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block whitespace-pre">
      {word}{" "}
    </motion.span>
  );
}

/**
 * Paragraph whose words brighten one by one as it scrolls through the
 * viewport. Renders plain text under reduced motion.
 */
export function ScrubText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.4"],
  });

  if (reduce) {
    return <p className={className}>{text}</p>;
  }

  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word
          key={i}
          word={word}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
        />
      ))}
    </p>
  );
}
