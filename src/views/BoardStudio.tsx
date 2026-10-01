import { For, Show } from "solid-js";
import { ImagePlus, Printer, Trash2 } from "lucide-solid";
import { useApp, useBoard } from "~/store/context";
import { stageFilesForCrop } from "~/lib/upload";
import { Thumb } from "~/components/Thumb";
import { StudioLayout } from "~/components/StudioLayout";
import { BoardSheet } from "~/components/sheets";

export const BoardStudio = () => {
  const app = useApp();
  const board = useBoard();
  let fileRef: HTMLInputElement | undefined;

  return (
    <StudioLayout
      title="Image board studio"
      desc="Any scans or photos in an adjustable grid — receipts, certificates, mixed evidence — on one A4."
      top={
        <>
          <h2 class="mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">
            1 · Images · {board.images().length}
          </h2>
          <div class="flex gap-1.5">
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
          <Show when={board.images().length > 0}>
            <div class="mt-3 grid max-h-44 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
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
          </Show>
        </>
      }
      options={
        <div class="flex flex-wrap items-center gap-3">
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
          <label class="flex items-center gap-1.5 text-sm text-fg-muted">
            <span class="font-mono text-[11px] uppercase">Gap (mm)</span>
            <input
              type="number"
              min={0}
              max={20}
              step={0.5}
              value={board.gapMm()}
              onInput={(e) => board.setGap(Number(e.currentTarget.value) || 0)}
              class="w-16 rounded-chip border border-edge-subtle bg-input px-2 py-1 text-sm text-fg outline-none focus:border-edge-focus"
            />
          </label>
        </div>
      }
      preview={
        <Show
          when={board.images().length > 0}
          fallback={<p class="text-sm text-fg-dim">Add images to preview the A4 sheet.</p>}
        >
          <div class="sheet-zoom">
            <BoardSheet
              title={board.title()}
              showTitle={board.showTitle()}
              images={board.images()}
              cols={board.cols()}
              gapMm={board.gapMm()}
              captions={board.captions()}
            />
          </div>
        </Show>
      }
      actions={
        <Show when={board.images().length > 0}>
          <button
            type="button"
            class="chip border-accent/40 text-accent"
            onClick={() => window.print()}
          >
            <Printer class="icon icon--accent" /> Print A4 <kbd>Ctrl+P</kbd>
          </button>
        </Show>
      }
    />
  );
};
