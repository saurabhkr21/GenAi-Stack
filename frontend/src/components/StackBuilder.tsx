import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import Flow, { type FlowHandle } from './Flow'; // Assuming Flow is the default export
import { ArrowLeft, Save, Play, MessageSquare, Moon, Sun, LogOut } from 'lucide-react';
import { ChatModal } from './ChatModal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const StackBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const flowRef = useRef<FlowHandle>(null);
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();

    // Profile Dropdown State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Click outside handler for profile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);


    // Helper to save or update workflow and return the ID
    const saveOrUpdateWorkflow = async (): Promise<string | null> => {
        if (!flowRef.current) return null;

        try {
            const flowData = flowRef.current.getFlowData ? flowRef.current.getFlowData() : null;
            if (!flowData) {
                alert("Error: Could not retrieve flow data.");
                return null;
            }

            if (id) {
                // Update existing
                const response = await fetch(`http://localhost:8000/api/workflows/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: stackName,
                        description: stackDesc,
                        data: flowData
                    })
                });

                if (!response.ok) throw new Error("Failed to update");
                await response.json();
                return id;
            } else {
                // Create new
                // For auto-save before run, we might want to skip the prompt if it's annoying, 
                // but for now let's keep consistency or just default it.
                // If running without saving, we probably want to just save it as "Draft" if user hasn't named it?
                // But the user might want to name it.
                // Let's use the current state name which defaults to "My GenAI Stack"

                const response = await fetch('http://localhost:8000/api/workflows/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: stackName, // Use current state name
                        description: "Created via Stack Builder",
                        data: flowData
                    })
                });

                if (!response.ok) throw new Error("Failed to save");
                const saved = await response.json();
                return saved.id;
            }
        } catch (e: any) {
            console.error("Auto-save error:", e);
            alert("Error saving before run: " + e.message);
            return null;
        }
    };

    const handleRun = async () => {
        if (flowRef.current) {
            // Validate first
            const validation = flowRef.current.validateWorkflow();
            if (!validation.isValid) {
                alert(`Validation Error: ${validation.error}`);
                return;
            }

            console.log("Play button clicked, saving then running...");

            // Auto-save before running
            let workflowId = id;
            if (!workflowId) {
                const newId = await saveOrUpdateWorkflow();
                if (!newId) return; // Save failed
                workflowId = newId;
                // Update URL without reload if possible, otherwise we just use the ID for this run
                // navigate(`/stack/${newId}`, { replace: true }); // Optional: update URL
                // If we don't navigate, subsequent saves might create NEW duplicates if 'id' param isn't updated.
                // We MUST navigate or simple logic:
                if (!id) {
                    navigate(`/stack/${newId}`, { replace: true });
                }
            } else {
                // Even if ID exists, we should save latest changes
                await saveOrUpdateWorkflow();
            }
            // Note: if navigate happened, 'id' from useParams might not update immediately in this closure?
            // Safer to use 'workflowId' variable.

            try {
                const results = await flowRef.current.runWorkflow({}, workflowId);
                console.log("Workflow execution completed", results);
            } catch (error) {
                console.error("Workflow failed from Play button:", error);
                alert("Failed to run workflow. " + (error instanceof Error ? error.message : "Unknown error"));
            }
        } else {
            console.warn("flowRef not found");
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!flowRef.current) return;

        // Add user message
        setChatMessages(prev => [...prev, { role: 'user', content: message }]);
        setIsChatLoading(true);

        // Auto-save before running
        let workflowId = id;
        const savedId = await saveOrUpdateWorkflow();
        if (savedId) {
            workflowId = savedId;
            if (!id) {
                navigate(`/stack/${savedId}`, { replace: true });
            }
        } else {
            // Save failed, abort?
            setIsChatLoading(false);
            return;
        }

        try {
            // Run workflow with user input
            const results = await flowRef.current.runWorkflow({
                input: message,
                query: message,
                user_input: message
            }, workflowId);

            // Extract AI response from results
            let aiResponse = "Workflow executed, but no text output was found.";

            if (results && typeof results === 'object') {
                const resultValues = Object.values(results);
                const potentialOutputs = resultValues
                    .map((r: any) => r.output || r)
                    .filter(val => typeof val === 'string' && val !== message && val.length > 0);

                if (potentialOutputs.length > 0) {
                    aiResponse = potentialOutputs[potentialOutputs.length - 1];
                } else {
                    const anyOutput: any = Object.values(results).find((r: any) => r.output);
                    if (anyOutput) aiResponse = typeof anyOutput.output === 'string' ? anyOutput.output : JSON.stringify(anyOutput.output);
                }
            }

            setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);

        } catch (error: any) {
            console.error("Chat Error:", error);
            const errorMsg = error.message || "Sorry, there was an error running the workflow.";
            setChatMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    // Stack Metadata State
    const [stackName, setStackName] = useState("My GenAI Stack");
    const [stackDesc, setStackDesc] = useState("Updated via Stack Builder");
    const [isLoading, setIsLoading] = useState(false);
    const [isWebSearchActive, setIsWebSearchActive] = useState(false);

    // Fetch existing stack data
    useEffect(() => {
        if (id) {
            setIsLoading(true);
            fetch(`http://localhost:8000/api/workflows/${id}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to load stack");
                    return res.json();
                })
                .then(data => {
                    if (data) {
                        setStackName(data.name);
                        setStackDesc(data.description || "");
                        // Load flow data into editor
                        if (data.data && flowRef.current) {
                            flowRef.current.loadFlowData(data.data);
                        }
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert("Failed to load stack data");
                })
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    const handleSave = async () => {
        if (!flowRef.current) return;

        console.log("Save clicked");

        try {
            // Ensure Flow.tsx exposes the data
            const flowData = flowRef.current.getFlowData ? flowRef.current.getFlowData() : null;
            if (!flowData) {
                alert("Error: Could not retrieve flow data.");
                return;
            }

            if (id) {
                // Update existing
                const response = await fetch(`http://localhost:8000/api/workflows/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: stackName,
                        description: stackDesc,
                        data: flowData
                    })
                });

                if (!response.ok) throw new Error("Failed to update");
                await response.json();
                alert("Stack updated successfully!");
            } else {
                // Create new
                const name = prompt("Enter stack name:", "My GenAI Stack");
                if (!name) return;

                setStackName(name);

                const response = await fetch('http://localhost:8000/api/workflows/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        description: "Created via Stack Builder",
                        data: flowData
                    })
                });

                if (!response.ok) throw new Error("Failed to save");
                const saved = await response.json();
                alert("Saved successfully! ID: " + saved.id);
                navigate(`/stack/${saved.id}`);
            }
        } catch (e: any) {
            alert("Error saving: " + e.message);
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-background text-foreground relative">
            {/* Header */}
            <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-background shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            {/* Logo Icon */}
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">ai</div>
                            <h1 className="font-bold text-lg text-gray-800">GenAI Stack</h1>
                        </div>
                    </div>
                    {/* Stack Name Breadcrumb/Title */}
                    <div className="h-6 w-px bg-gray-300 mx-2"></div>
                    <span className="font-medium text-gray-600">Chat With AI</span> {/* Dynamic based on ID later */}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent flex items-center gap-2 transition-colors"
                    >
                        <Save size={16} /> Save
                    </button>

                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 rounded-full hover:bg-accent text-foreground transition-colors"
                        title="Toggle Theme"
                    >
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 bg-background pl-3 pr-2 py-1.5 rounded-full border border-border hover:border-muted-foreground hover:shadow-sm transition-all text-sm font-medium text-foreground"
                        >
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold ml-1">
                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
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
                                        navigate('/');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:dark:bg-red-950/30 flex items-center gap-2 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Builder Area */}
            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar onChatClick={() => setIsChatOpen(true)} showWebSearch={isWebSearchActive} />
                <div className="flex-1 h-full relative">
                    <Flow ref={flowRef} onWebSearchChange={setIsWebSearchActive} />

                    {/* Drag & Drop Overlay Hint */}
                    <div className="absolute inset-0 pointer-events-none z-0 hidden">
                    </div>

                    {/* Floating Action Buttons */}
                    <div className="absolute bottom-8 right-8 flex flex-col gap-4 z-40">
                        {/* Run Button */}
                        <button
                            onClick={handleRun}
                            className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                            title="Run Workflow"
                        >
                            <Play size={24} fill="currentColor" className="ml-1" />
                        </button>

                        {/* Chat Button */}
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                            title="Chat output"
                        >
                            <MessageSquare size={24} />
                        </button>
                    </div>

                </div>
            </div>

            {/* Chat Modal */}
            <ChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isLoading={isChatLoading}
            />
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="text-lg font-medium">Loading stack...</p>
                    </div>
                </div>
            )}
        </div>
    );
};
