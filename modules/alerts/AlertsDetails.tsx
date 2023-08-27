import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import { useDelimitatedRoute } from '../../common/utils/router';
import { AlertsWidget } from './AlertsWidget';

export function AlertsDetails() {
  const { lineShort } = useDelimitatedRoute();

  return (
    <PageWrapper pageTitle={'Alerts'}>
      <div className="grid w-full grid-cols-1 gap-4 md:gap-8 xl:grid-cols-2">
        <AlertsWidget lineShort={lineShort} />
      </div>
    </PageWrapper>
  );
}

AlertsDetails.Layout = Layout.Dashboard;
