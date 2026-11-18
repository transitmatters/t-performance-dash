import type { Day } from './day';
import {
  ALERT,
  BENCHMARK,
  END,
  GAP,
  SNOW,
  START,
  STATUS,
  clockText,
  durationText,
  temperature,
} from './day';

// Draws one frame of the made-up day in the page's theme: trips against the benchmark, then the
// alert, weather and temperature tracks the dashboard draws under its trip charts.

/** Real time (ms) to time of day: quick through early morning, slow through the bad stretch. */
const KEYS: [number, number][] = [
  [0, START],
  [3500, 450],
  [14500, 640],
  [20000, END],
];
export const PLAY_MS = 20000;
export const HOLD_MS = 6500;
export const FADE_MS = 700;
/** Between these, the clock runs in slow motion. */
export const SLOW_MOTION_MS: [number, number] = [KEYS[1][0], KEYS[2][0]];

const lerp = (v: number, from: 0 | 1, to: 0 | 1) => {
  for (let i = 1; i < KEYS.length; i++) {
    if (v <= KEYS[i][from]) {
      const [a, b] = [KEYS[i - 1], KEYS[i]];
      return a[to] + ((b[to] - a[to]) * (v - a[from])) / (b[from] - a[from]);
    }
  }
  return KEYS[KEYS.length - 1][to];
};
export const minuteAt = (ms: number) => lerp(ms, 0, 1);
const msAt = (minute: number) => lerp(minute, 1, 0);

/** The colors for one theme. Trip dots use the trip charts' own severity colors in both. */
export interface Palette {
  /** The theme's text color at an opacity, for grid, ticks and labels. */
  ink: (alpha: number) => string;
  strong: string;
  benchmarkFill: string;
  benchmarkLine: string;
  trail: string;
  /** The alert band, and the gap bracket that goes with it. */
  alert: string;
  alertText: string;
  snow: string;
  snowText: string;
  freezing: string;
  freezingText: string;
  temperature: string;
}

export const LIGHT_PALETTE: Palette = {
  ink: (alpha) => `rgba(28,25,23,${alpha})`,
  strong: '#1c1917',
  benchmarkFill: 'rgba(160,160,160,0.16)',
  benchmarkLine: 'rgba(87,83,78,0.5)',
  trail: '#ed8b00',
  alert: '#facc15',
  alertText: '#92400e',
  snow: 'rgba(96,165,250,0.55)',
  snowText: '#1e3a8a',
  freezing: 'rgba(37,99,235,0.4)',
  freezingText: '#2563eb',
  temperature: '#ea580c',
};

export const DARK_PALETTE: Palette = {
  ink: (alpha) => `rgba(243,246,250,${alpha})`,
  strong: '#f3f6fa',
  benchmarkFill: 'rgba(232,232,232,0.08)',
  benchmarkLine: 'rgba(232,232,232,0.4)',
  trail: '#ff9a1f',
  alert: '#facc15',
  alertText: '#facc15',
  snow: 'rgba(147,197,253,0.8)',
  snowText: '#0d141d',
  freezing: 'rgba(147,197,253,0.35)',
  freezingText: 'rgba(147,197,253,0.7)',
  temperature: '#fb923c',
};
const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";
const TOP_SECONDS = 1860;
const LOW_SECONDS = 420;
const PLOT_TOP = 10;

export interface Layout {
  width: number;
  height: number;
  phone: boolean;
  /** Left gutter for the axis labels. */
  gutter: number;
  plotHeight: number;
  tracksTop: number;
  axisY: number;
  sans: string;
}

export const layoutFor = (width: number, sans: string): Layout => {
  const phone = width < 560;
  const plotHeight = phone ? 170 : 230;
  const tracksTop = PLOT_TOP + plotHeight + 32;
  return {
    width,
    phone,
    gutter: phone ? 54 : 66,
    plotHeight,
    tracksTop,
    axisY: tracksTop + 92,
    height: tracksTop + 92 + 22,
    sans,
  };
};

export const scales = (l: Layout) => ({
  x: (minute: number) => l.gutter + ((minute - START) / (END - START)) * (l.width - l.gutter - 6),
  y: (seconds: number) =>
    PLOT_TOP +
    l.plotHeight -
    ((Math.min(seconds, TOP_SECONDS) - LOW_SECONDS) / (TOP_SECONDS - LOW_SECONDS)) * l.plotHeight,
  plotBottom: PLOT_TOP + l.plotHeight,
});

export interface Frame {
  /** Time of day the playhead has reached. */
  minute: number;
  /** 1 while drawing, falling to 0 as the loop fades out. */
  fade: number;
  /** Real ms since the play started, or null when the whole day is shown at once. */
  elapsed: number | null;
}

