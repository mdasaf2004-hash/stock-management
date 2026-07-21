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

export function AddShipmentMethodForm() {
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
      carrierName: form.get("carrierName") as string || undefined,
      baseCost: Number(form.get("baseCost")),
      estimatedDays: Number(form.get("estimatedDays")),
    };

    const res = await fetch("/api/shipment", {
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
    toast("Shipment added successfully");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Add Method
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Shipping Method</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="sh-name">Name *</Label>
            <Input id="sh-name" name="name" required placeholder="Express Delivery" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sh-carrier">Carrier Name</Label>
            <Input id="sh-carrier" name="carrierName" placeholder="FedEx / BlueDart" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sh-cost">Base Cost (₹) *</Label>
              <Input id="sh-cost" name="baseCost" type="number" min="0" step="0.01" required placeholder="150.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sh-days">Est. Days *</Label>
              <Input id="sh-days" name="estimatedDays" type="number" min="1" required placeholder="3" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Spinner className="mr-2" /> Adding...</> : "Add Method"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
