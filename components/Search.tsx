"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Search = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get("query") || "");

  useEffect(() => {
    const queryFromUrl = searchParams.get("query") || "";

    const frame = window.requestAnimationFrame(() => {
      setQuery((prev) => (prev === queryFromUrl ? prev : queryFromUrl));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [searchParams]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (query) {
        params.set("query", query);
      } else {
        params.delete("query");
      }

      const url = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(url, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, pathname, router, searchParams]);

  return (
    <div className="library-search-wrapper">
      <div className="pl-4">
        <SearchIcon size={20} className="text-[var(--text-muted)]" />
      </div>
      <Input
        type="text"
        placeholder="Search books by title or author"
        className="library-search-input border-none shadow-none focus-visible:ring-0"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
};

export default Search;
