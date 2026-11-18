import { Skeleton } from "@/components/ui/skeleton";

/** Kerangka saat data terapis dimuat (bentuknya mengikuti tata letak asli agar tidak melompat). */
export function MemuatHalaman() {
  return (
    <div aria-busy="true" aria-label="Memuat" className="flex flex-1 flex-col">
      <div className="h-16 border-b border-border bg-card" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <Skeleton className="h-9 w-64 bg-mint" />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Skeleton className="h-48 bg-mint" />
          <Skeleton className="h-48 bg-mint" />
        </div>
        <Skeleton className="h-72 bg-mint" />
      </div>
    </div>
  );
}
