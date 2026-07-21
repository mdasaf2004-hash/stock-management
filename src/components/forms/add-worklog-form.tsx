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

interface Employee {
  id: string;
  name: string;
}

interface AddWorkLogFormProps {
  employeeId?: string;
}

export function AddWorkLogForm({ employeeId }: AddWorkLogFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (open) {
      fetch("/api/employees")
        .then((res) => res.json())
        .then((data) => setEmployees(data))
        .catch(() => setEmployees([]));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      employeeId: employeeId || (form.get("employeeId") as string),
      date: (form.get("date") as string) || undefined,
      startTime: form.get("startTime") as string,
      endTime: (form.get("endTime") as string) || undefined,
      hoursWorked: Number(form.get("hoursWorked")),
      taskType: form.get("taskType") as string,
      description: form.get("description") as string,
      quantity: form.get("quantity") ? Number(form.get("quantity")) : undefined,
      unit: (form.get("unit") as string) || undefined,
      status: form.get("status") as string,
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

    setOpen(false);
    toast("Work log added successfully");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Add Work Log
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Work Log</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {!employeeId && (
            <div className="space-y-2">
              <Label htmlFor="wl-employee">Employee *</Label>
              <Select name="employeeId">
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wl-date">Date</Label>
              <Input id="wl-date" name="date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wl-hours">Hours Worked *</Label>
              <Input id="wl-hours" name="hoursWorked" type="number" min="0.5" step="0.5" required placeholder="8" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wl-start">Start Time *</Label>
              <Input id="wl-start" name="startTime" type="time" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wl-end">End Time</Label>
              <Input id="wl-end" name="endTime" type="time" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wl-tasktype">Task Type *</Label>
              <Select name="taskType">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
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
              <Label htmlFor="wl-status">Status</Label>
              <Select name="status" defaultValue="COMPLETED">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wl-description">Description *</Label>
            <Input id="wl-description" name="description" required placeholder="What did they do?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wl-quantity">Quantity</Label>
              <Input id="wl-quantity" name="quantity" type="number" min="0" placeholder="100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wl-unit">Unit</Label>
              <Input id="wl-unit" name="unit" placeholder="boxes, items, etc." />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wl-notes">Notes</Label>
            <Input id="wl-notes" name="notes" placeholder="Additional notes" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Spinner className="mr-2" /> Adding...</> : "Add Work Log"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}