import { BusDataNotice } from '../../common/components/notices/BusDataNotice';
import { DataNotes } from '../../common/components/notices/DataNotes';
import { MIN_RUNNING_SPEED_SEGMENT_M, MIN_TRAVERSALS } from './constants';

/** The speed map's and Rankings' "About this data". */
export const BusSpeedDataNotes = () => (
  <DataNotes>
    <p>
      Segment speeds are running speeds, from pulling away at one stop to pulling in at the next, so
      time spent at stops is left out. Older archives count the time at stops instead, and the
      map&apos;s legend says which. A segment needs at least {MIN_TRAVERSALS} buses to be shown.
      Segments shorter than {MIN_RUNNING_SPEED_SEGMENT_M}m have no speed, since the MBTA&apos;s stop
      times leave out about 90m around each stop.
    </p>
    <p>
      Weeks run Monday to Sunday. The current week or month is built from the days so far, and fills
      in as the rest are published.
    </p>
    <BusDataNotice />
  </DataNotes>
);
