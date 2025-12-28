'use client';
import React, { useMemo, useState } from 'react';
import { LayoutContext, createLayoutStore } from '@/stores/ui/panels';
import { Layout as ResizableLayoutSchema } from 'react-resizable-panels';
import { ResizableLayout } from './resizable-layout';
import { Layout, LAYOUT_PANELS } from '@/stores/ui/layouts';
import { Logo } from '../logo';
import { Button } from '../ui/button';
import { Upload } from 'lucide-react';
import { ToggleTheme } from '../toggle-theme';
import { ChangeLayout } from './change-layout';
import { useStore } from 'zustand';

export function Editor({
  defaultLayouts: storedLayouts,
  selectedLayout,
}: {
  defaultLayouts: Record<
    Layout,
    Record<string, ResizableLayoutSchema | undefined>
  >;
  selectedLayout: Layout | undefined;
}) {
  const [store] = useState(() =>
    createLayoutStore(storedLayouts, selectedLayout)
  );

  const defaultLayouts = useStore(store, (state) => state.defaultLayouts);
  const activeLayout = useStore(store, (state) => state.activeLayout);
  const root = useMemo(() => LAYOUT_PANELS[activeLayout].root, [activeLayout]);
  const layouts = useMemo(
    () => defaultLayouts[activeLayout],
    [defaultLayouts, activeLayout]
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden px-3 py-3 gap-3">
      <LayoutContext.Provider value={store}>
        <div className="h-8 flex items-center justify-between w-full">
          <Logo className="size-8" />

          <div className="flex items-center gap-2">
            <Button>
              <Upload />
              Export
            </Button>

            <p>{activeLayout}</p>
            <ChangeLayout />
            <ToggleTheme />
          </div>
        </div>

        <ResizableLayout
          key={activeLayout}
          root={root}
          layouts={layouts}
          layoutId={activeLayout}
        />
      </LayoutContext.Provider>
    </div>
  );
}
