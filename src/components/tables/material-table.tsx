"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditMaterialForm } from "@/components/forms/edit-material-form";
import { AddVariantForm } from "@/components/forms/add-variant-form";

export function MaterialTableSearch() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function filter() {
    const rows = document.querySelectorAll("table tbody tr");
    rows.forEach((row) => {
      const text = row.textContent?.toLowerCase() ?? "";
      (row as HTMLElement).style.display = text.includes(query.toLowerCase())
        ? ""
        : "none";
    });
  }

  useEffect(() => {
    filter();
  }, [query]);

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search... ⌘K"
        className="h-8 w-full sm:w-56 pl-8 pr-7 rounded-lg bg-muted/50 border border-transparent focus:border-border focus:bg-card text-xs outline-none transition-colors"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

interface Material {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  reorderLevel: number;
  reorderQuantity: number;
  description: string | null;
  imageUrl: string | null;
  expiryDate: string | null;
}

interface MaterialActionsProps {
  material: Material;
}

export function MaterialActions({ material }: MaterialActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [variantOpen, setVariantOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete material "${material.name}" (${material.sku})? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    const res = await fetch(`/api/materials/${material.id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    setMenuOpen(false);

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete material");
      return;
    }

    router.refresh();
  }

  return (
    <>
      <div className="relative inline-block" ref={menuRef}>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl">
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setMenuOpen(false);
                setEditOpen(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setMenuOpen(false);
                setVariantOpen(true);
              }}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
              Add Variant
            </button>
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      <EditMaterialForm
        material={material}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <AddVariantForm
        materialId={material.id}
        materialName={material.name}
        open={variantOpen}
        onOpenChange={setVariantOpen}
      />
    </>
  );
}
