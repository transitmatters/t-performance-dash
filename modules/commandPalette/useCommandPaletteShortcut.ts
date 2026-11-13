import { useEffect } from 'react';
import { useCommandPaletteStore } from './store';

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);

/** How the shortcut is written on this platform: "⌘K" on Apple devices, "Ctrl K" elsewhere. */
export const shortcutLabel = () => (isMac() ? '⌘K' : 'Ctrl K');

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * Cmd/Ctrl+K toggles the palette from anywhere, and "/" opens it when you aren't typing. Cmd/Ctrl+B
 * stays with the sidebar.
 */
export const useCommandPaletteShortcut = () => {
  const toggle = useCommandPaletteStore((state) => state.toggle);
  const setOpen = useCommandPaletteStore((state) => state.setOpen);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      } else if (
        event.key === '/' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isTyping(event.target)
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle, setOpen]);
};