/** Where the animation is `elapsed` ms after it started, and whether it's time to loop. */
export const frameAt = (elapsed: number): Frame & { done: boolean } => {
  if (elapsed < PLAY_MS) return { minute: minuteAt(elapsed), fade: 1, elapsed, done: false };
  const hold = elapsed - PLAY_MS - HOLD_MS;
  return {
    minute: END,
    fade: hold <= 0 ? 1 : Math.max(0, 1 - hold / FADE_MS),
    elapsed: null,
    done: hold >= FADE_MS,
  };
};

export const STILL: Frame = { minute: END, fade: 1, elapsed: null };

export function drawFrame(
  c: CanvasRenderingContext2D,
  l: Layout,
  day: Day,
  frame: Frame,
  p: Palette,
  hover?: { x: number; y: number }
) {
  const { x: X, y: Y, plotBottom } = scales(l);
  const { minute: play, fade, elapsed } = frame;
  const right = l.width - 6;
  const plotWidth = right - l.gutter;
  // How long ago (real ms) the playhead passed a trip; still frames show every trip settled.
  const age = (minute: number) => (elapsed === null ? Infinity : elapsed - msAt(minute));
  const font = (weight: number, size: number, family = l.sans) => `${weight} ${size}px ${family}`;
  const rows = { alerts: l.tracksTop, weather: l.tracksTop + 26, temp: l.tracksTop + 52 };
  const tempY = (f: number) => rows.temp + 30 - ((f - 20) / 20) * 30;

  c.clearRect(0, 0, l.width, l.height);
  c.textBaseline = 'middle';

  // Grid and y axis.
  c.font = font(500, l.phone ? 10 : 11, MONO);
  c.textAlign = 'right';
  for (const seconds of [600, 1200, 1800]) {
    const y = Y(seconds);
    c.fillStyle = p.ink(0.07);
    c.fillRect(l.gutter, y, plotWidth, 1);
    c.fillStyle = p.ink(0.5);
    c.fillText(`${seconds / 60} min`, l.gutter - 8, y);
  }

  // The benchmark band and line.
  const benchY = Y(BENCHMARK);
  c.fillStyle = p.benchmarkFill;
  c.fillRect(X(START), benchY, X(END) - X(START), plotBottom - benchY);
  c.strokeStyle = p.benchmarkLine;
  c.setLineDash([4, 4]);
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(X(START), benchY + 0.5);
  c.lineTo(X(END), benchY + 0.5);
  c.stroke();
  c.setLineDash([]);

  // The gap in service, once it has passed.
  if (play > GAP[1]) {
    const [xa, xb, y] = [X(GAP[0]) + 2, X(GAP[1]) - 2, plotBottom + 6];
    c.globalAlpha = fade;
    c.strokeStyle = p.alertText;
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(xa, y - 4);
    c.lineTo(xa, y);
    c.lineTo(xb, y);
    c.lineTo(xb, y - 4);
    c.stroke();
    c.textAlign = 'left';
    c.fillStyle = p.alertText;
    c.font = font(700, l.phone ? 10.5 : 11.5);
    c.fillText(l.phone ? 'No trains, 24 min' : 'No trains for 24 minutes', xb + 6, y + 1);
    c.globalAlpha = 1;
  }

  // Trips: a connected trail, like the trip charts, then the dots.
  const shown = day.trips.filter((t) => age(t.minute) >= 0);
  c.globalAlpha = 0.55 * fade;
  c.strokeStyle = p.trail;
  c.lineWidth = 1.75;
  c.lineJoin = 'round';
  c.beginPath();
  shown.forEach((t, i) =>
    i ? c.lineTo(X(t.minute), Y(t.seconds)) : c.moveTo(X(t.minute), Y(t.seconds))
  );
  c.stroke();
  c.globalAlpha = fade;
  const radius = l.phone ? 2.8 : 3.4;
  for (const t of shown) {
    const a = age(t.minute);
    const [x, y] = [X(t.minute), Y(t.seconds)];
    const pop = a < 420 ? (a < 180 ? (a / 180) * 1.7 : 1.7 - 0.7 * ((a - 180) / 240)) : 1;
    // A late trip rings out as it lands.
    if (t.status !== 'ok' && a < 1100) {
      const q = a / 1100;
      c.strokeStyle = STATUS[t.status].color;
      c.globalAlpha = (1 - q) * fade;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(x, y, 4 + q * 20, 0, Math.PI * 2);
      c.stroke();
      c.globalAlpha = fade;
    }
    c.fillStyle = STATUS[t.status].color;
    c.beginPath();
    c.arc(x, y, (t.status === 'ok' ? radius : radius + 1) * pop, 0, Math.PI * 2);
    c.fill();
  }
  c.globalAlpha = 1;

  // Context tracks.
  c.font = font(500, l.phone ? 9.5 : 11);
  c.textAlign = 'right';
  c.fillStyle = p.ink(0.6);
  c.fillText('Alerts', l.gutter - 8, rows.alerts + 8);
  c.fillText('Weather', l.gutter - 8, rows.weather + 8);
  c.fillText('Temp', l.gutter - 8, rows.temp + 15);
  c.fillStyle = p.ink(0.06);
  c.fillRect(l.gutter, rows.alerts + 8, plotWidth, 1);
  c.fillRect(l.gutter, rows.weather + 8, plotWidth, 1);
  const band = ([from, to]: [number, number], y: number, color: string) => {
    if (play <= from) return null;
    const [xa, xb] = [X(from), X(Math.min(play, to))];
    c.fillStyle = color;
    c.beginPath();
    c.roundRect(xa, y + 1, Math.max(2, xb - xa), 14, 4);
    c.fill();
    return [xa, xb];
  };
  const alert = band(ALERT, rows.alerts, p.alert);
  if (alert && play > ALERT[0] + 4) {
    c.fillStyle = p.alertText;
    c.font = font(600, l.phone ? 10.5 : 11.5);
    c.textAlign = 'left';
    c.fillText(
      l.phone ? 'Disabled train' : 'Disabled train at Wellington',
      alert[1] + 8,
      rows.alerts + 8
    );
  }
  const snow = band(SNOW, rows.weather, p.snow);
  if (snow && snow[1] - snow[0] > 44) {
    c.fillStyle = p.snowText;
    c.font = font(700, l.phone ? 10 : 11);
    c.textAlign = 'left';
    c.fillText(play >= SNOW[1] ? 'Snow, 3 in.' : 'Snow', snow[0] + 7, rows.weather + 8);
  }

  // Temperature, with freezing marked.
  c.strokeStyle = p.freezing;
  c.setLineDash([3, 3]);
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(l.gutter, tempY(32));
  c.lineTo(right, tempY(32));
  c.stroke();
  c.setLineDash([]);
  c.fillStyle = p.freezingText;
  c.font = font(500, l.phone ? 9.5 : 10.5, MONO);
  c.textAlign = 'right';
  c.fillText('32°F', l.width - 8, tempY(32) - 7);
  c.strokeStyle = p.temperature;
  c.lineWidth = 2;
  c.beginPath();
  for (let m = START; m <= play; m += 4) {
    if (m === START) c.moveTo(X(m), tempY(temperature(m)));
    else c.lineTo(X(m), tempY(temperature(m)));
  }
  c.stroke();
  if (play > day.lowMinute + 15) {
    const [x, y] = [X(day.lowMinute), tempY(temperature(day.lowMinute))];
    c.fillStyle = p.temperature;
    c.beginPath();
    c.arc(x, y, 3.5, 0, Math.PI * 2);
    c.fill();
    c.font = font(700, l.phone ? 10 : 11);
    c.textAlign = 'left';
    c.fillText(`Low ${day.low}°F`, x + 7, y + 1);
  }

  // Time axis.
  c.fillStyle = p.ink(0.12);
  c.fillRect(l.gutter, l.axisY, plotWidth, 1);
  c.font = font(500, l.phone ? 10 : 11, MONO);
  c.fillStyle = p.ink(0.55);
  c.textAlign = 'center';
  for (let m = 360; m <= 1440; m += l.phone ? 360 : 180) {
    c.fillText(clockText(m).replace(':00', ''), X(m), l.axisY + 13);
  }

  // Playhead.
  if (play < END) {
    const x = X(play);
    const glow = c.createLinearGradient(x - 70, 0, x, 0);
    glow.addColorStop(0, p.ink(0));
    glow.addColorStop(1, p.ink(0.07));
    c.fillStyle = glow;
    c.fillRect(x - 70, PLOT_TOP, 70, l.axisY - PLOT_TOP);
    c.fillStyle = p.ink(0.75);
    c.fillRect(x, PLOT_TOP, 1.5, l.axisY - PLOT_TOP);
  }

  // The worst trip, labeled once it has run.
  if (play >= day.worst.minute + 6 && fade > 0.02) {
    c.globalAlpha = fade;
    c.fillStyle = p.strong;
    c.font = font(700, l.phone ? 11 : 12);
    c.textAlign = 'left';
    c.fillText(
      `${durationText(day.worst.seconds)} trip`,
      X(day.worst.minute) + 10,
      Y(day.worst.seconds) + 1
    );
    c.globalAlpha = 1;
  }

  if (hover) {
    c.strokeStyle = p.strong;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(hover.x, hover.y, 6, 0, Math.PI * 2);
    c.stroke();
  }
}
