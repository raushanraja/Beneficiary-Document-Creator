import { For, Show } from "solid-js";
import { ImagePlus, Printer, Trash2 } from "lucide-solid";
import { useApp, useAttest } from "~/store/context";
import { stageFilesForCrop } from "~/lib/upload";
import { Thumb } from "~/components/Thumb";
import { AttestationSheet } from "~/components/sheets";

export const AttestStudio = () => {
  const app = useApp();
  const attest = useAttest();
  let fileRef: HTMLInputElement | undefined;

  return (
    <div class="mx-auto max-w-4xl px-4 py-6">
      <h1 class="mb-1 font-mono text-xs uppercase tracking-[0.05em] text-fg">
        Self-attest studio
      </h1>
      <p class="mb-4 text-sm text-fg-muted">
        Upload scans, crop/redact as needed, then print a watermarked A4 sheet.
      </p>

      <section class="mb-3 rounded-card border border-edge bg-card p-3">
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
          <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
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
      </section>

      <section class="mb-3 rounded-card border border-edge bg-card p-3">
        <h2 class="mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">2 · Sheet</h2>
        <Show when={attest.images().length > 0} fallback={
          <p class="text-sm text-fg-dim">Add at least one scan to preview the sheet.</p>
        }>
          <div class="overflow-x-auto rounded border border-edge-subtle bg-deep p-2">
            <div style={{ zoom: 0.5 }}>
              <AttestationSheet images={attest.images()} watermark={attest.watermark()} />
            </div>
          </div>
          <button
            type="button"
            class="chip mt-3 border-accent/40 text-accent"
            onClick={() => { attest.setFrom("standalone"); app.go("attestation"); }}
          >
            <Printer class="icon icon--accent" /> Open printable sheet
          </button>
        </Show>
      </section>
    </div>
  );
};

/** Full-size sheet step with Back + Print. */
export const AttestationView = () => {
  const app = useApp();
  const attest = useAttest();
  return (
    <div class="mx-auto max-w-4xl px-4 py-6">
      <div class="mb-4 flex items-center gap-1.5">
        <h1 class="font-mono text-xs uppercase tracking-[0.05em] text-fg">Attestation sheet</h1>
        <div class="ml-auto flex gap-1.5">
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
        </div>
      </div>
      <Show when={attest.images().length > 0} fallback={
        <div class="rounded-card border border-edge bg-card p-6 text-center">
          <p class="text-sm text-fg-muted">Nothing to attest yet.</p>
          <button type="button" class="chip mt-3" onClick={() => app.go("attest")}>
            Back to studio
          </button>
        </div>
      }>
        <div class="overflow-x-auto rounded border border-edge bg-deep p-2">
          <div style={{ zoom: 0.62 }}>
            <AttestationSheet images={attest.images()} watermark={attest.watermark()} />
          </div>
        </div>
      </Show>
    </div>
  );
};
