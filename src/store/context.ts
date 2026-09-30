import { createContext, useContext } from "solid-js";
import type { Context } from "solid-js";
import type { AppStore } from "./appStore";
import type { AttestStore } from "./attestStore";
import type { BeneficiaryStore } from "./beneficiaryStore";
import type { BoardStore } from "./boardStore";
import type { IdPrintStore } from "./idPrintStore";
import type { PhotoStore } from "./photoStore";
import type { ThemeStore } from "./themeStore";

export const AppCtx = createContext<AppStore>();
export const ThemeCtx = createContext<ThemeStore>();
export const BeneficiaryCtx = createContext<BeneficiaryStore>();
export const AttestCtx = createContext<AttestStore>();
export const IdPrintCtx = createContext<IdPrintStore>();
export const PhotoCtx = createContext<PhotoStore>();
export const BoardCtx = createContext<BoardStore>();

function need<T>(ctx: Context<T | undefined>, name: string): T {
  const v = useContext(ctx);
  if (!v) throw new Error(`${name} store not provided`);
  return v;
}

export const useApp = (): AppStore => need(AppCtx, "App");
export const useTheme = (): ThemeStore => need(ThemeCtx, "Theme");
export const useBeneficiaries = (): BeneficiaryStore => need(BeneficiaryCtx, "Beneficiary");
export const useAttest = (): AttestStore => need(AttestCtx, "Attest");
export const useIdPrint = (): IdPrintStore => need(IdPrintCtx, "IdPrint");
export const usePhoto = (): PhotoStore => need(PhotoCtx, "Photo");
export const useBoard = (): BoardStore => need(BoardCtx, "Board");
