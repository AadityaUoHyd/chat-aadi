'use client';

import { Suspense } from 'react';
import Header from './Header';

export default function HeaderWrapper() {
  return (
    <Suspense fallback={<div className="h-14 bg-white border-b"></div>}>
      <Header />
    </Suspense>
  );
}
