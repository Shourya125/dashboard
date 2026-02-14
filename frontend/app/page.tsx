"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LivelawCard from "@/components/LivelawCard";
import ICHRCard from "@/components/ICHRCard";
import GazetteCard from "@/components/GazetteCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Scale, BookOpen, Search, Filter, Landmark } from "lucide-react";
import { API_URL } from "@/lib/utils";


export default function Home() {
  const router = useRouter();
  const [data, setData] = useState<any>({ livelaw: [], ichr: [], gazettes: [] });
  const [loading, setLoading] = useState(true);

  // Search bar state
  const [query, setQuery] = useState("");
  const [site, setSite] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, gazettesRes] = await Promise.all([
          fetch(`${API_URL}/all`),
          fetch(`${API_URL}/alerts/processed`)
        ]);

        const allJson = await allRes.json();
        const gazettesJson = await gazettesRes.json();

        setData({
          ...allJson,
          gazettes: gazettesJson
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (site) params.set("site", site);
    if (sortBy) params.set("sortBy", sortBy);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6">
          Central Intelligence <span className="text-blue-600">Dashboard</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          A unified platform to manage Livelaw legal intelligence and MOE historical research data.
        </p>

        {/* Unified Search Bar */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto mt-10">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-xl space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search across Livelaw and MOE documents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-14 pl-12 pr-4 rounded-2xl border-2 border-gray-200 dark:border-zinc-800 text-lg shadow-sm focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-blue-500/50"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Site Filter */}
              <div className="space-y-2">
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
                        MOE
                      </span>
                    </SelectItem>
                    <SelectItem value="gazette" className="rounded-lg">
                      <span className="flex items-center gap-2">
                        <Landmark className="w-3.5 h-3.5 text-emerald-500" />
                        Gazettes
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Dropdown */}
              <div className="space-y-2">
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

              {/* Date Filters */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                  <Filter className="w-3 h-3" />
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50 text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1.5">
                  <Filter className="w-3 h-3" />
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50 text-sm font-medium"
                />
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                className="h-12 w-full sm:col-span-2 lg:col-span-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Intelligence
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-10 flex flex-wrap justify-center gap-6">
          <Button asChild size="lg" variant="outline" className="px-8 py-6 bg-white dark:bg-zinc-900 border-2 border-red-600/20 text-red-600 dark:text-red-400 font-bold rounded-2xl shadow-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105 active:scale-95 group">
            <Link href="/livelaw">
              <Scale className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Browse Livelaw
              <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8 py-6 bg-white dark:bg-zinc-900 border-2 border-blue-600/20 text-blue-600 dark:text-blue-400 font-bold rounded-2xl shadow-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105 active:scale-95 group">
            <Link href="/ichr">
              <BookOpen className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Browse MOE
              <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8 py-6 bg-white dark:bg-zinc-900 border-2 border-emerald-600/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl shadow-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all hover:scale-105 active:scale-95 group">
            <Link href="/gazettes">
              <Landmark className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Browse Gazettes
              <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </Button>
        </div>

      </div>

      {loading ? (
        <div className="space-y-16">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-8">
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-64 rounded-xl" />
                <Skeleton className="h-6 w-24 rounded-lg" />
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-[400px] w-full rounded-2xl" />
                ))}
              </div>
            </div>
          ))}
        </div>

      ) : (
        <div className="space-y-16">
          {/* Livelaw Section */}
          {data.livelaw?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="w-2 h-8 bg-red-500 rounded-full mr-3"></span>
                  Latest Livelaw Updates
                </h2>
                <Link href="/livelaw" className="text-sm font-bold text-red-600 hover:underline">View All &rarr;</Link>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {data.livelaw.slice(0, 3).map((doc: any) => (
                  <LivelawCard key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          )}

          {/* ICHR Section */}
          {data.ichr?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
                  MOE Research Highlights
                </h2>
                <Link href="/ichr" className="text-sm font-bold text-blue-600 hover:underline">View All &rarr;</Link>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {data.ichr.slice(0, 3).map((doc: any) => (
                  <ICHRCard key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          )}

          {/* Gazettes Section */}
          {data.gazettes?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full mr-3"></span>
                  Latest Gazette Notifications
                </h2>
                <Link href="/gazettes" className="text-sm font-bold text-emerald-600 hover:underline">View All &rarr;</Link>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {data.gazettes.slice(0, 3).map((doc: any) => (
                  <GazetteCard key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          )}

          {!data.livelaw?.length && !data.ichr?.length && !data.gazettes?.length && (
            <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No data available in the system.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
