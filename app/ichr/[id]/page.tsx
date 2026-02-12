"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, Calendar, MapPin, BookOpen } from "lucide-react";

export default function ICHRDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [doc, setDoc] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!params.id) return;

        fetch(`/api/ichr/${params.id}`)
            .then(res => {
                if (!res.ok) throw new Error("Document not found");
                return res.json();
            })
            .then(data => {
                setDoc(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [params.id]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
                <Skeleton className="h-8 w-32 rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-6 w-64 rounded-xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        );
    }

    if (error || !doc) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <div className="p-12 bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
                    <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-900 dark:text-white font-bold text-lg">Document not found</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">The record you're looking for doesn't exist or has been removed.</p>
                    <Button onClick={() => router.back()} variant="outline" className="rounded-xl">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const mainLink = (doc.attachments && doc.attachments.length > 0) ? doc.attachments[0] : (doc.url || "#");

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Back Button */}
            <Button
                onClick={() => router.back()}
                variant="ghost"
                className="mb-8 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-xl group"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
            </Button>

            {/* Main Content Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                {/* Header */}
                <div className="p-8 pb-6 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-6 h-6 text-blue-500" />
                        <Badge variant="outline" className="px-3 py-1 text-[10px] font-bold text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 uppercase tracking-widest rounded-full">
                            {doc.site || "Archive"}
                        </Badge>
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                        {doc.title || "Untitled Document"}
                    </h1>

                    <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
                        {doc.Date && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>
                                    {typeof doc.Date === 'number'
                                        ? new Date(doc.Date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                                        : doc.Date
                                    }
                                </span>
                            </div>
                        )}
                        {doc.Place && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{doc.Place}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8">
                    {/* Content */}
                    {doc.content && (
                        <div>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Content</h2>
                            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {doc.content}
                            </p>
                        </div>
                    )}

                    {/* Site */}
                    {doc.site && (
                        <div>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Site</h2>
                            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                {doc.site}
                            </p>
                        </div>
                    )}

                    {/* Summary */}
                    {doc.summary && (
                        <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">Summary</h2>
                            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                {doc.summary}
                            </p>
                        </div>
                    )}

                    {/* Title (if different from heading) */}
                    {doc.title && (
                        <div>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Title</h2>
                            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                                {doc.title}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {mainLink && mainLink !== "#" && (
                    <div className="p-8 pt-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                        <a
                            href={mainLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold hover:underline transition-all group"
                        >
                            <BookOpen className="w-4 h-4" />
                            View Attachment
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
