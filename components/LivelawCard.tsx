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
import { ArrowRight, Clock, User, Scale } from "lucide-react";
import { useRouter } from "next/navigation";

interface LivelawDocument {
    id: string;
    author?: string;
    confidence?: number;
    confidence_score?: number;
    published_at?: string | number;
    relevance_reason?: string;
    source?: string;
    summary?: string;
    title?: string;
    url?: string;
}

export default function LivelawCard({ doc }: { doc: LivelawDocument }) {
    const router = useRouter();

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if user clicked the Full Coverage link
        const target = e.target as HTMLElement;
        if (target.closest('a') || target.closest('button')) return;
        router.push(`/livelaw/${doc.id}`);
    };

    return (
        <Card
            onClick={handleCardClick}
            className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:scale-105 hover:border-red-500/50 transition-all duration-300 group cursor-pointer ring-0 hover:ring-2 hover:ring-red-500/20 overflow-hidden"
        >
            <CardHeader className="p-6 pb-0 space-y-4">
                <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {doc.source || "Livelaw"}
                    </Badge>
                    <Scale className="w-4 h-4 text-red-500/50" />
                </div>

                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                    {doc.title || "Untitled Article"}
                </CardTitle>
                <CardDescription className="flex flex-wrap gap-4 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    {doc.author && (
                        <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="hover:text-red-500 cursor-default transition-colors">{doc.author}</span>
                        </div>
                    )}
                    {doc.published_at && (
                        <div className="flex items-center gap-1.5 ml-auto">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{new Date(doc.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    )}
                </CardDescription>

            </CardHeader>

            <CardContent className="p-6">
                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                        {doc.summary || "No summary available."}
                    </p>
                </div>

                {doc.relevance_reason && (
                    <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border-l-4 border-red-500">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 italic leading-relaxed">
                            <span className="font-bold text-red-500 not-italic uppercase text-[9px] block mb-1">Relevance Fact</span>
                            {doc.relevance_reason}
                        </p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="mt-auto p-6 pt-4 flex items-center justify-end border-t border-gray-100/50 dark:border-zinc-800/50 bg-gray-50/30 dark:bg-zinc-900/30">
                <Button asChild variant="link" className="text-red-600 dark:text-red-400 font-bold p-0 h-auto group/btn">
                    <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5"
                    >
                        Full Coverage
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                </Button>
            </CardFooter>

        </Card>
    );
}
