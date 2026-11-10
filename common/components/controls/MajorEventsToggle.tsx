import { useMajorEventsStore } from '../../state/majorEventsStore';
import { ToggleSwitch } from '../inputs/ToggleSwitch';

/**
 * Turns the major-event markers on every date-range chart on or off, remembered per browser.
 * It sits in the line-colored header on desktop and the line-colored control bar on mobile.
 */
export const MajorEventsToggle = () => {
  const showEvents = useMajorEventsStore((state) => state.showEvents);
  const setShowEvents = useMajorEventsStore((state) => state.setShowEvents);
  return (
    <ToggleSwitch
      enabled={showEvents}
      setEnabled={setShowEvents}
      label="Show major events"
      onLineColor
    />
  );
};
