import { Switch } from '@headlessui/react';
import classNames from 'classnames';
import React from 'react';
import { buttonHighlightFocus, lineColorBackground } from '../../styles/general';
import { useDelimitatedRoute } from '../../utils/router';

interface ToggleSwitchProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  label: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, setEnabled, label }) => {
  const { line } = useDelimitatedRoute();

  return (
    <div className={'inline-flex'}>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={classNames(
          enabled ? lineColorBackground[line ?? 'DEFAULT'] : 'bg-gray-200',
          buttonHighlightFocus[line ?? 'DEFAULT'],
          'focus:ring-2focus:ring-offset-2 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none'
        )}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
          )}
        />
      </Switch>
      <div
        onClick={() => setEnabled(!enabled)}
        className={classNames(
          'text-design-subtitleGrey cursor-pointer self-center text-sm whitespace-nowrap'
        )}
      >
        &nbsp;
        {label}
        &nbsp;
      </div>
    </div>
  );
};
