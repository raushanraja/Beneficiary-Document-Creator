import { Show, type JSX } from "solid-js";

/**
 * Sheet-studio frame. The outer page never scrolls: the header and work card
 * are pinned, the sheet preview scrolls internally, and the action bar stays
 * visible so Print / Open-sheet is always one click away.
 */
export const StudioLayout = (p: {
  title: string;
  desc?: string;
  top?: JSX.Element;
  options?: JSX.Element;
  preview: JSX.Element;
  actions?: JSX.Element;
}) => (
  <div class="mx-auto flex h-full min-h-0 max-w-4xl flex-col px-3 py-3 md:px-4 md:py-4">
    <div class="shrink-0">
      <h1 class="font-mono text-xs uppercase tracking-[0.05em] text-fg">{p.title}</h1>
      <Show when={p.desc}>
        <p class="mt-0.5 text-sm text-fg-muted">{p.desc}</p>
      </Show>
    </div>

    <Show when={p.top}>
      <section class="mt-3 max-h-[36vh] shrink-0 overflow-y-auto rounded-card border border-edge bg-card p-3">
        {p.top}
      </section>
    </Show>

    <section class="mt-3 flex min-h-0 flex-1 flex-col rounded-card border border-edge bg-card p-3">
      <h2 class="shrink-0 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-dim">
        Sheet
      </h2>
      <Show when={p.options}>
        <div class="mt-2 shrink-0">{p.options}</div>
      </Show>
      <div
        class="mt-2 min-h-0 flex-1 overflow-auto rounded border border-edge-subtle bg-deep p-2"
        style={{ "min-height": "160px" }}
      >
        {p.preview}
      </div>
      <Show when={p.actions}>
        <div class="flex shrink-0 flex-wrap gap-1.5 pt-3">{p.actions}</div>
      </Show>
    </section>
  </div>
);
