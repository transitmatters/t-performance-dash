import type { Bezier } from 'bezier-js';

type RangeName = string | null;
type RangesIndex = Record<string, [number, number]>;

const getRangesIndex = (ranges: RangeName[]): RangesIndex => {
  const index: RangesIndex = {};
  if (ranges.length === 0) {
    return index;
  }
  let open = ranges[0];
  let openStartIdx = 0;
  for (let idx = 1; idx < ranges.length; idx++) {
    const next = ranges[idx];
    if (next !== open) {
      if (open !== null) {
        if (open in index) {
          throw new Error(`RangeName reused in segments`);
        }
        index[open] = [openStartIdx, idx - 1];
      }
      open = next;
      openStartIdx = idx;
    }
  }
  if (open !== null) {
    index[open] = [openStartIdx, ranges.length - 1];
  }
  return index;
};

export class Path {
  private segments: Bezier[];
  private readonly ranges: RangeName[];
  private readonly rangesIndex: RangesIndex;
  readonly length: number;
  readonly namedRanges: string[];

  constructor(segments: Bezier[], ranges?: RangeName[]) {
    this.segments = segments;
    this.length = segments.map((seg) => seg.length()).reduce((a, b) => a + b, 0);
    this.ranges = ranges ?? Array(segments.length).fill(null);
    this.rangesIndex = getRangesIndex(this.ranges);
    this.namedRanges = this.ranges.filter((range): range is string => typeof range === 'string');
  }

  concat(curve: Bezier, range?: string) {
    return new Path([...this.segments, curve], [...this.ranges, range ?? null]);
  }

  slice(from: number, to: number) {
    return new Path(this.segments.slice(from, to), this.ranges.slice(from, to));
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

  private seek(target: number): { segment: Bezier; index: number; position: number } {
    let position = 0;
    for (let index = 0; index < this.segments.length; index++) {
      const segment = this.segments[index];
      const segmentLength = segment.length();
      if (position + segmentLength >= target) {
        return {
          index,
          segment,
          position: target - position,
        };
      } else {
        position += segmentLength;
      }
    }
    throw new Error('Failed to seek');
  }

  get(fraction: number) {
    const fractionalPosition = fraction * this.length;
    const { segment, position } = this.seek(fractionalPosition);
    return segment.get(position / segment.length());
  }

  cut(fromPosition: number, toPosition: number) {
    const {
      segment: fromSegment,
      index: fromIndex,
      position: positionInFromSegment,
    } = this.seek(fromPosition);
    const {
      segment: toSegment,
      index: toIndex,
      position: positionInToSegment,
    } = this.seek(toPosition);
    const fromSegmentLength = fromSegment.length();
    const toSegmentLength = toSegment.length();
    if (fromSegment === toSegment) {
      return new Path([
        fromSegment.split(
          positionInFromSegment / fromSegmentLength,
          positionInToSegment / fromSegmentLength
        ),
      ]);
    }
    const intermediate = this.cut(fromIndex + 1, toIndex);
    const partOfFromSegment = fromSegment.split(
      positionInFromSegment / fromSegmentLength,
      fromSegmentLength
    );
    const partOfToSegment = toSegment.split(0, positionInToSegment / toSegmentLength);
    return new Path([partOfFromSegment, ...intermediate.segments, partOfToSegment]);
  }

  toSVG() {
    return this.segments.map((segment) => segment.toSVG()).reduce((a, b) => `${a} ${b}`);
  }
}
