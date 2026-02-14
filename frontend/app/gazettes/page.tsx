"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Landmark, CheckCircle, Search, Filter, Calendar as CalendarIcon, SlidersHorizontal, ChevronDown } from "lucide-react";
import GazetteCard from "@/components/GazetteCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function GazettesPage() {
    const [gazettes, setGazettes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const router = useRouter();

    const fetchGazettes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (query) params.append("query", query);
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            if (sortBy) params.append("sortBy", sortBy);
            if (selectedTags.length > 0) params.append("tags", selectedTags.join(","));

            const res = await fetch(`${API_URL}/alerts/processed?${params.toString()}`);
            const data = await res.json();
            setGazettes(data);
        } catch (err) {
            console.error("Failed to fetch gazettes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGazettes();
    }, []);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        fetchGazettes();
    };



    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const impactMarkers = [
        { id: "legislative_value", label: "Legislative Value" },
        { id: "economic_impact", label: "Economic Impact" },
        { id: "political_relevance", label: "Political Relevance" }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <Landmark className="w-10 h-10 text-emerald-600" />
                        Official Gazettes
                    </h1>
                    <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                        Archive of processed and accepted legislative notifications.
                    </p>
                </div>
                <Badge variant="secondary" className="px-5 py-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {loading ? "Searching..." : `${gazettes.length} Documents Archived`}
                </Badge>
            </div>

            {/* Grid Search Bar Section (Same as Livelaw/ICHR) */}
            <div className="mb-12 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 items-end">
                {/* Main Search */}
                <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2 space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                        <Search className="w-3 h-3" />
                        Search Content
                    </label>
                    <Input
                        type="text"
                        placeholder="Search ministry, subject, summary..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500/50 text-sm font-medium"
                    />
                </div>

                {/* Impact Markers Dropdown */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3 h-3" />
                        Impact Factors
                    </label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-12 w-full justify-between bg-gray-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10">
                                <span className="truncate">
                                    {selectedTags.length > 0 ? `${selectedTags.length} Selected` : "All Factors"}
                                </span>
                                <ChevronDown className="w-4 h-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 rounded-xl">
                            <DropdownMenuLabel>Filter by Impact</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {impactMarkers.map(marker => (
                                <DropdownMenuCheckboxItem
                                    key={marker.id}
                                    checked={selectedTags.includes(marker.id)}
                                    onCheckedChange={() => toggleTag(marker.id)}
                                    className="rounded-lg"
                                >
                                    {marker.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                        className="h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500/50 text-sm font-medium"
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
                        className="h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500/50 text-sm font-medium"
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
                            <SelectTrigger className="h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/50 text-sm font-bold outline-none">
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
                        className="h-12 w-12 p-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 shrink-0"
                    >
                        <Search className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[450px] w-full rounded-[2.5rem]" />)}
                </div>
            ) : gazettes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gazettes.map((item) => (
                        <GazetteCard key={item.id} doc={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-gray-50 dark:bg-zinc-900/50 rounded-[4rem] border-2 border-dashed border-gray-200 dark:border-zinc-800">
                    <div className="mb-8 inline-flex p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-full">
                        <Search className="w-16 h-16 text-emerald-300 dark:text-emerald-700" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Empty Archive</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-md mx-auto font-bold text-xl leading-relaxed">
                        No gazettes found.
                    </p>
                    <Button
                        onClick={() => router.push('/alerts')}
                        className="mt-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-12 py-7 rounded-2xl shadow-2xl shadow-emerald-500/20 text-lg transition-transform hover:scale-105 active:scale-95"
                    >
                        Check Pending Alerts
                    </Button>
                </div>
            )}
        </div>
    );
}
