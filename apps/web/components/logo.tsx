import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('relative min-w-4 min-h-4', className)}>
      <Image src="/logo.svg" alt="Logo" layout="fill" />
    </div>
  );
}
