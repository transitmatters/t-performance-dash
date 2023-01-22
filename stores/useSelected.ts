import { create } from 'zustand';
import { LineMetadata, LINE_OBJECTS } from '../constants/lines';

interface SelectedStore {
  line: LineMetadata;
  setLine: (line: LineMetadata) => void;
}

export const useSelectedStore = create<SelectedStore>((set) => ({
  line: LINE_OBJECTS.RL,
  setLine: (line) => set({ line }),
}));
