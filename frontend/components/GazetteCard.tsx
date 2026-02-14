"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Building, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";

interface GazetteDocument {
    id: string;
    summary?: string;
    priority?: string;
    alerted_at?: string;
    gazette_id?: string;
    gazette_details?: {
        ministry?: string;
        subject?: string;
        pdf_url?: string;
        publish_date?: string;
    };
}

export default function GazetteCard({ doc }: { doc: GazetteDocument }) {
    const router = useRouter();

    const handleCardClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('a') || target.closest('button')) return;
        router.push(`/gazettes/${doc.id}`);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200';
            case 'medium': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-100';
            default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
        }
    };

    return (
        <Card
            onClick={handleCardClick}
            className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:scale-[1.02] hover:border-emerald-500/50 transition-all duration-300 group cursor-pointer ring-0 hover:ring-4 hover:ring-emerald-500/10 overflow-hidden"
        >
            <CardHeader className="p-6 pb-0 space-y-4">
                <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 transition-colors px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Gazette Official
                    </Badge>
                    <Landmark className="w-4 h-4 text-emerald-500/50" />
                </div>

                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                    {doc.gazette_details?.subject || "Official Notification"}
                </CardTitle>

                <div className="flex flex-wrap gap-3 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="line-clamp-1">{doc.gazette_details?.ministry || "Union Government"}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed italic mb-4">
                    "{doc.summary}"
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <Badge className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${getPriorityColor(doc.priority || 'low')}`}>
                        {doc.priority || 'Low'} Priority
                    </Badge>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{doc.gazette_details?.publish_date || (doc.alerted_at ? new Date(doc.alerted_at).toLocaleDateString() : 'Recent')}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="mt-auto p-6 pt-4 flex items-center justify-end border-t border-gray-100/50 dark:border-zinc-800/50 bg-emerald-50/10 dark:bg-emerald-900/5">
                <Button asChild variant="link" className="text-emerald-600 dark:text-emerald-400 font-bold p-0 h-auto group/btn">
                    <a
                        href={doc.gazette_details?.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5"
                    >
                        View Official PDF
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                </Button>
            </CardFooter>
        </Card>
    );
}
