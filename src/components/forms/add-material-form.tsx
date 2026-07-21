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

export function AddMaterialForm() {
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
      sku: form.get("sku") as string,
      name: form.get("name") as string,
      category: form.get("category") as string,
      unit: form.get("unit") as string,
      unitPrice: Number(form.get("unitPrice")),
      reorderLevel: Number(form.get("reorderLevel") || 0),
      reorderQuantity: Number(form.get("reorderQuantity") || 0),
      description: (form.get("description") as string) || undefined,
      imageUrl: (form.get("imageUrl") as string) || undefined,
      expiryDate: (form.get("expiryDate") as string) || undefined,
    };

    const res = await fetch("/api/materials", {
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
    toast("Material added successfully");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Add Material
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mat-sku">SKU *</Label>
              <Input id="mat-sku" name="sku" required placeholder="MAT-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mat-category">Category *</Label>
              <Input
                id="mat-category"
                name="category"
                required
                placeholder="Electronics"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mat-name">Name *</Label>
            <Input
              id="mat-name"
              name="name"
              required
              placeholder="Copper Wire 2.5mm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mat-unit">Unit *</Label>
              <Input
                id="mat-unit"
                name="unit"
                required
                placeholder="kg / pieces / meters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mat-price">Unit Price (₹) *</Label>
              <Input
                id="mat-price"
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="250.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mat-reorder">Reorder Level</Label>
              <Input
                id="mat-reorder"
                name="reorderLevel"
                type="number"
                min="0"
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mat-reorder-qty">Reorder Quantity</Label>
              <Input
                id="mat-reorder-qty"
                name="reorderQuantity"
                type="number"
                min="0"
                placeholder="100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mat-image">Image URL</Label>
              <Input
                id="mat-image"
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mat-expiry">Expiry Date</Label>
              <Input id="mat-expiry" name="expiryDate" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mat-desc">Description</Label>
            <Input
              id="mat-desc"
              name="description"
              placeholder="High-grade copper wire"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Spinner className="mr-2" /> Adding...</> : "Add Material"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
