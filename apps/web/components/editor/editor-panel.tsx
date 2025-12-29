export function EditorPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center overflow-hidden bg-muted rounded-lg">
      {children}
    </div>
  );
}
