import { Preview } from '@/components/editor/preview';
import { mapToObject } from '@/lib/utils';
import { Layout as ResizableLayoutSchema } from 'react-resizable-panels';

function DefaultPanel({ id }: { id: string }) {
  return (
    <div className="flex h-full items-center justify-center p-6 bg-muted rounded-lg">
      <span className="font-semibold">{id}</span>
    </div>
  );
}

export function getStoredLayout(
  layoutId: Layout,
  getCookie: (name: string) => string | undefined
) {
  const groupIds = LAYOUT_GROUP_IDS[layoutId];
  const layoutSizes = mapToObject(groupIds, (item) => {
    const defaultLayoutString = getCookie(`${layoutId}-${item}`);
    const defaultLayout = defaultLayoutString
      ? (JSON.parse(defaultLayoutString) as ResizableLayoutSchema)
      : undefined;

    return { key: item, value: defaultLayout };
  });

  return layoutSizes;
}

export type Layout = 'default' | 'media' | 'inspector' | 'vertical-preview';

export type Panel = {
  type: 'panel';
  id: string;
  component: React.FC;
};

export type Group = {
  type: 'group';
  id: string;
  orientation: 'horizontal' | 'vertical';
  panels: (Panel | Group)[];
  defaultLayout: ResizableLayoutSchema;
};

export const LAYOUT_GROUP_IDS: Record<Layout, string[]> = {
  default: ['root', 'main', 'preview-layer'],
  media: ['root', 'main', 'preview-layer'],
  inspector: ['root', 'main', 'media-preview'],
  'vertical-preview': ['root', 'main', 'media-layer'],
};

export const LAYOUT_PANELS: Record<Layout, { root: Group }> = {
  default: {
    root: {
      type: 'group',
      id: 'root',
      orientation: 'vertical',
      defaultLayout: { main: 65, timeline: 35 },
      panels: [
        {
          type: 'group',
          id: 'main',
          orientation: 'horizontal',
          defaultLayout: { media: 20, preview: 60, layer: 20 },
          panels: [
            {
              type: 'panel',
              id: 'media',
              component: () => <DefaultPanel id="Media" />,
            },
            {
              type: 'panel',
              id: 'preview',
              component: Preview,
            },
            {
              type: 'panel',
              id: 'layer',
              component: () => <DefaultPanel id="Layer" />,
            },
          ],
        },
        {
          type: 'panel',
          id: 'timeline',
          component: () => <DefaultPanel id="Timeline" />,
        },
      ],
    },
  },
  media: {
    root: {
      type: 'group',
      id: 'root',
      orientation: 'horizontal',
      defaultLayout: { media: 25, main: 75 },
      panels: [
        {
          type: 'panel',
          id: 'media',
          component: () => <DefaultPanel id="Media" />,
        },
        {
          type: 'group',
          id: 'main',
          orientation: 'vertical',
          defaultLayout: { 'preview-layer': 50, timeline: 50 },
          panels: [
            {
              type: 'group',
              id: 'preview-layer',
              orientation: 'horizontal',
              defaultLayout: { preview: 70, layer: 30 },
              panels: [
                {
                  type: 'panel',
                  id: 'preview',
                  component: Preview,
                },
                {
                  type: 'panel',
                  id: 'layer',
                  component: () => <DefaultPanel id="Layer" />,
                },
              ],
            },
            {
              type: 'panel',
              id: 'timeline',
              component: () => <DefaultPanel id="Timeline" />,
            },
          ],
        },
      ],
    },
  },
  inspector: {
    root: {
      type: 'group',
      id: 'root',
      orientation: 'horizontal',
      defaultLayout: { main: 75, layer: 25 },
      panels: [
        {
          type: 'group',
          id: 'main',
          orientation: 'vertical',
          defaultLayout: { 'media-preview': 70, timeline: 30 },
          panels: [
            {
              type: 'group',
              id: 'media-preview',
              orientation: 'horizontal',
              defaultLayout: { media: 30, preview: 70 },
              panels: [
                {
                  type: 'panel',
                  id: 'media',
                  component: () => <DefaultPanel id="Media" />,
                },
                {
                  type: 'panel',
                  id: 'preview',
                  component: Preview,
                },
              ],
            },
            {
              type: 'panel',
              id: 'timeline',
              component: () => <DefaultPanel id="Timeline" />,
            },
          ],
        },
        {
          type: 'panel',
          id: 'layer',
          component: () => <DefaultPanel id="Layer" />,
        },
      ],
    },
  },
  'vertical-preview': {
    root: {
      type: 'group',
      id: 'root',
      orientation: 'horizontal',
      defaultLayout: { main: 60, preview: 40 },
      panels: [
        {
          type: 'group',
          id: 'main',
          orientation: 'vertical',
          defaultLayout: { 'media-layer': 70, timeline: 30 },
          panels: [
            {
              type: 'group',
              id: 'media-layer',
              orientation: 'horizontal',
              defaultLayout: { media: 50, layer: 50 },
              panels: [
                {
                  type: 'panel',
                  id: 'media',
                  component: () => <DefaultPanel id="Media" />,
                },
                {
                  type: 'panel',
                  id: 'layer',
                  component: () => <DefaultPanel id="Layer" />,
                },
              ],
            },
            {
              type: 'panel',
              id: 'timeline',
              component: () => <DefaultPanel id="Timeline" />,
            },
          ],
        },
        {
          type: 'panel',
          id: 'preview',
          component: Preview,
        },
      ],
    },
  },
};
