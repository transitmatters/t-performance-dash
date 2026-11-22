import { useLinePage } from '../../hooks/usePageParams';

/**
 * Bus coverage note. Renders as plain prose for the "About this data"
 * accordion (see TripDataNotes).
 */
export const BusDataNotice = () => {
  if (useLinePage().line !== 'line-bus') {
    return null;
  }

  return (
    <p>
      Bus data isn&apos;t guaranteed to be complete for any stop or date, which may affect headway
      figures in particular.
    </p>
  );
};
