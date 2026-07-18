import {
  siDocker,
  siJenkins,
  siNodedotjs,
  siPython,
  siPytorch,
  siReact,
  siScikitlearn,
  siTailwindcss,
  siTensorflow,
  siTypescript,
} from "simple-icons";

export type TechLogo = { title: string; hex: string; path: string };

/** Verified stack only, matching the skills section. */
export const techLogos: TechLogo[] = [
  siPython,
  siPytorch,
  siTensorflow,
  siScikitlearn,
  siReact,
  siTypescript,
  siNodedotjs,
  siDocker,
  siJenkins,
  siTailwindcss,
].map((i) => ({ title: i.title, hex: i.hex, path: i.path }));

export function LogoMark({ logo, size = 18 }: { logo: TechLogo; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d={logo.path} />
    </svg>
  );
}
