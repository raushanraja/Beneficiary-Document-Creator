import { createSignal } from "solid-js";
import type { CropJob, ModalKind, RedactJob, Toast, View } from "~/types";
import { uid } from "~/lib/images";
import { clearCropQueue } from "~/lib/upload";

/** Reactive `matchMedia`, so layout mode follows rotation and window resize. */
const media = (query: string) => {
  const m = window.matchMedia(query);
  const [matches, setMatches] = createSignal(m.matches);
  m.addEventListener("change", (e) => setMatches(e.matches));
  return matches;
};

/**
 * View + chrome state only. No domain data lives here —
 * see beneficiaryStore / attestStore / idPrintStore / photoStore / boardStore.
 */
export const createAppStore = () => {
  const [view, setView] = createSignal<View>("welcome");
  const [activeBeneficiaryId, setActiveBeneficiaryId] = createSignal<string | null>(null);
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false);
  // Drawer state for phones; the desktop rail keeps using sidebarCollapsed.
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  // Touch-first widths: <768 sidebar is a drawer, <1024 the dock is a drawer.
  const mobile = media("(max-width: 767.98px)");
  const compact = media("(max-width: 1023.98px)");
  const [dockOpen, setDockOpenRaw] = createSignal(!window.matchMedia("(max-width: 1023.98px)").matches);
  const [zen, setZen] = createSignal(false);
  const [modal, setModal] = createSignal<ModalKind>(null);
  const [cropJob, setCropJob] = createSignal<CropJob | null>(null);
  const [redactJob, setRedactJob] = createSignal<RedactJob | null>(null);
  const [confirm, setConfirm] = createSignal<{ title: string; detail: string; run: () => void } | null>(null);
  const [toasts, setToasts] = createSignal<Toast[]>([]);

  const toast = (text: string, tone: Toast["tone"] = "info") => {
    const id = uid();
    setToasts((t) => [...t, { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  const go = (v: View) => {
    setView(v);
    // Overlay panels are transient: navigating hides them again.
    if (mobile()) setSidebarOpen(false);
    if (compact()) setDockOpenRaw(false);
    window.scrollTo(0, 0);
  };

  /** Only one overlay drawer may be open at a time. */
  const setSidebarOpenSafe = (open: boolean) => {
    setSidebarOpen(open);
    if (open) setDockOpenRaw(false);
  };

  const setDockOpen = (open: boolean) => {
    setDockOpenRaw(open);
    if (open) setSidebarOpen(false);
  };

  const toggleSidebar = () =>
    mobile() ? setSidebarOpenSafe(!sidebarOpen()) : setSidebarCollapsed((v) => !v);

  return {
    view, go,
    activeBeneficiaryId, setActiveBeneficiaryId,
    editingId, setEditingId,
    mobile, compact,
    sidebarCollapsed, toggleSidebar,
    sidebarOpen, setSidebarOpen: setSidebarOpenSafe,
    dockOpen, setDockOpen,
    zen, toggleZen: () => setZen((v) => !v),
    modal, openModal: setModal, closeModal: () => {
      clearCropQueue();
      setModal(null);
      setCropJob(null);
      setRedactJob(null);
      setConfirm(null);
    },
    cropJob, setCropJob,
    redactJob, setRedactJob,
    confirm, setConfirm,
    toasts, toast,
  };
};

export type AppStore = ReturnType<typeof createAppStore>;
