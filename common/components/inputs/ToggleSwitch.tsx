import { useId } from 'react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { lineColorVar } from '../../styles/general';
import { useDelimitatedRoute } from '../../utils/router';

interface ToggleSwitchProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  label: string;
}

export const ToggleSwitch = ({ enabled, setEnabled, label }: ToggleSwitchProps) => {
  const { line } = useDelimitatedRoute();
  const id = useId();

  return (
    <div className="inline-flex items-center gap-x-2">
      <Switch
        id={id}
        checked={enabled}
        onCheckedChange={setEnabled}
        style={lineColorVar(line)}
        className="data-[state=checked]:bg-(--line-color)"
      />
      <Label htmlFor={id} className="cursor-pointer text-sm whitespace-nowrap text-stone-500">
        {label}
      </Label>
    </div>
  );
};
