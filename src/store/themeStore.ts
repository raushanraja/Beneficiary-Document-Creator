/**
 * Theme switching with persistence and no flash of the wrong theme.
 * Keys are namespaced to this app; the pre-paint half lives in index.html.
 */
import { createEffect, createSignal, onMount } from "solid-js";
import { THEME_IDS } from "~/themes";

export type Mode = "dark" | "light";

const STORE_KEY = "printstudio.theme";
const MODE_KEY = "printstudio.mode";
const DEFAULT_NAME = "midnight";

const read = (key: string, fallback: string): string => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const apply = (name: string, mode: Mode) => {
  const root = document.documentElement;
  root.dataset.theme = name;
  root.classList.toggle("dark", mode === "dark");
  try {
    localStorage.setItem(STORE_KEY, name);
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* persistence is best-effort */
  }
};

export const createThemeStore = () => {
  const [name, setName] = createSignal(read(STORE_KEY, DEFAULT_NAME));
  const [mode, setMode] = createSignal<Mode>(
    read(MODE_KEY, "dark") === "light" ? "light" : "dark",
  );

  createEffect(() => apply(name(), mode()));

  onMount(() => {
    if (!THEME_IDS.includes(name())) setName(DEFAULT_NAME);
  });

  return {
    name,
    setName: (n: string) => setName(THEME_IDS.includes(n) ? n : DEFAULT_NAME),
    mode,
    setMode,
    toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
    cycle: () => {
      const i = THEME_IDS.indexOf(name());
      setName(THEME_IDS[(i + 1) % THEME_IDS.length] ?? DEFAULT_NAME);
    },
  };
};

export type ThemeStore = ReturnType<typeof createThemeStore>;
