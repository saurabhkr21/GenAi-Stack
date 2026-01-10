import { BaseNode } from './BaseNode';
import { Position, type NodeProps } from 'reactflow';

export const PromptNode = ({ data, selected }: NodeProps) => {
    return (
        <BaseNode
            label="Prompt Template"
            selected={selected}
            handles={[
                { type: 'target', position: Position.Left, id: 'input' }, // Simplified: just one input
                { type: 'source', position: Position.Right, id: 'output' }
            ]}
        >
            <div className="text-xs text-muted-foreground mb-1">Template</div>
            <textarea
                className="w-full bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                placeholder="Tell me a joke about {input}"
                defaultValue={data.template || ''}
                onChange={(e) => data.template = e.target.value}
            />
            <div className="text-xs text-muted-foreground mt-1">
                Use {"{input}"} to insert value
            </div>
        </BaseNode>
    );
};
