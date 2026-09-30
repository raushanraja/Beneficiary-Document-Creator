import { For, Show } from "solid-js";
import { Pencil, Plus, Printer, Trash2 } from "lucide-solid";
import { useApp, useAttest, useBeneficiaries } from "~/store/context";

export const BeneficiariesView = () => {
  const app = useApp();
  const ben = useBeneficiaries();
  const attest = useAttest();

  return (
    <div class="mx-auto max-w-4xl px-4 py-6">
      <div class="mb-4 flex items-center gap-2">
        <h1 class="font-mono text-xs uppercase tracking-[0.05em] text-fg">
          Beneficiaries · {ben.list().length}
        </h1>
        <button
          type="button"
          class="chip ml-auto border-accent/40 text-accent"
          onClick={() => { app.setEditingId(null); app.go("beneficiary-new"); }}
        >
          <Plus class="icon icon--accent" /> New <kbd>Ctrl+N</kbd>
        </button>
      </div>
      <Show
        when={ben.list().length > 0}
        fallback={
          <div class="rounded-card border border-edge bg-card p-6 text-center">
            <p class="font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">Empty</p>
            <p class="mt-1 text-sm text-fg-muted">No beneficiary files yet.</p>
            <button
              type="button"
              class="chip mt-3 border-accent/40 text-accent"
              onClick={() => { app.setEditingId(null); app.go("beneficiary-new"); }}
            >
              <Plus class="icon icon--accent" /> Create the first one
            </button>
          </div>
        }
      >
        <ul class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <For each={ben.list()}>
            {(b) => (
              <li class="rounded-card border border-edge bg-card p-3">
                <button
                  type="button"
                  class="block w-full truncate text-left text-[15px] text-fg-strong hover:text-accent"
                  onClick={() => { app.setActiveBeneficiaryId(b.id); app.go("beneficiary-detail"); }}
                >
                  {b.name}
                </button>
                <p class="mt-0.5 truncate font-mono text-[11px] text-fg-dim">
                  {b.proofType} · {b.bankName} · {b.images.length} scan{b.images.length === 1 ? "" : "s"}
                </p>
                <div class="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    class="chip"
                    aria-label={`Open ${b.name}`}
                    onClick={() => { app.setActiveBeneficiaryId(b.id); app.go("beneficiary-detail"); }}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    class="chip"
                    aria-label={`Edit ${b.name}`}
                    onClick={() => { app.setEditingId(b.id); app.go("beneficiary-new"); }}
                  >
                    <Pencil class="icon" /> Edit
                  </button>
                  <button
                    type="button"
                    class="chip"
                    aria-label={`Attest ${b.name}`}
                    onClick={() => {
                      attest.seed(b.images, "beneficiary");
                      app.setActiveBeneficiaryId(b.id);
                      app.go("attestation");
                    }}
                  >
                    <Printer class="icon" /> Attest
                  </button>
                  <button
                    type="button"
                    class="chip border-error/40 text-error"
                    aria-label={`Delete ${b.name}`}
                    onClick={() => {
                      app.setConfirm({
                        title: "Delete beneficiary",
                        detail: `Delete ${b.name}? This cannot be undone.`,
                        run: () => {
                          ben.remove(b.id);
                          app.toast("Beneficiary deleted", "info");
                        },
                      });
                      app.openModal("confirm-delete");
                    }}
                  >
                    <Trash2 class="icon icon--error" />
                  </button>
                </div>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
};
