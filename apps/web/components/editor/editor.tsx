'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../ui/resizable';

export function Editor() {
  return (
    <ResizablePanelGroup orientation="horizontal" className="w-full rounded-lg">
      <ResizablePanel>
        <div className="flex h-full items-center justify-center p-6 bg-muted rounded-lg">
          One
        </div>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel>
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel>
            <ResizablePanelGroup orientation="horizontal">
              <ResizablePanel>
                <div className="flex h-full items-center justify-center p-6 bg-muted rounded-lg">
                  <span className="font-semibold">Two</span>
                </div>
              </ResizablePanel>

              <ResizableHandle />

              <ResizablePanel>
                <div className="flex h-full items-center justify-center p-6 bg-muted rounded-lg">
                  <span className="font-semibold">Three</span>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel>
            <div className="flex h-full items-center justify-center p-6 bg-muted rounded-lg">
              <span className="font-semibold">Four</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
