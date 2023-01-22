export type Section = 'Commute' | 'Service' | 'Trains';

export const SECTIONS: Section[] = ['Commute', 'Service', 'Trains'];

export const SECTION_ITEMS = {
  Commute: ['General', 'Travel Times', 'Headways', 'Dwells', 'Est. Commute', 'More'],
  Service: ['General', 'Ridership', 'Service'],
};
