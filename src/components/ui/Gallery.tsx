import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Project } from "../../content/site";

type Images = NonNullable<Project["gallery"]>;

/**
 * Case-study image strip with a click-to-zoom lightbox. Renders nothing
 * until the project has gallery entries (images in public/projects/).
 */
export function Gallery({ images }: { images: Images }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
      e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, images.length]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(i);
            }}
            className="group overflow-hidden rounded-lg border border-line"
          >
            <img
              src={img.src}
              alt={img.caption}
              loading="lazy"
              className="aspect-video w-full cursor-zoom-in object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(null);
            }}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-ink/95 p-6 backdrop-blur-md"
          >
            <motion.img
              key={open}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              src={images[open].src}
              alt={images[open].caption}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[80vh] max-w-full rounded-xl border border-line object-contain"
            />
            <p className="mt-4 font-mono text-xs text-body">
              {images[open].caption}
            </p>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((open - 1 + images.length) % images.length);
                  }}
                  className="glass absolute left-5 rounded-full p-3 text-bright"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((open + 1) % images.length);
                  }}
                  className="glass absolute right-5 rounded-full p-3 text-bright"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
            <button
              type="button"
              aria-label="Close image"
              onClick={() => setOpen(null)}
              className="glass absolute top-5 right-5 rounded-full p-3 text-bright"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
