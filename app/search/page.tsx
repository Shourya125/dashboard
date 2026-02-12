"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LivelawCard from "@/components/LivelawCard";
import ICHRCard from "@/components/ICHRCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, Scale, BookOpen, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function SearchPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get("query") || "";
    const initialSite = searchParams.get("site") || "";
    const initialSortBy = searchParams.get("sortBy") || "";

    const [query, setQuery] = useState(initialQuery);
    const [site, setSite] = useState(initialSite);
    const [sortBy, setSortBy] = useState(initialSortBy);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [counts, setCounts] = useState({ livelaw: 0, ichr: 0 });
    const [hasSearched, setHasSearched] = useState(false);

    const performSearch = async (searchQuery: string, searchSite: string, searchSortBy: string) => {
        setLoading(true);
        setHasSearched(true);

        try {
            const params = new URLSearchParams();
            if (searchQuery.trim()) params.set("query", searchQuery.trim());
            if (searchSite) params.set("site", searchSite);
            if (searchSortBy) params.set("sortBy", searchSortBy);

            const res = await fetch(`/api/search?${params.toString()}`);
            const data = await res.json();

            if (data.results) {
                setResults(data.results);
                setCounts(data.counts || { livelaw: 0, ichr: 0 });
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Update URL with all params
        const params = new URLSearchParams();
        if (query.trim()) params.set("query", query.trim());
        if (site) params.set("site", site);
        if (sortBy) params.set("sortBy", sortBy);
        router.push(`/search?${params.toString()}`);

        performSearch(query, site, sortBy);
    };

    // React to URL changes
    useEffect(() => {
        const queryFromUrl = searchParams.get("query") || "";
        const siteFromUrl = searchParams.get("site") || "";
        const sortByFromUrl = searchParams.get("sortBy") || "";

        setQuery(queryFromUrl);
        setSite(siteFromUrl);
        setSortBy(sortByFromUrl);

        // Perform search if any param is set
        if (queryFromUrl || siteFromUrl || sortByFromUrl) {
            performSearch(queryFromUrl, siteFromUrl, sortByFromUrl);
        }
    }, [searchParams]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 text-center">
                    Unified Search
                </h1>

                <form onSubmit={handleSearchSubmit} className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search across Livelaw and ICHR documents..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="h-14 pl-12 pr-4 rounded-2xl border-2 border-gray-200 dark:border-zinc-800 text-lg shadow-sm focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-blue-500/50"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        {/* Site Filter */}
                        <div className="flex-1 space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                                <Filter className="w-3 h-3" />
                                Source
                            </label>
                            <Select value={site} onValueChange={(val) => setSite(val === "all" ? "" : val)}>
                                <SelectTrigger className="h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500/50 text-sm font-bold outline-none">
                                    <SelectValue placeholder="All Sources" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 dark:border-zinc-800">
                                    <SelectItem value="all" className="rounded-lg">All Sources</SelectItem>
                                    <SelectItem value="livelaw" className="rounded-lg">
                                        <span className="flex items-center gap-2">
                                            <Scale className="w-3.5 h-3.5 text-red-500" />
                                            Livelaw
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="ichr" className="rounded-lg">
                                        <span className="flex items-center gap-2">
                                            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                            ICHR
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex-1 space-y-2">
                            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                                <Filter className="w-3 h-3" />
                                Sort By
                            </label>
                            <Select value={sortBy} onValueChange={(val) => setSortBy(val === "relevance" ? "" : val)}>
                                <SelectTrigger className="h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500/50 text-sm font-bold outline-none">
                                    <SelectValue placeholder="Relevance" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 dark:border-zinc-800">
                                    <SelectItem value="relevance" className="rounded-lg">Relevance</SelectItem>
                                    <SelectItem value="newest" className="rounded-lg">Newest First</SelectItem>
                                    <SelectItem value="oldest" className="rounded-lg">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search Button */}
                        <Button
                            type="submit"
                            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Search className="w-5 h-5 mr-2" />
                            Search
                        </Button>
                    </div>
                </form>

                {hasSearched && !loading && (
                    <div className="flex justify-center gap-4 mt-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-900/30">
                            <Scale className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-bold text-red-700 dark:text-red-400">
                                {counts.livelaw || 0} Livelaw
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-900/30">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                                {counts.ichr || 0} ICHR
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {results.length > 0 ? (
                        results.map((doc, index) => (
                            <div key={`${doc._type}-${doc.id}-${index}`}>
                                {doc._type === 'livelaw' ? (
                                    <LivelawCard doc={doc} />
                                ) : (
                                    <ICHRCard doc={doc} />
                                )}
                            </div>
                        ))
                    ) : (
                        hasSearched && (
                            <div className="col-span-full text-center py-24 bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
                                <div className="mb-4 inline-flex p-4 bg-gray-100 dark:bg-zinc-800 rounded-full">
                                    <Search className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-gray-900 dark:text-white font-bold text-lg">No results found</p>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Try different keywords or check spelling.</p>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-12"><Skeleton className="h-12 w-full max-w-md rounded-xl" /></div>}>
            <SearchPageContent />
        </Suspense>
    );
}
