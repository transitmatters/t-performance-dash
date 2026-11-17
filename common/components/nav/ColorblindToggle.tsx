import { Eye } from 'lucide-react';
import { useThemeStore } from '../../state/themeStore';
import { Button } from '../ui/button';

/** Turns colorblind mode on or off: colors that don't lean on telling red from green. */
export const ColorblindToggle = () => {
  const colorblind = useThemeStore((state) => state.colorblind);
  const toggle = useThemeStore((state) => state.toggleColorblind);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-pressed={colorblind}
      className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
    >
      <Eye />
      <span>Colorblind mode: {colorblind ? 'on' : 'off'}</span>
    </Button>
  );
};
