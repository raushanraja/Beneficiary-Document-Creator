import { For, Show } from "solid-js";
import { ImagePlus, Printer, Trash2 } from "lucide-solid";
import { useApp, useBoard } from "~/store/context";
import { stageFilesForCrop } from "~/lib/upload";
import { Thumb } from "~/components/Thumb";
import { BoardSheet } from "~/components/sheets";

export const BoardStudio = () => {
  const app = useApp();
  const board = useBoard();
  let fileRef: HTMLInputElement | undefined;

  return (
    <div class="mx-auto max-w-4xl px-4 py-6">
      <h1 class="mb-1 font-mono text-xs uppercase tracking-[0.05em] text-fg">Image board studio</h1>
      <p class="mb-4 text-sm text-fg-muted">
        Any scans or photos in an adjustable grid — receipts, certificates, mixed evidence — on one A4.
      </p>

      <section class="mb-3 rounded-card border border-edge bg-card p-3">
        <h2 class="mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">
          1 · Images · {board.images().length}
        </h2>
        <div class="mb-3 flex gap-1.5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            aria-label="Add board images"
            onChange={(e) => {
              const files = Array.from(e.currentTarget.files ?? []);
              e.currentTarget.value = "";
              void stageFilesForCrop(app, files, "board", null, "Crop image");
            }}
          />
          <button type="button" class="chip" onClick={() => fileRef?.click()}>
            <ImagePlus class="icon" /> Add image(s)
          </button>
          <Show when={board.images().length > 0}>
            <button type="button" class="chip border-error/40 text-error" onClick={() => board.clear()}>
              <Trash2 class="icon icon--error" /> Clear
            </button>
          </Show>
        </div>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <For each={board.images()}>
            {(img) => (
              <div>
                <Thumb
                  src={img.src}
                  label={img.label}
                  onLeft={() => board.move(img.id, -1)}
                  onRight={() => board.move(img.id, 1)}
                  onRedact={() => {
                    app.setRedactJob({ src: img.src, target: "board", index: 0, imageId: img.id });
                    app.openModal("redact");
                  }}
                  onRemove={() => board.remove(img.id)}
                />
                <input
                  type="text"
                  value={img.label}
                  aria-label="Image caption"
                  onInput={(e) => board.rename(img.id, e.currentTarget.value)}
                  class="mt-1 w-full rounded border border-edge-subtle bg-input px-1.5 py-0.5 text-xs text-fg outline-none focus:border-edge-focus"
                />
              </div>
            )}
          </For>
        </div>
      </section>

      <section class="rounded-card border border-edge bg-card p-3">
        <h2 class="mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">2 · Sheet</h2>
        <div class="mb-3 flex flex-wrap items-center gap-3">
          <label class="flex items-center gap-1.5 text-sm text-fg-muted">
            <span class="font-mono text-[11px] uppercase">Title</span>
            <input
              type="text"
              value={board.title()}
              onInput={(e) => board.setTitle(e.currentTarget.value)}
              class="w-48 rounded-chip border border-edge-subtle bg-input px-2 py-1 text-sm text-fg outline-none focus:border-edge-focus"
            />
          </label>
          <label class="flex items-center gap-1.5 text-sm text-fg-muted">
            <span class="font-mono text-[11px] uppercase">Columns</span>
            <input
              type="number"
              min={1}
              max={4}
              value={board.cols()}
              onInput={(e) => board.setCols(Math.max(1, Math.min(4, Number(e.currentTarget.value) || 2)))}
              class="w-14 rounded-chip border border-edge-subtle bg-input px-2 py-1 text-sm text-fg outline-none focus:border-edge-focus"
            />
          </label>
        </div>
        <Show when={board.images().length > 0} fallback={
          <p class="text-sm text-fg-dim">Add images to preview the A4 sheet.</p>
        }>
          <div class="overflow-x-auto rounded border border-edge-subtle bg-deep p-2">
            <div style={{ zoom: 0.5 }}>
              <BoardSheet
                title={board.title()}
                images={board.images()}
                cols={board.cols()}
                captions={board.captions()}
              />
            </div>
          </div>
          <button
            type="button"
            class="chip mt-3 border-accent/40 text-accent"
            onClick={() => window.print()}
          >
            <Printer class="icon icon--accent" /> Print A4 <kbd>Ctrl+P</kbd>
          </button>
        </Show>
      </section>
    </div>
  );
};
