import { Editor } from '@/components/editor/editor';
import { mapToObject } from '@/lib/utils';
import { getStoredLayout, Layout, LAYOUT_GROUP_IDS } from '@/stores/ui/layouts';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

export default async function Home() {
  const cookieStore = await cookies();

  const selectedLayout = cookieStore.get('layout')?.value as Layout | undefined;
  const layouts = mapToObject(Object.keys(LAYOUT_GROUP_IDS), (layout) => {
    const key = layout as Layout;
    const layoutSizes = getStoredLayout(
      key,
      (name) => cookieStore.get(name)?.value
    );
    return { key, value: layoutSizes };
  });

  return (
    <div className="h-screen w-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <Editor defaultLayouts={layouts} selectedLayout={selectedLayout} />
      </Suspense>
    </div>
  );
}
