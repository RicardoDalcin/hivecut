import { Editor } from '@/components/editor/editor';
import { Logo } from '@/components/logo';
import { ToggleTheme } from '@/components/toggle-theme';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export default function Home() {
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

      <Editor />
    </div>
  );
}
