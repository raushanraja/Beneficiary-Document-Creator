import { Show } from "solid-js";
import { useApp, useAttest, useBeneficiaries, useBoard, useIdPrint, usePhoto, useTheme } from "~/store/context";
import { storageFootprint } from "~/lib/images";

export const StatusBar = () => {
  const app = useApp();
  const theme = useTheme();
  const ben = useBeneficiaries();
  const attest = useAttest();
  const idp = useIdPrint();
  const photo = usePhoto();
  const board = useBoard();

  const counts = () => {
    switch (app.view()) {
      case "beneficiaries":
      case "beneficiary-new":
      case "beneficiary-detail":
        return `${ben.list().length} files`;
      case "attest":
      case "attestation":
        return `${attest.images().length} scans`;
      case "idprint":
        return `${idp.images().length} cards`;
      case "photogrid":
        return photo.src() ? `×${photo.count()} ${photo.size().label}` : "no photo";
      case "board":
        return `${board.images().length} images`;
      default:
        return "ready";
    }
  };

  const kb = () =>
    storageFootprint([
      ben.storageKey,
      "printstudio.idprint.v1",
      "printstudio.board.v1",
    ]);

  return (
    <footer class="flex h-7 shrink-0 items-center justify-between gap-3 border-t border-edge bg-header px-3 font-mono text-[10px] uppercase tracking-[0.05em] text-fg-dim">
      <div class="flex min-w-0 items-center gap-3">
        <span class="truncate text-fg-muted">{app.view()} · {counts()}</span>
        <span class="hidden md:inline">{kb()} KB stored</span>
      </div>
      <div class="flex shrink-0 items-center gap-3">
        <button type="button" class="chip" onClick={() => app.openModal("shortcuts")}>
          ? Keys
        </button>
        <Show when={!app.dockOpen()}>
          <button type="button" class="chip lg:hidden" onClick={() => app.setDockOpen(true)}>
            Preview
          </button>
        </Show>
        <span class="hidden sm:inline">{theme.name()}</span>
        <span class="flex items-center gap-1.5">
          <span class="size-1.5 rounded-full bg-success" aria-hidden="true" />
          Local
        </span>
      </div>
    </footer>
  );
};
