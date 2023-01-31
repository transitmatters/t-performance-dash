import { useRouter } from 'next/router';
import React from 'react';

export default function More() {
  const router = useRouter();
  const line = router.query.line;
  return <div>{`${line} > more`}</div>;
}
