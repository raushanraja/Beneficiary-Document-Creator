import { For, Show } from "solid-js";
import { ImagePlus, Printer, Trash2 } from "lucide-solid";
import { useApp, useIdPrint } from "~/store/context";
import { stageFilesForCrop } from "~/lib/upload";
import { Thumb } from "~/components/Thumb";
import { StudioLayout } from "~/components/StudioLayout";
import { IdSheet } from "~/components/sheets";

export const IdPrintStudio = () => {
  const app = useApp();
  const idp = useIdPrint();
  let fileRef: HTMLInputElement | undefined;

  return (
    <StudioLayout
      title="ID print studio"
      desc="Add card scans (front/back), order them, and print side-by-side on A4 with cut guides."
      top={
        <>
          <h2 class="mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">
            1 · Cards · {idp.images().length}
          </h2>
          <div class="flex gap-1.5">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              aria-label="Add card scans"
              onChange={(e) => {
                const files = Array.from(e.currentTarget.files ?? []);
                e.currentTarget.value = "";
                void stageFilesForCrop(app, files, "idprint", 1.586, "Crop card");
              }}
            />
            <button type="button" class="chip" onClick={() => fileRef?.click()}>
              <ImagePlus class="icon" /> Add card(s)
            </button>
            <Show when={idp.images().length > 0}>
              <button type="button" class="chip border-error/40 text-error" onClick={() => idp.clear()}>
                <Trash2 class="icon icon--error" /> Clear
              </button>
            </Show>
          </div>
          <Show
            when={idp.images().length > 0}
            fallback={
              <p class="mt-2 text-sm text-fg-dim">
                Tip: crop uses the credit-card ratio (1.586:1) so fronts and backs line up.
              </p>
            }
          >
            <div class="mt-3 grid max-h-52 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
              <For each={idp.images()}>
                {(img) => (
                  <div>
                    <Thumb
                      src={img.src}
                      label={img.label}
                      onLeft={() => idp.move(img.id, -1)}
                      onRight={() => idp.move(img.id, 1)}
                      onRedact={() => {
                        app.setRedactJob({ src: img.src, target: "idprint", index: 0, imageId: img.id });
                        app.openModal("redact");
                      }}
                      onRemove={() => idp.remove(img.id)}
                    />
                    <input
                      type="text"
                      value={img.label}
                      aria-label="Card caption"
                      onInput={(e) => idp.rename(img.id, e.currentTarget.value)}
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
        <div>
          <label for="idp-title" class="mb-1 block font-mono text-[11px] uppercase tracking-[0.05em] text-fg-muted">
            Sheet title
          </label>
          <input
            id="idp-title"
            type="text"
            value={idp.title()}
            onInput={(e) => idp.setTitle(e.currentTarget.value)}
            class="w-full max-w-sm rounded-chip border border-edge-subtle bg-input px-2.5 py-1.5 text-[15px] text-fg outline-none focus:border-edge-focus"
          />
        </div>
      }
      preview={
        <Show
          when={idp.images().length > 0}
          fallback={<p class="text-sm text-fg-dim">Add cards to preview the A4 sheet.</p>}
        >
          <div style={{ zoom: 0.5 }}>
            <IdSheet
              title={idp.title()}
              showTitle={idp.showTitle()}
              images={idp.images()}
              twoUp={idp.twoUp()}
              guides={idp.guides()}
              caption={idp.caption()}
            />
          </div>
        </Show>
      }
      actions={
        <Show when={idp.images().length > 0}>
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
