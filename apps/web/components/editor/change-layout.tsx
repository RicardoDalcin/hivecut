'use client';

import * as React from 'react';
import { LayoutGrid } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLayouts } from '@/stores/ui/panels';
import { useStore } from 'zustand';

export function ChangeLayout() {
  const store = useLayouts();
  const activeLayout = useStore(store, (state) => state.activeLayout);
  const setActiveLayout = useStore(store, (state) => state.setActiveLayout);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(props) => (
          <Button variant="outline" size="icon" {...props}>
            <LayoutGrid className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Change layout</span>
          </Button>
        )}
      ></DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuRadioGroup
          value={activeLayout}
          onValueChange={setActiveLayout}
        >
          <DropdownMenuRadioItem value="default">Default</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="media">Media</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="inspector">
            Inspector
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="vertical-preview">
            Vertical Preview
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
