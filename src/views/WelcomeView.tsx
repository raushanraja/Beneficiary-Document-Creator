import { BadgeCheck, CreditCard, Images, LayoutGrid, Plus, Users } from "lucide-solid";
import { useApp } from "~/store/context";

const CARDS = [
  { view: "beneficiaries", label: "Beneficiaries", hint: "Dossiers with bank + ID scans", icon: Users, action: "Open" },
  { view: "attest", label: "Self-Attest", hint: "Watermarked scans on A4", icon: BadgeCheck, action: "Start" },
  { view: "idprint", label: "ID Print", hint: "Cards side-by-side on A4", icon: CreditCard, action: "Start" },
  { view: "photogrid", label: "Photo Grid", hint: "Passport photos tiled on A4", icon: LayoutGrid, action: "Start" },
  { view: "board", label: "Image Board", hint: "Any images, captioned, on A4", icon: Images, action: "Start" },
] as const;

export const WelcomeView = () => {
  const app = useApp();
  return (
    <div class="mx-auto max-w-4xl px-4 py-8">
      <div class="mb-6 rounded-card border border-edge bg-card p-4">
        <p class="font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">No active file</p>
        <h1 class="mt-1 font-mono text-sm uppercase tracking-[0.05em] text-fg-strong">
          Print studio
        </h1>
        <p class="mt-2 max-w-prose text-[15px] leading-7 text-fg-muted">
          Beneficiary dossiers, self-attested scans, ID cards, passport photos and free-form
          image boards — composed on screen, printed on A4. Everything stays in this browser.
        </p>
        <div class="mt-3">
          <button type="button" class="chip border-accent/40 text-accent" onClick={() => app.go("beneficiary-new")}>
            <Plus class="icon icon--accent" /> New beneficiary <kbd>Ctrl+N</kbd>
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <button
              type="button"
              onClick={() => app.go(c.view)}
              class="rounded-card border border-edge bg-card p-3 text-left hover:border-edge-focus"
            >
              <p class="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.05em] text-fg">
                <Icon class="icon" /> {c.label}
              </p>
              <p class="mt-1 text-sm text-fg-muted">{c.hint}</p>
              <p class="mt-2 font-mono text-[11px] uppercase tracking-[0.05em] text-accent">
                {c.action} ›
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
