import dynamic from 'next/dynamic';

const Device = dynamic(() => import('./Device'), { ssr: false });

export default Device;
