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

interface Warehouse {
  id: string;
  name: string;
}

export function AddEmployeeForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    if (open) {
      fetch("/api/warehouses")
        .then((res) => res.json())
        .then((data) => setWarehouses(data))
        .catch(() => setWarehouses([]));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      phone: (form.get("phone") as string) || undefined,
      position: form.get("position") as string,
      department: (form.get("department") as string) || undefined,
      warehouseId: (form.get("warehouseId") as string) || undefined,
      hireDate: (form.get("hireDate") as string) || undefined,
    };

    const res = await fetch("/api/employees", {
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
    toast("Employee added successfully");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Add Employee
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="emp-name">Name *</Label>
            <Input id="emp-name" name="name" required placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-email">Email *</Label>
            <Input id="emp-email" name="email" type="email" required placeholder="john@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emp-phone">Phone</Label>
              <Input id="emp-phone" name="phone" placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-position">Position *</Label>
              <Input id="emp-position" name="position" required placeholder="Warehouse Manager" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emp-department">Department</Label>
              <Input id="emp-department" name="department" placeholder="Operations" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-warehouse">Warehouse</Label>
              <Select name="warehouseId">
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-hiredate">Hire Date</Label>
            <Input id="emp-hiredate" name="hireDate" type="date" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Spinner className="mr-2" /> Adding...</> : "Add Employee"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}