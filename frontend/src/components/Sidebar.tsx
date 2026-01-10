import React from 'react';
import { Type, Bot, Database, LogOut, GripVertical, Globe } from 'lucide-react';

interface SidebarProps {
    onChatClick?: () => void;
    showWebSearch?: boolean;
}

export const Sidebar = ({ onChatClick, showWebSearch }: SidebarProps) => {
    const onDragStart = (event: React.DragEvent, nodeType: string, payload: any = {}) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/payload', JSON.stringify(payload));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 border-r border-border flex flex-col h-full bg-background transition-colors duration-300">
            <div className="p-4 space-y-4">
                {/* Chat Button */}
                <button
                    onClick={onChatClick}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 border border-border rounded-lg text-foreground transition-all group"
                >
                    <span className="font-medium text-sm">Chat With AI</span>
                    <Bot size={18} className="text-muted-foreground group-hover:text-foreground" />
                </button>

                <div>
                    <div className="text-sm font-semibold text-foreground mb-4">Components</div>

                    <div className="space-y-3">
                        {/* Input Node */}
                        <div
                            className="bg-card border border-border p-3 rounded-lg cursor-grab hover:border-primary hover:shadow-md transition-all flex items-center gap-3 group"
                            onDragStart={(event) => onDragStart(event, 'inputNode')}
                            draggable
                        >
                            <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                <Type size={20} />
                            </div>
                            <span className="text-sm font-medium text-foreground">User Query</span>
                            <GripVertical size={16} className="ml-auto text-muted-foreground/50" />
                        </div>

                        {/* LLM Node */}
                        <div
                            className="bg-card border border-border p-3 rounded-lg cursor-grab hover:border-primary hover:shadow-md transition-all flex items-center gap-3 group"
                            onDragStart={(event) => onDragStart(event, 'llmNode', { model: 'gpt-3.5-turbo' })}
                            draggable
                        >
                            <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                <Bot size={20} />
                            </div>
                            <span className="text-sm font-medium text-foreground">LLM (OpenAI)</span>
                            <GripVertical size={16} className="ml-auto text-muted-foreground/50" />
                        </div>

                        {/* Knowledge Node */}
                        <div
                            className="bg-card border border-border p-3 rounded-lg cursor-grab hover:border-primary hover:shadow-md transition-all flex items-center gap-3 group"
                            onDragStart={(event) => onDragStart(event, 'ragNode')}
                            draggable
                        >
                            <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                <Database size={20} />
                            </div>
                            <span className="text-sm font-medium text-foreground">Knowledge Base</span>
                            <GripVertical size={16} className="ml-auto text-muted-foreground/50" />
                        </div>

                        {/* Web Search Node */}
                        {showWebSearch && (
                            <div
                                className="bg-card border border-border p-3 rounded-lg cursor-grab hover:border-primary hover:shadow-md transition-all flex items-center gap-3 group animate-in slide-in-from-left-2 fade-in duration-200"
                                onDragStart={(event) => onDragStart(event, 'webSearchNode')}
                                draggable
                            >
                                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                    <Globe size={20} />
                                </div>
                                <span className="text-sm font-medium text-foreground">Web Search</span>
                                <GripVertical size={16} className="ml-auto text-muted-foreground/50" />
                            </div>
                        )}

                        {/* Output Node */}
                        <div
                            className="bg-card border border-border p-3 rounded-lg cursor-grab hover:border-primary hover:shadow-md transition-all flex items-center gap-3 group"
                            onDragStart={(event) => onDragStart(event, 'outputNode')}
                            draggable
                        >
                            <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                <LogOut size={20} />
                            </div>
                            <span className="text-sm font-medium text-foreground">Output</span>
                            <GripVertical size={16} className="ml-auto text-muted-foreground/50" />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
