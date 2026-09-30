/**
 * Print Studio — glyphline-solid app shell.
 * header (h-10) → sidebar | main | dock → status bar (h-7), plus modal + toast
 * hosts and a print-only A4 root.
 */
import { Match, Show, Switch, onCleanup, onMount } from "solid-js";
import { PanelRight } from "lucide-solid";
import { createAppStore } from "~/store/appStore";
import { createThemeStore } from "~/store/themeStore";
import { createBeneficiaryStore } from "~/store/beneficiaryStore";
import { createAttestStore } from "~/store/attestStore";
import { createIdPrintStore } from "~/store/idPrintStore";
import { createPhotoStore } from "~/store/photoStore";
import { createBoardStore } from "~/store/boardStore";
import {
  AppCtx,
  AttestCtx,
  BeneficiaryCtx,
  BoardCtx,
  IdPrintCtx,
  PhotoCtx,
  ThemeCtx,
  useApp,
} from "~/store/context";
import { Header } from "~/components/Header";
import { Sidebar } from "~/components/Sidebar";
import { StatusBar } from "~/components/StatusBar";
import { DockPreview } from "~/components/DockPreview";
import { ModalHost } from "~/components/ModalHost";
import { ToastHost } from "~/components/ToastHost";
import { PrintRoot } from "~/components/PrintRoot";
import { IconButton } from "~/components/IconButton";
import { WelcomeView } from "~/views/WelcomeView";
import { BeneficiariesView } from "~/views/BeneficiariesView";
import { BeneficiaryForm } from "~/views/BeneficiaryForm";
import { BeneficiaryDetail } from "~/views/BeneficiaryDetail";
import { AttestStudio, AttestationView } from "~/views/AttestStudio";
import { IdPrintStudio } from "~/views/IdPrintStudio";
import { PhotoGridStudio } from "~/views/PhotoGridStudio";
import { BoardStudio } from "~/views/BoardStudio";

export default function App() {
  const app = createAppStore();
  const theme = createThemeStore();
  const beneficiaries = createBeneficiaryStore();
  const attest = createAttestStore();
  const idprint = createIdPrintStore();
  const photo = createPhotoStore();
  const board = createBoardStore();

  const VIEWS = ["beneficiaries", "attest", "idprint", "photogrid", "board"] as const;

  const onKey = (e: KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;
    const typing =
      (e.target as HTMLElement)?.tagName === "INPUT" ||
      (e.target as HTMLElement)?.tagName === "TEXTAREA" ||
      (e.target as HTMLElement)?.tagName === "SELECT";

    if (mod && e.key.toLowerCase() === "b") {
      e.preventDefault();
      app.toggleSidebar();
      return;
    }
    if (mod && e.shiftKey && e.key.toLowerCase() === "f") {
      e.preventDefault();
      app.setDockOpen(!app.dockOpen());
      return;
    }
    if (mod && e.key.toLowerCase() === "n") {
      e.preventDefault();
      app.setEditingId(null);
      app.go("beneficiary-new");
      return;
    }
    if (mod && e.key.toLowerCase() === "p") {
      e.preventDefault();
      window.print();
      return;
    }
    if (e.altKey && ["0", "1", "2", "3", "4", "5"].includes(e.key)) {
      e.preventDefault();
      if (e.key === "0") app.go("welcome");
      else app.go(VIEWS[Number(e.key) - 1]!);
      return;
    }
    if (e.key === "/" && !typing) {
      e.preventDefault();
      document.querySelector<HTMLElement>('aside input[type="search"]')?.focus();
      return;
    }
    if (e.key === "?" && !typing) {
      app.openModal("shortcuts");
      return;
    }
    if (e.key === "Escape") {
      if (app.modal()) app.closeModal();
      else if (app.view() === "attestation") {
        app.go(attest.from() === "beneficiary" ? "beneficiary-detail" : "attest");
      } else if (app.view() === "beneficiary-detail") app.go("beneficiaries");
      return;
    }
  };

  onMount(() => window.addEventListener("keydown", onKey));
  onCleanup(() => window.removeEventListener("keydown", onKey));

  return (
    <AppCtx.Provider value={app}>
      <ThemeCtx.Provider value={theme}>
        <BeneficiaryCtx.Provider value={beneficiaries}>
          <AttestCtx.Provider value={attest}>
            <IdPrintCtx.Provider value={idprint}>
              <PhotoCtx.Provider value={photo}>
                <BoardCtx.Provider value={board}>
                  <div id="app-shell" class="h-dvh w-full bg-app p-0 md:p-4">
                    <div class="relative mx-auto flex h-full max-w-[1400px] flex-col border border-edge bg-shell md:rounded-card">
                      <Header />
                      <div class="flex min-h-0 flex-1">
                        <Show when={!app.zen()}>
                          <Sidebar />
                        </Show>
                        <main class="min-w-0 flex-1 overflow-y-auto bg-chat" aria-label="Studio">
                          <ViewRenderer />
                        </main>
                        <Show when={!app.zen()}>
                          <DockPreview />
                        </Show>
                      </div>
                      <Show when={!app.zen()}>
                        <StatusBar />
                      </Show>
                      {/* mobile dock toggle */}
                      <Show when={!app.zen() && !app.dockOpen()}>
                        <button
                          type="button"
                          aria-label="Open print settings"
                          title="Print settings"
                          onClick={() => app.setDockOpen(true)}
                          class="absolute bottom-10 right-3 chip border-accent/40 text-accent md:hidden"
                        >
                          <PanelRight class="icon icon--accent" /> Print
                        </button>
                      </Show>
                      <ModalHost />
                      <ToastHost />
                    </div>
                  </div>
                  <PrintRoot />
                </BoardCtx.Provider>
              </PhotoCtx.Provider>
            </IdPrintCtx.Provider>
          </AttestCtx.Provider>
        </BeneficiaryCtx.Provider>
      </ThemeCtx.Provider>
    </AppCtx.Provider>
  );
}

/** The renderer switch: one arm per view, fallback to welcome. */
const ViewRenderer = () => {
  const app = useApp();
  return (
    <Switch fallback={<WelcomeView />}>
      <Match when={app.view() === "welcome"}><WelcomeView /></Match>
      <Match when={app.view() === "beneficiaries"}><BeneficiariesView /></Match>
      <Match when={app.view() === "beneficiary-new"}><BeneficiaryForm /></Match>
      <Match when={app.view() === "beneficiary-detail"}><BeneficiaryDetail /></Match>
      <Match when={app.view() === "attest"}><AttestStudio /></Match>
      <Match when={app.view() === "attestation"}><AttestationView /></Match>
      <Match when={app.view() === "idprint"}><IdPrintStudio /></Match>
      <Match when={app.view() === "photogrid"}><PhotoGridStudio /></Match>
      <Match when={app.view() === "board"}><BoardStudio /></Match>
    </Switch>
  );
};

