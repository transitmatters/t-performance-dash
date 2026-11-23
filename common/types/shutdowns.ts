import type { Schemas } from './apiSchemas';

export type ShutdownEffect = 'SHUTTLE' | 'SUSPENSION' | 'STATION_CLOSURE';

export type Shutdown = Schemas['ShutdownEntry'] & { effect: ShutdownEffect };

export type ShutdownPeriod = Schemas['ShutdownPeriod'];
