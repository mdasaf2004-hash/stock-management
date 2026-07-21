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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";

interface QuickLogHoursFormProps {
  employeeId: string;
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickLogHoursForm({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: QuickLogHoursFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const startTimeStr = form.get("startTime") as string;
    const endTimeStr = (form.get("endTime") as string) || undefined;

    const startTime = new Date(`${today}T${startTimeStr}`);
    let endTime: Date | undefined;
    let hoursWorked: number;

    if (endTimeStr) {
      endTime = new Date(`${today}T${endTimeStr}`);
      hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    } else {
      hoursWorked = Number(form.get("hoursWorked")) || 8;
    }

    const body = {
      employeeId,
      date: today,
      startTime: startTime.toISOString(),
      endTime: endTime?.toISOString(),
      hoursWorked,
      taskType: form.get("taskType") as string,
      description: form.get("description") as string,
      quantity: form.get("quantity") ? Number(form.get("quantity")) : undefined,
      unit: (form.get("unit") as string) || undefined,
      status: "COMPLETED",
      notes: (form.get("notes") as string) || undefined,
    };

    const res = await fetch("/api/worklogs", {
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
    toast("Hours logged successfully");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Hours</DialogTitle>
          <DialogDescription>
            Clock in work hours for {employeeName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ql-start">Start Time *</Label>
              <Input
                id="ql-start"
                name="startTime"
                type="time"
                required
                defaultValue={new Date().toTimeString().slice(0, 5)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ql-end">End Time (leave blank for manual hours)</Label>
              <Input id="ql-end" name="endTime" type="time" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ql-hours">Hours Worked (if no end time)</Label>
            <Input
              id="ql-hours"
              name="hoursWorked"
              type="number"
              min="0.5"
              step="0.5"
              defaultValue="8"
              placeholder="8"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ql-tasktype">Task Type *</Label>
            <Select name="taskType" defaultValue="OTHER">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PICKING">Picking</SelectItem>
                <SelectItem value="PACKING">Packing</SelectItem>
                <SelectItem value="SHIPPING">Shipping</SelectItem>
                <SelectItem value="RECEIVING">Receiving</SelectItem>
                <SelectItem value="INVENTORY">Inventory Check</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ql-description">Description *</Label>
            <Input
              id="ql-description"
              name="description"
              required
              placeholder="What did they do?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ql-quantity">Quantity (optional)</Label>
              <Input
                id="ql-quantity"
                name="quantity"
                type="number"
                min="0"
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ql-unit">Unit (optional)</Label>
              <Input
                id="ql-unit"
                name="unit"
                placeholder="boxes, items, etc."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ql-notes">Notes (optional)</Label>
            <Input
              id="ql-notes"
              name="notes"
              placeholder="Additional notes"
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
              {loading ? <><Spinner className="mr-2" /> Saving...</> : "Log Hours"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}