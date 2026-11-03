/** Delay is counted in whole minutes, so it reads as hours and minutes, never seconds: "38m", "5h 20m". */
export const formatDelay = (minutes: number) => {
  const total = Math.round(Math.abs(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${String(rest).padStart(2, '0')}m` : `${hours}h`;
};

// Tick spacings in minutes, so the axis lands on round hours ("4h", "8h") rather than "200, 400".
const AXIS_STEPS = [15, 30, 60, 120, 180, 240, 360, 480, 600, 720, 1200, 1440, 2400, 3600, 6000];

/** Y-axis ticks for minute values: about five of them, on round times. */
export const delayAxisTicks = (maxMinutes: number) => ({
  stepSize: AXIS_STEPS.find((step) => maxMinutes / step <= 5) ?? AXIS_STEPS[AXIS_STEPS.length - 1],
  callback: (value: string | number) => formatDelay(Number(value)),
});
