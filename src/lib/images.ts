/** Small image helpers shared by every studio module. */

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error ?? new Error("read failed"));
    r.readAsDataURL(file);
  });

export const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("could not decode image"));
    img.src = src;
  });

/** Crop a region (in source pixels) out of a dataURL image. */
export async function cropDataUrl(
  src: string,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  maxEdge = 1600,
): Promise<string> {
  const img = await loadImage(src);
  const scale = Math.min(1, maxEdge / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw * scale));
  canvas.height = Math.max(1, Math.round(sh * scale));
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const KB = (s: string) => Math.round((s.length * 3) / 4 / 1024);

/** Rough localStorage footprint of the serialisable stores, in KB. */
export function storageFootprint(keys: string[]): number {
  let total = 0;
  for (const k of keys) {
    try {
      const v = localStorage.getItem(k);
      if (v) total += KB(v);
    } catch {
      /* private mode */
    }
  }
  return total;
}
