export interface FacilityProperty {
  value: string;
  name: string;
}

export interface Facility {
  type: string;
  relationships: {
    stop: {
      data: {
        type: 'stop';
        id: string;
      };
    };
  };
  id: string;
  attributes: {
    type: 'ELEVATOR' | 'ESCALATOR';
    short_name: string;
    properties: FacilityProperty[];
    longitude: number;
    long_name: string;
    latitude: number;
  };
}

export interface FacilitiesResponse {
  jsonApi: string;
  data: Facility[];
}
