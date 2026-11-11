import { useId } from 'react';
import classNames from 'classnames';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { lineColorVar } from '../../styles/general';
import { useDelimitatedRoute } from '../../utils/router';

interface ToggleSwitchProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  label: string;
  /** For a switch on a line-colored header, where a line-colored track would vanish. */
  onLineColor?: boolean;
}

export const ToggleSwitch = ({
  enabled,
  setEnabled,
  label,
  onLineColor = false,
}: ToggleSwitchProps) => {
  const { line } = useDelimitatedRoute();
  const id = useId();

  return (
    <div className="inline-flex items-center gap-x-2">
      <Switch
        id={id}
        checked={enabled}
        onCheckedChange={setEnabled}
        style={onLineColor ? undefined : lineColorVar(line)}
        className={
          onLineColor
            ? 'data-[state=checked]:bg-white/60 data-[state=unchecked]:bg-black/25'
            : 'data-[state=checked]:bg-(--line-color)'
        }
      />
      <Label
        htmlFor={id}
        className={classNames(
          'cursor-pointer text-sm whitespace-nowrap',
          // On the header, take its text colour: dark on bus yellow, white elsewhere.
          onLineColor ? 'font-medium text-current' : 'text-stone-500'
        )}
      >
        {label}
      </Label>
    </div>
  );
};
