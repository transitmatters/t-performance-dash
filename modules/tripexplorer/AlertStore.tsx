import { create } from 'zustand';
import { AlertForModal } from '../../common/types/alerts';

export interface AlertStore {
  alerts: AlertForModal[] | undefined;
  bears: number;
  increasePopulation: any;
  setAlerts: (alerts: AlertForModal[] | undefined) => void;
  changeAlertApplied: (alerts: AlertForModal[] | undefined, index: number) => void;
  getAppliedAlerts: () => AlertForModal[] | undefined;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  setAlerts: (alerts) => set(() => ({ alerts: alerts })),
  changeAlertApplied: (alerts, index) => {
    // const alerts = get().alerts;
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
