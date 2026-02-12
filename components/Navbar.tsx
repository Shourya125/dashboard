"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LogOut, Sun, Moon, Menu, Home as HomeIcon, Scale, BookOpen, MoreVertical, Search as SearchIcon, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
    const { resolvedTheme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();


    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
            setSearchQuery("");
        }
    };

    if (!mounted) return null;

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link
                            href="/"
                            className="text-2xl font-bold bg-cyan-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                        >
                            <Image
                                src="/image.png"
                                alt="Logo"
                                width={150}
                                height={80}
                                className="object-contain"
                            />
                        </Link>
                    </div>

                    {/* Global Search Bar (Desktop) */}
                    {user && (
                        <div className="hidden md:flex flex-1 max-w-md mx-8">
                            <form onSubmit={handleSearch} className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Search everything..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border-none text-sm focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-400"
                                />
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </form>
                        </div>
                    )}

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user && (
                            <div className="flex items-center gap-3 pr-4 border-r border-gray-100 dark:border-zinc-800">
                                <div className="text-right">
                                    <div className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px]">
                                        {user.displayName?.split(' ')[0]}
                                    </div>
                                </div>
                                <Avatar className="h-8 w-8 border border-gray-200 dark:border-zinc-700">
                                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                                    <AvatarFallback className="bg-red-600 text-white text-xs font-bold">
                                        {user.displayName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        )}

                        {/* Notification Bell */}
                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all relative"
                                    >
                                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                        {/* Notification dot — show when there are notifications */}
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80 rounded-2xl p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-sm">Notifications</h3>
                                        <Badge variant="secondary" className="text-xs">2 New</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex gap-3 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                                            <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">System Update</p>
                                                <p className="text-xs text-gray-500 mt-1">Livelaw sync completed successfully.</p>
                                                <p className="text-[10px] text-gray-400 mt-2">Just now</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <div className="mt-1 w-2 h-2 bg-transparent rounded-full flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">New ICHR Documents</p>
                                                <p className="text-xs text-gray-500 mt-1">15 new documents added to the archive.</p>
                                                <p className="text-[10px] text-gray-400 mt-2">2 hours ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="w-full mt-2 text-xs text-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-300">
                                        Mark all as read
                                    </Button>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {user && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                className="text-xs font-bold uppercase tracking-wider hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all rounded-xl"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        )}

                        {/* Navigation Dropdown (Three Dots) */}
                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl bg-muted hover:bg-accent transition-all border border-border"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 rounded-2xl p-2 bg-popover text-popover-foreground border border-border shadow-lg"
                                >
                                    <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        Navigation
                                    </DropdownMenuLabel>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem asChild className="rounded-xl">
                                        <Link
                                            href="/"
                                            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold"
                                        >
                                            <HomeIcon className="h-4 w-4" />
                                            Home
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild className="rounded-xl">
                                        <Link
                                            href="/livelaw"
                                            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold"
                                        >
                                            <Scale className="h-4 w-4" />
                                            Livelaw
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild className="rounded-xl">
                                        <Link
                                            href="/ichr"
                                            className="flex items-center gap-3 px-3 py-2 text-sm font-semibold"
                                        >
                                            <BookOpen className="h-4 w-4" />
                                            ICHR
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}


                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all border border-gray-100 dark:border-zinc-700"
                        >
                            {resolvedTheme === "dark" ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-700" />
                            )}
                        </Button>
                    </div>


                    {/* Mobile Navigation / Menu Button */}
                    <div className="flex items-center md:hidden space-x-4">
                        {/* Notification Bell (Mobile) */}
                        {user && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-lg bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:scale-110 active:scale-95 transition-all duration-200 relative"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="rounded-lg bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:scale-110 active:scale-95 transition-all duration-200"
                        >
                            {resolvedTheme === "light" ? (
                                <Moon className="w-5 h-5" />
                            ) : (
                                <Sun className="w-5 h-5" />
                            )}
                        </Button>

                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-lg bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:scale-110 active:scale-95 transition-all duration-200">
                                        <Menu className="w-5 h-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                    <DropdownMenuItem asChild>
                                        <Link href="/" className="flex items-center">
                                            <HomeIcon className="mr-3 h-4 w-4 text-gray-400" />
                                            Home
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/livelaw" className="flex items-center">
                                            <Scale className="mr-3 h-4 w-4 text-red-500" />
                                            Livelaw
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/ichr" className="flex items-center">
                                            <BookOpen className="mr-3 h-4 w-4 text-blue-500" />
                                            ICHR
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>


                </div>
            </div>
        </nav>
    );
}
