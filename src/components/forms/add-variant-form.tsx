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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";

interface AddVariantFormProps {
  materialId: string;
  materialName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddVariantForm({
  materialId,
  materialName,
  open,
  onOpenChange,
}: AddVariantFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const attributesRaw = form.get("attributes") as string;

    let attributes: Record<string, string> | undefined;
    if (attributesRaw && attributesRaw.trim()) {
      try {
        attributes = JSON.parse(attributesRaw);
      } catch {
        setError("Attributes must be valid JSON (e.g. {\"color\":\"red\"})");
        setLoading(false);
        return;
      }
    }

    const body = {
      materialId,
      name: form.get("name") as string,
      sku: form.get("sku") as string,
      attributes: attributes ?? null,
      unitPrice: Number(form.get("unitPrice")),
    };

    const res = await fetch(`/api/materials/${materialId}/variants`, {
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

    onOpenChange(false);
    toast("Variant added successfully");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Variant</DialogTitle>
          <DialogDescription>
            Add a new variant to {materialName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="var-name">Name *</Label>
            <Input
              id="var-name"
              name="name"
              required
              placeholder="Large Red Variant"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="var-sku">SKU *</Label>
            <Input
              id="var-sku"
              name="sku"
              required
              placeholder="MAT-001-LR"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="var-attrs">Attributes (JSON)</Label>
            <Textarea
              id="var-attrs"
              name="attributes"
              placeholder='{"size": "L", "color": "Red"}'
              className="min-h-20 font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="var-price">Unit Price (₹) *</Label>
            <Input
              id="var-price"
              name="unitPrice"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="275.00"
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
              {loading ? <><Spinner className="mr-2" /> Adding...</> : "Add Variant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
