import type { Bezier, Point, Projection } from 'bezier-js';
import type { RangeNames, RangeLookup, PathProjection } from './types';

type Range = [number, number];
type RangesByName = Record<string, Range>;

const getRangesIndex = (ranges: RangeNames[]): RangesByName => {
  const index: RangesByName = {};
  const allNames = new Set(ranges.flat());
  for (const name of allNames) {
    const firstIndexWithName = ranges.findIndex((range) => range.includes(name));
    const lastIndexInRestWithoutName = ranges
      .slice(firstIndexWithName + 1)
      .findIndex((range) => !range.includes(name));
    const lastIndexWithName =
      lastIndexInRestWithoutName === -1
        ? ranges.length - 1
        : firstIndexWithName + lastIndexInRestWithoutName;
    index[name] = [firstIndexWithName, lastIndexWithName];
  }
  return index;
};

const getAccumulatedLengths = (segments: Bezier[]): number[] => {
  return segments.reduce((lengths, segment) => {
    const accumulated = lengths[lengths.length - 1] ?? 0;
    return [...lengths, accumulated + segment.length()];
  }, []);
};

export class Path {
  private segments: Bezier[];
  private readonly ranges: RangeNames[];
  private readonly rangesIndex: RangesByName;
  private readonly accumulatedLengths: number[];
  readonly length: number;

  constructor(segments: Bezier[], ranges: RangeNames[] = []) {
    this.segments = segments;
    this.ranges = ranges;
    this.rangesIndex = getRangesIndex(this.ranges);
    this.accumulatedLengths = getAccumulatedLengths(segments);
    this.length = this.accumulatedLengths[this.accumulatedLengths.length - 1];
  }

  private seek(target: number): { segment: Bezier; index: number; displacement: number } {
    let displacement = 0;
    for (let index = 0; index < this.segments.length; index++) {
      const segment = this.segments[index];
      const segmentLength = segment.length();
      if (displacement + segmentLength >= target) {
        return {
          index,
          segment,
          displacement: target - displacement,
        };
      } else {
        displacement += segmentLength;
      }
    }
    throw new Error('Failed to seek');
  }

  concat(curve: Bezier, ranges: RangeNames = []) {
    return new Path([...this.segments, curve], [...this.ranges, ranges]);
  }

  slice(from: number, to: number) {
    return new Path(this.segments.slice(from, to), this.ranges.slice(from, to));
  }

  getRanges(): string[] {
    return Object.keys(this.rangesIndex);
  }

  hasRange(name: string) {
    return !!this.rangesIndex[name];
  }

  getRange(name: string) {
    const range = this.rangesIndex[name];
    if (range) {
      return range;
    }
    throw new Error(`No range by name ${name}`);
  }

  sliceRange(name: string) {
    const [from, to] = this.getRange(name);
    return this.slice(from, to + 1);
  }

  getDisplacementFromRangeLookup(lookup: RangeLookup) {
    const { range, fraction } = lookup;
    const [from, to] = this.getRange(range);
    const fromLength = from === 0 ? 0 : this.accumulatedLengths[from - 1];
    const toLength = this.accumulatedLengths[to];
    return fromLength + fraction * (toLength - fromLength);
  }

  getPointFromRangeLookup(lookup: RangeLookup) {
    const displacement = this.getDisplacementFromRangeLookup(lookup);
    return this.getPointFromFraction(displacement / this.length);
  }

  getPointFromDisplacement(displacement: number) {
    const { segment, displacement: segmentDisplacement } = this.seek(displacement);
    return segment.get(segmentDisplacement / segment.length());
  }

  getPointFromFraction(fraction: number) {
    const fractionalDisplacement = fraction * this.length;
    const { segment, displacement } = this.seek(fractionalDisplacement);
    return segment.get(displacement / segment.length());
  }

  cut(fromDisplacement: number, toDisplacement: number) {
    if (fromDisplacement > toDisplacement) {
      const intermediate = toDisplacement;
      toDisplacement = fromDisplacement;
      fromDisplacement = intermediate;
    }
    const {
      segment: fromSegment,
      index: fromIndex,
      displacement: displacementInFromSegment,
    } = this.seek(fromDisplacement);
    const {
      segment: toSegment,
      index: toIndex,
      displacement: displacementInToSegment,
    } = this.seek(toDisplacement);
    const fromSegmentLength = fromSegment.length();
    const toSegmentLength = toSegment.length();
    if (fromSegment === toSegment) {
      return new Path([
        fromSegment.split(
          displacementInFromSegment / fromSegmentLength,
          displacementInToSegment / fromSegmentLength
        ),
      ]);
    }
    const fractionInFromSegment = displacementInFromSegment / fromSegmentLength;
    const partOfFromSegment = fromSegment.split(fractionInFromSegment, 1);
    const intermediate = this.segments.slice(fromIndex + 1, toIndex);
    const fractionInToSegment = displacementInToSegment / toSegmentLength;
    const partOfToSegment = toSegment.split(0, fractionInToSegment);
    const includedParts = [
      fractionInFromSegment !== 1 && partOfFromSegment,
      ...intermediate,
      fractionInToSegment !== 0 && partOfToSegment,
    ].filter((x): x is Bezier => !!x);
    return new Path(includedParts);
  }

  offset(distance: number) {
    if (distance === 0) {
      return this;
    }
    return new Path(
      this.segments.map((segment) => segment.offset(distance) as unknown as Bezier).flat()
    );
  }

  toSVG() {
    return this.segments.map((segment) => segment.toSVG()).reduce((a, b) => `${a} ${b}`, '');
  }

  getBounds() {
    let maxLeft = Infinity;
    let maxRight = -Infinity;
    let maxTop = Infinity;
    let maxBottom = -Infinity;
    for (const segment of this.segments) {
      const {
        x: { min: left, max: right },
        y: { min: top, max: bottom },
      } = segment.bbox();
      maxLeft = Math.min(maxLeft, left);
      maxRight = Math.max(maxRight, right);
      maxTop = Math.min(maxTop, top);
      maxBottom = Math.max(maxBottom, bottom);
    }
    return {
      left: maxLeft,
      right: maxRight,
      top: maxTop,
      bottom: maxBottom,
      width: maxRight - maxLeft,
      height: maxBottom - maxTop,
    };
  }

  project(point: Point): null | PathProjection {
    let closestProjection: null | Projection = null;
    let closestSegment: null | Bezier = null;
    for (const segment of this.segments) {
      const projection = segment.project(point);
      if (projection.d && (!closestProjection || projection.d < closestProjection.d!)) {
        closestProjection = projection;
        closestSegment = segment;
      }
    }
    if (closestProjection && closestSegment) {
      const indexOfSegment = this.segments.indexOf(closestSegment);
      const displacementBeforeSegment =
        indexOfSegment === 0 ? 0 : this.accumulatedLengths[indexOfSegment - 1];
      const displacementWithinSegment = closestProjection.t! * closestSegment.length();
      const totalDisplacement = displacementBeforeSegment + displacementWithinSegment;
      return {
        segmentProjection: closestProjection,
        distance: closestProjection.d!,
        displacement: totalDisplacement,
      };
    }
    return null;
  }
}
