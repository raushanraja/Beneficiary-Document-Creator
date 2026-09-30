import { For, Show, createSignal } from "solid-js";
import { Palette } from "lucide-solid";
import { THEMES } from "~/themes";
import { useTheme } from "~/store/context";

export const ThemeMenu = () => {
  const theme = useTheme();
  const [open, setOpen] = createSignal(false);

  return (
    <div class="relative">
      <button
        type="button"
        class="chip p-1"
        aria-haspopup="menu"
        aria-expanded={open()}
        aria-label="Theme"
        title="Theme"
        onClick={() => setOpen(!open())}
      >
        <Palette class="icon" />
      </button>
      <Show when={open()}>
        <div class="fixed inset-0 z-30" onClick={() => setOpen(false)} />
        <div
          role="menu"
          aria-label="Theme"
          class="absolute right-0 z-40 mt-1 max-h-80 w-56 overflow-y-auto rounded-card border border-edge bg-elevated p-1"
        >
          {(["dark", "light"] as const).map((mode) => (
            <div class="mb-1">
              <p class="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.05em] text-fg-dim">
                {mode}
              </p>
              <For each={THEMES.filter((t) => t.mode === mode)}>
                {(t) => (
                  <button
                    role="menuitem"
                    class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-fg hover:bg-hover"
                    onClick={() => {
                      theme.setName(t.id);
                      theme.setMode(t.mode);
                      setOpen(false);
                    }}
                  >
                    <span
                      aria-hidden="true"
                      class="size-3 shrink-0 rounded-full border border-edge"
                      style={{
                        "background-color": t.swatch[0],
                        "box-shadow": `inset 0 0 0 2px ${t.swatch[1]}`,
                      }}
                    />
                    <span class="truncate">{t.label}</span>
                    <Show when={theme.name() === t.id}>
                      <span class="ml-auto text-accent" aria-label="Current theme">✓</span>
                    </Show>
                  </button>
                )}
              </For>
            </div>
          ))}
        </div>
      </Show>
    </div>
  );
};
