import { useRouter } from 'next/router';
import React from 'react';

export default function DwellsDetails() {
  const router = useRouter();
  const line = router.query.line;
  return <div>{`${line} > dwells`}</div>;
}
