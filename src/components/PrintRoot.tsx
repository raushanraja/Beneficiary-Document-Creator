import { Match, Switch } from "solid-js";
import { useApp, useAttest, useBeneficiaries, useBoard, useIdPrint, usePhoto } from "~/store/context";
import { AttestationSheet, BeneficiarySheet, BoardSheet, IdSheet, PhotoSheet } from "./sheets";

/**
 * Print-only root. Display:none on screen; the only thing visible in
 * @media print (see index.css). Renders the sheet for the current view.
 */
export const PrintRoot = () => {
  const app = useApp();
  const ben = useBeneficiaries();
  const attest = useAttest();
  const idp = useIdPrint();
  const photo = usePhoto();
  const board = useBoard();

  return (
    <div id="print-root" aria-hidden="true">
      <Switch fallback={null}>
        <Match when={app.view() === "beneficiary-detail" && ben.byId(app.activeBeneficiaryId())}>
          <BeneficiarySheet b={ben.byId(app.activeBeneficiaryId())!} />
        </Match>
        <Match when={(app.view() === "attest" || app.view() === "attestation") && attest.images().length > 0}>
          <AttestationSheet images={attest.images()} watermark={attest.watermark()} />
        </Match>
        <Match when={app.view() === "idprint" && idp.images().length > 0}>
          <IdSheet
            title={idp.title()}
            showTitle={idp.showTitle()}
            images={idp.images()}
            twoUp={idp.twoUp()}
            guides={idp.guides()}
            caption={idp.caption()}
          />
        </Match>
        <Match when={app.view() === "photogrid" && photo.src()}>
          <PhotoSheet src={photo.src()!} size={photo.size()} count={photo.count()} gap={photo.gap()} />
        </Match>
        <Match when={app.view() === "board" && board.images().length > 0}>
          <BoardSheet
            title={board.title()}
            showTitle={board.showTitle()}
            images={board.images()}
            cols={board.cols()}
            gapMm={board.gapMm()}
            captions={board.captions()}
          />
        </Match>
      </Switch>
    </div>
  );
};
