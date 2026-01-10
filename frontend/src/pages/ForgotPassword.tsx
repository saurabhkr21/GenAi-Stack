import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Mail } from 'lucide-react';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('http://localhost:8000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Panel - Visuals */}
            <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#18181b] overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-900/40 via-[#18181b] to-[#18181b]"></div>
                    <div className="absolute -bottom-[20%] -left-[20%] w-[80%] h-[80%] bg-purple-900/20 blur-[150px] rounded-full mix-blend-screen"></div>
                </div>

                <div className="relative z-10">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-white font-bold text-xl tracking-tight"
                    >
                        <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            ai
                        </div>
                        GenAI Stack
                    </button>
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <h2 className="text-4xl font-bold text-white leading-tight">
                        Don't worry, <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">we've got you.</span>
                    </h2>
                    <p className="text-gray-400 text-lg">
                        It happens to the best of us. We'll send you a link to reset your password and get you back to building.
                    </p>
                </div>

                <div className="relative z-10 text-xs text-gray-500">
                    © 2024 GenAI Stack Inc. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex items-center justify-center p-8 bg-white dark:bg-[#09090b] transition-colors duration-300">
                <div className="w-full max-w-[400px] space-y-8">
                    {status === 'success' ? (
                        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                                <Mail className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Check your email</h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    We've sent password reset instructions to <span className="font-semibold text-gray-900 dark:text-gray-200">{email}</span>
                                </p>
                            </div>
                            <Link 
                                to="/login"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-11 px-8 w-full bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                            >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Link 
                                    to="/login"
                                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-4"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Login
                                </Link>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Forgot password?</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none text-gray-900 dark:text-gray-300">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            className="flex h-11 w-full rounded-md border border-gray-200 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:bg-white/5"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={status === 'loading'}
                                        />
                                    </div>
                                </div>

                                {status === 'error' && (
                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
                                        Something went wrong. Please try again.
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8 w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
                                >
                                    {status === 'loading' ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                    {status !== 'loading' && <ArrowRight className="ml-2 h-4 w-4" />}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
