"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "../ui/sheet";
import { Filter, DollarSign, ArrowUpDown, MapPin, CheckSquare, Zap } from "lucide-react";

interface EventFiltersProps {
  categories: string[];
}

export function EventFilters({ categories }: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "date_asc");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [availableOnly, setAvailableOnly] = useState(searchParams.get("available") === "true");
  const [freeOnly, setFreeOnly] = useState(searchParams.get("freeOnly") === "true");

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    
    if (startDate) params.set("startDate", startDate);
    else params.delete("startDate");
    
    if (endDate) params.set("endDate", endDate);
    else params.delete("endDate");
    
    if (sort) params.set("sort", sort);
    else params.delete("sort");

    if (category && category !== "all") params.set("category", category);
    else params.delete("category");

    if (location) params.set("location", location);
    else params.delete("location");

    if (availableOnly) params.set("available", "true");
    else params.delete("available");

    if (freeOnly) params.set("freeOnly", "true");
    else params.delete("freeOnly");

    router.push(`/events?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setStartDate("");
    setEndDate("");
    setSort("date_asc");
    setCategory("all");
    setLocation("");
    setAvailableOnly(false);
    setFreeOnly(false);
    router.push("/events");
    setIsOpen(false);
  };

  const activeFiltersCount = [
    searchParams.get("minPrice"),
    searchParams.get("maxPrice"),
    searchParams.get("startDate"),
    searchParams.get("endDate"),
    searchParams.get("category"),
    searchParams.get("location"),
    searchParams.get("available") === "true" ? "true" : null,
    searchParams.get("freeOnly") === "true" ? "true" : null,
  ].filter(Boolean).length;

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const setThisWeekend = () => {
    const today = new Date();
    const friday = new Date(today.setDate(today.getDate() + (5 - today.getDay())));
    const sunday = new Date(today.setDate(today.getDate() + 2));
    setStartDate(friday.toISOString().split('T')[0]);
    setEndDate(sunday.toISOString().split('T')[0]);
  };

  return (
    <div className="flex items-center gap-4">
      <Select value={sort} onValueChange={(value: string) => {
        setSort(value);
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        router.push(`/events?${params.toString()}`);
      }}>
        <SelectTrigger className="w-[180px] h-12 bg-background border-border/60 rounded-xl font-bold">
          <ArrowUpDown className="mr-2 h-4 w-4 opacity-50" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date_asc">Earliest date</SelectItem>
          <SelectItem value="date_desc">Latest date</SelectItem>
          <SelectItem value="price_asc">Price: Low to high</SelectItem>
          <SelectItem value="price_desc">Price: High to low</SelectItem>
          <SelectItem value="newest">Recently added</SelectItem>
        </SelectContent>
      </Select>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="h-12 px-6 rounded-xl font-bold flex items-center gap-2 border-border/60 hover:bg-aura-primary/5 hover:border-aura-primary/30 transition-all">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-aura-primary text-[10px] font-black text-white">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-background/80 backdrop-blur-3xl border-border/60 p-0 overflow-hidden rounded-l-[3rem] shadow-2xl flex flex-col h-full">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-aura-primary via-aura-secondary to-aura-accent" />
        
        <SheetHeader className="p-10 pb-6 border-b border-border/60 shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <SheetTitle className="text-3xl font-black tracking-tighter text-foreground">
                Filter <span className="bg-gradient-to-r from-aura-primary to-aura-secondary bg-clip-text text-transparent uppercase">Reality</span>
              </SheetTitle>
              <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
                Calibrate your experience parameters
              </SheetDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-red-500 hover:bg-red-500/5 transition-all"
            >
              Reset
            </Button>
          </div>
        </SheetHeader>

        <div className="p-10 space-y-10 overflow-y-auto flex-1">
          {/* Quick Shortcuts */}
          <div className="space-y-6">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Temporal presets</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={setToday}
                className="h-12 rounded-xl border-border/60 bg-foreground/[0.02] text-[10px] font-black uppercase tracking-widest hover:bg-aura-primary/5 hover:border-aura-primary/30 transition-all"
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={setThisWeekend}
                className="h-12 rounded-xl border-border/60 bg-foreground/[0.02] text-[10px] font-black uppercase tracking-widest hover:bg-aura-secondary/5 hover:border-aura-secondary/30 transition-all"
              >
                This Weekend
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[8px] font-black uppercase tracking-widest text-foreground/20">Start date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-12 bg-foreground/[0.02] border-border/60 rounded-xl text-xs font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[8px] font-black uppercase tracking-widest text-foreground/20">End date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-12 bg-foreground/[0.02] border-border/60 rounded-xl text-xs font-bold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Classification</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-14 bg-foreground/[0.02] border-border/60 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="bg-background/80 backdrop-blur-3xl border-border/60 rounded-2xl">
                <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">All classifications</SelectItem>
                <SelectItem value="Music" className="text-[10px] font-black uppercase tracking-widest">Audio experiences</SelectItem>
                <SelectItem value="Workshop" className="text-[10px] font-black uppercase tracking-widest">Skill induction</SelectItem>
                <SelectItem value="Conference" className="text-[10px] font-black uppercase tracking-widest">Knowledge summit</SelectItem>
                <SelectItem value="Social" className="text-[10px] font-black uppercase tracking-widest">Neural social</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-6">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Location nexus</Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
              <Input
                placeholder="Location code..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-14 pl-12 bg-foreground/[0.02] border-border/60 rounded-2xl font-bold uppercase tracking-wider text-sm"
              />
            </div>
          </div>

          <div className="space-y-6">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Availability matrix</Label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setAvailableOnly(!availableOnly)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${
                  availableOnly 
                    ? "bg-aura-primary/5 border-aura-primary/40 shadow-glow-aura/10" 
                    : "bg-foreground/[0.02] border-border/60 hover:border-foreground/20"
                }`}
              >
                <div className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${
                  availableOnly ? "bg-aura-primary border-aura-primary text-white" : "border-foreground/20"
                }`}>
                  {availableOnly && <CheckSquare className="h-4 w-4" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">In stock</span>
              </div>

              <div 
                onClick={() => setFreeOnly(!freeOnly)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${
                  freeOnly 
                    ? "bg-aura-secondary/5 border-aura-secondary/40 shadow-glow-aura/10" 
                    : "bg-foreground/[0.02] border-border/60 hover:border-foreground/20"
                }`}
              >
                <div className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${
                  freeOnly ? "bg-aura-secondary border-aura-secondary text-white" : "border-foreground/20"
                }`}>
                  {freeOnly && <Zap className="h-4 w-4" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Open access</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Resource credits</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-14 pl-12 bg-foreground/[0.02] border-border/60 rounded-2xl font-bold"
                />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-14 pl-12 bg-foreground/[0.02] border-border/60 rounded-2xl font-bold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Sequence order</Label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-14 bg-foreground/[0.02] border-border/60 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-background/80 backdrop-blur-3xl border-border/60 rounded-2xl">
                <SelectItem value="date_asc" className="text-[10px] font-black uppercase tracking-widest">Chronological (Asc)</SelectItem>
                <SelectItem value="date_desc" className="text-[10px] font-black uppercase tracking-widest">Chronological (Desc)</SelectItem>
                <SelectItem value="price_asc" className="text-[10px] font-black uppercase tracking-widest">Credits (Low to high)</SelectItem>
                <SelectItem value="price_desc" className="text-[10px] font-black uppercase tracking-widest">Credits (High to low)</SelectItem>
                <SelectItem value="newest" className="text-[10px] font-black uppercase tracking-widest">Newly discovered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="p-10 bg-background/50 border-t border-border/60 backdrop-blur-xl shrink-0">
          <Button 
            onClick={applyFilters} 
            variant="aura" 
            className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-glow-aura"
          >
            Apply parameters
          </Button>
        </SheetFooter>
      </SheetContent>
      </Sheet>
    </div>
  );
}
