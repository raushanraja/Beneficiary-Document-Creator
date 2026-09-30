export type Mode = "dark" | "light";

export interface ThemeMeta {
  id: string;
  label: string;
  mode: Mode;
  /** [surface, accent] live swatch for the picker */
  swatch: [string, string];
}

export const THEMES: readonly ThemeMeta[] = [
  { id: "midnight", label: "Midnight Terminal", mode: "dark", swatch: ["#0c0c0e", "#38bdf8"] },
  { id: "nord", label: "Nord", mode: "dark", swatch: ["#323844", "#88c0d0"] },
  { id: "dracula", label: "Dracula", mode: "dark", swatch: ["#2c2e3a", "#bd93f9"] },
  { id: "gruvbox", label: "Gruvbox", mode: "dark", swatch: ["#2c2c2b", "#fabd2f"] },
  { id: "solarized", label: "Solarized", mode: "dark", swatch: ["#032d38", "#268bd2"] },
  { id: "tokyo-night", label: "Tokyo Night", mode: "dark", swatch: ["#1d1f2a", "#7aa2f7"] },
  { id: "ayu", label: "Ayu", mode: "dark", swatch: ["#13181d", "#ff8f40"] },
  { id: "rose-pine", label: "Rosé Pine", mode: "dark", swatch: ["#1d1b28", "#9ccfd8"] },
  { id: "catppuccin", label: "Catppuccin", mode: "dark", swatch: ["#222232", "#cba6f7"] },
  { id: "ocean", label: "Ocean", mode: "dark", swatch: ["#131b2e", "#38bdf8"] },
  { id: "matrix", label: "Matrix", mode: "dark", swatch: ["#040504", "#00ff41"] },
  { id: "paper", label: "Paper", mode: "light", swatch: ["#f1f0eb", "#0b5fff"] },
  { id: "nord-light", label: "Nord Light", mode: "light", swatch: ["#e7eaf0", "#5e81ac"] },
  { id: "gruvbox-light", label: "Gruvbox Light", mode: "light", swatch: ["#f6ecc3", "#aa6f13"] },
  { id: "solarized-light", label: "Solarized Light", mode: "light", swatch: ["#f9f2e0", "#268bd2"] },
  { id: "tokyo-light", label: "Tokyo Light", mode: "light", swatch: ["#dddee3", "#2b76db"] },
  { id: "ayu-light", label: "Ayu Light", mode: "light", swatch: ["#f6f6f6", "#e15e00"] },
  { id: "rose-dawn", label: "Rosé Dawn", mode: "light", swatch: ["#f6f0ea", "#286983"] },
];

export const THEME_IDS = THEMES.map((t) => t.id);
