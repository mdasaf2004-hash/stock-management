"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Warehouse,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Users,
  ArrowLeftRight,
  Settings,
  ClipboardList,
  BarChart,
  Activity,
  UserCog,
  Clock,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/warehouses", label: "Warehouses", icon: Warehouse },
  { href: "/materials", label: "Materials", icon: Package },
  { href: "/stock", label: "Stock", icon: BarChart3 },
  { href: "/stock-movements", label: "Movements", icon: ArrowLeftRight },
  { href: "/orders", label: "Sales Orders", icon: ShoppingCart },
  { href: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
  { href: "/shipments", label: "Shipments", icon: Truck },
  { href: "/wholesalers", label: "Suppliers", icon: Users },
  { href: "/employees", label: "Employees", icon: UserCog },
  { href: "/work-hours", label: "Work Hours", icon: Clock },
  { href: "/reports", label: "Reports", icon: BarChart },
  { href: "/activity-logs", label: "Activity Logs", icon: Activity },
];

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close sidebar on navigation
  useEffect(() => {
    setOpen(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [pathname]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={handleOpen}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={handleClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-lg"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
              <Package className="h-4 w-4" />
            </div>
            StockPro
          </Link>
          <Button variant="ghost" size="icon-sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-4.5 w-4.5 shrink-0" />
            <span className="whitespace-nowrap">Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
