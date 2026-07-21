"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface EnhancedTableSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilter?: (key: string, value: string) => void;
  filters?: { key: string; label: string; options: FilterOption[] }[];
  sortBy?: string;
  onSort?: (field: string) => void;
}

export function EnhancedTableSearch({
  placeholder = "Search... ⌘K",
  onSearch,
  onFilter,
  filters = [],
}: EnhancedTableSearchProps) {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
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

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleFilter = useCallback(
    (key: string, value: string) => {
      const newFilters = { ...activeFilters };
      if (value === "") {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      setActiveFilters(newFilters);
      onFilter?.(key, value);
    },
    [activeFilters, onFilter]
  );

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setQuery("");
    onSearch("");
  }, [onSearch]);

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || query.length > 0;

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="h-8 w-full sm:w-56 pl-8 pr-7 rounded-lg bg-muted/50 border border-transparent focus:border-border focus:bg-card text-xs outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {filters.length > 0 && (
        <>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-8 px-2 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              showFilters || hasActiveFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="h-3 w-3" />
            Filters
            {Object.keys(activeFilters).length > 0 && (
              <span className="ml-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </button>

          {showFilters && (
            <div className="flex items-center gap-2">
              {filters.map((filter) => (
                <select
                  key={filter.key}
                  value={activeFilters[filter.key] || ""}
                  onChange={(e) => handleFilter(filter.key, e.target.value)}
                  className="h-8 px-2 rounded-lg bg-muted/50 border border-transparent focus:border-border text-xs outline-none transition-colors"
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </>
      )}

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="h-8 px-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
