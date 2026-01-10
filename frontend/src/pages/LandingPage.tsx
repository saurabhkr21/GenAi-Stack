import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, LogOut, Sun, Moon, Github } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
    const navigate = useNavigate();
    const { token, user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // If already logged in, redirect to dashboard? 
    // Or let them see the landing page but "Get Started" goes to dashboard.
    // Let's keep it simple: "Get Started" -> Dashboard if logged in, else Login.

    const handleGetStarted = () => {
        if (token) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden relative selection:bg-purple-500/30 transition-colors duration-300">
            {/* Background Gradients */}
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-200/40 dark:bg-purple-900/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-blue-200/40 dark:bg-blue-900/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] bg-indigo-200/40 dark:bg-indigo-900/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-background/50 backdrop-blur-md border-b border-border transition-all duration-300">
                <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-linear-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
                            ai
                        </div>
                        <span className="font-bold text-xl tracking-tight text-foreground">GenAI Stack</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        {token ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 bg-background pl-3 pr-2 py-1.5 rounded-full border border-border hover:border-muted-foreground hover:shadow-sm transition-all text-sm font-medium text-foreground"
                                >
                                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border py-1 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                        <div className="px-4 py-3 border-b border-border">
                                            <p className="text-sm font-medium text-foreground truncate">Account</p>
                                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsProfileOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 grid lg:grid-cols-2 gap-12 items-center">

                {/* Left Content */}
                <div className="space-y-8 animate-in slide-in-from-left-10 fade-in duration-700 relative z-20">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-linear-to-r from-purple-200 to-blue-100 border border-purple-200 text-xs font-semibold text-purple-700 dark:bg-white/5 dark:border-white/10 dark:text-purple-300 mb-2 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-600 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-700 dark:bg-purple-500"></span>
                            </span>
                            v2.0 is now live
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tight drop-shadow-sm text-gray-900 dark:text-gray-50">
                            Stop fighting <br />
                            <span className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent pb-2">
                                your tools
                            </span>
                        </h1>
                        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-lg leading-relaxed pt-2 font-medium">
                            Build and deploy powerful AI agents and workflows visually. Support for all major LLMs, vector databases, and custom tools.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4">
                        <button
                            onClick={handleGetStarted}
                            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white rounded-full font-bold text-lg text-white dark:text-gray-900 shadow-xl shadow-black/10 dark:shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {token ? "Go to Dashboard" : "Get Started for Free"}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>

                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm dark:bg-white/10 dark:border-white/10 dark:text-white dark:hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Github size={20} />
                            Star on GitHub
                        </a>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 pt-4 animate-in fade-in duration-1000 delay-300 fill-mode-both">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-10 h-10 rounded-full border-2 border-white dark:border-background bg-gray-${i * 100 + 400} flex items-center justify-center text-xs text-white overflow-hidden bg-cover bg-center`} style={{ backgroundImage: `url(https://ui-avatars.com/api/?name=User+${i}&background=random)` }}>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col leading-tight">
                            <div className="flex text-yellow-500 gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => <span key={i}>★</span>)}
                            </div>
                            <span className="font-semibold">Trusted by 10,000+ developers</span>
                        </div>
                    </div>
                </div>

                {/* Right Content - Visual Mockup */}
                <div className="relative animate-in slide-in-from-right-10 fade-in duration-700 delay-200 perspective-1000">
                    {/* Glowing effect behind the card */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-linear-to-tr from-purple-500/20 via-blue-500/20 to-pink-500/20 blur-3xl rounded-full pointer-events-none" />

                    {/* The connector line animation */}
                    <svg className="absolute -left-20 top-1/2 w-32 h-32 text-purple-500/30 hidden lg:block pointer-events-none" viewBox="0 0 100 100">
                        <path d="M0,50 C50,50 50,50 100,50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="animate-[dash_3s_linear_infinite]" />
                        <circle cx="100" cy="50" r="4" fill="currentColor" className="animate-pulse shadow-[0_0_10px_currentColor]" />
                    </svg>

                    {/* Mock Card */}
                    <div className="relative bg-[#1a1b26]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl transition-transform duration-500 hover:rotate-y-2 hover:scale-[1.01] hover:shadow-purple-500/10 group">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                            <h3 className="text-sm font-semibold text-gray-200 tracking-wide uppercase">Interactive Agent</h3>
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Input Field Mock */}
                            <div className="space-y-2 group/input">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Input</label>
                                <div className="bg-[#13141f] border border-white/5 rounded-xl p-4 text-gray-300 text-sm shadow-inner transition-colors group-hover/input:border-purple-500/30 group-hover/input:bg-[#13141f]/80 relative overflow-hidden">
                                    <span className="relative z-10 flex items-center gap-2">
                                        <span className="w-[2px] h-4 bg-blue-500 animate-pulse"></span>
                                        Type something...
                                    </span>
                                </div>
                            </div>

                            {/* Model Selection Mock */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Model</label>
                                <div className="flex items-center justify-between bg-[#13141f] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3 text-gray-200 text-sm">
                                        <div className="w-6 h-6 bg-white text-black rounded-md text-[10px] font-bold flex items-center justify-center shadow-sm">13</div>
                                        llama-3.2
                                    </div>
                                    <div className="w-4 h-4 text-gray-600">↕</div>
                                </div>
                            </div>

                            {/* Params Mock */}
                            <div className="space-y-4 pt-2">
                                <div>
                                    <div className="flex justify-between text-[10px] font-medium text-gray-500 mb-2 uppercase tracking-wider pl-1">
                                        <span>Temperature</span>
                                        <span className="text-gray-300">0.5</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full w-1/2 bg-linear-to-r from-purple-500 to-pink-500 relative">
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
