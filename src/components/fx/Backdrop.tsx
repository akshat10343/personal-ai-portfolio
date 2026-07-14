/**
 * Fixed full-page backdrop: drifting aurora blobs, a blueprint grid that
 * fades out below the fold, and a film-grain pass to kill banding.
 * Pure CSS animation — cheap, and disabled by prefers-reduced-motion.
 */
export function Backdrop() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <div className="animate-hue absolute inset-0">
        <div className="animate-drift-1 absolute -top-[30%] left-[8%] h-[55vmax] w-[55vmax] rounded-full bg-accent/[0.17] blur-[110px]" />
        <div className="animate-drift-2 absolute -top-[12%] right-[2%] h-[42vmax] w-[42vmax] rounded-full bg-accent-2/[0.12] blur-[110px]" />
        <div className="animate-drift-3 absolute top-[48%] left-[38%] h-[36vmax] w-[36vmax] rounded-full bg-indigo-500/[0.10] blur-[120px]" />
      </div>
      <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,transparent_68%)]" />
      <div className="bg-noise absolute inset-0 opacity-[0.05]" />
    </div>
  );
}
