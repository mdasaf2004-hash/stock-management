"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

export function Topbar() {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MobileSidebar />
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
            <span className="text-xs font-bold">SP</span>
          </div>
          <span className="font-bold text-lg">StockPro</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
        <BarcodeScanner />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {(session?.user?.email?.[0] ?? "U").toUpperCase()}
              </span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium leading-none">
                {session?.user?.email ?? "User"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Admin</p>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="gap-2 text-muted-foreground hover:text-destructive ml-1"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
