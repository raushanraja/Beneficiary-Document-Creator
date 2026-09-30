import { For, Show } from "solid-js";
import type { Beneficiary, StudioImage } from "~/types";
import type { PhotoSize } from "~/store/photoStore";

/**
 * A4 sheets. Shared by the on-screen preview and the print-only root, so
 * what you see is what prints. Paper is unthemed: white bg, black ink.
 */

const sheetCls = "a4-sheet p-[10mm] text-[12px] leading-6 text-black";

export const BeneficiarySheet = (p: { b: Beneficiary }) => (
  <div class={sheetCls}>
    <h1 class="pb-2 text-xl font-semibold">Beneficiary Details</h1>
    <h2 class="mb-2 mt-5 border-b border-gray-300 pb-1 text-base font-semibold">
      Personal Information
    </h2>
    <table class="w-full border-collapse">
      <tbody>
        <Row k="Name" v={p.b.name} />
        <Row k="Proof of ID" v={p.b.proofType} />
        <Row k="ID Number" v={p.b.idNumber} />
      </tbody>
    </table>
    <h2 class="mb-2 mt-5 border-b border-gray-300 pb-1 text-base font-semibold">Bank Details</h2>
    <table class="w-full border-collapse">
      <tbody>
        <Row k="Bank Name" v={p.b.bankName} />
        <Row k="Branch Code (IFSC)" v={p.b.branchCode} />
        <Row k="Account No" v={p.b.accountNo} />
        <Row k="Account Type" v={p.b.accountType} />
      </tbody>
    </table>
    <h2 class="mb-2 mt-5 border-b border-gray-300 pb-1 text-base font-semibold">
      Proof of Identity Images
    </h2>
    <div class="grid grid-cols-2 gap-4">
      <For each={p.b.images}>
        {(src) => (
          <div class="border border-gray-300 p-1" style={{ "break-inside": "avoid" }}>
            <img src={src} alt="Proof of identity" class="h-auto w-full" />
          </div>
        )}
      </For>
    </div>
  </div>
);

const Row = (p: { k: string; v: string }) => (
  <tr>
    <td class="w-44 bg-gray-100 px-3 py-1.5 font-medium">{p.k}</td>
    <td class="px-3 py-1.5">{p.v}</td>
  </tr>
);

export const AttestationSheet = (p: { images: StudioImage[]; watermark: boolean }) => (
  <div class={sheetCls}>
    <For each={p.images}>
      {(img) => (
        <div
          class="relative mb-4 inline-block w-full border border-gray-300 p-1"
          style={{ "break-inside": "avoid" }}
        >
          <img src={img.src} alt={img.label} class="h-auto w-full" />
          <Show when={p.watermark}>
            <div
              class="print-watermark pointer-events-none absolute inset-0 flex items-center justify-center text-5xl font-bold"
              style={{ transform: "rotate(-30deg)" }}
            >
              Self-Attested
            </div>
          </Show>
        </div>
      )}
    </For>
  </div>
);

export const IdSheet = (p: {
  title: string;
  showTitle: boolean;
  images: StudioImage[];
  twoUp: boolean;
  guides: boolean;
  caption: boolean;
}) => (
  <div class={sheetCls}>
    <Show when={p.showTitle}>
      <h1 class="mb-4 pb-2 text-lg font-semibold">{p.title}</h1>
    </Show>
    <div
      class="grid gap-4"
      style={{ "grid-template-columns": p.twoUp ? "1fr 1fr" : "1fr" }}
    >
      <For each={p.images}>
        {(img) => (
          <figure
            class="p-1"
            classList={{ "border border-dashed border-gray-500": p.guides }}
            style={{ "break-inside": "avoid" }}
          >
            <img src={img.src} alt={img.label} class="h-auto w-full" />
            <Show when={p.caption}>
              <figcaption class="mt-1 text-center text-[11px] text-gray-700">{img.label}</figcaption>
            </Show>
          </figure>
        )}
      </For>
    </div>
  </div>
);

export const PhotoSheet = (p: { src: string; size: PhotoSize; count: number; gap: boolean }) => {
  // px at 96dpi ≈ mm * 3.7795
  const wpx = Math.round(p.size.w * 3.7795);
  const hpx = Math.round(p.size.h * 3.7795);
  return (
    <div class={sheetCls}>
      <div class="flex flex-wrap" style={{ gap: p.gap ? "4mm" : "1mm" }}>
        <For each={Array.from({ length: p.count })}>
          {() => (
            <img
              src={p.src}
              alt={`Photo ${p.size.label}`}
              width={wpx}
              height={hpx}
              style={{
                width: `${p.size.w}mm`,
                height: `${p.size.h}mm`,
                "object-fit": "cover",
                border: "1px solid #ccc",
              }}
            />
          )}
        </For>
      </div>
    </div>
  );
};

export const BoardSheet = (p: {
  title: string;
  showTitle: boolean;
  images: StudioImage[];
  cols: number;
  captions: boolean;
}) => (
  <div class={sheetCls}>
    <Show when={p.showTitle}>
      <h1 class="mb-4 pb-2 text-lg font-semibold">{p.title}</h1>
    </Show>
    <div class="grid gap-3" style={{ "grid-template-columns": `repeat(${p.cols}, 1fr)` }}>
      <For each={p.images}>
        {(img) => (
          <figure class="border border-gray-200 p-1" style={{ "break-inside": "avoid" }}>
            <img src={img.src} alt={img.label} class="h-auto w-full" />
            <Show when={p.captions}>
              <figcaption class="mt-1 text-center text-[11px] text-gray-700">{img.label}</figcaption>
            </Show>
          </figure>
        )}
      </For>
    </div>
  </div>
);
