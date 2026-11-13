import { DataNotes } from '../../../common/components/notices/DataNotes';
import {
  REGIONAL_RAIL_EXPLORER_URL,
  REGIONAL_RAIL_REPORTS_URL,
} from '../../../common/constants/regionalRail';

/** How the Regional Rail measures are built, under the Commuter Rail service charts. */
export const RegionalRailNotes = () => (
  <DataNotes>
    <p>
      Built from the MBTA&apos;s published schedules, not trains actually run. TransitMatters&apos;
      Regional Rail vision calls for a train at least every 30 minutes in both directions, from 5am
      to 1am, on a repeating hourly pattern riders can memorize.{' '}
      <a href={REGIONAL_RAIL_REPORTS_URL} rel="noopener" target="_blank">
        Read our Regional Rail reports
      </a>
      , or{' '}
      <a href={REGIONAL_RAIL_EXPLORER_URL} rel="noopener" target="_blank">
        plan a trip on the Regional Rail Explorer
      </a>
      .
    </p>
    <p>
      Each direction is measured at its Boston terminal: outbound trains when they leave, inbound
      trains when they arrive. The grid counts trains in each hour, averaged over the range. Two
      trains in an hour aren&apos;t always 30 minutes apart (:05 and :15 leave a 50-minute wait), so
      a line can have more two-train hours than hours with a train every 30 minutes.
    </p>
    <p>
      A wait spans the trains on either side of the window, so a 7am train followed by a 4pm train
      counts as a 9-hour midday wait. Clock-face trains have another train exactly an hour before or
      after, within two minutes. Holidays are counted with the kind of day they fall on.
    </p>
  </DataNotes>
);
