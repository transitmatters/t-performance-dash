// Found on https://stackoverflow.com/questions/59494037/how-to-detect-the-device-on-react-ssr-app-with-next-js

import type { ReactNode } from 'react';
import React from 'react';
import * as rdd from 'react-device-detect';

interface DeviceProps {
  children: (props: typeof rdd) => ReactNode;
}
export default function Device(props: DeviceProps) {
  return <div className="device-layout-component">{props.children(rdd)}</div>;
}
