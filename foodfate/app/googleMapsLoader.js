import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
    apiKey: 'AIzaSyAFY09CwJBA_uW3jdsFJU3BOtw_wyS286g',
    version: 'weekly',
    libraries: ['places'],
  });
  export default loader;