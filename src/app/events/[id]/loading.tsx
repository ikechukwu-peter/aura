import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function Loading() {
  return (
    <div className="container py-16 space-y-12">
      <div className="inline-flex items-center text-sm font-black uppercase tracking-widest text-white/20">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to events
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Hero Skeleton */}
          <Skeleton className="aspect-video rounded-[2rem]" />

          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5" />
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-4/6" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10 shadow-none">
              <CardContent className="p-8 flex items-start gap-6">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 shadow-none">
              <CardContent className="p-8 flex items-start gap-6">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="border-white/10 bg-white/5 overflow-hidden rounded-[2.5rem]">
            <CardHeader className="p-10 pb-4">
              <Skeleton className="h-8 w-40" />
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-10">
              <Skeleton className="h-32 rounded-3xl" />
              <div className="space-y-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-16 w-full rounded-[1.5rem]" />
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 shadow-none overflow-hidden">
            <CardContent className="p-8 flex items-center gap-6">
              <Skeleton className="h-16 w-16 rounded-[1.25rem]" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
