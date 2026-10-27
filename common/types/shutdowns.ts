export type ShutdownEffect = 'SHUTTLE' | 'SUSPENSION' | 'STATION_CLOSURE';

export type ShutdownPeriod = {
  start: string;
  end: string;
};

export type Shutdown = {
  line: string;
  alert_id: string;
  effect: ShutdownEffect;
  cause: string | null;
  header: string;
  stops: string[];
  periods: ShutdownPeriod[];
  first_start: string;
  last_end: string;
};
