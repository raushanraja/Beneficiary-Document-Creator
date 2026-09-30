import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import type { Beneficiary } from "~/types";
import { uid } from "~/lib/images";

const KEY = "printstudio.beneficiaries.v1";

const load = (): Beneficiary[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Beneficiary[];
  } catch {
    return [];
  }
};

/**
 * Beneficiary domain store. Draft text lives in a plain Map (not a signal)
 * so typing never re-renders subscribers per keystroke.
 */
export const createBeneficiaryStore = () => {
  const [list, setList] = createSignal<Beneficiary[]>(load());
  const [staging, setStaging] = createStore<{ images: string[] }>({ images: [] });
  const drafts = new Map<string, Partial<Beneficiary>>();

  const persist = (next: Beneficiary[]) => {
    setList(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* quota: keep in-memory, print still works */
    }
  };

  return {
    list,
    staging,
    byId: (id: string | null) => list().find((b) => b.id === id) ?? null,

    draftFor: (key: string) => drafts.get(key),
    setDraft: (key: string, patch: Partial<Beneficiary>) =>
      drafts.set(key, { ...drafts.get(key), ...patch }),
    clearDraft: (key: string) => drafts.delete(key),

    stageImages: () => staging.images,
    setStageImages: (imgs: string[]) => setStaging("images", imgs),
    addStaged: (src: string) => setStaging("images", (p) => [...p, src]),
    removeStaged: (i: number) => setStaging("images", (p) => p.filter((_, x) => x !== i)),
    replaceStaged: (i: number, src: string) =>
      setStaging("images", (p) => p.map((v, x) => (x === i ? src : v))),
    clearStaging: () => setStaging("images", []),

    /** Begin a fresh form: returns the draft key. */
    beginNew: () => {
      setStaging("images", []);
      const key = `new-${uid()}`;
      drafts.delete(key);
      return key;
    },
    /** Begin editing: seeds staging + draft from the record. */
    beginEdit: (b: Beneficiary) => {
      setStaging("images", [...b.images]);
      const key = `edit-${b.id}`;
      drafts.set(key, { ...b });
      return key;
    },

    save: (data: Omit<Beneficiary, "id" | "createdAt" | "updatedAt">, editId?: string) => {
      const now = Date.now();
      if (editId) {
        const next = list().map((b) =>
          b.id === editId ? { ...b, ...data, id: editId, updatedAt: now } : b,
        );
        persist(next);
        return editId;
      }
      const id = uid();
      persist([...list(), { ...data, id, createdAt: now, updatedAt: now }]);
      return id;
    },

    remove: (id: string) => persist(list().filter((b) => b.id !== id)),

    storageKey: KEY,
  };
};

export type BeneficiaryStore = ReturnType<typeof createBeneficiaryStore>;
