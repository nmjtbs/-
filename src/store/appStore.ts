import type { ApiMeta } from "../api/contracts/common";
import type { DashboardContextContract } from "../api/contracts/dashboard";
import { create } from "zustand";

interface AppState {
  layoutContext: DashboardContextContract | null;
  layoutMeta: ApiMeta | null;
  setLayoutState: (
    context: DashboardContextContract,
    meta: ApiMeta,
  ) => void;
  clearLayoutState: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  layoutContext: null,
  layoutMeta: null,
  setLayoutState: (layoutContext, layoutMeta) =>
    set({ layoutContext, layoutMeta }),
  clearLayoutState: () => set({ layoutContext: null, layoutMeta: null }),
}));
