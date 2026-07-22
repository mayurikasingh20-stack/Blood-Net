/** Placeholder blocks while content is being fetched. */
export default function SkeletonLoader({ lines = 3, className = "" }) { return <div aria-busy="true" aria-label="Loading content" className={`space-y-3 ${className}`}>{Array.from({ length: lines }, (_, index) => <div key={index} className={`h-4 animate-pulse rounded bg-ink/10 ${index === lines - 1 ? "w-2/3" : "w-full"}`} />)}</div>; }
