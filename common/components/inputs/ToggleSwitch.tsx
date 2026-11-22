import { useId } from 'react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { lineColorVar } from '../../styles/general';
import type { LineColorKey } from '../../types/lines';

interface ToggleSwitchProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  label: string;
  colorKey: LineColorKey | undefined;
}

export const ToggleSwitch = ({ enabled, setEnabled, label, colorKey }: ToggleSwitchProps) => {
  const id = useId();

  return (
    <div className="inline-flex items-center gap-x-2">
      <Switch
        id={id}
        checked={enabled}
        onCheckedChange={setEnabled}
        style={lineColorVar(colorKey)}
        className="data-[state=checked]:bg-(--line-color)"
      />
      <Label
        htmlFor={id}
        className="cursor-pointer text-sm whitespace-nowrap text-stone-600 dark:text-stone-300"
      >
        {label}
      </Label>
    </div>
  );
};
