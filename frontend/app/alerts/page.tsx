"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, ChevronRight, Check, X, FileText, Calendar, Building } from "lucide-react";

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/alerts`);
            const data = await res.json();
            setAlerts(data);
        } catch (err) {
            console.error("Failed to fetch alerts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleAction = async (id: string, action: "approve" | "decline") => {
        try {
            await fetch(`${API_URL}/alerts/${id}/action`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action })
            });
            // Update local state
            setAlerts(prev => prev.filter(a => a.id !== id));
            // Notify Navbar to update count
            window.dispatchEvent(new Event('alert-updated'));
        } catch (err) {
            console.error("Action failed:", err);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
            case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <Bell className="w-10 h-10 text-red-600" />
                        Intelligence Alerts
                    </h1>
                    <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                        Review and manage important legislative and economic updates.
                    </p>
                </div>
                <Badge variant="secondary" className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-xl font-bold">
                    {alerts.length} Pending Actions
                </Badge>
            </div>

            {loading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-3xl" />)}
                </div>
            ) : alerts.length > 0 ? (
                <div className="grid gap-6">
                    {alerts.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="p-8">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <Badge className={`uppercase text-[10px] font-black px-3 py-1 rounded-full border ${getPriorityColor(item.priority)}`}>
                                                {item.priority || 'Low'} Priority
                                            </Badge>
                                            <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {item.alerted_at ? new Date(item.alerted_at).toLocaleDateString() : 'Recent'}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                                {item.gazette_details?.subject || "Subject Unavailable"}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                                                <span className="flex items-center gap-1.5">
                                                    <Building className="w-4 h-4" />
                                                    {item.gazette_details?.ministry || "General Alert"}
                                                </span>

                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 italic">
                                                "{item.summary}"
                                            </p>
                                        </div>

                                        <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Reasoning</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                {item.reason}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="lg:w-64 flex flex-col gap-4">
                                        <Button
                                            onClick={() => router.push(`/alerts/${item.id}`)}
                                            className="w-full h-14 bg-slate-100 hover:bg-slate-300 text-slate-600 dark:bg-zinc-300 dark:text-slate-900 dark:hover:bg-white dark:border-zinc-300 font-bold rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all border border-transparent cursor-pointer"
                                        >
                                            View Details
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                onClick={() => handleAction(item.id, "approve")}
                                                className="h-14 bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-2xl transition-all"
                                            >
                                                <Check className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                onClick={() => handleAction(item.id, "decline")}
                                                className="h-14 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-2xl transition-all"
                                            >
                                                <X className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-gray-50 dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-zinc-800">
                    <div className="mb-6 inline-flex p-6 bg-green-50 dark:bg-green-900/10 rounded-full">
                        <Check className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All caught up!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto font-medium text-lg">
                        There are no pending alerts for you to review at this time.
                    </p>
                    <Button
                        onClick={() => router.push('/')}
                        variant="link"
                        className="mt-8 text-red-600 font-bold hover:no-underline"
                    >
                        Return to Dashboard →
                    </Button>
                </div>
            )}
        </div>
    );
}
