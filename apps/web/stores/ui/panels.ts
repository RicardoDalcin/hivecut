import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Layout = 'default' | 'media' | 'inspector' | 'vertical-preview';
type LayoutState = {
  main: number;
  media: number;
  preview: number;
  timeline: number;
  layer: number;
};

const LAYOUT_DEFAULTS: Record<Layout, LayoutState> = {
  default: {
    main: 70,
    media: 25,
    preview: 50,
    layer: 25,
    timeline: 30,
  },
  media: {
    main: 100,
    media: 30,
    preview: 45,
    layer: 25,
    timeline: 25,
  },
  inspector: {
    main: 75,
    media: 30,
    preview: 70,
    layer: 30,
    timeline: 25,
  },
  'vertical-preview': {
    main: 75,
    media: 30,
    preview: 40,
    layer: 30,
    timeline: 25,
  },
};

type PanelState = {
  layout: Layout;
  layoutCustomSizes: Record<Layout, Partial<LayoutState>>;

  setLayout: (layout: Layout) => void;
  getSizes: () => LayoutState;

  setMediaSize: (size: number) => void;
  setPreviewSize: (size: number) => void;
  setLayerSize: (size: number) => void;
  setTimelineSize: (size: number) => void;
  setMainSize: (size: number) => void;
} & LayoutState;

export const usePanels = create<PanelState>()(
  persist<PanelState>(
    (set, get) => ({
      ...LAYOUT_DEFAULTS.default,
      layout: 'default' as Layout,
      layoutCustomSizes: {
        default: {},
        media: {},
        inspector: {},
        'vertical-preview': {},
      },

      setLayout: (layout) => {
        const {
          layout: currentLayout,
          layoutCustomSizes,
          media,
          preview,
          layer,
          timeline,
        } = get();

        const updatedSizes = {
          ...layoutCustomSizes,
          [currentLayout]: { media, preview, layer, timeline },
        };

        const defaultSizes = LAYOUT_DEFAULTS[layout as Layout];
        const customSizes = updatedSizes[currentLayout] || {};
        const mergedSizes: LayoutState = {
          ...defaultSizes,
          ...customSizes,
        };

        set({
          layout,
          layoutCustomSizes: updatedSizes,
          ...mergedSizes,
        });
      },

      getSizes: () => {
        const { main, media, preview, layer, timeline } = get();
        return { main, media, preview, layer, timeline };
      },

      setMainSize: (size) => {
        console.log('setMainSize', size);
        const { layout, layoutCustomSizes } = get();
        set({
          main: size,
          layoutCustomSizes: {
            ...layoutCustomSizes,
            [layout]: {
              ...layoutCustomSizes[layout],
              main: size,
            },
          },
        });
      },

      setMediaSize: (size) => {
        console.log('setMediaSize', size);
        const { layout, layoutCustomSizes } = get();
        set({
          media: size,
          layoutCustomSizes: {
            ...layoutCustomSizes,
            [layout]: {
              ...layoutCustomSizes[layout],
              media: size,
            },
          },
        });
      },

      setPreviewSize: (size) => {
        console.log('setPreviewSize', size);
        const { layout, layoutCustomSizes } = get();
        set({
          layoutCustomSizes: {
            ...layoutCustomSizes,
            [layout]: {
              ...layoutCustomSizes[layout],
              preview: size,
            },
          },
          preview: size,
        });
      },

      setLayerSize: (size) => {
        console.log('setLayerSize', size);
        const { layout, layoutCustomSizes } = get();
        set({
          layoutCustomSizes: {
            ...layoutCustomSizes,
            [layout]: {
              ...layoutCustomSizes[layout],
              layer: size,
            },
          },
          layer: size,
        });
      },

      setTimelineSize: (size) => {
        console.log('setTimelineSize', size);
        const { layout, layoutCustomSizes } = get();
        set({
          layoutCustomSizes: {
            ...layoutCustomSizes,
            [layout]: {
              ...layoutCustomSizes[layout],
              timeline: size,
            },
          },
          timeline: size,
        });
      },
    }),
    { name: 'panels' }
  )
);
