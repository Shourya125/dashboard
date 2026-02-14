"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, Clock, User, Scale } from "lucide-react";
import { API_URL } from "@/lib/utils";

export default function LivelawDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [doc, setDoc] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!params.id) return;

        fetch(`${API_URL}/livelaw/${params.id}`)
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
                    <Scale className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 dark:text-white font-bold text-lg">Document not found</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">The article you're looking for doesn't exist or has been removed.</p>
                    <Button onClick={() => router.back()} variant="outline" className="rounded-xl">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const confidenceValue = doc.confidence ?? doc.confidence_score;

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
                        <Scale className="w-6 h-6 text-red-500" />
                        <Badge variant="secondary" className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-100 dark:border-red-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {doc.source || "Livelaw"}
                        </Badge>
                        {confidenceValue !== undefined && (
                            <Badge variant="outline" className="ml-auto px-3 py-1 rounded-full text-[11px] font-bold text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-700">
                                Confidence: {Math.round(confidenceValue * 100)}%
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                        {doc.title || "Untitled Article"}
                    </h1>

                    <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
                        {doc.author && (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{doc.author}</span>
                            </div>
                        )}
                        {doc.published_at && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{new Date(doc.published_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8">
                    {/* Summary */}
                    {doc.summary && (
                        <div>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Summary</h2>
                            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                {doc.summary}
                            </p>
                        </div>
                    )}

                    {/* Source */}
                    {doc.source && (
                        <div>
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Source</h2>
                            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                {doc.source}
                            </p>
                        </div>
                    )}

                    {/* Relevance Reason */}
                    {doc.relevance_reason && (
                        <div className="p-5 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                            <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Relevance Reason</h2>
                            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                {doc.relevance_reason}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {doc.url && (
                    <div className="p-8 pt-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                        <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-bold hover:underline transition-all group"
                        >
                            <Scale className="w-4 h-4" />
                            Full Coverage
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
