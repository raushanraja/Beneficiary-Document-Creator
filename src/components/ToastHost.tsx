import { For } from "solid-js";
import { Check, CircleAlert, Info } from "lucide-solid";
import { useApp } from "~/store/context";

export const ToastHost = () => {
  const app = useApp();
  return (
    <div
      aria-live="polite"
      class="pointer-events-none absolute left-1/2 top-12 z-[60] flex -translate-x-1/2 flex-col items-center gap-1"
    >
      <For each={app.toasts()}>
        {(t) => (
          <div
            class="pointer-events-auto flex items-center gap-2 rounded-chip border border-edge bg-elevated px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.05em]"
            classList={{
              "text-fg": t.tone === "info",
              "text-success": t.tone === "success",
              "text-error": t.tone === "error",
            }}
          >
            {t.tone === "success" ? (
              <Check class="icon icon--success" />
            ) : t.tone === "error" ? (
              <CircleAlert class="icon icon--error" />
            ) : (
              <Info class="icon" />
            )}
            {t.text}
          </div>
        )}
      </For>
    </div>
  );
};
