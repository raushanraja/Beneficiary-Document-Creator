import { PanelLeft, PanelRight, Printer, Settings } from "lucide-solid";
import { useApp } from "~/store/context";
import { IconButton } from "./IconButton";
import { ThemeMenu } from "./ThemeMenu";
import type { View } from "~/types";

const TITLES: Record<View, string> = {
  welcome: "overview",
  beneficiaries: "beneficiaries",
  "beneficiary-new": "new beneficiary",
  "beneficiary-detail": "beneficiary dossier",
  attest: "self-attest studio",
  attestation: "attestation sheet",
  idprint: "id print studio",
  photogrid: "photo grid studio",
  board: "image board studio",
};

export const Header = () => {
  const app = useApp();

  return (
    <header class="flex h-10 shrink-0 items-center gap-3 border-b border-edge bg-header px-3">
      {/* left — status dot plus word; colour never carries it alone */}
      <div class="flex w-auto shrink-0 items-center gap-2 md:w-56">
        <IconButton label="Toggle sidebar" shortcut="Ctrl+B" onClick={app.toggleSidebar}>
          <PanelLeft class="icon" />
        </IconButton>
        <span class="size-2 rounded-full bg-success" aria-hidden="true" />
        <span class="font-mono text-xs uppercase tracking-widest text-fg">PrintStudio</span>
        <span class="hidden font-mono text-[10px] text-fg-dim lg:inline">v1.0</span>
        <span class="hidden font-mono text-[10px] uppercase tracking-widest text-fg-dim sm:inline">
          Local
        </span>
      </div>

      {/* centre — truncates, never wraps */}
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <span class="text-fg-dim" aria-hidden="true">›</span>
        <span class="truncate font-mono text-xs uppercase tracking-widest text-fg-strong">
          {TITLES[app.view()]}
        </span>
      </div>

      {/* right — first thing dropped when narrow */}
      <div class="flex items-center gap-1.5">
        <IconButton label="Print current sheet" shortcut="Ctrl+P" onClick={() => window.print()}>
          <Printer class="icon" />
        </IconButton>
        <IconButton
          label="Toggle print settings dock"
          shortcut="Ctrl+Shift+F"
          onClick={() => app.setDockOpen(!app.dockOpen())}
        >
          <PanelRight class="icon" />
        </IconButton>
        <ThemeMenu />
        <IconButton label="Settings" onClick={() => app.openModal("settings")}>
          <Settings class="icon" />
        </IconButton>
      </div>
    </header>
  );
};
