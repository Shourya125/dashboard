"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import LivelawCard from "@/components/LivelawCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Calendar as CalendarIcon, Filter, Layers, Scale } from "lucide-react";




export default function LivelawPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [totalHits, setTotalHits] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Search States
    const [query, setQuery] = useState("");
    const [author, setAuthor] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Active Filters (synchronized with what's actually fetched)
    const [activeFilters, setActiveFilters] = useState({
        query: "",
        author: "",
        sortBy: "newest",
        startDate: "",
        endDate: ""
    });

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: any) => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const fetchDocuments = async (currentOffset: number = 0, isInitial = false) => {
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        try {
            const params = new URLSearchParams({
                query: activeFilters.query,
                author: activeFilters.author,
                sortBy: activeFilters.sortBy,
                startDate: activeFilters.startDate,
                endDate: activeFilters.endDate,
                limit: "20",
                offset: currentOffset.toString()
            });

            const res = await fetch(`/api/livelaw?${params.toString()}`);
            const data = await res.json();

            if (data.documents) {
                setDocuments(prev => isInitial ? data.documents : [...prev, ...data.documents]);
                setTotalHits(data.totalHits || 0);
                setHasMore(data.hasMore || false);
                setOffset(currentOffset + data.documents.length);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Trigger on Search Button Click
    const handleSearch = () => {
        setActiveFilters({ query, author, sortBy, startDate, endDate });
        setDocuments([]);
        setOffset(0);
        setTotalHits(0);
        setHasMore(true);
    };

    // Effect to trigger fetch when activeFilters or reset happens
    useEffect(() => {
        fetchDocuments(0, true);
    }, [activeFilters]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchDocuments(offset);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <Scale className="w-10 h-10 text-red-600" />
                        Livelaw Intelligence
                    </h1>
                    <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                        Explore accross lakhs of legal articles.
                    </p>
                </div>
                <Badge variant="secondary" className="px-5 py-2.5 bg-red-100 dark:bg-red-900/30 rounded-2xl border border-red-200 dark:border-red-800 shadow-sm text-sm font-bold text-red-700 dark:text-red-300">
                    <Layers className="w-4 h-4 mr-2" />
                    {loading ? "Searching..." : `${documents.length} of ${totalHits} Articles`}
                </Badge>
            </div>


            {/* Search Bar Section */}
            <div className="mb-12 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 items-end">
                {/* Main Search */}
                <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2 space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                        <Search className="w-3 h-3" />
                        Search Content
                    </label>
                    <Input
                        type="text"
                        placeholder="Search title, summary, reasons..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-red-500/50 text-sm font-medium"
                    />
                </div>

                {/* Author Search */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        Author
                    </label>
                    <Input
                        type="text"
                        placeholder="Filter by author..."
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-red-500/50 text-sm font-medium"
                    />
                </div>

                {/* Date range - Start */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                        <CalendarIcon className="w-3 h-3" />
                        Start Date
                    </label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-red-500/50 text-sm font-medium"
                    />
                </div>

                {/* Date range - End */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                        <CalendarIcon className="w-3 h-3" />
                        End Date
                    </label>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-red-500/50 text-sm font-medium"
                    />
                </div>

                {/* Sort & Search Button Group */}
                <div className="flex gap-4 items-end sm:col-span-2 lg:col-span-1 xl:col-span-1">
                    <div className="flex-1 space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                            <Filter className="w-3 h-3" />
                            Sort By
                        </label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-red-500/50 text-sm font-bold outline-none">
                                <SelectValue placeholder="Sort order" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-100 dark:border-zinc-800">
                                <SelectItem value="newest" className="rounded-lg">Newest First</SelectItem>
                                <SelectItem value="oldest" className="rounded-lg">Oldest First</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={handleSearch}
                        className="h-12 w-12 p-0 bg-red-600 hover:bg-red-700 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-red-500/20 shrink-0"
                    >
                        <Search className="w-5 h-5" />
                    </Button>
                </div>

            </div>

            {/* Results Grid */}
            {loading && documents.length === 0 ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />
                    ))}
                </div>
            ) : (

                <>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {documents.length > 0 ? (
                            documents.map((doc, index) => {
                                if (index === documents.length - 1) {
                                    return (
                                        <div key={doc.id} ref={lastElementRef}>
                                            <LivelawCard doc={doc} />
                                        </div>
                                    );
                                }
                                return <LivelawCard key={doc.id} doc={doc} />;
                            })
                        ) : (
                            <div className="col-span-full text-center py-24 bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
                                <div className="mb-4 inline-flex p-4 bg-red-50 dark:bg-red-900/10 rounded-full">
                                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-900 dark:text-white font-bold text-lg">No matches found</p>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </div>

                    {/* Loading More Indicator */}
                    {loadingMore && (
                        <div className="flex justify-center mt-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        </div>
                    )}

                    {!hasMore && documents.length > 0 && (
                        <div className="text-center mt-12 text-gray-500 dark:text-gray-400 font-medium italic">
                            You've reached the end of the collection.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
