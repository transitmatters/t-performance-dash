// Found on https://stackoverflow.com/questions/59494037/how-to-detect-the-device-on-react-ssr-app-with-next-js

import dynamic from 'next/dynamic';

export const Device = dynamic(() => import('./Device'), { ssr: false });
