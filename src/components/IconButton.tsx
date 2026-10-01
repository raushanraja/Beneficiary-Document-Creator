import type { JSX } from "solid-js";

/** Every clickable thing looks like a bordered chip. Route icon buttons here. */
export const IconButton = (p: {
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  class?: string;
  children: JSX.Element;
}) => (
  <button
    type="button"
    aria-label={p.shortcut ? `${p.label} (${p.shortcut})` : p.label}
    title={p.shortcut ? `${p.label} · ${p.shortcut}` : p.label}
    disabled={p.disabled}
    onClick={p.onClick}
    class={`chip p-1 disabled:pointer-events-none disabled:opacity-40 ${p.class ?? ""}`}
  >
    {p.children}
  </button>
);
