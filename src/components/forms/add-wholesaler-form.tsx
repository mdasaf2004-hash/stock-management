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

export function AddWholesalerForm() {
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
      contactPerson: form.get("contactPerson") as string || undefined,
      email: form.get("email") as string || undefined,
      phone: form.get("phone") as string || undefined,
      creditLimit: Number(form.get("creditLimit") || 0),
    };

    const res = await fetch("/api/wholesalers", {
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
    toast("Supplier added successfully");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Add Wholesaler
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Wholesaler</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="ws-name">Name *</Label>
            <Input id="ws-name" name="name" required placeholder="ABC Traders" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-contact">Contact Person</Label>
            <Input id="ws-contact" name="contactPerson" placeholder="Rajesh Kumar" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ws-email">Email</Label>
              <Input id="ws-email" name="email" type="email" placeholder="raj@abctraders.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-phone">Phone</Label>
              <Input id="ws-phone" name="phone" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-credit">Credit Limit (₹)</Label>
            <Input id="ws-credit" name="creditLimit" type="number" min="0" placeholder="500000" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Spinner className="mr-2" /> Adding...</> : "Add Wholesaler"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
