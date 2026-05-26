export function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
        <div className="h-16 w-24 rounded border border-border bg-muted" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            className="h-28 rounded-lg border border-border bg-muted"
            key={index}
          />
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-32 rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              className="h-24 rounded-lg border border-border bg-muted"
              key={index}
            />
          ))}
        </div>
      </div>

      {/* Recent sections skeleton */}
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="space-y-3" key={index}>
            <div className="h-6 w-32 rounded bg-muted" />
            <div className="h-64 rounded-lg border border-border bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
