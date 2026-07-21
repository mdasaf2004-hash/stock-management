"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";

export function AddBatchForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [materials, setMaterials] = useState<{ id: string; name: string; sku: string }[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [materialId, setMaterialId] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/warehouses").then(r => r.json()).then(setWarehouses);
      fetch("/api/materials").then(r => r.json()).then(setMaterials);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!warehouseId || !materialId) {
      setError("Please select both warehouse and material");
      return;
    }

    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      batchNumber: form.get("batchNumber") as string,
      warehouseId,
      materialId,
      quantity: Number(form.get("quantity")),
      manufacturingDate: form.get("manufacturingDate") as string || undefined,
      expiryDate: form.get("expiryDate") as string || undefined,
    };

    const res = await fetch("/api/batches", {
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
    setWarehouseId("");
    setMaterialId("");
    toast("Batch added successfully");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Add Batch
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Batch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="batch-number">Batch Number *</Label>
            <Input id="batch-number" name="batchNumber" required placeholder="BATCH-001" />
          </div>
          <div className="space-y-2">
            <Label>Warehouse *</Label>
            <Select value={warehouseId} onValueChange={(v) => setWarehouseId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Material *</Label>
            <Select value={materialId} onValueChange={(v) => setMaterialId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name} ({m.sku})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="batch-qty">Quantity *</Label>
            <Input id="batch-qty" name="quantity" type="number" min="1" required placeholder="100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch-mfg">Manufacturing Date</Label>
              <Input id="batch-mfg" name="manufacturingDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-exp">Expiry Date</Label>
              <Input id="batch-exp" name="expiryDate" type="date" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Spinner className="mr-2" /> Adding...</> : "Add Batch"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
