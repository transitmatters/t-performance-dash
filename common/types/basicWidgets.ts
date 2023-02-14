import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

export interface WidgetValueInterface {
  value?: number;
  delta?: number;

  getUnits: () => string;
  getFormattedValue: () => string;
  getFormattedDelta: () => string;
}

// This will eventually include the logic of the analysis (past week, since last Weds, etc.)
export class TimeWidgetValue implements WidgetValueInterface {
  value?: number | undefined;
  delta?: number | undefined;
  constructor(value: number | undefined, delta: number | undefined) {
    this.value = value;
    this.delta = delta;
  }

  getUnits() {
    if (typeof this.value === 'undefined') return '...';
    const secondsAbs = Math.abs(this.value);
    switch (true) {
      case secondsAbs < 99:
        return 'sec';
      case secondsAbs < 3600:
        return 'min.';
      default:
        return 'hrs.';
    }
  }

  getFormattedValue() {
    if (typeof this.value === 'undefined') return '...';
    const absValue = Math.abs(this.value);
    switch (true) {
      case absValue < 90:
        return absValue.toFixed(0);
      case absValue < 3600:
        return dayjs.duration(absValue, 'seconds').format('m:ss');
      default:
        return (absValue / 3600).toFixed(2);
    }
  }
  getFormattedDelta() {
    if (typeof this.value === 'undefined' || typeof this.delta === 'undefined') return '...';
    const absValue = Math.abs(this.value);
    const absDelta = Math.abs(this.delta);
    const sign = this.delta >= 0 ? '+' : '-';
    switch (true) {
      case absValue < 90:
        return `${sign}${absDelta}`;
      case absValue < 3600:
        return `${sign}${dayjs.duration(absDelta, 'seconds').format('m:ss')}`;
      default:
        return `${sign}${(absDelta / 3600).toFixed(2)}`;
    }
  }
}
export class SZWidgetValue implements WidgetValueInterface {
  value?: number | undefined;
  delta?: number | undefined;
  constructor(value: number | undefined, delta: number | undefined) {
    this.value = value;
    this.delta = delta;
  }
  getUnits() {
    return 'Zones';
  }
  getFormattedValue() {
    if (typeof this.value === 'undefined') return '...';
    return Math.abs(this.value).toString();
  }
  getFormattedDelta() {
    if (typeof this.delta === 'undefined') return '...';
    return `${this.delta >= 0 ? '+' : '-'}${Math.abs(this.delta).toString()}`;
  }
}

export class PercentageWidgetValue implements WidgetValueInterface {
  value?: number | undefined;
  delta?: number | undefined;
  constructor(value: number | undefined, delta: number | undefined) {
    this.value = value;
    this.delta = delta;
  }
  getUnits() {
    return '%';
  }

  getFormattedValue() {
    if (this.value === undefined) return '...';
    return Math.round(100 * this.value).toString();
  }

  getFormattedDelta() {
    if (this.delta === undefined) return '...';
    return `${this.delta >= 0 ? '+' : '-'}${Math.round(100 * this.delta).toString()}%`;
  }
}

export class TripsWidgetValue implements WidgetValueInterface {
  value?: number | undefined;
  delta?: number | undefined;
  constructor(value: number | undefined, delta: number | undefined) {
    this.value = value;
    this.delta = delta;
  }
  getUnits() {
    return 'daily trips';
  }

  getFormattedValue() {
    if (this.value === undefined) return '...';
    return Math.abs(this.value).toString();
  }

  getFormattedDelta() {
    if (this.delta === undefined) return '...';
    return `${this.delta >= 0 ? '+' : '-'}${Math.abs(this.delta).toString()}`;
  }
}
