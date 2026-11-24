import { useThemeStore } from '../state/themeStore';

export const isColorblindMode = () => useThemeStore.getState().colorblind;

/**
 * A palette that reads its colorblind-mode values while that setting is on, and the standard ones
 * otherwise. It is looked up on every access, so the many charts that index palettes like
 * `LINE_COLORS` directly pick up the setting without each subscribing to the store. React Compiler
 * memoizes what's computed from them, so whatever draws with these is keyed on
 * useColorVisionKey and remounts when the setting changes.
 *
 * Don't copy a value out at module load (`const RED = LINE_COLORS['line-red']`): that freezes it.
 */
export const colorVisionPalette = <T extends object>(standard: T, colorblind: Partial<T>): T =>
  new Proxy(standard, {
    get: (target, key, receiver) =>
      isColorblindMode() && Object.hasOwn(colorblind, key)
        ? Reflect.get(colorblind, key)
        : Reflect.get(target, key, receiver),
  });

/**
 * A React key that changes with colorblind mode. The page, the sidebar's nav, and the command
 * palette take it.
 */
export const useColorVisionKey = () =>
  useThemeStore((state) => (state.colorblind ? 'colorblind' : 'standard'));
