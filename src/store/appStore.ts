import { createSignal } from "solid-js";
import type { CropJob, ModalKind, RedactJob, Toast, View } from "~/types";
import { uid } from "~/lib/images";
import { clearCropQueue } from "~/lib/upload";

/**
 * View + chrome state only. No domain data lives here —
 * see beneficiaryStore / attestStore / idPrintStore / photoStore / boardStore.
 */
export const createAppStore = () => {
  const [view, setView] = createSignal<View>("welcome");
  const [activeBeneficiaryId, setActiveBeneficiaryId] = createSignal<string | null>(null);
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false);
  const [dockOpen, setDockOpen] = createSignal(true);
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
    window.scrollTo(0, 0);
  };

  return {
    view, go,
    activeBeneficiaryId, setActiveBeneficiaryId,
    editingId, setEditingId,
    sidebarCollapsed, toggleSidebar: () => setSidebarCollapsed((v) => !v),
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
