import { For, Show } from "solid-js";
import { ImagePlus, Printer, Trash2 } from "lucide-solid";
import { useApp, useAttest } from "~/store/context";
import { stageFilesForCrop } from "~/lib/upload";
import { Thumb } from "~/components/Thumb";
import { StudioLayout } from "~/components/StudioLayout";
import { AttestationSheet } from "~/components/sheets";

export const AttestStudio = () => {
  const app = useApp();
  const attest = useAttest();
  let fileRef: HTMLInputElement | undefined;

  return (
    <StudioLayout
      title="Self-attest studio"
      desc="Upload scans, crop/redact as needed, then print a watermarked A4 sheet."
      top={
        <>
          <h2 class="mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">
            1 · Scans · {attest.images().length}
          </h2>
          <div class="flex gap-1.5">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              aria-label="Add scans"
              onChange={(e) => {
                const files = Array.from(e.currentTarget.files ?? []);
                e.currentTarget.value = "";
                void stageFilesForCrop(app, files, "attest", null, "Crop scan");
              }}
            />
            <button type="button" class="chip" onClick={() => fileRef?.click()}>
              <ImagePlus class="icon" /> Add image(s)
            </button>
            <Show when={attest.images().length > 0}>
              <button type="button" class="chip border-error/40 text-error" onClick={() => attest.clear()}>
                <Trash2 class="icon icon--error" /> Clear all
              </button>
            </Show>
          </div>
          <Show when={attest.images().length > 0}>
            <div class="mt-3 grid max-h-44 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
              <For each={attest.images()}>
                {(img) => (
                  <Thumb
                    src={img.src}
                    label={img.label}
                    onRedact={() => {
                      app.setRedactJob({ src: img.src, target: "attest", index: 0, imageId: img.id });
                      app.openModal("redact");
                    }}
                    onRemove={() => attest.remove(img.id)}
                  />
                )}
              </For>
            </div>
          </Show>
        </>
      }
      preview={
        <Show
          when={attest.images().length > 0}
          fallback={<p class="text-sm text-fg-dim">Add at least one scan to preview the sheet.</p>}
        >
          <div style={{ zoom: 0.5 }}>
            <AttestationSheet images={attest.images()} watermark={attest.watermark()} watermarkText={attest.watermarkText()} />
          </div>
        </Show>
      }
      actions={
        <Show when={attest.images().length > 0}>
          <button
            type="button"
            class="chip border-accent/40 text-accent"
            onClick={() => { attest.setFrom("standalone"); app.go("attestation"); }}
          >
            <Printer class="icon icon--accent" /> Open printable sheet
          </button>
        </Show>
      }
    />
  );
};

/** Full-size sheet step with Back + Print pinned below the preview. */
export const AttestationView = () => {
  const app = useApp();
  const attest = useAttest();
  return (
    <StudioLayout
      title="Attestation sheet"
      preview={
        <Show
          when={attest.images().length > 0}
          fallback={
            <div class="p-6 text-center">
              <p class="text-sm text-fg-muted">Nothing to attest yet.</p>
              <button type="button" class="chip mt-3" onClick={() => app.go("attest")}>
                Back to studio
              </button>
            </div>
          }
        >
          <div style={{ zoom: 0.62 }}>
            <AttestationSheet images={attest.images()} watermark={attest.watermark()} watermarkText={attest.watermarkText()} />
          </div>
        </Show>
      }
      actions={
        <>
          <button
            type="button"
            class="chip"
            onClick={() => app.go(attest.from() === "beneficiary" ? "beneficiary-detail" : "attest")}
          >
            Back <kbd>esc</kbd>
          </button>
          <button
            type="button"
            class="chip border-accent/40 text-accent"
            onClick={() => window.print()}
          >
            <Printer class="icon icon--accent" /> Print PDF <kbd>Ctrl+P</kbd>
          </button>
        </>
      }
    />
  );
};
