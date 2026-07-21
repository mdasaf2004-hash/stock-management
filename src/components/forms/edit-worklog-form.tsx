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

interface WorkLog {
  id: string;
  employeeId: string;
  date: string | Date;
  startTime: string | Date;
  endTime: string | Date | null;
  hoursWorked: number;
  taskType: string;
  description: string;
  quantity: number | null;
  unit: string | null;
  status: string;
  notes: string | null;
  employee: { name: string };
}

interface EditWorkLogFormProps {
  workLog: WorkLog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditWorkLogForm({
  workLog,
  open,
  onOpenChange,
}: EditWorkLogFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
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

    const res = await fetch(`/api/worklogs/${workLog.id}`, {
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
    toast("Work log updated successfully");
    router.refresh();
  }

  const formatDateForInput = (dateStr: string | Date | null) => {
    if (!dateStr) return "";
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return d.toISOString().split("T")[0];
  };

  const formatTimeForInput = (dateStr: string | Date | null) => {
    if (!dateStr) return "";
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return d.toISOString().substring(11, 16);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Work Log</DialogTitle>
          <DialogDescription>
            Update work log for {workLog.employee.name}
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
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                name="date"
                type="date"
                defaultValue={formatDateForInput(workLog.date)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hours">Hours Worked *</Label>
              <Input
                id="edit-hours"
                name="hoursWorked"
                type="number"
                min="0.5"
                step="0.5"
                required
                defaultValue={workLog.hoursWorked}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-start">Start Time *</Label>
              <Input
                id="edit-start"
                name="startTime"
                type="time"
                required
                defaultValue={formatTimeForInput(workLog.startTime)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end">End Time</Label>
              <Input
                id="edit-end"
                name="endTime"
                type="time"
                defaultValue={formatTimeForInput(workLog.endTime)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tasktype">Task Type *</Label>
              <Select name="taskType" defaultValue={workLog.taskType}>
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
              <Label htmlFor="edit-status">Status</Label>
              <Select name="status" defaultValue={workLog.status}>
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
            <Label htmlFor="edit-description">Description *</Label>
            <Input
              id="edit-description"
              name="description"
              required
              defaultValue={workLog.description}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                name="quantity"
                type="number"
                min="0"
                defaultValue={workLog.quantity ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-unit">Unit</Label>
              <Input
                id="edit-unit"
                name="unit"
                defaultValue={workLog.unit ?? ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Input
              id="edit-notes"
              name="notes"
              defaultValue={workLog.notes ?? ""}
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