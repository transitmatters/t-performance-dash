import { create } from 'zustand';
import type { HistoricalAlert } from '../../common/types/alerts';

interface AlertStore {
  // Undefined until the day's alerts load, or when they fail to
  alerts: HistoricalAlert[] | undefined;
  isLoading: boolean;
  setAlerts: (alerts: HistoricalAlert[] | undefined, isLoading: boolean) => void;
}

/** The selected day's service alerts, shared by every chart's context track. */
export const useAlertStore = create<AlertStore>((set) => ({
  alerts: undefined,
  isLoading: false,
  setAlerts: (alerts, isLoading) => set({ alerts, isLoading }),
}));
