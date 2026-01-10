import { BaseNode } from './BaseNode';
import { Position, type NodeProps } from 'reactflow';
import { LogIn } from 'lucide-react';

export const InputNode = ({ data, selected }: NodeProps) => {
    return (
        <BaseNode
            label="User Query"
            description="Enter point for queries"
            icon={<LogIn size={16} className="text-blue-500" />}
            selected={selected}
            onSettingsClick={() => alert("Settings for User Query Node")}
            handles={[
                { type: 'source', position: Position.Right, id: 'value', style: { top: '90%' } }
            ]}
            contentClassName="pr-10"
        >
            <div className="space-y-1">
                <div className="text-xs font-medium text-foreground">Query</div>
                <div className="relative">
                    <textarea
                        className="w-full h-20 bg-background border border-border rounded-lg p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground/50"
                        placeholder="Write your query here"
                        onChange={(e) => data.label = e.target.value}
                    />
                </div>
            </div>
            {/* Handle Label */}
            <div className="absolute right-0 top-[90%] -translate-y-1/2 pr-3 pointer-events-none">
                <span className="text-xs font-medium text-muted-foreground bg-card/80 px-1">Query</span>
            </div>
        </BaseNode>
    );
};
