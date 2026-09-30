import { For, Show } from "solid-js";
import { Pencil, Printer } from "lucide-solid";
import { useApp, useAttest, useBeneficiaries } from "~/store/context";

/** Read-only dossier. The print sheet for this view is rendered by PrintRoot. */
export const BeneficiaryDetail = () => {
  const app = useApp();
  const ben = useBeneficiaries();
  const attest = useAttest();
  const b = () => ben.byId(app.activeBeneficiaryId());

  return (
    <Show
      when={b()}
      fallback={
        <div class="mx-auto max-w-4xl px-4 py-8">
          <div class="rounded-card border border-edge bg-card p-6 text-center">
            <p class="font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">Gone</p>
            <p class="mt-1 text-sm text-fg-muted">This dossier no longer exists.</p>
            <button type="button" class="chip mt-3" onClick={() => app.go("beneficiaries")}>
              Back to list
            </button>
          </div>
        </div>
      }
    >
      {(rec) => (
        <div class="mx-auto max-w-4xl px-4 py-6">
          <div class="mb-4 flex flex-wrap items-center gap-1.5">
            <h1 class="font-mono text-xs uppercase tracking-[0.05em] text-fg">
              {rec().name}
            </h1>
            <div class="ml-auto flex gap-1.5">
              <button
                type="button"
                class="chip"
                onClick={() => { app.setEditingId(rec().id); app.go("beneficiary-new"); }}
              >
                <Pencil class="icon" /> Edit
              </button>
              <button
                type="button"
                class="chip"
                onClick={() => {
                  attest.seed(rec().images, "beneficiary");
                  app.go("attestation");
                }}
              >
                <Printer class="icon" /> Self-attest PDF
              </button>
              <button
                type="button"
                class="chip border-accent/40 text-accent"
                onClick={() => window.print()}
              >
                <Printer class="icon icon--accent" /> Print <kbd>Ctrl+P</kbd>
              </button>
            </div>
          </div>

          <section class="mb-3 rounded-card border border-edge bg-card p-3">
            <h2 class="mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">
              Personal information
            </h2>
            <dl class="grid grid-cols-1 gap-2 text-[15px] md:grid-cols-2">
              <Field k="Name" v={rec().name} />
              <Field k="Proof of ID" v={rec().proofType} />
              <div class="md:col-span-2"><Field k="ID number" v={rec().idNumber} mono /></div>
            </dl>
          </section>

          <section class="mb-3 rounded-card border border-edge bg-card p-3">
            <h2 class="mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">
              Bank details
            </h2>
            <dl class="grid grid-cols-1 gap-2 text-[15px] md:grid-cols-2">
              <Field k="Bank" v={rec().bankName} />
              <Field k="IFSC" v={rec().branchCode} mono />
              <Field k="Account" v={rec().accountNo} mono />
              <Field k="Type" v={rec().accountType} />
            </dl>
          </section>

          <section class="rounded-card border border-edge bg-card p-3">
            <h2 class="mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">
              Proof scans · {rec().images.length}
            </h2>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <For each={rec().images}>
                {(src) => (
                  <div class="rounded border border-edge bg-deep p-1.5">
                    <img src={src} alt="Proof of identity" class="max-h-72 w-full rounded object-contain" />
                  </div>
                )}
              </For>
            </div>
          </section>
        </div>
      )}
    </Show>
  );
};

const Field = (p: { k: string; v: string; mono?: boolean }) => (
  <div class="rounded border border-edge-subtle bg-card-subtle px-2.5 py-1.5">
    <dt class="font-mono text-[10px] uppercase tracking-[0.05em] text-fg-dim">{p.k}</dt>
    <dd class="text-fg-strong" classList={{ "font-mono text-sm": p.mono }}>{p.v}</dd>
  </div>
);
