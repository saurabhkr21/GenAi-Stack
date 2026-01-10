import { BaseNode } from './BaseNode';
import { Position, type NodeProps } from 'reactflow';
import { Database, Upload, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export const RagNode = ({ data, selected }: NodeProps) => {
    const [showApiKey, setShowApiKey] = useState(false);
    const [fileName, setFileName] = useState<string | undefined>(data.fileName);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://127.0.0.1:8000/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            // const result = await response.json();
            // Assuming result contains filename/filepath, but we just need to confirm success for now
            // and maybe store the server-side filename if it differs (e.g. unique ID)

            setFileName(file.name);
            data.fileName = file.name;
            // Trigger visual update if needed

        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Failed to upload file. Please ensure backend is running.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <BaseNode
            label="Knowledge Base"
            description="Let LLM search info in your file"
            icon={<Database size={16} className="text-green-500" />}
            selected={selected}
            onSettingsClick={() => alert("Settings for RAG Node")}
            handles={[
                { type: 'target', position: Position.Left, id: 'query', style: { top: '70%' } },
                { type: 'source', position: Position.Right, id: 'context', style: { top: '70%' } }
            ]}
            contentClassName="pl-10 pr-10"
        >
            <div className="space-y-4">
                {/* File Upload UI */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">File for Knowledge Base</label>
                    <div
                        className={`border border-dashed rounded-lg p-3 flex items-center justify-center cursor-pointer transition-colors ${fileName ? 'border-green-500/50 bg-green-500/5 justify-between' : 'border-border hover:border-primary hover:bg-muted/50'}`}
                        onClick={() => !fileName && !isUploading && document.getElementById(`file-upload-${data.id}`)?.click()}
                    >
                        {isUploading ? (
                            <span className="text-xs text-muted-foreground animate-pulse">Uploading...</span>
                        ) : fileName ? (
                            <>
                                <span className="text-sm text-green-600 font-medium truncate max-w-[180px]">{fileName}</span>
                                <button
                                    className="text-muted-foreground hover:text-red-500 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFileName(undefined);
                                        data.fileName = undefined;
                                        const fileInput = document.getElementById(`file-upload-${data.id}`) as HTMLInputElement;
                                        if (fileInput) fileInput.value = '';
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Upload size={14} />
                                <span className="text-xs">Upload File</span>
                            </div>
                        )}
                        <input
                            type="file"
                            id={`file-upload-${data.id}`}
                            className="hidden"
                            accept=".pdf,.txt,.md"
                            onChange={handleFileUpload}
                        />
                    </div>
                </div>

                {/* Embedding Model */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Embedding Model</label>
                    <select
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        defaultValue={data.embeddingModel || 'text-embedding-3-large'}
                        onChange={(e) => data.embeddingModel = e.target.value}
                    >
                        <option value="text-embedding-3-large">text-embedding-3-large</option>
                        <option value="text-embedding-ada-002">text-embedding-ada-002</option>
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
                            onChange={(e) => data.apiKey = e.target.value}
                        />
                        <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </div>

                {/* Handle Labels */}
                <div className="absolute left-0 top-[70%] -translate-y-1/2 pl-3 pointer-events-none">
                    <span className="text-xs font-medium text-muted-foreground bg-card/80 px-1">Query</span>
                </div>
                <div className="absolute right-0 top-[70%] -translate-y-1/2 pr-3 pointer-events-none">
                    <span className="text-xs font-medium text-muted-foreground bg-card/80 px-1">Context</span>
                </div>
            </div>
        </BaseNode>
    );
};
