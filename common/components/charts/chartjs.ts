// Import chart components from here (as '@chartjs-components') rather than 'react-chartjs-2', so
// Chart.js is registered first and loads with the chart chunks instead of the entry bundle.
import '@chartjs-utils';

export { Bar, Line } from 'react-chartjs-2';
