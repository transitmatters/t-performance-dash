import { create } from 'zustand';
import type { AlertForModal } from '../../common/types/alerts';

interface AlertStore {
  alerts: AlertForModal[] | undefined;
  setAlerts: (alerts: AlertForModal[] | undefined) => void;
  changeAlertApplied: (alerts: AlertForModal[] | undefined, index: number) => void;
  getAppliedAlerts: () => AlertForModal[] | undefined;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  setAlerts: (alerts) => set(() => ({ alerts: alerts })),
  changeAlertApplied: (alerts, index) => {
    if (!alerts)
      return set(() => ({
        alerts: undefined,
      }));
    alerts[index].applied = !alerts[index].applied;
    const newAlerts = [...alerts];
    return set(() => ({
      alerts: newAlerts,
    }));
  },
  getAppliedAlerts: () => {
    return get().alerts?.filter((alert) => alert.applied);
  },
}));
