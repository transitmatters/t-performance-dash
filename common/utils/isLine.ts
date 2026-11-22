import { LINE_OBJECTS } from '../constants/lines';
import type { Line } from '../types/lines';
import { hasKey } from './hasKey';

export const isLine = (value: string): value is Line => hasKey(LINE_OBJECTS, value);
