import { Match, Show, Switch } from "solid-js";
import { Printer, X } from "lucide-solid";
import { useApp, useAttest, useBeneficiaries, useBoard, useIdPrint, usePhoto } from "~/store/context";
import { IconButton } from "./IconButton";

const Toggle = (p: { label: string; value: boolean; onFlip: () => void }) => (
  <label class="flex cursor-pointer items-center gap-2 rounded border border-edge-subtle px-2 py-1.5 text-sm text-fg-muted hover:border-edge">
    <input
      type="checkbox"
      checked={p.value}
      onChange={p.onFlip}
      class="h-3.5 w-3.5 accent-[var(--color-accent)]"
    />
    {p.label}
  </label>
);

const PrintBtn = (p: { disabled?: boolean }) => (
  <button
    type="button"
    class="chip w-full justify-center border-accent/40 py-1.5 text-accent"
    disabled={p.disabled}
    onClick={() => window.print()}
  >
    <Printer class="icon icon--accent" /> Print A4 <kbd>Ctrl+P</kbd>
  </button>
);

/**
 * Right dock: print settings + sheet summary for the active view.
 * Collapses behind a toggle below 900px (see App shell).
 */
export const DockPreview = () => {
  const app = useApp();
  const ben = useBeneficiaries();
  const attest = useAttest();
  const idp = useIdPrint();
  const photo = usePhoto();
  const board = useBoard();

  const b = () => ben.byId(app.activeBeneficiaryId());

  return (
    <aside
      aria-label="Print preview and settings"
      class="w-80 shrink-0 flex-col border-l border-edge bg-sidebar"
      classList={{ flex: app.dockOpen(), hidden: !app.dockOpen() }}
    >
      <div class="flex items-center gap-2 border-b border-edge-subtle px-3 py-2">
        <p class="font-mono text-[10px] uppercase tracking-[0.05em] text-fg-dim">Print settings</p>
        <span class="ml-auto md:hidden">
          <IconButton label="Close preview" onClick={() => app.setDockOpen(false)}>
            <X class="icon" />
          </IconButton>
        </span>
      </div>

      <div class="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        <Switch fallback={
          <p class="text-sm text-fg-dim">Pick a studio — print settings appear here.</p>
        }>
          <Match when={app.view() === "beneficiary-detail" && b()}>
            <p class="font-mono text-[11px] uppercase text-fg">{b()!.name}</p>
            <p class="font-mono text-[11px] text-fg-dim">
              {b()!.images.length} scans · dossier + images on A4
            </p>
            <PrintBtn />
          </Match>

          <Match when={app.view() === "attest" || app.view() === "attestation"}>
            <Toggle label="Self-Attested watermark" value={attest.watermark()} onFlip={() => attest.setWatermark(!attest.watermark())} />
            <p class="font-mono text-[11px] text-fg-dim">{attest.images().length} scans on A4</p>
            <PrintBtn disabled={attest.images().length === 0} />
            <Show when={app.view() === "attest" && attest.images().length > 0}>
              <button
                type="button"
                class="chip w-full justify-center"
                onClick={() => { attest.setFrom("standalone"); app.go("attestation"); }}
              >
                Open full sheet ›
              </button>
            </Show>
          </Match>

          <Match when={app.view() === "idprint"}>
            <Toggle label="Sheet title" value={idp.showTitle()} onFlip={() => idp.setShowTitle(!idp.showTitle())} />
            <Toggle label="Two per row" value={idp.twoUp()} onFlip={() => idp.setTwoUp(!idp.twoUp())} />
            <Toggle label="Cut guides" value={idp.guides()} onFlip={() => idp.setGuides(!idp.guides())} />
            <Toggle label="Captions" value={idp.caption()} onFlip={() => idp.setCaption(!idp.caption())} />
            <p class="font-mono text-[11px] text-fg-dim">{idp.images().length} cards on A4</p>
            <PrintBtn disabled={idp.images().length === 0} />
          </Match>

          <Match when={app.view() === "photogrid"}>
            <Toggle label="Gaps between photos" value={photo.gap()} onFlip={() => photo.setGap(!photo.gap())} />
            <p class="font-mono text-[11px] text-fg-dim">
              {photo.src() ? `×${photo.count()} ${photo.size().label}` : "no photo yet"}
            </p>
            <PrintBtn disabled={!photo.src()} />
          </Match>

          <Match when={app.view() === "board"}>
            <Toggle label="Sheet title" value={board.showTitle()} onFlip={() => board.setShowTitle(!board.showTitle())} />
            <Toggle label="Captions" value={board.captions()} onFlip={() => board.setCaptions(!board.captions())} />
            <p class="font-mono text-[11px] text-fg-dim">
              {board.images().length} images · {board.cols()} col
            </p>
            <PrintBtn disabled={board.images().length === 0} />
          </Match>

          <Match when={app.view() === "beneficiary-new"}>
            <p class="text-sm text-fg-muted">
              {ben.stageImages().length} scan{ben.stageImages().length === 1 ? "" : "s"} staged.
            </p>
            <p class="font-mono text-[11px] text-fg-dim">
              Save the dossier to unlock its A4 sheet.
            </p>
          </Match>

          <Match when={app.view() === "beneficiaries"}>
            <p class="text-sm text-fg-muted">{ben.list().length} dossiers stored locally.</p>
            <button type="button" class="chip w-full justify-center" onClick={() => { app.setEditingId(null); app.go("beneficiary-new"); }}>
              New dossier ›
            </button>
          </Match>

          <Match when={app.view() === "welcome"}>
            <p class="text-sm text-fg-muted">
              Paper: A4 · margins 10mm. Every sheet prints from the same data you see — no
              separate export step.
            </p>
          </Match>
        </Switch>
      </div>

      <div class="border-t border-edge px-3 py-2 font-mono text-[10px] uppercase tracking-[0.05em] text-fg-dim">
        A4 · 10mm margins
      </div>
    </aside>
  );
};
