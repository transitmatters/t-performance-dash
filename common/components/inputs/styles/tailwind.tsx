export const formConfig = {
  default: 'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium',
  active: {
    red: `bg-mbta-red text-white`,
    orange: `bg-mbta-orange text-white`,
    green: `bg-mbta-green text-white`,
    blue: `bg-mbta-blue text-white`,
    bus: `bg-mbta-bus text-white`,
  },
};

export const mbtaTextConfig = {
  RL: `text-mbta-red`,
  OL: `text-mbta-orange`,
  GL: `text-mbta-green`,
  BL: `text-mbta-blue`,
  BUS: `text-mbta-bus`,
};
export const otherConfig = {
  selected: {
    red: `text-mbta-red`,
    orange: `text-mbta-orange`,
    green: `text-mbta-green`,
    blue: `text-mbta-blue`,
    bus: `text-mbta-bus`,
  },
};

export const buttonConfig = {
  default:
    'relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm  focus:outline-none focus:ring-1  sm:text-sm',
  red: 'focus:ring-mbta-red focus:border-mbta-red',
  orange: 'focus:ring-mbta-orange focus:border-mbta-orange',
  green: 'focus:ring-mbta-green focus:border-mbta-green',
  blue: 'focus:ring-mbta-blue focus:border-mbta-blue',
  bus: 'focus:ring-mbta-bus focus:border-mbta-bus',
};

export const dateInputConfig = {
  range: {
    default:
      'rounded border bg-transparent py-2 px-4 font-medium text-gray-700 hover:border-transparent  hover:text-white',
    red: 'hover:bg-mbta-red border-mbta-red',
    orange: 'hover:bg-mbta-orange border-mbta-orange',
    green: 'hover:bg-mbta-green border-mbta-green',
    blue: 'hover:bg-mbta-blue border-mbta-blue',
    bus: 'hover:bg-mbta-bus border-mbta-bus',
  },
};
