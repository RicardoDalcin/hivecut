import { createStore } from 'zustand';
import { Layout as ResizableLayoutSchema } from 'react-resizable-panels';
import { mapToObject } from '@/lib/utils';
import { createContext } from 'react';
import { getStoredLayout, Layout, LAYOUT_GROUP_IDS } from './layouts';

type LayoutStore = {
  activeLayout: Layout;
  setActiveLayout: (layout: Layout) => void;
  defaultLayouts: Record<
    Layout,
    Record<string, ResizableLayoutSchema | undefined>
  >;
};

function getCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

export const createLayoutStore = (
  storedLayouts: Record<
    Layout,
    Record<string, ResizableLayoutSchema | undefined>
  >,
  selectedLayout: Layout | undefined
) => {
  return createStore<LayoutStore>()((set, get) => ({
    activeLayout: selectedLayout ?? 'default',
    defaultLayouts: storedLayouts,
    setActiveLayout: (layout: Layout) => {
      const { activeLayout: oldLayout, defaultLayouts } = get();

      const fromStorage = getStoredLayout(oldLayout, getCookie);

      set({
        activeLayout: layout,
        defaultLayouts: {
          ...defaultLayouts,
          [oldLayout]: fromStorage,
        },
      });
    },
  }));
};

export const LayoutContext = createContext<LayoutStore | null>(null);
