import { Editor } from '@/components/editor/editor';
import { Logo } from '@/components/logo';
import { ToggleTheme } from '@/components/toggle-theme';
import { Button } from '@/components/ui/button';
import { mapToObject } from '@/lib/utils';
import { getStoredLayout, Layout, LAYOUT_GROUP_IDS } from '@/stores/ui/layouts';
import { Upload } from 'lucide-react';
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
    <div className="h-screen w-screen flex flex-col overflow-hidden px-3 py-3 gap-3">
      <div className="h-8 flex items-center justify-between w-full">
        <Logo className="size-8" />

        <div className="flex items-center gap-2">
          <Button>
            <Upload />
            Export
          </Button>
          <ToggleTheme />
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <Editor defaultLayouts={layouts} selectedLayout={selectedLayout} />
      </Suspense>
    </div>
  );
}
