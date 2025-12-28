'use client';
import React from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../ui/resizable';
import { Layout as ResizableLayoutSchema } from 'react-resizable-panels';
import { Group, Panel } from '@/stores/ui/layouts';

export function RecursiveGroup({
  panel,
  layouts,
}: {
  panel: Panel | Group;
  layouts: Record<string, ResizableLayoutSchema | undefined>;
}) {
  if (panel.type === 'panel') {
    return (
      <ResizablePanel key={panel.id} id={panel.id}>
        <panel.component />
      </ResizablePanel>
    );
  }

  return (
    <ResizablePanel key={panel.id} id={panel.id}>
      <ResizablePanelGroup
        id={panel.id}
        orientation={panel.orientation}
        defaultLayout={layouts[panel.id] ?? panel.defaultLayout}
        onLayoutChange={(layout) => {
          document.cookie = `${panel.id}=${JSON.stringify(layout)}`;
        }}
      >
        {panel.panels.map((panel, index) => (
          <React.Fragment key={panel.id}>
            {index > 0 && <ResizableHandle />}
            <RecursiveGroup key={panel.id} panel={panel} layouts={layouts} />
          </React.Fragment>
        ))}
      </ResizablePanelGroup>
    </ResizablePanel>
  );
}

export function ResizableLayout({
  root,
  layouts,
}: {
  root: Group;
  layouts: Record<string, ResizableLayoutSchema | undefined>;
}) {
  return (
    <ResizablePanelGroup
      id={root.id}
      orientation={root.orientation}
      defaultLayout={layouts[root.id] ?? root.defaultLayout}
      onLayoutChange={(layout) => {
        document.cookie = `${root.id}=${JSON.stringify(layout)}`;
      }}
    >
      {root.panels.map((panel, index) => (
        <React.Fragment key={panel.id}>
          {index > 0 && <ResizableHandle />}
          <RecursiveGroup key={panel.id} panel={panel} layouts={layouts} />
        </React.Fragment>
      ))}
    </ResizablePanelGroup>
  );
}
