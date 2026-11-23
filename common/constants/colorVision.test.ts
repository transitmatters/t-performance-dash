import { afterEach, describe, expect, it } from 'vitest';
import { useThemeStore } from '../state/themeStore';
import { SEVERITY_COLORS, severityPointStyle } from '../utils/chartTheme';
import { colorVisionPalette } from '../utils/colorVision';
import { patternFill } from '../utils/chartPatterns';
import { contrastRatio, hexWithAlpha } from '../utils/general';
import { WEATHER_BASE_COLORS } from '../../modules/weather/utils/weatherAnnotations';
import { TEMPERATURE_COLOR_STOPS } from '../../modules/weather/utils/temperatureDataset';
import { REASON_BY_KEY } from '../../modules/delays/constants/reasons';
import { COLORS, LINE_COLORS, LINE_COLORS_ON_DARK, LINE_TEXT_COLORS } from './colors';

// Machado, Oliveira & Fernandes (2009) at full severity, applied in linear sRGB.
const DEFICIENCIES = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};
type Deficiency = keyof typeof DEFICIENCIES;

const toLinear = (hex: string) =>
  [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

const simulate = (hex: string, deficiency: Deficiency) =>
  DEFICIENCIES[deficiency].map((row) => {
    const [r, g, b] = toLinear(hex);
    return Math.min(1, Math.max(0, row[0] * r + row[1] * g + row[2] * b));
  });

const toOklab = ([r, g, b]: number[]) => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

/** The closest two colors get in OKLab once seen with the deficiency; ~0.02 is barely noticeable. */
const minSeparation = (colors: string[], deficiency: Deficiency) => {
  const seen = colors.map((hex) => toOklab(simulate(hex, deficiency)));
  let min = Infinity;
  seen.forEach((a, i) =>
    seen.slice(i + 1).forEach((b) => {
      min = Math.min(min, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
    })
  );
  return min;
};

const setColorblind = (colorblind: boolean) => useThemeStore.setState({ colorblind });

afterEach(() => setColorblind(false));

describe('colorVisionPalette', () => {
  const palette = colorVisionPalette({ a: 'standard', b: 'shared' }, { a: 'colorblind' });

  it('reads the colorblind value only while colorblind mode is on', () => {
    expect(palette.a).toBe('standard');
    setColorblind(true);
    expect(palette.a).toBe('colorblind');
    expect(palette.b).toBe('shared');
  });

  it('follows the store toggle', () => {
    useThemeStore.getState().toggleColorblind();
    expect(palette.a).toBe('colorblind');
    useThemeStore.getState().toggleColorblind();
    expect(palette.a).toBe('standard');
  });
});

describe('colorblind mode', () => {
  const SUBWAY = ['line-red', 'line-orange', 'line-blue', 'line-green'] as const;
  const deficiencies = Object.keys(DEFICIENCIES) as Deficiency[];
  // Comfortably past noticeable, for colors that have to be told apart at a glance.
  const DISTINCT = 0.1;

  it.each(deficiencies)('keeps the subway lines apart with %s', (deficiency) => {
    const standard = minSeparation(
      SUBWAY.map((line) => LINE_COLORS[line]),
      deficiency
    );
    setColorblind(true);
    const colorblind = minSeparation(
      SUBWAY.map((line) => LINE_COLORS[line]),
      deficiency
    );
    expect(colorblind).toBeGreaterThanOrEqual(DISTINCT);
    expect(colorblind).toBeGreaterThanOrEqual(standard);
  });

  it.each(deficiencies)('keeps the severity ramp apart with %s', (deficiency) => {
    setColorblind(true);
    expect(minSeparation(Object.values(SEVERITY_COLORS), deficiency)).toBeGreaterThanOrEqual(
      DISTINCT
    );
  });

  it.each(deficiencies)('keeps the weather conditions apart with %s', (deficiency) => {
    setColorblind(true);
    expect(minSeparation(Object.values(WEATHER_BASE_COLORS), deficiency)).toBeGreaterThanOrEqual(
      DISTINCT
    );
  });

  it.each(deficiencies)('keeps the temperature stops apart with %s', (deficiency) => {
    setColorblind(true);
    const stops = TEMPERATURE_COLOR_STOPS.map(([, color]) => color);
    expect(minSeparation(stops, deficiency)).toBeGreaterThanOrEqual(DISTINCT);
  });

  it.each(deficiencies)('keeps the delay families apart with %s', (deficiency) => {
    setColorblind(true);
    // Each family's middle shade: the reasons within a family are meant to read as related.
    const families = [
      'door_problem',
      'power_problem',
      'track_work',
      'flooding',
      'medical_emergency',
      'other',
    ] as const;
    expect(
      minSeparation(
        families.map((key) => REASON_BY_KEY[key].color),
        deficiency
      )
    ).toBeGreaterThanOrEqual(0.08);
  });

  it('changes the colors it is meant to', () => {
    setColorblind(true);
    expect(LINE_COLORS['line-green']).not.toBe('#00843d');
    expect(COLORS.mbta.red).toBe(LINE_COLORS['line-red']);
    expect(LINE_COLORS['line-mattapan']).toBe(LINE_COLORS['line-red']);
    expect(LINE_COLORS['line-blue']).toBe('#003da5');
  });

  it('keeps line text readable on light and dark cards', () => {
    setColorblind(true);
    for (const line of SUBWAY) {
      expect(contrastRatio(LINE_TEXT_COLORS[line].light, '#ffffff'), line).toBeGreaterThan(4.5);
      expect(contrastRatio(LINE_TEXT_COLORS[line].dark, '#171717'), line).toBeGreaterThan(4.5);
      expect(contrastRatio(LINE_COLORS_ON_DARK[line], '#171717'), line).toBeGreaterThan(4.5);
    }
  });

  it('holds the temperature ramp at 3:1 on light and dark cards', () => {
    setColorblind(true);
    for (const [, color] of TEMPERATURE_COLOR_STOPS) {
      expect(contrastRatio(color, '#ffffff'), color).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(color, '#171717'), color).toBeGreaterThanOrEqual(3);
    }
  });

  it('gives each severity its own point shape, only in colorblind mode', () => {
    expect(severityPointStyle('off50')).toBe('circle');
    setColorblind(true);
    const shapes = (['onTime', 'off25', 'off50', 'off100'] as const).map(severityPointStyle);
    expect(new Set(shapes).size).toBe(4);
    expect(severityPointStyle(undefined)).toBe('circle');
  });

  it('fades a dimmed solid fill like a patterned one', () => {
    expect(patternFill('#1d5fb0', 'solid')).toBe('#1d5fb0');
    expect(patternFill('#1d5fb0', 'solid', 0.3)).toBe(hexWithAlpha('#1d5fb0', 0.3));
  });
});
