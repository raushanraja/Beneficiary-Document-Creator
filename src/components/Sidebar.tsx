import { For, Show, createSignal } from "solid-js";
import {
  BadgeCheck,
  CreditCard,
  House,
  Images,
  LayoutGrid,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-solid";
import { useApp, useBeneficiaries } from "~/store/context";
import { IconButton } from "./IconButton";
import type { View } from "~/types";

const NAV: { view: View; label: string; shortcut: string }[] = [
  { view: "welcome", label: "Home", shortcut: "Alt+0" },
  { view: "beneficiaries", label: "Beneficiaries", shortcut: "Alt+1" },
  { view: "attest", label: "Self-Attest", shortcut: "Alt+2" },
  { view: "idprint", label: "ID Print", shortcut: "Alt+3" },
  { view: "photogrid", label: "Photo Grid", shortcut: "Alt+4" },
  { view: "board", label: "Image Board", shortcut: "Alt+5" },
];

export const NavIcon = (p: { view: View }) => {
  const cls = "icon";
  switch (p.view) {
    case "welcome": return <House class={cls} />;
    case "beneficiaries": return <Users class={cls} />;
    case "attest": return <BadgeCheck class={cls} />;
    case "idprint": return <CreditCard class={cls} />;
    case "photogrid": return <LayoutGrid class={cls} />;
    case "board": return <Images class={cls} />;
    default: return <Users class={cls} />;
  }
};

const isBenView = (v: View) =>
  v === "beneficiaries" || v === "beneficiary-new" || v === "beneficiary-detail";

export const Sidebar = () => {
  const app = useApp();
  const ben = useBeneficiaries();
  const [q, setQ] = createSignal("");
  let searchRef: HTMLInputElement | undefined;

  return (
    <>
      <Show when={app.mobile()}>
        <div
          class="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => app.setSidebarOpen(false)}
        />
      </Show>
      <aside
        aria-label="Studio navigation"
        class="flex shrink-0 flex-col border-r border-edge bg-sidebar transition-[width] duration-100"
        classList={{
          "max-md:pointer-events-auto max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40 max-md:w-72 max-md:max-w-[85vw] max-md:shadow-2xl":
            app.mobile(),
          "w-12": !app.mobile() && app.sidebarCollapsed(),
          "w-64": !app.mobile() && !app.sidebarCollapsed(),
        }}
      >
        <Show when={!app.sidebarCollapsed()} fallback={
          <nav class="flex flex-col items-center gap-1 py-2" aria-label="Studios">
            <For each={NAV}>
              {(n) => (
                <button
                  type="button"
                  aria-label={n.label}
                  title={`${n.label} · ${n.shortcut}`}
                  onClick={() => app.go(n.view)}
                  class="chip p-1"
                  classList={{ "border-edge-focus text-fg": app.view() === n.view || (n.view === "beneficiaries" && isBenView(app.view())) }}
                >
                  <NavIcon view={n.view} />
                </button>
              )}
            </For>
          </nav>
        }>
          <nav class="flex items-center gap-1.5 border-b border-edge-subtle px-3 py-2" aria-label="Primary">
            <button type="button" class="chip flex-1" onClick={() => app.go("beneficiary-new")}>
              <Plus class="icon" /> New file
            </button>
            <IconButton label="Search beneficiaries" shortcut="/" onClick={() => searchRef?.focus()}>
              <Search class="icon" />
            </IconButton>
            <Show when={app.mobile()}>
              <IconButton label="Close navigation" onClick={() => app.setSidebarOpen(false)}>
                <X class="icon" />
              </IconButton>
            </Show>
          </nav>
  
          <div class="border-b border-edge-subtle px-2 py-1.5">
            <p class="px-1 pb-1 font-mono text-[10px] uppercase tracking-[0.05em] text-fg-dim">
              Studios
            </p>
            <For each={NAV}>
              {(n) => {
                const active = () =>
                  app.view() === n.view || (n.view === "beneficiaries" && isBenView(app.view()));
                return (
                  <button
                    type="button"
                    title={n.shortcut}
                    onClick={() => app.go(n.view)}
                    class="mb-0.5 flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
                    classList={{ "bg-active text-fg": active(), "text-fg-muted hover:bg-hover": !active() }}
                  >
                    <NavIcon view={n.view} />
                    <span class="truncate">{n.label}</span>
                    <kbd class="ml-auto hidden text-[10px] text-fg-dim xl:inline">{n.shortcut}</kbd>
                  </button>
                );
              }}
            </For>
          </div>
  
          <div class="min-h-0 flex-1 overflow-y-auto px-2 py-1.5">
            <p class="px-1 pb-1 font-mono text-[10px] uppercase tracking-[0.05em] text-fg-dim">
              Beneficiaries · {ben.list().length}
            </p>
            <input
              ref={searchRef}
              id="ben-filter"
              name="ben-filter"
              type="search"
              placeholder="Filter…  ( / )"
              aria-label="Filter beneficiaries"
              value={q()}
              onInput={(e) => setQ(e.currentTarget.value.toLowerCase())}
              class="mb-1.5 w-full rounded-chip border border-edge-subtle bg-input px-2 py-1 text-sm text-fg outline-none placeholder:text-fg-dim focus:border-edge-focus"
            />
            <Show
              when={ben.list().length > 0}
              fallback={<p class="px-1 py-3 text-sm text-fg-dim">No files yet. Create one.</p>}
            >
              <ul>
                <For each={ben.list().filter((b) => b.name.toLowerCase().includes(q()))}>
                  {(b) => (
                    <li>
                      <div
                        class="group flex items-center gap-1 rounded px-2 py-1.5 hover:bg-hover focus-within:bg-hover"
                        classList={{ "bg-active": app.activeBeneficiaryId() === b.id }}
                      >
                        <button
                          type="button"
                          class="min-w-0 flex-1 truncate text-left text-sm text-fg"
                          onClick={() => {
                            app.setActiveBeneficiaryId(b.id);
                            app.go("beneficiary-detail");
                          }}
                        >
                          {b.name}
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${b.name}`}
                          title={`Delete ${b.name}`}
                          class="hidden rounded border border-edge px-1 group-hover:inline group-focus-within:inline"
                          onClick={() => {
                            app.setConfirm({
                              title: "Delete beneficiary",
                              detail: `Delete ${b.name}? This cannot be undone.`,
                              run: () => {
                                ben.remove(b.id);
                                if (app.activeBeneficiaryId() === b.id) {
                                  app.setActiveBeneficiaryId(null);
                                  app.go("beneficiaries");
                                }
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
  
          <div class="border-t border-edge px-3 py-2 font-mono text-[10px] uppercase tracking-[0.05em] text-fg-dim">
            local-first · no cloud
          </div>
        </Show>
      </aside>
    </>
  );
};
