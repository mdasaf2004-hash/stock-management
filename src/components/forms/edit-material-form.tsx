"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";

interface Material {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number | { toString(): string };
  reorderLevel: number;
  reorderQuantity: number;
  description: string | null;
  imageUrl: string | null;
  expiryDate: string | Date | null;
}

interface EditMaterialFormProps {
  material: Material;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMaterialForm({
  material,
  open,
  onOpenChange,
}: EditMaterialFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleOpenChange(value: boolean) {
    if (value) setError("");
    onOpenChange(value);
  }

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

    const res = await fetch(`/api/materials/${material.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    onOpenChange(false);
    toast("Material updated successfully");
    router.refresh();
  }

  const formatDateForInput = (dateStr: string | Date | null) => {
    if (!dateStr) return "";
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return d.toISOString().split("T")[0];
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Material</DialogTitle>
          <DialogDescription>
            Update material details for {material.sku}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {typeof error === "string" ? error : JSON.stringify(error)}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sku">SKU *</Label>
              <Input
                id="edit-sku"
                name="sku"
                required
                defaultValue={material.sku}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Input
                id="edit-category"
                name="category"
                required
                defaultValue={material.category}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              name="name"
              required
              defaultValue={material.name}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-unit">Unit *</Label>
              <Input
                id="edit-unit"
                name="unit"
                required
                defaultValue={material.unit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Unit Price (₹) *</Label>
              <Input
                id="edit-price"
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={Number(material.unitPrice)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-reorder">Reorder Level</Label>
              <Input
                id="edit-reorder"
                name="reorderLevel"
                type="number"
                min="0"
                defaultValue={material.reorderLevel}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reorder-qty">Reorder Quantity</Label>
              <Input
                id="edit-reorder-qty"
                name="reorderQuantity"
                type="number"
                min="0"
                defaultValue={material.reorderQuantity}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                name="imageUrl"
                defaultValue={material.imageUrl ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expiry">Expiry Date</Label>
              <Input
                id="edit-expiry"
                name="expiryDate"
                type="date"
                defaultValue={formatDateForInput(material.expiryDate)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-desc">Description</Label>
            <Input
              id="edit-desc"
              name="description"
              defaultValue={material.description ?? ""}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Spinner className="mr-2" /> Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
