import { createSignal } from "solid-js";
import type { StudioImage } from "~/types";
import { uid } from "~/lib/images";

/** Standalone self-attestation studio: upload → crop/redact → watermark → A4. */
export const createAttestStore = () => {
  const [images, setImages] = createSignal<StudioImage[]>([]);
  const [watermark, setWatermark] = createSignal(true);
  const [from, setFrom] = createSignal<"standalone" | "beneficiary">("standalone");

  return {
    images, watermark, setWatermark, from, setFrom,
    add: (src: string, label = "scan") =>
      setImages((p) => [...p, { id: uid(), src, label }]),
    remove: (id: string) => setImages((p) => p.filter((i) => i.id !== id)),
    replace: (id: string, src: string) =>
      setImages((p) => p.map((i) => (i.id === id ? { ...i, src } : i))),
    clear: () => setImages([]),
    /** Seed from a beneficiary record for the preview → attest path. */
    seed: (srcs: string[], source: "standalone" | "beneficiary") => {
      setFrom(source);
      setImages(srcs.map((src, n) => ({ id: uid(), src, label: `page-${n + 1}` })));
    },
  };
};

export type AttestStore = ReturnType<typeof createAttestStore>;
