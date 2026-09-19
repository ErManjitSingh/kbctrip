'use client';

import { use } from 'react';
import { PackageMaker } from '../PackageMaker';

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PackageMaker packageId={id} />;
}
