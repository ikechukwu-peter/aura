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

export function EventFilters() {
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
        <SelectTrigger className="w-45 h-10 bg-background border-border rounded-lg font-medium">
          <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
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
          <Button variant="outline" className="h-10 px-4 rounded-lg font-medium flex items-center gap-2 border-border hover:bg-primary/5 hover:border-primary/30 transition-colors">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-background border-border p-0 overflow-hidden flex flex-col h-full">
        <SheetHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
                Filter events
              </SheetTitle>
              <SheetDescription className="text-xs font-medium text-muted-foreground">
                Narrow down your search results
              </SheetDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-9 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-colors"
            >
              Reset
            </Button>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick date filters</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={setToday}
                className="h-10 rounded-lg border-border bg-muted/30 text-xs font-medium hover:bg-primary/5 hover:border-primary/30 transition-colors"
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={setThisWeekend}
                className="h-10 rounded-lg border-border bg-muted/30 text-xs font-medium hover:bg-primary/5 hover:border-primary/30 transition-colors"
              >
                This weekend
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Start date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 bg-background border-border rounded-lg text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">End date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 bg-background border-border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11 bg-background border-border rounded-lg text-sm">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border rounded-lg">
                <SelectItem value="all" className="text-sm">All categories</SelectItem>
                <SelectItem value="Music" className="text-sm">Music</SelectItem>
                <SelectItem value="Workshop" className="text-sm">Workshop</SelectItem>
                <SelectItem value="Conference" className="text-sm">Conference</SelectItem>
                <SelectItem value="Social" className="text-sm">Social</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="City or venue..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-11 pl-10 bg-background border-border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Availability</Label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setAvailableOnly(!availableOnly)}
                className={`p-3 rounded-lg border transition-colors cursor-pointer flex flex-col gap-2 ${
                  availableOnly 
                    ? "bg-primary/5 border-primary/40" 
                    : "bg-muted/30 border-border hover:border-foreground/20"
                }`}
              >
                <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                  availableOnly ? "bg-primary border-primary text-white" : "border-border"
                }`}>
                  {availableOnly && <CheckSquare className="h-3.5 w-3.5" />}
                </div>
                <span className="text-xs font-medium">Available tickets</span>
              </div>

              <div 
                onClick={() => setFreeOnly(!freeOnly)}
                className={`p-3 rounded-lg border transition-colors cursor-pointer flex flex-col gap-2 ${
                  freeOnly 
                    ? "bg-primary/5 border-primary/40" 
                    : "bg-muted/30 border-border hover:border-foreground/20"
                }`}
              >
                <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                  freeOnly ? "bg-primary border-primary text-white" : "border-border"
                }`}>
                  {freeOnly && <Zap className="h-3.5 w-3.5" />}
                </div>
                <span className="text-xs font-medium">Free events</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-11 pl-10 bg-background border-border rounded-lg text-sm"
                />
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-11 pl-10 bg-background border-border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort order</Label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-11 bg-background border-border rounded-lg text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border rounded-lg">
                <SelectItem value="date_asc" className="text-sm">Date: Earliest first</SelectItem>
                <SelectItem value="date_desc" className="text-sm">Date: Latest first</SelectItem>
                <SelectItem value="price_asc" className="text-sm">Price: Low to high</SelectItem>
                <SelectItem value="price_desc" className="text-sm">Price: High to low</SelectItem>
                <SelectItem value="newest" className="text-sm">Recently added</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="p-6 bg-background border-t border-border shrink-0">
          <Button 
            onClick={applyFilters} 
            variant="default" 
            className="w-full h-11 rounded-lg text-sm font-semibold"
          >
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
      </Sheet>
    </div>
  );
}
