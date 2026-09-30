import { createSignal } from "solid-js";
import type { StudioImage } from "~/types";
import { uid } from "~/lib/images";

/**
 * ID Print studio: collect card scans, lay them out side-by-side
 * (front/back pairs) on an A4 sheet with cut guides.
 */
export const createIdPrintStore = () => {
  const [images, setImages] = createSignal<StudioImage[]>([]);
  const [title, setTitle] = createSignal("ID Card Print");
  const [twoUp, setTwoUp] = createSignal(true);
  const [guides, setGuides] = createSignal(true);
  const [caption, setCaption] = createSignal(true);

  return {
    images, title, setTitle, twoUp, setTwoUp, guides, setGuides, caption, setCaption,
    add: (src: string, label?: string) =>
      setImages((p) => [...p, { id: uid(), src, label: label ?? `card-${p.length + 1}` }]),
    remove: (id: string) => setImages((p) => p.filter((i) => i.id !== id)),
    replace: (id: string, src: string) =>
      setImages((p) => p.map((i) => (i.id === id ? { ...i, src } : i))),
    rename: (id: string, label: string) =>
      setImages((p) => p.map((i) => (i.id === id ? { ...i, label } : i))),
    move: (id: string, dir: -1 | 1) =>
      setImages((p) => {
        const i = p.findIndex((x) => x.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= p.length) return p;
        const next = [...p];
        [next[i], next[j]] = [next[j]!, next[i]!];
        return next;
      }),
    clear: () => setImages([]),
  };
};

export type IdPrintStore = ReturnType<typeof createIdPrintStore>;
