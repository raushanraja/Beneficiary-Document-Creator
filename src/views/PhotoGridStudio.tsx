import { For, Show } from "solid-js";
import { ImagePlus, Printer, Trash2 } from "lucide-solid";
import { useApp, usePhoto } from "~/store/context";
import { stageFilesForCrop } from "~/lib/upload";
import { PhotoSheet } from "~/components/sheets";

export const PhotoGridStudio = () => {
  const app = useApp();
  const photo = usePhoto();
  let fileRef: HTMLInputElement | undefined;

  return (
    <div class="mx-auto max-w-4xl px-4 py-6">
      <h1 class="mb-1 font-mono text-xs uppercase tracking-[0.05em] text-fg">Photo grid studio</h1>
      <p class="mb-4 text-sm text-fg-muted">
        One portrait, tiled N-up at exact mm sizes for cutting.
      </p>

      <section class="mb-3 rounded-card border border-edge bg-card p-3">
        <h2 class="mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">1 · Portrait</h2>
        <div class="flex flex-wrap items-center gap-1.5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            class="hidden"
            aria-label="Add portrait photo"
            onChange={(e) => {
              const files = Array.from(e.currentTarget.files ?? []);
              e.currentTarget.value = "";
              void stageFilesForCrop(app, files.slice(0, 1), "photogrid", null, "Crop portrait");
            }}
          />
          <button type="button" class="chip" onClick={() => fileRef?.click()}>
            <ImagePlus class="icon" /> {photo.src() ? "Replace photo" : "Add photo"}
          </button>
          <Show when={photo.src()}>
            <button type="button" class="chip border-error/40 text-error" onClick={() => photo.clear()}>
              <Trash2 class="icon icon--error" /> Remove
            </button>
            <img src={photo.src()!} alt="Portrait preview" class="h-16 w-16 rounded border border-edge object-cover" />
          </Show>
        </div>
      </section>

      <section class="mb-3 rounded-card border border-edge bg-card p-3">
        <h2 class="mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">2 · Layout</h2>
        <div class="flex flex-wrap items-center gap-3">
          <label class="flex items-center gap-1.5 text-sm text-fg-muted">
            <span class="font-mono text-[11px] uppercase">Size</span>
            <select
              value={photo.sizeId()}
              onChange={(e) => photo.setSizeId(e.currentTarget.value)}
              class="rounded-chip border border-edge-subtle bg-input px-2 py-1 text-sm text-fg outline-none focus:border-edge-focus"
            >
              <For each={photo.sizes}>{(s) => <option value={s.id}>{s.label}</option>}</For>
            </select>
          </label>
          <label class="flex items-center gap-1.5 text-sm text-fg-muted">
            <span class="font-mono text-[11px] uppercase">Copies</span>
            <input
              type="number"
              min={1}
              max={40}
              value={photo.count()}
              onInput={(e) => photo.setCount(Math.max(1, Math.min(40, Number(e.currentTarget.value) || 1)))}
              class="w-16 rounded-chip border border-edge-subtle bg-input px-2 py-1 text-sm text-fg outline-none focus:border-edge-focus"
            />
          </label>
        </div>
      </section>

      <section class="rounded-card border border-edge bg-card p-3">
        <h2 class="mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">3 · Sheet</h2>
        <Show when={photo.src()} fallback={
          <p class="text-sm text-fg-dim">Add a portrait to preview the A4 sheet.</p>
        }>
          {(src) => (
            <>
              <div class="overflow-x-auto rounded border border-edge-subtle bg-deep p-2">
                <div style={{ zoom: 0.5 }}>
                  <PhotoSheet src={src()} size={photo.size()} count={photo.count()} gap={photo.gap()} />
                </div>
              </div>
              <button
                type="button"
                class="chip mt-3 border-accent/40 text-accent"
                onClick={() => window.print()}
              >
                <Printer class="icon icon--accent" /> Print A4 <kbd>Ctrl+P</kbd>
              </button>
            </>
          )}
        </Show>
      </section>
    </div>
  );
};
