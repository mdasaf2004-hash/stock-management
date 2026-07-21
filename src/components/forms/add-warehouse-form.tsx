"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";

export function AddWarehouseForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name") as string,
      location: form.get("location") as string,
      contactPerson: form.get("contactPerson") as string || undefined,
      phone: form.get("phone") as string || undefined,
      capacity: form.get("capacity") ? Number(form.get("capacity")) : undefined,
    };

    const res = await fetch("/api/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    setOpen(false);
    toast("Warehouse added successfully");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Add Warehouse
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Warehouse</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="wh-name">Name *</Label>
            <Input id="wh-name" name="name" required placeholder="Central Warehouse" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wh-location">Location *</Label>
            <Input id="wh-location" name="location" required placeholder="Mumbai, India" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wh-contact">Contact Person</Label>
              <Input id="wh-contact" name="contactPerson" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-phone">Phone</Label>
              <Input id="wh-phone" name="phone" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wh-capacity">Capacity (m³)</Label>
            <Input id="wh-capacity" name="capacity" type="number" min="0" placeholder="10000" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Spinner className="mr-2" /> Adding...</> : "Add Warehouse"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
