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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";

interface Warehouse {
  id: string;
  name: string;
}

interface Wholesaler {
  id: string;
  name: string;
}

interface Material {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
}

interface PurchaseOrderItem {
  materialId: string;
  quantity: number;
  unitPrice: number;
}

export function AddPurchaseOrderForm({
  warehouses,
  wholesalers,
  materials,
}: {
  warehouses: Warehouse[];
  wholesalers: Wholesaler[];
  materials: Material[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const [warehouseId, setWarehouseId] = useState("");
  const [wholesalerId, setWholesalerId] = useState("");
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    { materialId: "", quantity: 1, unitPrice: 0 },
  ]);

  function addItem() {
    setItems([...items, { materialId: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index: number) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof PurchaseOrderItem, value: string | number) {
    const updated = [...items];
    if (field === "materialId") {
      const mat = materials.find((m) => m.id === value);
      updated[index] = {
        ...updated[index],
        materialId: value as string,
        unitPrice: mat ? mat.unitPrice : updated[index].unitPrice,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setItems(updated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!warehouseId || !wholesalerId) {
      setError("Please select a warehouse and wholesaler");
      return;
    }

    if (items.some((i) => !i.materialId || i.quantity <= 0)) {
      setError("Please fill all item fields with valid values");
      return;
    }

    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      warehouseId,
      wholesalerId,
      expectedDate: form.get("expectedDate") as string || undefined,
      notes: form.get("notes") as string || undefined,
      items,
    };

    const res = await fetch("/api/purchase-orders", {
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
    toast("Purchase order created successfully");
    setWarehouseId("");
    setWholesalerId("");
    setItems([{ materialId: "", quantity: 1, unitPrice: 0 }]);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" />
        New Purchase Order
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
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
              <Label>Wholesaler *</Label>
              <Select value={wholesalerId} onValueChange={(v) => setWholesalerId(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select wholesaler" />
                </SelectTrigger>
                <SelectContent>
                  {wholesalers.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="po-expected">Expected Date</Label>
            <Input id="po-expected" name="expectedDate" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="po-notes">Notes</Label>
            <Input id="po-notes" name="notes" placeholder="Purchase order notes (optional)" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Items *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
                <Plus className="h-3 w-3" /> Add Item
              </Button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-end">
                <div className="space-y-1">
                  {index === 0 && <Label className="text-xs">Material</Label>}
                  <Select
                    value={item.materialId}
                    onValueChange={(v) => updateItem(index, "materialId", v ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  {index === 0 && <Label className="text-xs">Qty</Label>}
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  {index === 0 && <Label className="text-xs">Price (₹)</Label>}
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-destructive h-9"
                  disabled={items.length === 1}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Spinner className="mr-2" /> Creating...</> : "Create Purchase Order"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
