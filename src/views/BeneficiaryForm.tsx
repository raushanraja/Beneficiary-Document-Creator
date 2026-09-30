import { For, Show, createSignal, onMount } from "solid-js";
import { ImagePlus, Save, X } from "lucide-solid";
import { useApp, useBeneficiaries } from "~/store/context";
import { INDIAN_BANKS, PROOF_TYPES } from "~/types";
import { stageFilesForCrop } from "~/lib/upload";
import { Thumb } from "~/components/Thumb";

const inputCls =
  "w-full rounded-chip border border-edge-subtle bg-input px-2.5 py-1.5 text-[15px] text-fg outline-none placeholder:text-fg-dim focus:border-edge-focus";
const labelCls = "mb-1 block font-mono text-[11px] uppercase tracking-[0.05em] text-fg-muted";
const errCls = "border-error";

export const BeneficiaryForm = () => {
  const app = useApp();
  const ben = useBeneficiaries();
  const editingId = () => app.editingId();
  const editing = () => (editingId() ? ben.byId(editingId()) : null);

  const draftKey = () => (editingId() ? `edit-${editingId()}` : "new");
  const seed = () => ({ ...editing(), ...ben.draftFor(draftKey()) });

  const [name, setName] = createSignal("");
  const [proofType, setProofType] = createSignal<string>(PROOF_TYPES[0]!);
  const [idNumber, setIdNumber] = createSignal("");
  const [bankName, setBankName] = createSignal("");
  const [branchCode, setBranchCode] = createSignal("");
  const [accountNo, setAccountNo] = createSignal("");
  const [accountType, setAccountType] = createSignal("Savings");
  const [tried, setTried] = createSignal(false);

  onMount(() => {
    const s = seed();
    if (editing()) ben.beginEdit(editing()!);
    else if (!ben.draftFor(draftKey())) ben.beginNew();
    // restore text (staging seeded by beginEdit/beginNew)
    const d = ben.draftFor(draftKey());
    setName(d?.name ?? editing()?.name ?? "");
    setProofType(d?.proofType ?? editing()?.proofType ?? PROOF_TYPES[0]!);
    setIdNumber(d?.idNumber ?? editing()?.idNumber ?? "");
    setBankName(d?.bankName ?? editing()?.bankName ?? "");
    setBranchCode(d?.branchCode ?? editing()?.branchCode ?? "");
    setAccountNo(d?.accountNo ?? editing()?.accountNo ?? "");
    setAccountType(d?.accountType ?? editing()?.accountType ?? "Savings");
    void s;
  });

  const keep = (patch: Parameters<typeof ben.setDraft>[1]) => ben.setDraft(draftKey(), patch);

  const bad = (v: string) => tried() && v.trim() === "";

  const submit = (e: Event) => {
    e.preventDefault();
    setTried(true);
    const imgs = ben.stageImages();
    const ok =
      name().trim() && idNumber().trim() && bankName().trim() &&
      branchCode().trim() && accountNo().trim() && imgs.length > 0;
    if (!ok) {
      app.toast(imgs.length === 0 ? "Add at least one ID scan" : "Fill the highlighted fields", "error");
      return;
    }
    const id = ben.save(
      {
        name: name().trim(),
        proofType: proofType(),
        idNumber: idNumber().trim(),
        bankName: bankName().trim(),
        branchCode: branchCode().trim(),
        accountNo: accountNo().trim(),
        accountType: accountType(),
        images: [...imgs],
      },
      editingId() ?? undefined,
    );
    ben.clearDraft(draftKey());
    app.setEditingId(null);
    app.setActiveBeneficiaryId(id);
    app.toast(editingId() ? "Dossier updated" : "Dossier saved", "success");
    app.go("beneficiary-detail");
  };

  let fileRef: HTMLInputElement | undefined;

  return (
    <div class="mx-auto max-w-4xl px-4 py-6">
      <h1 class="mb-4 font-mono text-xs uppercase tracking-[0.05em] text-fg">
        {editingId() ? "Edit beneficiary" : "New beneficiary"}
      </h1>
      <form onSubmit={submit} novalidate class="space-y-4">
        <section class="rounded-card border border-edge bg-card p-3">
          <h2 class="mb-3 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">
            Personal information
          </h2>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label for="f-name" class={labelCls}>Full name *</label>
              <input
                id="f-name" type="text" value={name()} placeholder="e.g. Meera Devi"
                onInput={(e) => { setName(e.currentTarget.value); keep({ name: e.currentTarget.value }); }}
                class={inputCls} classList={{ [errCls]: bad(name()) }}
              />
            </div>
            <div>
              <label for="f-proof" class={labelCls}>Proof of identity *</label>
              <select
                id="f-proof" value={proofType()}
                onChange={(e) => { setProofType(e.currentTarget.value); keep({ proofType: e.currentTarget.value }); }}
                class={inputCls}
              >
                <For each={PROOF_TYPES}>{(t) => <option value={t}>{t}</option>}</For>
              </select>
            </div>
            <div class="md:col-span-2">
              <label for="f-idnum" class={labelCls}>ID card number *</label>
              <input
                id="f-idnum" type="text" value={idNumber()} placeholder="As printed on the card"
                onInput={(e) => { setIdNumber(e.currentTarget.value); keep({ idNumber: e.currentTarget.value }); }}
                class={inputCls} classList={{ [errCls]: bad(idNumber()) }}
              />
            </div>
          </div>
        </section>

        <section class="rounded-card border border-edge bg-card p-3">
          <h2 class="mb-3 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">Bank details</h2>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label for="f-bank" class={labelCls}>Bank name *</label>
              <input
                id="f-bank" type="text" list="bank-list" value={bankName()} placeholder="Start typing…"
                onInput={(e) => { setBankName(e.currentTarget.value); keep({ bankName: e.currentTarget.value }); }}
                class={inputCls} classList={{ [errCls]: bad(bankName()) }}
              />
              <datalist id="bank-list">
                <For each={INDIAN_BANKS}>{(b) => <option value={b} />}</For>
              </datalist>
            </div>
            <div>
              <label for="f-ifsc" class={labelCls}>Branch code (IFSC) *</label>
              <input
                id="f-ifsc" type="text" value={branchCode()} placeholder="e.g. SBIN0060231"
                onInput={(e) => { setBranchCode(e.currentTarget.value); keep({ branchCode: e.currentTarget.value }); }}
                class={inputCls} classList={{ [errCls]: bad(branchCode()) }}
              />
            </div>
            <div>
              <label for="f-acno" class={labelCls}>Account number *</label>
              <input
                id="f-acno" type="text" inputmode="numeric" value={accountNo()}
                onInput={(e) => { setAccountNo(e.currentTarget.value); keep({ accountNo: e.currentTarget.value }); }}
                class={inputCls} classList={{ [errCls]: bad(accountNo()) }}
              />
            </div>
            <div>
              <label for="f-actype" class={labelCls}>Account type *</label>
              <select
                id="f-actype" value={accountType()}
                onChange={(e) => { setAccountType(e.currentTarget.value); keep({ accountType: e.currentTarget.value }); }}
                class={inputCls}
              >
                <option>Savings</option>
                <option>Current</option>
              </select>
            </div>
          </div>
        </section>

        <section class="rounded-card border border-edge bg-card p-3">
          <h2 class="mb-1 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">
            Identity proof scans · {ben.stageImages().length}
          </h2>
          <p class="mb-3 font-mono text-[11px] text-fg-dim">
            Each upload opens the cropper (3:2 locked) · hover a scan to redact or remove
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            aria-label="Add identity proof images"
            onChange={(e) => {
              const files = Array.from(e.currentTarget.files ?? []);
              e.currentTarget.value = "";
              void stageFilesForCrop(app, files, "beneficiary", 1.5, "Crop ID scan");
            }}
          />
          <button type="button" class="chip" onClick={() => fileRef?.click()}>
            <ImagePlus class="icon" /> Add image(s)
          </button>
          <Show when={ben.stageImages().length > 0}>
            <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              <For each={ben.stageImages()}>
                {(src, i) => (
                  <Thumb
                    src={src}
                    label={`scan-${i() + 1}`}
                    onRedact={() => {
                      app.setRedactJob({ src, target: "beneficiary", index: i() });
                      app.openModal("redact");
                    }}
                    onRemove={() => ben.removeStaged(i())}
                  />
                )}
              </For>
            </div>
          </Show>
          <Show when={tried() && ben.stageImages().length === 0}>
            <p class="mt-2 text-sm text-error">▲ Add at least one identity proof image.</p>
          </Show>
        </section>

        <div class="flex justify-end gap-1.5 pb-8">
          <button
            type="button"
            class="chip"
            onClick={() => {
              app.setEditingId(null);
              app.go(app.activeBeneficiaryId() ? "beneficiary-detail" : "beneficiaries");
            }}
          >
            <X class="icon" /> Cancel <kbd>esc</kbd>
          </button>
          <button type="submit" class="chip border-accent/40 text-accent">
            <Save class="icon icon--accent" /> {editingId() ? "Save changes" : "Save dossier"}
          </button>
        </div>
      </form>
    </div>
  );
};
