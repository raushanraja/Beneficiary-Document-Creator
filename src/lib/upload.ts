import type { AppStore } from "~/store/appStore";
import { fileToDataUrl } from "./images";

export type CropTarget = "beneficiary" | "attest" | "idprint" | "photogrid" | "board";

interface Queued {
  src: string;
  name: string;
  target: CropTarget;
  aspect: number | null;
  title: string;
}

const queue: Queued[] = [];

/** Queue files for one-by-one cropping. First item opens immediately. */
export async function stageFilesForCrop(
  app: AppStore,
  files: File[],
  target: CropTarget,
  aspect: number | null,
  title: string,
) {
  const fresh = files.filter((f) => f.type.startsWith("image/"));
  if (fresh.length === 0) {
    app.toast("No image files selected", "error");
    return;
  }
  for (const f of fresh) {
    try {
      queue.push({ src: await fileToDataUrl(f), name: f.name, target, aspect, title });
    } catch {
      app.toast(`Could not read ${f.name}`, "error");
    }
  }
  pumpCropQueue(app);
}

/** Advance the crop queue. Returns true if another job opened. */
export function pumpCropQueue(app: AppStore): boolean {
  const next = queue.shift();
  if (!next) return false;
  const n = next.title.includes("(") ? next.title : `${next.title} (${next.name})`;
  app.setCropJob({ ...next, title: n });
  app.openModal("crop");
  return true;
}

/** Clear pending crops (e.g. dialog cancelled mid-batch). */
export function clearCropQueue() {
  queue.length = 0;
}
