import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { MousePointerClick } from 'lucide-react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    type Connection,
    type Edge,
    type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { LLMNode } from '../nodes/LLMNode';
import { InputNode } from '../nodes/InputNode';
import { PromptNode } from '../nodes/PromptNode';
import { OutputNode } from '../nodes/OutputNode';
import { RagNode } from '../nodes/RagNode';
import axios from 'axios';

const nodeTypes = {
    llmNode: LLMNode,
    inputNode: InputNode,
    promptNode: PromptNode,
    outputNode: OutputNode,
    ragNode: RagNode,
};

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `dndnode_${id++}`;

export interface FlowHandle {
    runWorkflow: (inputs?: Record<string, any>, workflowId?: string) => Promise<any>;
    validateWorkflow: () => { isValid: boolean; error?: string };
    getFlowData: () => any;
    loadFlowData: (data: any) => void;
}

export interface FlowProps {
    onWebSearchChange?: (isActive: boolean) => void;
}

const Flow = forwardRef<FlowHandle, FlowProps>((props, ref) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);

    // Monitor LLM Nodes for WebSearch Toggle
    useEffect(() => {
        if (props.onWebSearchChange) {
            const isWebSearchActive = nodes.some(node =>
                node.type === 'llmNode' && node.data?.webSearch === true
            );
            props.onWebSearchChange(isWebSearchActive);
        }
    }, [nodes, props.onWebSearchChange]);

    // ... (rest of the file until useImperativeHandle)

    useImperativeHandle(ref, () => ({
        runWorkflow,
        validateWorkflow,
        getFlowData: () => reactFlowInstance?.toObject(),
        loadFlowData: (data: any) => {
            if (data) {
                const { nodes: restoredNodes, edges: restoredEdges, viewport } = data;
                setNodes(restoredNodes || []);
                setEdges(restoredEdges || []);
                if (viewport && reactFlowInstance) {
                    reactFlowInstance.setViewport(viewport);
                }
            }
        }
    }));

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const payloadString = event.dataTransfer.getData('application/payload');
            const payload = payloadString ? JSON.parse(payloadString) : {};

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: { ...payload, label: `${type}` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    const runWorkflow = async (customInputs?: Record<string, any>, workflowId?: string) => {
        setIsRunning(true);
        try {
            if (!workflowId) {
                throw new Error("Workflow must be saved before running.");
            }

            // 1. Prepare Inputs
            let inputs: Record<string, any> = customInputs || {};

            // If no custom inputs provided, try to auto-generate from graph or fallback
            if (!customInputs) {
                const inputNodes = nodes.filter(node => node.type === 'inputNode');
                if (inputNodes.length > 0) {
                    inputNodes.forEach(node => {
                        const key = node.data.label || node.id;
                        inputs[key] = "Test Input Value";
                    });
                } else {
                    inputs = { "topic": "Artificial Intelligence" };
                }
            }

            // 2. Run Workflow using existing ID
            const runRes = await axios.post(`http://localhost:8000/api/run/${workflowId}`, {
                inputs: inputs
            });

            console.log("Run Results:", runRes.data);

            // Update Output Nodes with results
            const results = runRes.data.results;

            setNodes((nds) => nds.map(node => {
                // Check if result exists for this node ID OR its label (field name)
                const result = results[node.id] || (node.data.label ? results[node.data.label] : undefined);

                if (result) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            outputValue: result.output || result // Handle format {output: "val"} or just "val"
                        }
                    };
                }
                return node;
            }));

            return results;

        } catch (error: any) {
            console.error("Error running workflow:", error);

            let errorMessage = "Failed to run workflow.";
            if (error.code === "ERR_NETWORK") {
                errorMessage = "Could not connect to the backend server (localhost:8000). Please ensure the backend is running.";
            } else if (error.response) {
                errorMessage = `Server Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            } else if (error.message) {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        } finally {
            setIsRunning(false);
        }
    };

    const validateWorkflow = (): { isValid: boolean; error?: string } => {
        if (nodes.length === 0) {
            return { isValid: false, error: "Workflow is empty. Add nodes to start." };
        }

        // 1. Check for Orphans (nodes with no edges)
        // A node is connected if it is a source or target in at least one edge
        if (nodes.length > 1) {
            const connectedNodeIds = new Set<string>();
            edges.forEach(edge => {
                connectedNodeIds.add(edge.source);
                connectedNodeIds.add(edge.target);
            });

            const orphans = nodes.filter(node => !connectedNodeIds.has(node.id));
            if (orphans.length > 0) {
                return { isValid: false, error: `Found ${orphans.length} disconnected node(s). All nodes must be connected.` };
            }
        }

        // 2. Check for Cycles (Simple DFS)
        const adjacencyList = new Map<string, string[]>();
        nodes.forEach(node => adjacencyList.set(node.id, []));
        edges.forEach(edge => {
            if (adjacencyList.has(edge.source)) {
                adjacencyList.get(edge.source)?.push(edge.target);
            }
        });

        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const hasCycle = (nodeId: string): boolean => {
            visited.add(nodeId);
            recursionStack.add(nodeId);

            const neighbors = adjacencyList.get(nodeId) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    if (hasCycle(neighbor)) return true;
                } else if (recursionStack.has(neighbor)) {
                    return true;
                }
            }

            recursionStack.delete(nodeId);
            return false;
        };

        for (const node of nodes) {
            if (!visited.has(node.id)) {
                if (hasCycle(node.id)) {
                    return { isValid: false, error: "Workflow contains a cycle (infinite loop). Please ensure connections are linear." };
                }
            }
        }

        return { isValid: true };
    };



    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

    // Listen for theme changes
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDarkMode(document.documentElement.classList.contains('dark'));
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="w-full h-full relative" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
                className="bg-background"
            >
                <Controls />
                <Background color={isDarkMode ? "#555" : "#aaa"} gap={20} size={1.5} />

                {nodes.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center gap-4 text-muted-foreground/50">
                            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                                <MousePointerClick size={32} />
                            </div>
                            <p className="text-lg font-medium text-muted-foreground">Drag & drop to get started</p>
                        </div>
                    </div>
                )}
            </ReactFlow>

            {isRunning && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm cursor-wait">
                    <div className="flex flex-col items-center gap-3 p-4 rounded-lg">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        <p className="text-sm font-medium text-foreground">Running workflow...</p>
                    </div>
                </div>
            )}
        </div>
    );
});

const FlowWithProvider = forwardRef<FlowHandle, FlowProps>((props, ref) => (
    <ReactFlowProvider>
        <Flow ref={ref} {...props} />
    </ReactFlowProvider>
));

export default FlowWithProvider;
