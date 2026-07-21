"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

export function OrderTableSearch() {
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
      (row as HTMLElement).style.display = text.includes(query.toLowerCase()) ? "" : "none";
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
