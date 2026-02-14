"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ExternalLink, Check, X, Building, Calendar, FileText, Info, Zap, Briefcase, Landmark } from "lucide-react";

export default function AlertDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
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

    const handleAction = async (action: "approve" | "decline") => {
        try {
            await fetch(`${API_URL}/alerts/${params.id}/action`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });
            // Notify Navbar to update count
            window.dispatchEvent(new Event('alert-updated'));
            router.push('/alerts');
        } catch (err) {
            console.error("Action failed:", err);
        }
    };

    if (loading) return (
        <div className="max-w-4xl mx-auto px-4 py-24">
            <Skeleton className="h-12 w-1/3 mb-12" />
            <Skeleton className="h-[600px] w-full rounded-3xl" />
        </div>
    );

    if (!data || !data.alert) return (
        <div className="text-center py-24">
            <h2 className="text-2xl font-bold">Alert not found</h2>
            <Button onClick={() => router.push('/alerts')} variant="link">Back to alerts</Button>
        </div>
    );

    const { alert, gazette } = data;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Button
                onClick={() => router.push('/alerts')}
                variant="ghost"
                className="mb-8 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl px-4 py-2 font-bold flex items-center gap-2 group"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Alerts
            </Button>

            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden mb-8">
                {/* Header Section */}
                <div className="p-8 lg:p-12 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Badge className={`uppercase text-[10px] font-black px-3 py-1 rounded-full border ${alert.priority === 'high' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                                    }`}>
                                    {alert.priority} Priority
                                </Badge>
                                {alert.important_ministry && <Badge className="bg-purple-100 text-purple-700 border-purple-200 uppercase text-[10px] font-black px-3 py-1 rounded-full border">Important Ministry</Badge>}
                            </div>
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                                {gazette?.subject || "Subject Unavailable"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-2">
                                    <Building className="w-5 h-5 text-gray-400" />
                                    {gazette?.ministry || "General"}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    Published: {gazette?.publish_date || "N/A"}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
                            <Button
                                onClick={() => handleAction("approve")}
                                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-500/20"
                            >
                                <Check className="w-5 h-5 mr-2" />
                                Approve
                            </Button>
                            <Button
                                onClick={() => handleAction("decline")}
                                className="w-full h-14 bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 font-bold rounded-2xl border border-red-100 dark:border-red-900/30"
                            >
                                <X className="w-5 h-5 mr-2" />
                                Decline
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Summary Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-wider">Summary</h2>
                            </div>
                            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic mb-8">
                                "{alert.summary}"
                            </p>
                            <div className="p-6 bg-gray-50 dark:bg-zinc-800/80 rounded-[2rem] border border-gray-100 dark:border-zinc-800">
                                <p className="text-sm font-bold text-gray-400 uppercase mb-3">Relevance Reason</p>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-bold">
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
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-wider">Gazette Content</h2>
                                </div>
                                <div className="p-8 bg-zinc-50 dark:bg-zinc-950 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    <pre className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-mono leading-loose">
                                        {gazette.pdf_text}
                                    </pre>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar / Metadata */}
                    <div className="space-y-8">
                        {/* Status Checkbox Items */}
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 space-y-6">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-2">Impact Analysis</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                    <span className="flex items-center gap-2 text-sm font-bold">
                                        <Landmark className="w-4 h-4 text-emerald-500" />
                                        Legislative Value
                                    </span>
                                    {alert.legislative_value ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-zinc-300" />}
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                    <span className="flex items-center gap-2 text-sm font-bold">
                                        <Briefcase className="w-4 h-4 text-emerald-500" />
                                        Economic Impact
                                    </span>
                                    {alert.economic_impact ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-zinc-300" />}
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                    <span className="flex items-center gap-2 text-sm font-bold">
                                        <Zap className="w-4 h-4 text-emerald-500" />
                                        Political Relevance
                                    </span>
                                    {alert.political_relevance ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-zinc-300" />}
                                </div>
                            </div>

                            {/* <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] font-black text-zinc-400 uppercase mb-2 pl-2">Confidence Score</p>
                                <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 rounded-full"
                                        style={{ width: `${(alert.confidence || 0) * 100}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-right text-sm font-black text-blue-600">{Math.round((alert.confidence || 0) * 100)}%</p>
                            </div> */}
                        </div>

                        {/* PDF Link Button */}
                        {gazette?.pdf_url && (
                            <Button
                                asChild
                                className="w-full h-16 bg-[#002d62] hover:bg-[#001f44] text-white font-black rounded-2xl shadow-xl shadow-blue-500/10 text-lg group border-b-4 border-blue-900"
                            >
                                <a href={gazette.pdf_url} target="_blank" rel="noopener noreferrer">
                                    View Official PDF
                                    <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </a>
                            </Button>
                        )}

                        <div className="p-6 bg-red-50/50 dark:bg-zinc-800/50 rounded-[2rem] border border-red-100/50 dark:border-zinc-800">
                            <p className="text-xs text-red-800 dark:text-red-300 font-bold leading-relaxed flex gap-2">
                                <Info className="w-4 h-4 shrink-0" />
                                Please review this document carefully. Your decision will mark the legislative update as relevant for policy tracking.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
