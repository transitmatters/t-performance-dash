export interface Facility {
  id: string;
  type: 'facility';
}

export interface FacilitiesResponse {
  jsonApi: string;
  data: Facility[];
}
