import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60",
        className,
      )}
    />
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid gap-3 border-b border-border p-4"
           style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid gap-3 p-4"
               style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="mt-4 h-5 w-2/3" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-5/6" />
          <div className="mt-5 flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
