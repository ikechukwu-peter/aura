"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Users, Info, ArrowRight, ArrowLeft, CheckCircle, Sparkles, Layers, Image as ImageIcon, Camera, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCreateFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function EventCreateForm({ initialData, isEditing = false }: EventCreateFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    category: initialData?.category || "",
    startTime: initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : "",
    endTime: initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : "",
    capacity: initialData?.capacity?.toString() || "100",
    price: initialData?.price?.toString() || "0",
    ticketsPerUserLimit: initialData?.ticketsPerUserLimit?.toString() || "5",
  });

  const [imageData, setImageData] = useState<{
    originalPath: string;
    bannerPath: string;
    thumbPath: string;
    width: number;
    height: number;
    size: number;
  } | null>(initialData?.images?.[0] || null);

  const validateStep = () => {
    setError(null);
    if (step === 1) {
      if (!formData.title.trim()) {
        setError("Event title is required");
        return false;
      }
      if (!formData.category.trim()) {
        setError("Category is required");
        return false;
      }
      if (!formData.description.trim()) {
        setError("Description is required");
        return false;
      }
    } else if (step === 2) {
      if (!formData.startTime) {
        setError("Start time is required");
        return false;
      }
      if (!formData.endTime) {
        setError("End time is required");
        return false;
      }
      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        setError("End time must be after start time");
        return false;
      }
      if (!formData.location.trim()) {
        setError("Location is required");
        return false;
      }
    } else if (step === 3) {
      if (parseInt(formData.capacity) <= 0) {
        setError("Capacity must be greater than 0");
        return false;
      }
      if (parseFloat(formData.price) < 0) {
        setError("Price cannot be negative");
        return false;
      }
      if (parseInt(formData.ticketsPerUserLimit) <= 0) {
        setError("Tickets per user limit must be greater than 0");
        return false;
      }
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
    }
  };
  const prevStep = () => setStep((s) => s - 1);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setImageData(data);
    } catch (err: any) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 4) {
      nextStep();
      return;
    }

    if (!imageData) {
      setError("Please upload an event banner");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = isEditing ? `/api/organizer/events/${initialData.id}` : "/api/organizer/events";
      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
          price: parseFloat(formData.price),
          ticketsPerUserLimit: parseInt(formData.ticketsPerUserLimit),
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          image: imageData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} event`);
      }

      router.push(isEditing ? `/organizer/events/${initialData.id}` : "/organizer/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-16 space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-indigo-300 backdrop-blur-md">
          <Sparkles className="h-4 w-4 mr-2" />
          Event Architect
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
          {isEditing ? 'Edit' : 'Create'} <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{isEditing ? 'Experience' : 'New Experience'}</span>
        </h1>
        <p className="text-xl text-white/40 font-bold uppercase tracking-tight">Step {step} of 4: {step === 1 ? "Fundamentals" : step === 2 ? "Logistics" : step === 3 ? "Inventory" : "Visuals"}</p>
      </div>

      <div className="mb-12 flex justify-between items-center relative px-4">
         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-white/5 -z-10" />
         <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-700 -z-10 shadow-glow-indigo" style={{ width: `${((step - 1) / 3) * 100}%` }} />
         {[1, 2, 3, 4].map((i) => (
           <div
             key={i}
             className={cn(
               "h-12 w-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 border backdrop-blur-xl",
               step >= i 
                 ? "bg-indigo-500 border-indigo-400 text-white shadow-glow-indigo scale-110" 
                 : "bg-white/5 border-white/10 text-white/20 scale-100"
             )}
           >
             {step > i ? <CheckCircle className="h-6 w-6" /> : i}
           </div>
         ))}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-cyan-500/10 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />

        {step === 1 && (
          <Card className="bg-white/5 border-white/10 shadow-2xl overflow-hidden rounded-[2.5rem]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-transparent to-transparent opacity-50" />
            <CardHeader className="p-10 pb-6">
              <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Info className="h-6 w-6 text-indigo-400" />
                </div>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-white/40">Event Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Summer Music Festival 2026"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-indigo-500/20 text-lg font-bold"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-white/40">Category</Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="e.g. Music, Tech, Workshop"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-white/40">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  className="flex min-h-[160px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/20 transition-all placeholder:text-white/20"
                  placeholder="Tell people what your event is about..."
                  required
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {error && step === 1 && (
                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-red-400 rotate-180" />
                    <span className="font-black uppercase tracking-tight">Requirement Missing</span>
                  </div>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-10 pt-0">
              <Button type="button" className="ml-auto h-14 px-10 rounded-2xl shadow-glow-indigo font-black uppercase tracking-widest text-xs" onClick={nextStep}>
                Next Step <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-white/5 border-white/10 shadow-2xl overflow-hidden rounded-[2.5rem]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-transparent opacity-50" />
            <CardHeader className="p-10 pb-6">
              <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Calendar className="h-6 w-6 text-cyan-400" />
                </div>
                Date & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="startTime" className="text-[10px] font-black uppercase tracking-widest text-white/40">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={handleChange}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-cyan-500/20 font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="endTime" className="text-[10px] font-black uppercase tracking-widest text-white/40">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={handleChange}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-cyan-500/20 font-bold"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest text-white/40">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g. Central Park, New York"
                    className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-cyan-500/20 pl-12 font-bold"
                    required
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {error && step === 2 && (
                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-red-400 rotate-180" />
                    <span className="font-black uppercase tracking-tight">Requirement Missing</span>
                  </div>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-10 pt-0 justify-between">
              <Button type="button" variant="glass" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button type="button" className="h-14 px-10 rounded-2xl shadow-glow-cyan font-black uppercase tracking-widest text-xs bg-cyan-600 hover:bg-cyan-500" onClick={nextStep}>
                Next Step <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card className="bg-white/5 border-white/10 shadow-2xl overflow-hidden rounded-[2.5rem]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 opacity-50" />
            <CardHeader className="p-10 pb-6">
              <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Users className="h-6 w-6 text-indigo-400" />
                </div>
                Pricing & Capacity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
              <div className="space-y-3">
                <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-white/40">Ticket Price (USD)</Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</div>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-indigo-500/20 pl-8 font-bold text-xl"
                  />
                </div>
                <p className="text-[10px] text-white/20 font-medium uppercase tracking-tight">Set to 0 for free events</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="capacity" className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={handleChange}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-indigo-500/20 font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="ticketsPerUserLimit" className="text-[10px] font-black uppercase tracking-widest text-white/40">Tickets per User Limit</Label>
                  <Input
                    id="ticketsPerUserLimit"
                    name="ticketsPerUserLimit"
                    type="number"
                    min="1"
                    required
                    value={formData.ticketsPerUserLimit}
                    onChange={handleChange}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-indigo-500/20 font-bold"
                  />
                </div>
              </div>

              {error && step === 3 && (
                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-red-400 rotate-180" />
                    <span className="font-black uppercase tracking-tight">Requirement Missing</span>
                  </div>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-10 pt-0 justify-between">
              <Button type="button" variant="glass" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button type="button" className="h-14 px-10 rounded-2xl shadow-glow-indigo font-black uppercase tracking-widest text-xs" onClick={nextStep}>
                Next Step <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        )}
        {step === 4 && (
          <Card className="bg-white/5 border-white/10 shadow-2xl overflow-hidden rounded-[2.5rem]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500 opacity-50" />
            <CardHeader className="p-10 pb-6">
              <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <ImageIcon className="h-6 w-6 text-cyan-400" />
                </div>
                Event Banner
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
              <div className="space-y-6">
                <div 
                  className={cn(
                    "relative aspect-[1200/630] rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden flex flex-col items-center justify-center gap-4",
                    imageData ? "border-indigo-500/50" : "border-white/10 hover:border-white/20 bg-white/5"
                  )}
                >
                  {imageData ? (
                    <>
                      <img 
                        src={imageData.bannerPath} 
                        alt="Preview" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Label htmlFor="banner-upload" className="cursor-pointer h-12 px-6 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                          <Upload className="h-4 w-4" /> Change Image
                        </Label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-20 w-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                        {uploading ? (
                          <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
                        ) : (
                          <Camera className="h-10 w-10 text-white/20" />
                        )}
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-black uppercase tracking-widest">Upload Event Banner</p>
                        <p className="text-xs text-white/40 font-medium">1200 x 630 recommended (WebP/PNG/JPG)</p>
                      </div>
                      <Input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                      <Label htmlFor="banner-upload" className="cursor-pointer h-12 px-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all">
                        {uploading ? "Uploading..." : "Select File"}
                      </Label>
                    </>
                  )}
                </div>

                {error && (
                  <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 animate-in fade-in zoom-in duration-500">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="h-5 w-5 text-red-400 rotate-180" />
                      <span className="font-black uppercase tracking-tight">Requirement Missing</span>
                    </div>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-10 pt-0 justify-between">
              <Button type="button" variant="glass" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button type="submit" disabled={loading || uploading || !imageData} className="h-14 px-10 rounded-2xl shadow-glow-indigo font-black uppercase tracking-widest text-xs">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 animate-spin" /> Processing...
                  </div>
                ) : "Create & Submit for Approval"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </form>
    </div>
  );
}
