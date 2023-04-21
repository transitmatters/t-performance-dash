import React from 'react';
import dayjs from 'dayjs';
import { useSpeedData } from '../../common/api/hooks/speed';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { OVERVIEW_OPTIONS, TODAY_STRING } from '../../common/constants/dates';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { ServiceOverviewWrapper } from './ServiceOverviewWrapper';
import { getSpeedGraphConfig } from '../speed/constants/speeds';

export const ServiceWidget: React.FC = () => {
  const { line, query } = useDelimitatedRoute();
  const { startDate, agg } = OVERVIEW_OPTIONS[query.view ?? 'year'];
  const endDate = TODAY_STRING;
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const serviceData = useSpeedData({
    start_date: startDate,
    end_date: endDate,
    agg: agg,
    line,
  });

  const serviceReady = !serviceData.isError && serviceData.data && line;

  return (
    <WidgetDiv>
      <HomescreenWidgetTitle title="Service" tab="service" />
      {serviceReady ? (
        <ServiceOverviewWrapper
          data={serviceData.data}
          config={config}
          line={line}
          startDate={startDate}
          endDate={endDate}
        />
      ) : (
        <ChartPlaceHolder query={serviceData} />
      )}
    </WidgetDiv>
  );
};
