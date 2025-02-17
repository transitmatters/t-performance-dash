import React from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { getFormattedTimeValue, getTimeUnit } from '../utils/time';
import { WidgetText } from '../components/widgets/internal/WidgetText';
import { UnitText } from '../components/widgets/internal/UnitText';

dayjs.extend(duration);

export interface WidgetValueInterface {
  readonly value?: number;
  readonly delta?: number;
  readonly percentChange?: number;

  getUnits: () => string;
  getFormattedValue: (isLarge?: boolean) => React.ReactNode;
  getFormattedDelta: () => string;
  getFormattedPercentChange: () => string;
}

class BaseWidgetValue {
  value?: number | undefined;
  delta?: number | undefined;
  percentChange?: number | undefined;

  constructor(value: number | undefined, delta?: number | undefined) {
    this.value = value;
    this.delta = delta;
    this.percentChange =
      typeof this.value === 'number' && typeof this.delta === 'number'
        ? 100 * (this.value / (this.value - this.delta) - 1)
        : undefined;
  }

  getFormattedPercentChange() {
    if (typeof this.percentChange === 'undefined') return '...';
    const sign = this.percentChange >= 0 ? '+' : '';
    return `${sign}${Math.floor(this.percentChange)}%`;
  }
}

export class DeltaTimeWidgetValue extends BaseWidgetValue implements WidgetValueInterface {
  getUnits() {
    if (this.delta === undefined) return '...';
    return getTimeUnit(this.delta);
  }
  getFormattedValue(isLarge?: boolean) {
    if (this.delta === undefined) return '...';
    return getFormattedTimeValue(this.delta, isLarge);
  }
  getFormattedDelta() {
    new Error('DeltaWidgets should use `getFormattedValue`');
    return 'invalid';
  }
}

export class DeltaZonesWidgetValue extends BaseWidgetValue implements WidgetValueInterface {
  getUnits() {
    return 'zones';
  }
  getFormattedValue(isLarge?: boolean) {
    if (this.delta === undefined) return '...';
    return (
      <p>
        <WidgetText
          isLarge={isLarge}
          text={`${this.delta >= 0 ? '+' : '-'}${Math.abs(this.delta)}`}
        />{' '}
        <UnitText isLarge={isLarge} text={this.getUnits()} />
      </p>
    );
  }
  getFormattedDelta() {
    new Error('DeltaWidgets should use `getFormattedValue`');
    return 'invalid';
  }
}

// This will eventually include the logic of the analysis (past week, since last Weds, etc.)
export class TimeWidgetValue extends BaseWidgetValue implements WidgetValueInterface {
  getUnits() {
    if (this.value === undefined) return '...';
    return getTimeUnit(this.value);
  }

  getFormattedValue(isLarge?: boolean) {
    if (this.value === undefined) return '...';
    return getFormattedTimeValue(this.value, isLarge);
  }

  getFormattedDelta() {
    if (typeof this.value === 'undefined' || typeof this.delta === 'undefined') return '...';
    const absValue = Math.abs(this.value);
    const absDelta = Math.abs(this.delta);
    const sign = this.delta >= 0 ? '+' : '-';
    switch (true) {
      case absValue < 100:
        return `${sign}${absDelta.toFixed(0)} sec`;
      case absValue < 3600:
        return `${sign}${dayjs.duration(absDelta, 'seconds').format('m:ss')}`;
      default:
        return `${sign}${dayjs.duration(absDelta, 'seconds').as('minutes').toFixed(0)} min`;
    }
  }
}

export class SZWidgetValue extends BaseWidgetValue implements WidgetValueInterface {
  getUnits() {
    return 'zones';
  }
  getFormattedValue(isLarge?: boolean) {
    if (typeof this.value === 'undefined') return '...';
    return (
      <p className="text-sm">
        <WidgetText isLarge={isLarge} text={`${Math.abs(this.value).toString()}`} />{' '}
        <UnitText isLarge={isLarge} text={this.getUnits()} />
      </p>
    );
  }
  getFormattedDelta() {
    if (typeof this.delta === 'undefined') return '...';
    return `${this.delta >= 0 ? '+' : '-'}${Math.abs(this.delta).toString()}`;
  }
}

export class PercentageWidgetValue extends BaseWidgetValue implements WidgetValueInterface {
  getUnits() {
    return '%';
  }

  getFormattedValue(isLarge?: boolean) {
    if (this.value === undefined) return '...';
    return (
      <p className="text-sm">
        <WidgetText isLarge={isLarge} text={`${Math.round(100 * this.value).toString()}`} />
        <UnitText isLarge={isLarge} text={this.getUnits()} />
      </p>
    );
  }

  getFormattedDelta() {
    if (this.delta === undefined) return '...';
    return `${this.delta >= 0 ? '+' : ''}${Math.round(100 * this.delta).toString()}%`;
  }
}

export class TripsWidgetValue extends BaseWidgetValue implements WidgetValueInterface {
  getUnits() {
    return 'Round trips';
  }

  getFormattedValue(isLarge?: boolean) {
    if (this.value === undefined) return '...';
    return (
      <p>
        <WidgetText isLarge={isLarge} text={Math.abs(this.value).toFixed(0)} />{' '}
        <UnitText isLarge={isLarge} text={this.getUnits()} />
      </p>
    );
  }

  getFormattedDelta() {
    if (this.delta === undefined) return '...';
    return `${this.delta >= 0 ? '+' : '-'}${Math.abs(this.delta).toString()}`;
  }
}

export class MPHWidgetValue extends BaseWidgetValue implements WidgetValueInterface {
  getUnits() {
    return 'MPH';
  }

  getFormattedValue(isLarge?: boolean) {
    if (typeof this.value === 'undefined') return '...';
    return (
      <p>
        <WidgetText isLarge={isLarge} text={this.value.toFixed(1)} />{' '}
        <UnitText isLarge={isLarge} text={this.getUnits()} />
      </p>
    );
  }
  getFormattedDelta() {
    if (typeof this.value === 'undefined' || typeof this.delta === 'undefined') return '...';
    const absDelta = Math.abs(this.delta);
    const sign = this.delta >= 0 ? '+' : '-';
    return `${sign}${absDelta.toFixed(1)}`;
  }
}

export class RidersWidgetValue extends BaseWidgetValue implements WidgetValueInterface {
  getUnits() {
    return 'Fare validations';
  }

  getFormattedValue(isLarge?: boolean) {
    if (this.value === undefined) return '...';
    return (
      <p>
        <WidgetText isLarge={isLarge} text={`${(this.value / 1000).toFixed(1)}k`} />{' '}
        <UnitText isLarge={isLarge} text={this.getUnits()} />
      </p>
    );
  }

  // TODO
  getFormattedDelta() {
    if (this.delta === undefined) return '...';
    return `${this.delta >= 0 ? '+' : '-'}${Math.abs(this.delta).toString()}`;
  }
}
