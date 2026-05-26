export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            className="h-28 animate-pulse rounded-md border border-border bg-muted"
            key={index}
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-md border border-border bg-muted" />
        <div className="h-72 animate-pulse rounded-md border border-border bg-muted" />
      </div>
    </div>
  );
}
