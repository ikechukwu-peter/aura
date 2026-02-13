"use client";

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, Trash2, ShieldAlert, Ban, Unlock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

interface UserManagementTableProps {
  initialUsers: User[];
  currentUserRole: string;
}

export function UserManagementTable({ initialUsers, currentUserRole }: UserManagementTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Alert Dialog states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    description: string;
    actionLabel: string;
    onConfirm: () => void;
    variant: "default" | "destructive";
  } | null>(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER"
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setUsers([{
        ...data.user,
        createdAt: new Date(data.user.createdAt).toISOString(),
        isBlocked: false
      }, ...users]);
      
      toast.success("User created successfully");
      setIsCreateModalOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "USER" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        (user.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update role");
      }

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success("User role updated successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update user role");
    }
  };

  const roleOptions = useMemo(() => {
    const roles = [
      { value: "USER", label: "Attendee" },
      { value: "ORGANIZER", label: "Organizer" },
    ];
    if (currentUserRole === "SUPER_ADMIN") {
      roles.push({ value: "ADMIN", label: "Admin" });
    }
    return roles;
  }, [currentUserRole]);

  const handleBlockToggle = async (userId: string, currentBlockedStatus: boolean) => {
    const action = currentBlockedStatus ? "unblock" : "block";
    
    setConfirmConfig({
      title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: `Are you sure you want to ${action} this user?`,
      actionLabel: action.charAt(0).toUpperCase() + action.slice(1),
      variant: currentBlockedStatus ? "default" : "destructive",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/users/${userId}/block`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isBlocked: !currentBlockedStatus }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to update status");
          }

          setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !currentBlockedStatus } : u));
          toast.success(currentBlockedStatus ? "User unblocked" : "User blocked");
        } catch (error: any) {
          console.error(error);
          toast.error(error.message || "Failed to update user status");
        }
      }
    });
    setIsConfirmOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    setConfirmConfig({
      title: "Confirm Deletion",
      description: "Are you sure you want to delete this user? This action cannot be undone and will remove all associated records.",
      actionLabel: "Delete Identity",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to delete user");
          }

          setUsers(users.filter(u => u.id !== userId));
          toast.success("User deleted from the registry");
        } catch (error: any) {
          console.error(error);
          toast.error(error.message || "Failed to delete user");
        }
      }
    });
    setIsConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="bg-background/80 backdrop-blur-3xl border-border/60 rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">
              {confirmConfig?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/40 font-medium">
              {confirmConfig?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-12 rounded-xl border-border/60 font-black uppercase tracking-widest text-[10px]">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmConfig?.onConfirm}
              className={`h-12 rounded-xl font-black uppercase tracking-widest text-[10px] ${
                confirmConfig?.variant === "destructive" 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-aura-primary hover:bg-aura-primary/90 text-white"
              }`}
            >
              {confirmConfig?.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
          <Input 
            placeholder="Search identities by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 rounded-2xl bg-foreground/[0.02] border-border/60 focus:border-aura-primary/50 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {currentUserRole === "SUPER_ADMIN" && (
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="h-14 rounded-2xl bg-aura-primary hover:bg-aura-primary/90 text-white px-6 font-black uppercase tracking-widest gap-2">
                  <UserPlus className="h-5 w-5" />
                  New Citizen
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background/80 backdrop-blur-3xl border-border/60 rounded-[2rem] max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Induct New Citizen</DialogTitle>
                  <DialogDescription className="text-foreground/40 font-medium">
                    Add a new identity to the population registry.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Full Identity Name</label>
                    <Input 
                      placeholder="e.g. John Doe" 
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className="h-12 rounded-xl bg-foreground/[0.02] border-border/60 focus:border-aura-primary/50 transition-all font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Email Address</label>
                    <Input 
                      type="email"
                      placeholder="email@example.com" 
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="h-12 rounded-xl bg-foreground/[0.02] border-border/60 focus:border-aura-primary/50 transition-all font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Access Credentials</label>
                    <Input 
                      type="password"
                      placeholder="Minimum 8 characters" 
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="h-12 rounded-xl bg-foreground/[0.02] border-border/60 focus:border-aura-primary/50 transition-all font-medium"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Classification Role</label>
                    <Select 
                      value={newUser.role} 
                      onValueChange={(value) => setNewUser({...newUser, role: value})}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-foreground/[0.02] border-border/60 text-[10px] font-black uppercase tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background/80 backdrop-blur-3xl border-border/60 rounded-xl">
                        <SelectItem value="USER" className="text-[10px] font-black uppercase tracking-widest">Citizen (USER)</SelectItem>
                        <SelectItem value="ORGANIZER" className="text-[10px] font-black uppercase tracking-widest">Provider (ORG)</SelectItem>
                        {currentUserRole === "SUPER_ADMIN" && (
                          <SelectItem value="ADMIN" className="text-[10px] font-black uppercase tracking-widest">Overseer (ADM)</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl bg-aura-primary hover:bg-aura-primary/90 text-white font-black uppercase tracking-widest"
                    >
                      {isSubmitting ? "Processing..." : "Confirm Induction"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[180px] h-14 rounded-2xl bg-foreground/[0.02] border-border/60 text-[10px] font-black uppercase tracking-widest">
              <SelectValue placeholder="All Classifications" />
            </SelectTrigger>
            <SelectContent className="bg-background/80 backdrop-blur-3xl border-border/60 rounded-2xl">
              <SelectItem value="ALL" className="text-[10px] font-black uppercase tracking-widest">All Citizens</SelectItem>
              <SelectItem value="USER" className="text-[10px] font-black uppercase tracking-widest">Citizens (USER)</SelectItem>
              <SelectItem value="ORGANIZER" className="text-[10px] font-black uppercase tracking-widest">Providers (ORG)</SelectItem>
              <SelectItem value="ADMIN" className="text-[10px] font-black uppercase tracking-widest">Overseers (ADM)</SelectItem>
              {currentUserRole === "SUPER_ADMIN" && (
                <SelectItem value="SUPER_ADMIN" className="text-[10px] font-black uppercase tracking-widest">High Council (SUP)</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-[2rem] overflow-hidden border border-border/40 bg-foreground/[0.01]">
        <Table>
          <TableHeader className="bg-foreground/[0.02]">
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-[10px] font-black uppercase tracking-widest p-6">Identity</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest p-6">Classification</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest p-6">Onboarded</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest p-6 text-right">Protocol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className={`border-border/40 hover:bg-foreground/[0.01] transition-colors group ${user.isBlocked ? 'opacity-50 grayscale' : ''}`}>
                  <TableCell className="p-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-foreground uppercase tracking-tight">{user.name || "Anonymous User"}</span>
                        {user.isBlocked && (
                          <StatusBadge variant="error">BLOCKED</StatusBadge>
                        )}
                      </div>
                      <span className="text-[10px] text-foreground/40 font-medium">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-6">
                    <StatusBadge variant={
                      user.role === "SUPER_ADMIN" ? "info" :
                      user.role === "ADMIN" ? "info" : 
                      user.role === "ORGANIZER" ? "success" : "default"
                    }>
                      {user.role}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="p-6">
                    <span className="text-xs font-bold text-foreground/60">{formatDate(user.createdAt)}</span>
                  </TableCell>
                  <TableCell className="p-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Only allow managing users with lower permissions */}
                      {/* Admins cannot manage other admins or super admins */}
                      {/* Super Admins can manage anyone except other super admins */}
                      {!(currentUserRole === "ADMIN" && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) && 
                       !(currentUserRole === "SUPER_ADMIN" && user.role === "SUPER_ADMIN") && (
                        <>
                          <Select
                            defaultValue={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value)}
                          >
                            <SelectTrigger className="w-[140px] h-10 rounded-xl bg-background border-border/60 text-[10px] font-black uppercase tracking-widest">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background/80 backdrop-blur-3xl border-border/60 rounded-xl">
                              <SelectItem value="USER" className="text-[10px] font-black uppercase tracking-widest">Citizen (USER)</SelectItem>
                              <SelectItem value="ORGANIZER" className="text-[10px] font-black uppercase tracking-widest">Provider (ORG)</SelectItem>
                              {currentUserRole === "SUPER_ADMIN" && (
                                <SelectItem value="ADMIN" className="text-[10px] font-black uppercase tracking-widest">Overseer (ADM)</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-10 w-10 rounded-xl transition-all ${user.isBlocked ? 'text-green-500 hover:bg-green-500/10' : 'text-amber-500 hover:bg-amber-500/10'}`}
                            onClick={() => handleBlockToggle(user.id, user.isBlocked)}
                            title={user.isBlocked ? "Unblock User" : "Block User"}
                          >
                            {user.isBlocked ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </Button>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl text-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <ShieldAlert className="h-12 w-12 text-foreground/10" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">No matching identities found in registry</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

