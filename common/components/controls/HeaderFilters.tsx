import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';

interface FilterSlotStore {
  node: HTMLElement | null;
  setNode: (node: HTMLElement | null) => void;
}

const useFilterSlot = create<FilterSlotStore>((set) => ({
  node: null,
  setNode: (node) => set({ node }),
}));

/** Where page-wide filters render: the header's control bar, or the mobile controls sheet. */
export const HeaderFilterSlot = ({ className }: { className?: string }) => {
  const setNode = useFilterSlot((state) => state.setNode);
  return <div ref={setNode} className={className} />;
};

/**
 * Renders a page's filter in the header, beside the dates. The page keeps the filter's state, so
 * it lives next to the charts it changes; only the control moves.
 */
export const HeaderFilter = ({ label, children }: { label: string; children: ReactNode }) => {
  const node = useFilterSlot((state) => state.node);
  if (!node) return null;
  return createPortal(
    <div
      role="group"
      aria-label={label}
      className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-2"
    >
      <span
        aria-hidden
        className="text-xs font-semibold tracking-wide text-stone-600 uppercase dark:text-stone-400"
      >
        {label}
      </span>
      <div className="md:shrink-0">{children}</div>
    </div>,
    node
  );
};
