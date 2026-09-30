import { For, Match, Show, Switch } from "solid-js";
import { Trash2, X } from "lucide-solid";
import { useApp, useBeneficiaries, useTheme } from "~/store/context";
import { THEMES } from "~/themes";
import { storageFootprint } from "~/lib/images";
import { CropModal } from "./CropModal";
import { RedactModal } from "./RedactModal";

/** One host, driven by state. Focus lands on the dialog; Esc closes. */
export const ModalHost = () => {
  const app = useApp();

  return (
    <Show when={app.modal() !== null}>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) app.closeModal();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Dialog"
          class="max-h-[88vh] w-[min(760px,94vw)] overflow-y-auto rounded-card border border-edge bg-elevated p-4"
        >
          <Switch fallback={null}>
            <Match when={app.modal() === "crop" && app.cropJob()}>
              <CropModal />
            </Match>
            <Match when={app.modal() === "redact" && app.redactJob()}>
              <RedactModal />
            </Match>
            <Match when={app.modal() === "shortcuts"}>
              <ShortcutsModal />
            </Match>
            <Match when={app.modal() === "settings"}>
              <SettingsModal />
            </Match>
            <Match when={app.modal() === "confirm-delete" && app.confirm()}>
              <ConfirmModal />
            </Match>
          </Switch>
        </div>
      </div>
    </Show>
  );
};

const BINDINGS: [string, string][] = [
  ["Ctrl+B", "Toggle sidebar"],
  ["Ctrl+Shift+F", "Toggle preview dock"],
  ["Ctrl+N", "New beneficiary file"],
  ["Ctrl+P", "Print current sheet"],
  ["Alt+1…5", "Switch studio"],
  ["/", "Focus beneficiary filter"],
  ["?", "This shortcut list"],
  ["Esc", "Close dialog · back one level"],
];

const ShortcutsModal = () => {
  const app = useApp();
  return (
    <div>
      <h2 class="mb-3 font-mono text-xs uppercase tracking-[0.05em] text-fg">Keyboard shortcuts</h2>
      <table class="w-full text-sm">
        <tbody>
          <For each={BINDINGS}>
            {([keys, what]) => (
              <tr class="border-t border-edge-subtle">
                <td class="py-1.5 pr-3"><kbd>{keys}</kbd></td>
                <td class="py-1.5 text-fg-muted">{what}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <div class="mt-3 flex justify-end">
        <button type="button" class="chip" onClick={() => app.closeModal()}>
          <X class="icon" /> Close <kbd>esc</kbd>
        </button>
      </div>
    </div>
  );
};

const SettingsModal = () => {
  const app = useApp();
  const theme = useTheme();
  const ben = useBeneficiaries();
  const kb = () =>
    storageFootprint([ben.storageKey, "printstudio.idprint.v1", "printstudio.board.v1"]);

  return (
    <div>
      <h2 class="mb-3 font-mono text-xs uppercase tracking-[0.05em] text-fg">Settings</h2>
      <h3 class="mb-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">Theme</h3>
      <div class="mb-4 flex flex-wrap gap-1.5">
        <For each={THEMES}>
          {(t) => (
            <button
              type="button"
              class="chip"
              classList={{ "border-edge-focus text-fg": theme.name() === t.id }}
              onClick={() => { theme.setName(t.id); theme.setMode(t.mode); }}
            >
              <span
                aria-hidden="true"
                class="size-2.5 rounded-full border border-edge"
                style={{
                  "background-color": t.swatch[0],
                  "box-shadow": `inset 0 0 0 2px ${t.swatch[1]}`,
                }}
              />
              {t.label}
            </button>
          )}
        </For>
      </div>
      <h3 class="mb-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">Storage</h3>
      <p class="mb-4 text-sm text-fg-muted">
        Local footprint ≈ <strong class="text-fg">{kb()} KB</strong>. Everything stays in this
        browser — there is no account and no cloud.
      </p>
      <h3 class="mb-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-error">Danger zone</h3>
      <button
        type="button"
        class="chip border-error/40 text-error"
        onClick={() => {
          app.setConfirm({
            title: "Erase all local data",
            detail: "Delete every beneficiary, scan and board? This cannot be undone.",
            run: () => {
              for (const k of Object.keys(localStorage)) {
                if (k.startsWith("printstudio.")) localStorage.removeItem(k);
              }
              window.location.reload();
            },
          });
          app.openModal("confirm-delete");
        }}
      >
        <Trash2 class="icon icon--error" /> Erase everything
      </button>
      <div class="mt-4 flex justify-end">
        <button type="button" class="chip" onClick={() => app.closeModal()}>
          <X class="icon" /> Close <kbd>esc</kbd>
        </button>
      </div>
    </div>
  );
};

const ConfirmModal = () => {
  const app = useApp();
  const c = () => app.confirm()!;
  return (
    <div>
      <h2 class="mb-1 font-mono text-xs uppercase tracking-[0.05em] text-fg">{c().title}</h2>
      <p class="mb-4 text-sm text-fg-muted">{c().detail}</p>
      <div class="flex justify-end gap-1.5">
        <button type="button" class="chip" onClick={() => app.closeModal()}>
          <X class="icon" /> Cancel <kbd>esc</kbd>
        </button>
        <button
          type="button"
          class="chip border-error/40 text-error"
          onClick={() => { c().run(); app.closeModal(); }}
        >
          <Trash2 class="icon icon--error" /> Confirm
        </button>
      </div>
    </div>
  );
};
