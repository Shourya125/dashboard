"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Lock, ShieldCheck } from "lucide-react";


export default function LoginPage() {
    const { user, loading, signInWithGoogle, error } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push("/");
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <Card className="max-w-md w-full border-gray-200 dark:border-zinc-800 shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-zinc-900">
                <CardHeader className="text-center pt-8 pb-4">
                    <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/20 rotate-3 transition-transform hover:rotate-0 duration-300">
                        <Lock className="w-12 h-12 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                        Varahe Analytics
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400 font-medium">
                        Internal Insights Dashboard
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 space-y-8">
                    {error && (
                        <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 rounded-xl animate-shake">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="font-bold">Access Denied</AlertTitle>
                            <AlertDescription className="text-xs font-medium">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button
                        onClick={signInWithGoogle}
                        disabled={loading}
                        variant="outline"
                        className="w-full h-14 flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-zinc-800 border-2 border-gray-100 dark:border-zinc-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all shadow-sm hover:shadow-lg disabled:opacity-50 group font-bold"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                            <>
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Sign in with Google</span>
                            </>
                        )}
                    </Button>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 pb-8 pt-4">
                    <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-red-500 uppercase opacity-50">
                        <ShieldCheck className="w-3 h-3" />
                        Restricted Access
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold text-center leading-relaxed">
                        AUTHORIZED GOOGLE ACCOUNTS ONLY<br />
                        DOMAIN VALIDATION ACTIVE
                    </p>
                </CardFooter>
            </Card>
        </div>

    );
}
