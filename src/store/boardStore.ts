import { createSignal } from "solid-js";
import type { StudioImage } from "~/types";
import { uid } from "~/lib/images";

/** Generic image board: any scans/photos in an adjustable grid on A4. */
export const createBoardStore = () => {
  const [images, setImages] = createSignal<StudioImage[]>([]);
  const [title, setTitle] = createSignal("Document Board");
  const [showTitle, setShowTitle] = createSignal(true);
  const [cols, setCols] = createSignal(2);
  const [gapMm, setGapMm] = createSignal(3);
  const [captions, setCaptions] = createSignal(true);

  return {
    images, title, setTitle, showTitle, setShowTitle, cols, setCols,
    gapMm, setGap: (v: number) => setGapMm(Math.max(0, Math.min(10, v))),
    captions, setCaptions,
    add: (src: string, label?: string) =>
      setImages((p) => [...p, { id: uid(), src, label: label ?? `img-${p.length + 1}` }]),
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

export type BoardStore = ReturnType<typeof createBoardStore>;
