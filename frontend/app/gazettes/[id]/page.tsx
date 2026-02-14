"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ExternalLink, Building, Calendar, FileText, Info, Zap, Briefcase, Landmark, CheckCircle } from "lucide-react";

export default function GazetteDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchDetail = async () => {
        try {
            const res = await fetch(`${API_URL}/alerts/${params.id}`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error("Failed to fetch detail:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [params.id]);

    if (loading) return (
        <div className="max-w-4xl mx-auto px-4 py-24">
            <Skeleton className="h-12 w-1/3 mb-12" />
            <Skeleton className="h-[600px] w-full rounded-3xl" />
        </div>
    );

    if (!data || !data.alert) return (
        <div className="text-center py-24">
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Gazette not found</h2>
            <Button onClick={() => router.push('/gazettes')} variant="link" className="text-emerald-600">Back to archive</Button>
        </div>
    );

    const { alert, gazette } = data;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Button
                onClick={() => router.push('/gazettes')}
                variant="ghost"
                className="mb-8 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 rounded-xl px-4 py-2 font-bold flex items-center gap-2 group"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Archive
            </Button>

            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden mb-8 ring-1 ring-emerald-500/10">
                {/* Header Section */}
                <div className="p-8 lg:p-12 border-b border-gray-100 dark:border-zinc-800 bg-emerald-50/20 dark:bg-emerald-900/10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Badge className={`uppercase text-[10px] font-black px-3 py-1 rounded-full border ${alert.priority === 'high' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                                    }`}>
                                    {alert.priority} Priority
                                </Badge>
                            </div>
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                {gazette?.subject || "Subject Unavailable"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-2">
                                    <Building className="w-5 h-5 text-emerald-500" />
                                    {gazette?.ministry || "General Cabinet"}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-emerald-500" />
                                    Published: {gazette?.publish_date || "N/A"}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Content Grid */}
                <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Summary Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-wider">Document Summary</h2>
                            </div>
                            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic mb-8 border-l-4 border-emerald-500 pl-6 py-2">
                                "{alert.summary}"
                            </p>
                            <div className="p-8 bg-gray-50 dark:bg-zinc-800/80 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800">
                                <p className="text-sm font-bold text-emerald-600 uppercase mb-3 tracking-widest">Relevance Rationale</p>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-bold text-lg">
                                    {alert.reason}
                                </p>
                            </div>
                        </section>

                        {/* Full Text Section */}
                        {gazette?.pdf_text && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                                        <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-wider">Official Gazette Content</h2>
                                </div>
                                <div className="p-8 bg-zinc-50 dark:bg-zinc-950 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    <pre className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed">
                                        {gazette.pdf_text}
                                    </pre>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar / Metadata */}
                    <div className="space-y-8">
                        <div className="bg-emerald-50/30 dark:bg-emerald-900/5 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800/50 space-y-8 shadow-sm">
                            <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-[0.2em] pl-2">Intelligence Markers</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                    <span className="flex items-center gap-3 text-sm font-black text-gray-700 dark:text-gray-300">
                                        <Landmark className="w-5 h-5 text-emerald-500" />
                                        Legislative
                                    </span>
                                    {alert.legislative_value ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-zinc-200" />}
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                    <span className="flex items-center gap-3 text-sm font-black text-gray-700 dark:text-gray-300">
                                        <Briefcase className="w-5 h-5 text-emerald-500" />
                                        Economic
                                    </span>
                                    {alert.economic_impact ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-zinc-200" />}
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                    <span className="flex items-center gap-3 text-sm font-black text-gray-700 dark:text-gray-300">
                                        <Zap className="w-5 h-5 text-emerald-500" />
                                        Political
                                    </span>
                                    {alert.political_relevance ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-zinc-200" />}
                                </div>
                            </div>
                        </div>

                        {/* PDF Link Button */}
                        {gazette?.pdf_url && (
                            <Button
                                asChild
                                className="w-full h-20 bg-[#002d62] hover:bg-[#001f44] text-white font-black rounded-3xl shadow-2xl shadow-blue-500/10 text-xl group border-b-8 border-blue-900 transition-all hover:-translate-y-1 active:translate-y-1 active:border-b-0"
                            >
                                <a href={gazette.pdf_url} target="_blank" rel="noopener noreferrer">
                                    View Official PDF
                                    <ExternalLink className="w-6 h-6 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </a>
                            </Button>
                        )}

                        <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800 shadow-sm">
                            <p className="text-xs text-emerald-800 dark:text-emerald-400 font-bold leading-relaxed mb-4 uppercase tracking-widest pl-2 border-l-2 border-emerald-500">Audit Information</p>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium opacity-80 leading-relaxed">
                                This document was formally processed on {alert.alerted_at ? new Date(alert.alerted_at).toLocaleString() : 'N/A'}.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
