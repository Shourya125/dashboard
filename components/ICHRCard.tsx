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
import { Calendar, MapPin, ArrowRight, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";


interface ICHRDocument {
    id: string;
    attachments?: string[];
    Date?: number | string;
    Place?: string;
    content?: string;
    summary?: string;
    title?: string;
    site?: string;
    url?: string;
}

export default function ICHRCard({ doc }: { doc: ICHRDocument }) {
    const router = useRouter();
    const mainLink = (doc.attachments && doc.attachments.length > 0) ? doc.attachments[0] : (doc.url || "#");

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if user clicked the View Attachment link
        const target = e.target as HTMLElement;
        if (target.closest('a')) return;
        router.push(`/ichr/${doc.id}`);
    };

    return (
        <Card
            onClick={handleCardClick}
            className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:scale-105 hover:border-blue-500/50 transition-all duration-300 group cursor-pointer ring-0 hover:ring-2 hover:ring-blue-500/20 overflow-hidden"
        >
            <CardHeader className="p-6 pb-0 space-y-4">
                <div className="flex justify-between items-center">
                    <Badge variant="outline" className="px-3 py-1 text-[10px] font-bold text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 uppercase tracking-widest rounded-full">
                        {doc.site || "Archive"}
                    </Badge>
                    <BookOpen className="w-4 h-4 text-blue-500/50" />
                </div>

                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {doc.title || "Untitled Document"}
                </CardTitle>
                <CardDescription className="flex flex-wrap gap-4 text-[11px] font-medium">
                    {doc.Date && (
                        <div className="flex items-center text-gray-500 dark:text-gray-400 gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {typeof doc.Date === 'number'
                                ? new Date(doc.Date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
                                : doc.Date
                            }
                        </div>
                    )}
                    {doc.Place && (
                        <div className="flex items-center text-gray-500 dark:text-gray-400 gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {doc.Place}
                        </div>
                    )}
                </CardDescription>

            </CardHeader>

            <CardContent className="p-6">
                <div className="space-y-3">
                    {doc.summary && (
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed italic">
                            &ldquo;{doc.summary}&rdquo;
                        </p>
                    )}
                    {doc.content && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                            {doc.content}
                        </p>
                    )}
                </div>
            </CardContent>

            <CardFooter className="mt-auto flex items-center justify-end p-6 pt-4 border-t border-gray-100/50 dark:border-zinc-800/50 bg-gray-50/30 dark:bg-zinc-900/30">
                <Button asChild variant="link" className="text-blue-600 dark:text-blue-400 font-bold p-0 h-auto group/btn">
                    <a
                        href={mainLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5"
                    >
                        View Attachment
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                </Button>
            </CardFooter>

        </Card>
    );
}
