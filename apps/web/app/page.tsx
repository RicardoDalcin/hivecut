import { ToggleTheme } from '@/components/toggle-theme';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Button>Click me</Button>

      <ToggleTheme />
    </div>
  );
}
