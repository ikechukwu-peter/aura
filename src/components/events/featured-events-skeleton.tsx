import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";

export function FeaturedEventsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden flex flex-col p-0 bg-background border-border/60 rounded-[2.5rem] shadow-card">
          <div className="aspect-[16/11] relative bg-foreground/[0.03]">
            <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
            <div className="absolute top-6 left-6">
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
          <CardHeader className="flex-1 p-10 pb-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex flex-col gap-5 mt-8">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </CardHeader>
          <CardFooter className="p-10 pt-0">
            <Skeleton className="h-16 w-full rounded-2xl" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
