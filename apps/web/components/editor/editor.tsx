'use client';
import React, { useMemo, useState } from 'react';
import { LayoutContext, createLayoutStore } from '@/stores/ui/panels';
import { Layout as ResizableLayoutSchema } from 'react-resizable-panels';
import { ResizableLayout } from './resizable-layout';
import { Layout, LAYOUT_PANELS } from '@/stores/ui/layouts';

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

  const state = useMemo(() => store.getState(), [store]);
  const { defaultLayouts, activeLayout } = state;
  const root = useMemo(() => LAYOUT_PANELS[activeLayout].root, [activeLayout]);
  const layouts = useMemo(
    () => defaultLayouts[activeLayout],
    [defaultLayouts, activeLayout]
  );

  return (
    <LayoutContext.Provider value={state}>
      <ResizableLayout root={root} layouts={layouts} />
    </LayoutContext.Provider>
  );
}
