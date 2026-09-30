import { createSignal } from "solid-js";

export interface PhotoSize {
  id: string;
  label: string;
  /** mm */
  w: number;
  h: number;
}

export const PHOTO_SIZES: readonly PhotoSize[] = [
  { id: "passport-in", label: "Passport 35×45mm", w: 35, h: 45 },
  { id: "visa-us", label: "US Visa 2×2in", w: 50.8, h: 50.8 },
  { id: "stamp", label: "Stamp 25×30mm", w: 25, h: 30 },
  { id: "wallet", label: "Wallet 50×70mm", w: 50, h: 70 },
];

/** Photo grid studio: one portrait tiled N-up on A4. */
export const createPhotoStore = () => {
  const [src, setSrc] = createSignal<string | null>(null);
  const [sizeId, setSizeId] = createSignal<string>(PHOTO_SIZES[0]!.id);
  const [count, setCount] = createSignal(8);
  const [gap, setGap] = createSignal(true);

  return {
    src, setSrc,
    sizeId, setSizeId,
    size: () => PHOTO_SIZES.find((s) => s.id === sizeId()) ?? PHOTO_SIZES[0]!,
    sizes: PHOTO_SIZES,
    count, setCount,
    gap, setGap,
    clear: () => setSrc(null),
  };
};

export type PhotoStore = ReturnType<typeof createPhotoStore>;
