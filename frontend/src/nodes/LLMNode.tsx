import { BaseNode } from './BaseNode';
import { Position, Handle, useReactFlow, type NodeProps } from 'reactflow';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export const LLMNode = ({ id, data, selected }: NodeProps) => {
    const [showApiKey, setShowApiKey] = useState(false);
    const [showSerpKey, setShowSerpKey] = useState(false);
    const { setNodes } = useReactFlow();

    const updateData = (updates: any) => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...updates } };
                }
                return node;
            })
        );
    };

    return (
        <BaseNode
            label="LLM (OpenAI)"
            description="Run a query with OpenAI LLM"
            icon={<Sparkles size={16} className="text-purple-500" />}
            selected={selected}
            onSettingsClick={() => alert("Settings for LLM Node")}
            className="w-[320px]" // Wider for form elements
            contentClassName="pl-4 pr-4 py-4" // Reset padding, let internal spacing handle it
        >
            <div className="space-y-4">
                {/* Model */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Model</label>
                    <select
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        defaultValue={data.model || 'gpt-4o-mini'}
                        onChange={(e) => updateData({ model: e.target.value })}
                    >
                        <option value="gpt-4o-mini">GPT 4o- Mini</option>
                        <option value="gpt-4">GPT 4</option>
                        <option value="gpt-3.5-turbo">GPT 3.5 Turbo</option>
                    </select>
                </div>

                {/* API Key */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">API Key</label>
                    <div className="relative">
                        <input
                            type={showApiKey ? "text" : "password"}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary pr-8"
                            placeholder="Enter your API key"
                            defaultValue={data.apiKey}
                            onChange={(e) => updateData({ apiKey: e.target.value })}
                        />
                        <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </div>

                {/* Prompt */}
                <div className="space-y-1 relative">
                    <label className="text-xs font-medium text-foreground">Prompt</label>
                    {/* Handle for Prompt Input - roughly aligned with the box */}
                    <div className="bg-background border border-border rounded-lg p-3 relative">
                        <textarea
                            className="w-full h-24 bg-transparent border-none text-sm text-foreground focus:outline-none resize-none"
                            defaultValue={data.prompt}
                            placeholder="Enter your prompt"
                            onChange={(e) => updateData({ prompt: e.target.value })}
                        />
                        <div className="mt-2 space-y-1">
                            {/* Context Handle Container */}
                            <div className="relative flex items-center">
                                <Handle
                                    type="target"
                                    position={Position.Left}
                                    id="context"
                                    className="bg-primary! border-background! w-3! h-3!"
                                    style={{ left: '-29px', top: '50%' }}
                                />
                                <div className="text-xs text-primary font-medium">CONTEXT: {'{context}'}</div>
                            </div>

                            {/* User Query Handle Container */}
                            <div className="relative flex items-center">
                                <Handle
                                    type="target"
                                    position={Position.Left}
                                    id="prompt"
                                    className="bg-primary! border-background! w-3! h-3!"
                                    style={{ left: '-29px', top: '50%' }}
                                />
                                <div className="text-xs text-primary font-medium">User Query: {'{query}'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Temperature */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Temperature</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            defaultValue={data.temperature || 0.75}
                            onChange={(e) => updateData({ temperature: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>

                {/* WebSearch Toggle */}
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">WebSearch Tool</label>
                    <label className="relative inline-block w-10 h-6 cursor-pointer">
                        <input
                            type="checkbox"
                            id={`websearch-toggle-${id}`}
                            className="peer sr-only"
                            checked={!!data.webSearch}
                            onChange={(e) => updateData({ webSearch: e.target.checked })}
                        />
                        <div className="block bg-muted w-10 h-6 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-4"></div>
                    </label>
                </div>

                {/* SERP API */}
                {data.webSearch && (
                    <div className="space-y-1 animate-in slide-in-from-top-2 fade-in duration-200">
                        <label className="text-xs font-medium text-foreground">SERP API</label>
                        <div className="relative">
                            <input
                                type={showSerpKey ? "text" : "password"}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary pr-8"
                                placeholder="Enter your SERP API key"
                                defaultValue={data.serpKey}
                                onChange={(e) => updateData({ serpKey: e.target.value })}
                            />
                            <button
                                onClick={() => setShowSerpKey(!showSerpKey)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showSerpKey ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Output Handle */}
                <div className="relative flex justify-end items-center mt-2">
                    <span className="text-xs font-medium text-muted-foreground mr-2">Output</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="output"
                        className="bg-primary! border-background! w-3! h-3!"
                        style={{ right: '-27px', top: '50%' }}
                    />
                </div>
            </div>
        </BaseNode>
    );
};
