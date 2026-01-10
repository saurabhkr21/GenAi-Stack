import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, X, Edit, Box, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface Stack {
    id: string;
    name: string;
    description: string;
    updatedAt: string;
}

export const StackDashboard = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [stacks, setStacks] = useState<Stack[]>([])
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [newStackName, setNewStackName] = useState('');
    const [newStackDesc, setNewStackDesc] = useState('');
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchStacks();

        // Click outside to close profile dropdown
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchStacks = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/workflows/');
            if (response.ok) {
                const data = await response.json();
                // Map backend data to frontend Stack interface
                const mapped = data.map((w: any) => ({
                    id: w.id,
                    name: w.name,
                    description: w.description || '',
                    updatedAt: new Date(w.updated_at || w.created_at).toLocaleDateString()
                }));
                setStacks(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch stacks", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this stack?")) return;

        try {
            const response = await fetch(`http://localhost:8000/api/workflows/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setStacks(prev => prev.filter(s => s.id !== id));
            } else {
                alert("Failed to delete stack");
            }
        } catch (error) {
            console.error("Error deleting stack:", error);
        }
    };

    const handleCreate = async () => {
        if (!newStackName.trim()) return;

        // Create via backend
        try {
            const response = await fetch('http://localhost:8000/api/workflows/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newStackName,
                    description: newStackDesc,
                    data: { nodes: [], edges: [] } // Initialize empty
                })
            });

            if (response.ok) {
                const created = await response.json();
                navigate(`/stack/${created.id}`);
            }
        } catch (error) {
            console.error("Failed to create stack", error);
            alert("Failed to create stack");
        }
    };

    return (
        <div className="min-h-screen bg-background p-8 font-sans text-foreground">
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">ai</div>
                    <h1 className="text-xl font-bold text-foreground">GenAI Stack</h1>
                </Link>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* User Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 bg-background pl-3 pr-2 py-1.5 rounded-full border border-border hover:border-muted-foreground hover:shadow-sm transition-all text-sm font-medium text-foreground"
                        >

                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold ml-1">
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
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:dark:bg-red-950/30 flex items-center gap-2 transition-colors">
                                    <LogOut size={16} />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">My Stacks</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={20} /> New Stack
                </button>
            </div>

            {/* Grid of Stacks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stacks.map((stack) => (
                    <div
                        key={stack.id}
                        className="bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between h-48"
                        onClick={() => navigate(`/stack/${stack.id}`)}
                    >
                        <div>
                            <h3 className="text-lg font-semibold text-card-foreground mb-2">{stack.name}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-2">{stack.description}</p>
                        </div>

                        <div className="flex justify-end mt-4 gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(stack.id); }}
                                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-900 px-3 py-1 rounded transition-colors"
                            >
                                <X size={14} /> Delete
                            </button>
                            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground border border-border bg-background hover:bg-accent px-3 py-1 rounded transition-colors">
                                <Edit size={14} /> Edit
                            </button>
                        </div>
                    </div>
                ))}

                {/* Create New Card (Empty State / Placeholder style from design) */}
                {stacks.length === 0 && !isLoading && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed border-border">
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 mb-4">
                            <Box size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Create New Stack</h3>
                        <p className="text-muted-foreground mb-6 max-w-md text-center">Start building your generative AI apps with our essential tools and frameworks</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            <Plus size={20} /> New Stack
                        </button>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200 border border-border">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-foreground">Create New Stack</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newStackName}
                                    onChange={(e) => setNewStackName(e.target.value)}
                                    placeholder="e.g. Chat With PDF"
                                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                                <textarea
                                    value={newStackDesc}
                                    onChange={(e) => setNewStackDesc(e.target.value)}
                                    placeholder="What does this stack do?"
                                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none h-24"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-muted-foreground hover:bg-accent rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newStackName.trim()}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
