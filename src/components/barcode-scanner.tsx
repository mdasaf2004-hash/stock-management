"use client";

import { useState, useEffect, useRef } from "react";
import { ScanBarcode, X } from "lucide-react";
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

interface BarcodeSearchResult {
  type: "material" | "batch" | "serial";
  id: string;
  name: string;
  sku?: string;
  batchNumber?: string;
  serialNumber?: string;
  quantity?: number;
  warehouse?: string;
}

export function BarcodeScanner() {
  const [open, setOpen] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [result, setResult] = useState<BarcodeSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  async function handleScan() {
    if (!scanInput.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const code = scanInput.trim().toUpperCase();

      // Search by SKU
      const matRes = await fetch("/api/materials");
      const materials = await matRes.json();
      const material = materials.find(
        (m: { sku: string }) => m.sku.toUpperCase() === code
      );
      if (material) {
        setResult({
          type: "material",
          id: material.id,
          name: material.name,
          sku: material.sku,
        });
        setLoading(false);
        return;
      }

      // Search by batch number
      const batchRes = await fetch("/api/batches");
      const batches = await batchRes.json();
      const batch = batches.find(
        (b: { batchNumber: string }) => b.batchNumber.toUpperCase() === code
      );
      if (batch) {
        setResult({
          type: "batch",
          id: batch.id,
          name: batch.material?.name || "Unknown",
          batchNumber: batch.batchNumber,
          quantity: Number(batch.quantity),
          warehouse: batch.warehouse?.name,
        });
        setLoading(false);
        return;
      }

      // Search by serial number
      const serialRes = await fetch("/api/serial-numbers");
      const serials = await serialRes.json();
      const serial = serials.find(
        (s: { serialNumber: string }) => s.serialNumber.toUpperCase() === code
      );
      if (serial) {
        setResult({
          type: "serial",
          id: serial.id,
          name: serial.material?.name || "Unknown",
          serialNumber: serial.serialNumber,
          warehouse: serial.warehouse?.name,
        });
        setLoading(false);
        return;
      }

      setError("No matching item found for this barcode/QR code");
    } catch {
      setError("Failed to scan barcode");
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
        <ScanBarcode className="h-4 w-4" />
        Scan Barcode
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Barcode / QR Code Scanner</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="barcode-input">Scan or enter code</Label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                id="barcode-input"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                placeholder="Enter SKU, batch number, or serial number"
              />
              <Button onClick={handleScan} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {result.type}
                </span>
                <button
                  onClick={() => setResult(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <p className="font-medium">{result.name}</p>
              {result.sku && (
                <p className="text-sm font-mono text-muted-foreground">
                  SKU: {result.sku}
                </p>
              )}
              {result.batchNumber && (
                <p className="text-sm font-mono text-muted-foreground">
                  Batch: {result.batchNumber}
                </p>
              )}
              {result.serialNumber && (
                <p className="text-sm font-mono text-muted-foreground">
                  Serial: {result.serialNumber}
                </p>
              )}
              {result.quantity !== undefined && (
                <p className="text-sm text-muted-foreground">
                  Quantity: {result.quantity}
                </p>
              )}
              {result.warehouse && (
                <p className="text-sm text-muted-foreground">
                  Warehouse: {result.warehouse}
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Supports SKU codes, batch numbers, and serial numbers. 
            Enter the code manually or use a barcode scanner.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
