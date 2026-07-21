"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditEmployeeForm } from "@/components/forms/edit-employee-form";
import { QuickLogHoursForm } from "@/components/forms/quick-log-hours-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/spinner";
import { Clock } from "lucide-react";

interface Warehouse {
  id: string;
  name: string;
}

interface WorkLog {
  id: string;
  hoursWorked: number;
  taskType: string;
  description: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  position: string;
  department: string | null;
  warehouseId: string | null;
  hireDate: string | Date;
  isActive: boolean;
  warehouse: Warehouse | null;
  workLogs: WorkLog[];
}

interface EmployeeTableProps {
  employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [logHoursEmployee, setLogHoursEmployee] = useState<Employee | null>(null);
  const [logHoursOpen, setLogHoursOpen] = useState(false);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = (employee: Employee) => {
    setEditEmployee(employee);
    setEditOpen(true);
  };

  const handleLogHours = (employee: Employee) => {
    setLogHoursEmployee(employee);
    setLogHoursOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setDeleteEmployee(employee);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteEmployee) return;
    setDeleting(true);

    const res = await fetch(`/api/employees/${deleteEmployee.id}`, {
      method: "DELETE",
    });

    setDeleting(false);
    setDeleteOpen(false);

    if (res.ok) {
      toast("Employee deleted successfully");
      router.refresh();
    } else {
      toast("Failed to delete employee", "error");
    }
  };

  return (
    <>
      <div className="table-responsive">
        <div className="rounded-md border">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Work Logs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No employees registered yet.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{emp.position}</p>
                      {emp.department && (
                        <p className="text-xs text-muted-foreground">{emp.department}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {emp.warehouse?.name ?? "Unassigned"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={emp.isActive ? "default" : "destructive"}>
                      {emp.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {emp.workLogs.length}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLogHours(emp)}
                      >
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        Log Hours
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(emp)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(emp)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {editEmployee && (
        <EditEmployeeForm
          employee={editEmployee}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}

      {logHoursEmployee && (
        <QuickLogHoursForm
          employeeId={logHoursEmployee.id}
          employeeName={logHoursEmployee.name}
          open={logHoursOpen}
          onOpenChange={setLogHoursOpen}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Employee"
        description={`Are you sure you want to delete ${deleteEmployee?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </>
  );
}