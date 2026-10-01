import { Show } from "solid-js";
import { ChevronLeft, ChevronRight, Eraser, X } from "lucide-solid";

/**
 * One staged-image thumbnail: hover AND focus reveal the same actions
 * (hover-only controls are a keyboard trap).
 */
export const Thumb = (p: {
  src: string;
  label?: string;
  onRedact?: () => void;
  onRemove?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
}) => (
  <div class="group relative rounded border border-edge bg-deep">
    <img src={p.src} alt={p.label ?? "staged scan"} class="h-24 w-full rounded object-cover" />
    <div class="thumb-actions absolute inset-0 flex flex-wrap items-center justify-center gap-1 rounded bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
      <Show when={p.onLeft}>
        <button
          type="button"
          aria-label={`Move ${p.label ?? "image"} left`}
          title="Move left"
          class="rounded-full border border-edge bg-elevated p-1.5 text-fg"
          onClick={p.onLeft}
        >
          <ChevronLeft class="icon" />
        </button>
      </Show>
      <Show when={p.onRedact}>
        <button
          type="button"
          aria-label={`Redact ${p.label ?? "image"}`}
          title="Redact"
          class="rounded-full border border-edge bg-elevated p-1.5 text-fg"
          onClick={p.onRedact}
        >
          <Eraser class="icon" />
        </button>
      </Show>
      <Show when={p.onRemove}>
        <button
          type="button"
          aria-label={`Remove ${p.label ?? "image"}`}
          title="Remove"
          class="rounded-full border border-edge bg-elevated p-1.5 text-fg"
          onClick={p.onRemove}
        >
          <X class="icon icon--error" />
        </button>
      </Show>
      <Show when={p.onRight}>
        <button
          type="button"
          aria-label={`Move ${p.label ?? "image"} right`}
          title="Move right"
          class="rounded-full border border-edge bg-elevated p-1.5 text-fg"
          onClick={p.onRight}
        >
          <ChevronRight class="icon" />
        </button>
      </Show>
    </div>
    <Show when={p.label}>
      <p class="truncate px-1 py-0.5 text-center font-mono text-[10px] text-fg-dim">{p.label}</p>
    </Show>
  </div>
);
